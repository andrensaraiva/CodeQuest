using CodeQuest.Api.Data;
using CodeQuest.Api.DTOs;
using CodeQuest.Api.Entities;
using CodeQuest.Api.Enums;
using CodeQuest.Api.Services.Gamification;
using Microsoft.EntityFrameworkCore;

namespace CodeQuest.Api.Services.CodeRunner;

public interface ICodeSubmissionService
{
    Task<CodeRunResponse> RunAsync(Guid studentId, CodeRunRequest request);
    Task<SubmissionDto> SubmitAsync(Guid studentId, SubmitCodeRequest request);
    Task<IReadOnlyList<SubmissionDto>> GetMySubmissionsAsync(Guid studentId);
    Task<IReadOnlyList<SubmissionDto>> GetExerciseSubmissionsAsync(Guid exerciseId);
    Task<IReadOnlyList<SubmissionDto>> GetClassSubmissionsAsync(Guid classroomId);
}

public sealed class CodeSubmissionService(AppDbContext db, ICodeRunnerService runner, IGamificationService gamification) : ICodeSubmissionService
{
    public async Task<CodeRunResponse> RunAsync(Guid studentId, CodeRunRequest request)
    {
        var exercise = await db.Exercises.Include(x => x.Tests).FirstOrDefaultAsync(x => x.Id == request.ExerciseId)
            ?? throw new InvalidOperationException("Exercise not found.");

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

        var previousAttempts = await db.Submissions.CountAsync(x => x.StudentId == studentId && x.ExerciseId == exercise.Id);
        var failedBefore = await db.Submissions.CountAsync(x => x.StudentId == studentId && x.ExerciseId == exercise.Id && x.Status == SubmissionStatus.Failed);
        var result = await runner.RunTestsAsync(new TestRunRequest(request.Language, request.Code, exercise, exercise.Tests.OrderBy(x => x.OrderIndex).ToList()));
        var status = result.FailedCount == 0 ? SubmissionStatus.Passed : SubmissionStatus.Failed;

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
            await gamification.AwardExerciseCompletionAsync(studentId, exercise, failedBefore);
        }

        return ToDto(submission);
    }

    public async Task<IReadOnlyList<SubmissionDto>> GetMySubmissionsAsync(Guid studentId)
    {
        var submissions = await db.Submissions.Include(x => x.TestResults).Where(x => x.StudentId == studentId).OrderByDescending(x => x.CreatedAt).ToListAsync();
        return submissions.Select(ToDto).ToList();
    }

    public async Task<IReadOnlyList<SubmissionDto>> GetExerciseSubmissionsAsync(Guid exerciseId)
    {
        var submissions = await db.Submissions.Include(x => x.TestResults).Where(x => x.ExerciseId == exerciseId).OrderByDescending(x => x.CreatedAt).ToListAsync();
        return submissions.Select(ToDto).ToList();
    }

    public async Task<IReadOnlyList<SubmissionDto>> GetClassSubmissionsAsync(Guid classroomId)
    {
        var studentIds = await db.ClassStudents.Where(x => x.ClassroomId == classroomId).Select(x => x.StudentId).ToListAsync();
        var submissions = await db.Submissions.Include(x => x.TestResults).Where(x => studentIds.Contains(x.StudentId)).OrderByDescending(x => x.CreatedAt).ToListAsync();
        return submissions.Select(ToDto).ToList();
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
            submission.CreatedAt,
            submission.TestResults.Select(x => new RunnerTestResultDto(x.TestId, x.TestName, x.Passed, x.Expected, x.Output, x.Error, x.IsHidden, x.ExecutionTimeMs)).ToList());
    }
}
