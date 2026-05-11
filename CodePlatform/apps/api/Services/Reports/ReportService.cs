using CodeQuest.Api.Data;
using CodeQuest.Api.DTOs;
using CodeQuest.Api.Enums;
using CodeQuest.Api.Services.Classrooms;
using Microsoft.EntityFrameworkCore;

namespace CodeQuest.Api.Services.Reports;

public interface IReportService
{
    Task<ClassReportDto> GetClassReportAsync(Guid classroomId, Guid requesterId, UserRole role);
    Task<IReadOnlyList<StudentProgressDto>> GetDifficultStudentsAsync(Guid classroomId, Guid requesterId, UserRole role);
}

public sealed class ReportService(AppDbContext db, IClassroomService classrooms) : IReportService
{
    public async Task<ClassReportDto> GetClassReportAsync(Guid classroomId, Guid requesterId, UserRole role)
    {
        var classroom = await classrooms.GetAsync(classroomId, requesterId, role)
            ?? throw new UnauthorizedAccessException("Classroom not found or forbidden.");
        var students = await classrooms.GetStudentsAsync(classroomId, requesterId, role);
        var studentIds = students.Select(x => x.StudentId).ToList();
        var submissions = await db.Submissions.Include(x => x.Exercise).Where(x => studentIds.Contains(x.StudentId)).ToListAsync();
        var difficultExercises = submissions
            .Where(x => x.Status == SubmissionStatus.Failed)
            .GroupBy(x => x.Exercise?.Title ?? "Exercise")
            .OrderByDescending(g => g.Count())
            .Take(5)
            .Select(g => $"{g.Key}: {g.Count()} failed attempts")
            .ToList();

        var difficultStudents = students
            .Where(x => x.FailedAttempts >= 2 || x.CompletedExercises == 0)
            .OrderByDescending(x => x.FailedAttempts)
            .Take(5)
            .ToList();

        return new ClassReportDto(
            classroom.Id,
            classroom.Name,
            classroom.StudentCount,
            submissions.Count,
            submissions.Where(x => x.Status == SubmissionStatus.Passed).Select(x => new { x.StudentId, x.ExerciseId }).Distinct().Count(),
            difficultExercises,
            difficultStudents);
    }

    public Task<IReadOnlyList<StudentProgressDto>> GetDifficultStudentsAsync(Guid classroomId, Guid requesterId, UserRole role)
    {
        return GetDifficultStudentsCoreAsync(classroomId, requesterId, role);
    }

    private async Task<IReadOnlyList<StudentProgressDto>> GetDifficultStudentsCoreAsync(Guid classroomId, Guid requesterId, UserRole role)
    {
        var students = await classrooms.GetStudentsAsync(classroomId, requesterId, role);
        return students.Where(x => x.FailedAttempts >= 2 || x.CompletedExercises == 0).OrderByDescending(x => x.FailedAttempts).ToList();
    }
}
