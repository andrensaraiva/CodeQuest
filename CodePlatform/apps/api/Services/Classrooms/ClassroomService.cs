using CodeQuest.Api.Data;
using CodeQuest.Api.DTOs;
using CodeQuest.Api.Entities;
using CodeQuest.Api.Enums;
using CodeQuest.Api.Services.Gamification;
using Microsoft.EntityFrameworkCore;

namespace CodeQuest.Api.Services.Classrooms;

public interface IClassroomService
{
    Task<IReadOnlyList<ClassroomDto>> GetClassroomsAsync(Guid userId, UserRole role);
    Task<ClassroomDto> CreateAsync(Guid teacherId, CreateClassroomRequest request);
    Task<ClassroomDto?> GetAsync(Guid id, Guid userId, UserRole role);
    Task JoinAsync(Guid studentId, string inviteCode);
    Task<IReadOnlyList<StudentProgressDto>> GetStudentsAsync(Guid classroomId, Guid requesterId, UserRole role);
}

public sealed class ClassroomService(AppDbContext db) : IClassroomService
{
    public async Task<IReadOnlyList<ClassroomDto>> GetClassroomsAsync(Guid userId, UserRole role)
    {
        var query = db.Classrooms.Include(x => x.Students).AsQueryable();
        query = role == UserRole.Teacher
            ? query.Where(x => x.TeacherId == userId)
            : query.Where(x => x.Students.Any(s => s.StudentId == userId));

        return await query
            .OrderBy(x => x.Name)
            .Select(x => new ClassroomDto(x.Id, x.Name, x.Description, x.InviteCode, x.TeacherId, x.Students.Count))
            .ToListAsync();
    }

    public async Task<ClassroomDto> CreateAsync(Guid teacherId, CreateClassroomRequest request)
    {
        var classroom = new Classroom
        {
            Name = request.Name.Trim(),
            Description = request.Description.Trim(),
            TeacherId = teacherId,
            InviteCode = await GenerateInviteCodeAsync()
        };

        db.Classrooms.Add(classroom);
        await db.SaveChangesAsync();
        return new ClassroomDto(classroom.Id, classroom.Name, classroom.Description, classroom.InviteCode, classroom.TeacherId, 0);
    }

    public async Task<ClassroomDto?> GetAsync(Guid id, Guid userId, UserRole role)
    {
        var classroom = await db.Classrooms.Include(x => x.Students).FirstOrDefaultAsync(x => x.Id == id);
        if (classroom is null || !CanAccess(classroom, userId, role))
        {
            return null;
        }

        return new ClassroomDto(classroom.Id, classroom.Name, classroom.Description, classroom.InviteCode, classroom.TeacherId, classroom.Students.Count);
    }

    public async Task JoinAsync(Guid studentId, string inviteCode)
    {
        var code = inviteCode.Trim().ToUpperInvariant();
        var classroom = await db.Classrooms.FirstOrDefaultAsync(x => x.InviteCode == code)
            ?? throw new InvalidOperationException("Invite code not found.");

        var exists = await db.ClassStudents.AnyAsync(x => x.ClassroomId == classroom.Id && x.StudentId == studentId);
        if (!exists)
        {
            db.ClassStudents.Add(new ClassStudent { ClassroomId = classroom.Id, StudentId = studentId });
            await db.SaveChangesAsync();
        }
    }

    public async Task<IReadOnlyList<StudentProgressDto>> GetStudentsAsync(Guid classroomId, Guid requesterId, UserRole role)
    {
        var classroom = await db.Classrooms.Include(x => x.Students).ThenInclude(x => x.Student).FirstOrDefaultAsync(x => x.Id == classroomId)
            ?? throw new InvalidOperationException("Classroom not found.");

        if (!CanAccess(classroom, requesterId, role))
        {
            throw new UnauthorizedAccessException("You cannot access this class.");
        }

        var studentIds = classroom.Students.Select(x => x.StudentId).ToList();
        var xp = await db.XpEvents.Where(x => studentIds.Contains(x.StudentId)).GroupBy(x => x.StudentId).Select(g => new { g.Key, Xp = g.Sum(x => x.Amount) }).ToListAsync();
        var submissions = await db.Submissions.Where(x => studentIds.Contains(x.StudentId)).ToListAsync();

        return classroom.Students.Select(s =>
        {
            var studentXp = xp.FirstOrDefault(x => x.Key == s.StudentId)?.Xp ?? 0;
            var studentSubmissions = submissions.Where(x => x.StudentId == s.StudentId).ToList();
            return new StudentProgressDto(
                s.StudentId,
                s.Student?.Name ?? "Student",
                s.Student?.Email ?? "",
                studentXp,
                GamificationService.CalculateLevel(studentXp),
                studentSubmissions.Where(x => x.Status == SubmissionStatus.Passed).Select(x => x.ExerciseId).Distinct().Count(),
                studentSubmissions.Count(x => x.Status == SubmissionStatus.Failed),
                studentSubmissions.OrderByDescending(x => x.CreatedAt).FirstOrDefault()?.CreatedAt);
        }).OrderByDescending(x => x.Xp).ToList();
    }

    private bool CanAccess(Classroom classroom, Guid userId, UserRole role)
    {
        return role == UserRole.Admin || classroom.TeacherId == userId || classroom.Students.Any(x => x.StudentId == userId);
    }

    private async Task<string> GenerateInviteCodeAsync()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        for (var attempt = 0; attempt < 10; attempt++)
        {
            var code = new string(Enumerable.Range(0, 8).Select(_ => chars[Random.Shared.Next(chars.Length)]).ToArray());
            if (!await db.Classrooms.AnyAsync(x => x.InviteCode == code))
            {
                return code;
            }
        }

        return Guid.NewGuid().ToString("N")[..8].ToUpperInvariant();
    }
}
