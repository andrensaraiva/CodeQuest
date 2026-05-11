using CodeQuest.Api.Data;
using CodeQuest.Api.DTOs;
using CodeQuest.Api.Entities;
using CodeQuest.Api.Enums;
using Microsoft.EntityFrameworkCore;

namespace CodeQuest.Api.Services.Gamification;

public interface IGamificationService
{
    Task<XpSummaryDto> GetXpSummaryAsync(Guid studentId);
    Task<IReadOnlyList<BadgeDto>> GetBadgesAsync(Guid studentId);
    Task AwardExerciseCompletionAsync(Guid studentId, Exercise exercise, int failedAttemptsBeforeSuccess);
    Task<IReadOnlyList<RankingEntryDto>> GetClassRankingAsync(Guid classroomId);
}

public sealed class GamificationService(AppDbContext db) : IGamificationService
{
    public async Task<XpSummaryDto> GetXpSummaryAsync(Guid studentId)
    {
        var total = await db.XpEvents.Where(x => x.StudentId == studentId).SumAsync(x => (int?)x.Amount) ?? 0;
        var level = CalculateLevel(total);
        return new XpSummaryDto(total, level, total % 100, 100);
    }

    public async Task<IReadOnlyList<BadgeDto>> GetBadgesAsync(Guid studentId)
    {
        var badges = await db.Badges.OrderBy(x => x.Title).ToListAsync();
        var earned = await db.StudentBadges.Where(x => x.StudentId == studentId).ToListAsync();
        return badges.Select(b =>
        {
            var studentBadge = earned.FirstOrDefault(x => x.BadgeId == b.Id);
            return new BadgeDto(b.Id, b.Title, b.Description, b.Icon, studentBadge is not null, studentBadge?.EarnedAt);
        }).ToList();
    }

    public async Task AwardExerciseCompletionAsync(Guid studentId, Exercise exercise, int failedAttemptsBeforeSuccess)
    {
        var alreadyAwarded = await db.XpEvents.AnyAsync(x =>
            x.StudentId == studentId &&
            x.SourceType == "Exercise" &&
            x.SourceId == exercise.Id &&
            x.Reason == "Exercise completed");

        if (!alreadyAwarded)
        {
            db.XpEvents.Add(new XpEvent
            {
                StudentId = studentId,
                SourceType = "Exercise",
                SourceId = exercise.Id,
                Amount = exercise.XpReward,
                Reason = "Exercise completed"
            });
        }

        await UnlockBadgesAsync(studentId, exercise, failedAttemptsBeforeSuccess);
        await db.SaveChangesAsync();
    }

    public async Task<IReadOnlyList<RankingEntryDto>> GetClassRankingAsync(Guid classroomId)
    {
        var students = await db.ClassStudents
            .Where(x => x.ClassroomId == classroomId)
            .Include(x => x.Student)
            .ToListAsync();

        var xpByStudent = await db.XpEvents
            .Where(x => students.Select(s => s.StudentId).Contains(x.StudentId))
            .GroupBy(x => x.StudentId)
            .Select(g => new { StudentId = g.Key, Xp = g.Sum(x => x.Amount) })
            .ToListAsync();

        return students
            .Select(x =>
            {
                var xp = xpByStudent.FirstOrDefault(e => e.StudentId == x.StudentId)?.Xp ?? 0;
                return new { x.StudentId, Name = x.Student?.Name ?? "Student", Xp = xp, Level = CalculateLevel(xp) };
            })
            .OrderByDescending(x => x.Xp)
            .Select((x, i) => new RankingEntryDto(x.StudentId, x.Name, x.Xp, x.Level, i + 1))
            .ToList();
    }

    private async Task UnlockBadgesAsync(Guid studentId, Exercise exercise, int failedAttemptsBeforeSuccess)
    {
        await TryUnlockAsync(studentId, "First Code");

        var csharpCompleted = await db.Submissions
            .Include(x => x.Exercise)
            .Where(x => x.StudentId == studentId && x.Status == SubmissionStatus.Passed && x.Exercise!.Language == ProgrammingLanguage.CSharp)
            .Select(x => x.ExerciseId)
            .Distinct()
            .CountAsync();

        if (csharpCompleted >= 3)
        {
            await TryUnlockAsync(studentId, "C# Apprentice");
        }

        if (exercise.Difficulty == ExerciseDifficulty.Boss)
        {
            await TryUnlockAsync(studentId, "Boss Defeated");
        }
    }

    private async Task TryUnlockAsync(Guid studentId, string badgeTitle)
    {
        var badge = await db.Badges.FirstOrDefaultAsync(x => x.Title == badgeTitle);
        if (badge is null)
        {
            return;
        }

        var exists = await db.StudentBadges.AnyAsync(x => x.StudentId == studentId && x.BadgeId == badge.Id);
        if (!exists)
        {
            db.StudentBadges.Add(new StudentBadge { StudentId = studentId, BadgeId = badge.Id });
        }
    }

    public static int CalculateLevel(int totalXp) => (totalXp / 100) + 1;
}
