using CodeQuest.Api.Data;
using CodeQuest.Api.DTOs;
using CodeQuest.Api.Entities;
using CodeQuest.Api.Enums;
using CodeQuest.Api.Services.Gamification;
using CodeQuest.Api.Services.Learning;
using Microsoft.EntityFrameworkCore;

namespace CodeQuest.Api.Services.CodeRunner;

public interface ICodeSubmissionService
{
    Task<CodeRunResponse> RunAsync(Guid studentId, CodeRunRequest request);
    Task<SubmissionDto> SubmitAsync(Guid studentId, SubmitCodeRequest request);
    Task<PagedResult<SubmissionDto>> GetMySubmissionsAsync(Guid studentId, PageQuery page);
    Task<PagedResult<SubmissionDto>> GetExerciseSubmissionsAsync(Guid exerciseId, Guid teacherId, PageQuery page);
    Task<PagedResult<SubmissionDto>> GetClassSubmissionsAsync(Guid classroomId, Guid teacherId, PageQuery page);
}

public sealed class CodeSubmissionService(AppDbContext db, ICodeRunnerService runner, IGamificationService gamification, IHintService hintService) : ICodeSubmissionService
{
    public async Task<CodeRunResponse> RunAsync(Guid studentId, CodeRunRequest request)
    {
        var exercise = await db.Exercises.Include(x => x.Tests).FirstOrDefaultAsync(x => x.Id == request.ExerciseId)
            ?? throw new InvalidOperationException("Exercise not found.");

        await EnsureStudentCanAccessAsync(studentId, exercise);

        var result = await runner.RunCodeAsync(new TestRunRequest(request.Language, request.Code, exercise, exercise.Tests.Where(x => !x.IsHidden).ToList()));
        db.CodeRuns.Add(new CodeRun
        {
            StudentId = studentId,
            ExerciseId = exercise.Id,
            Language = request.Language,
            Code = request.Code,
            Output = result.Output,
            Error = result.Error ?? result.CompilationError,
            Status = result.Status,
            ExecutionTimeMs = result.ExecutionTimeMs
        });
        await db.SaveChangesAsync();
        return result;
    }

    public async Task<SubmissionDto> SubmitAsync(Guid studentId, SubmitCodeRequest request)
    {
        var exercise = await db.Exercises.Include(x => x.Tests).FirstOrDefaultAsync(x => x.Id == request.ExerciseId)
            ?? throw new InvalidOperationException("Exercise not found.");

        await EnsureStudentCanAccessAsync(studentId, exercise);

        var previousAttempts = await db.Submissions.CountAsync(x => x.StudentId == studentId && x.ExerciseId == exercise.Id);
        var failedBefore = await db.Submissions.CountAsync(x => x.StudentId == studentId && x.ExerciseId == exercise.Id && x.Status == SubmissionStatus.Failed);
        var result = await runner.RunTestsAsync(new TestRunRequest(request.Language, request.Code, exercise, exercise.Tests.OrderBy(x => x.OrderIndex).ToList()));
        var status = result.FailedCount == 0 ? SubmissionStatus.Passed : SubmissionStatus.Failed;

        var (penaltyPercent, hintsUsedCount, highestHintLevel) = await hintService.ComputePenaltyAsync(studentId, exercise.Id);
        var xpBeforePenalty = exercise.XpReward;
        var xpAfterPenalty = status == SubmissionStatus.Passed
            ? (int)Math.Round(xpBeforePenalty * (100 - penaltyPercent) / 100.0)
            : 0;

        var submission = new Submission
        {
            ExerciseId = exercise.Id,
            StudentId = studentId,
            Code = request.Code,
            Status = status,
            Score = result.Score,
            Feedback = result.Feedback,
            PassedTests = result.PassedCount,
            TotalTests = result.Tests.Count,
            AttemptNumber = previousAttempts + 1,
            HintsUsedCount = hintsUsedCount,
            HighestHintLevelUsed = highestHintLevel,
            HintPenaltyPercent = penaltyPercent,
            XpBeforePenalty = xpBeforePenalty,
            XpAwarded = xpAfterPenalty,
            TestResults = result.Tests.Select(x => new SubmissionTestResult
            {
                TestId = x.TestId,
                TestName = x.Name,
                Passed = x.Passed,
                Expected = x.Expected,
                Output = x.Actual,
                Error = x.Error,
                IsHidden = x.IsHidden,
                ExecutionTimeMs = x.ExecutionTimeMs
            }).ToList()
        };

        db.Submissions.Add(submission);
        await db.SaveChangesAsync();

        if (status == SubmissionStatus.Passed)
        {
            var actuallyAwarded = await gamification.AwardExerciseCompletionAsync(studentId, exercise, failedBefore, xpAfterPenalty);
            // If a previous submission already locked in the XP, mark this submission as awarding 0 to avoid misleading the student.
            if (actuallyAwarded == 0)
            {
                submission.XpAwarded = 0;
                await db.SaveChangesAsync();
            }
        }

        return ToDto(submission);
    }

    public async Task<PagedResult<SubmissionDto>> GetMySubmissionsAsync(Guid studentId, PageQuery page)
    {
        var query = db.Submissions.Where(x => x.StudentId == studentId);
        return await PaginateAsync(query, page);
    }

    public async Task<PagedResult<SubmissionDto>> GetExerciseSubmissionsAsync(Guid exerciseId, Guid teacherId, PageQuery page)
    {
        var ownsExercise = await db.Exercises.AnyAsync(x => x.Id == exerciseId && x.CreatedByTeacherId == teacherId);
        if (!ownsExercise)
        {
            throw new UnauthorizedAccessException("You cannot view submissions for this exercise.");
        }

        var query = db.Submissions.Where(x => x.ExerciseId == exerciseId);
        return await PaginateAsync(query, page);
    }

    public async Task<PagedResult<SubmissionDto>> GetClassSubmissionsAsync(Guid classroomId, Guid teacherId, PageQuery page)
    {
        var ownsClassroom = await db.Classrooms.AnyAsync(x => x.Id == classroomId && x.TeacherId == teacherId);
        if (!ownsClassroom)
        {
            throw new UnauthorizedAccessException("You cannot view submissions for this classroom.");
        }

        var studentIds = await db.ClassStudents.Where(x => x.ClassroomId == classroomId).Select(x => x.StudentId).ToListAsync();
        var query = db.Submissions.Where(x => studentIds.Contains(x.StudentId));
        return await PaginateAsync(query, page);
    }

    private async Task<PagedResult<SubmissionDto>> PaginateAsync(IQueryable<Submission> query, PageQuery page)
    {
        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip(page.Skip)
            .Take(page.SafePageSize)
            .Include(x => x.TestResults)
            .ToListAsync();
        return new PagedResult<SubmissionDto>(items.Select(ToDto).ToList(), page.SafePage, page.SafePageSize, total);
    }

    private async Task EnsureStudentCanAccessAsync(Guid studentId, Entities.Exercise exercise)
    {
        if (!exercise.IsPublished)
        {
            throw new UnauthorizedAccessException("This exercise is not available to students yet.");
        }

        var enrolled = await db.ClassStudents.AnyAsync(x => x.StudentId == studentId);
        if (!enrolled)
        {
            throw new UnauthorizedAccessException("Join a classroom before submitting code.");
        }
    }

    private static SubmissionDto ToDto(Submission submission)
    {
        return new SubmissionDto(
            submission.Id,
            submission.ExerciseId,
            submission.StudentId,
            submission.Status,
            submission.Score,
            submission.Feedback,
            submission.PassedTests,
            submission.TotalTests,
            submission.AttemptNumber,
            submission.HintsUsedCount,
            submission.HighestHintLevelUsed,
            submission.HintPenaltyPercent,
            submission.XpBeforePenalty,
            submission.XpAwarded,
            submission.CreatedAt,
            submission.TestResults.Select(x => new RunnerTestResultDto(x.TestId, x.TestName, x.Passed, x.Expected, x.Output, x.Error, x.IsHidden, x.ExecutionTimeMs)).ToList());
    }
}
