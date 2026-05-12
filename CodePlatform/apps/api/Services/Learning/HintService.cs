using CodeQuest.Api.Data;
using CodeQuest.Api.DTOs;
using CodeQuest.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace CodeQuest.Api.Services.Learning;

public interface IHintService
{
    Task<IReadOnlyList<ExerciseHintSummaryDto>> ListAsync(Guid studentId, Guid exerciseId);
    Task<HintUnlockResponse> UnlockAsync(Guid studentId, Guid exerciseId, Guid hintId);
    Task<(int HighestPenaltyPercent, int HintsUsedCount, int HighestHintLevel)> ComputePenaltyAsync(Guid studentId, Guid exerciseId);
}

public sealed class HintService(AppDbContext db) : IHintService
{
    public async Task<IReadOnlyList<ExerciseHintSummaryDto>> ListAsync(Guid studentId, Guid exerciseId)
    {
        var exercise = await db.Exercises.AsNoTracking().FirstOrDefaultAsync(x => x.Id == exerciseId)
            ?? throw new InvalidOperationException("Exercise not found.");

        var hints = await db.ExerciseHints
            .Where(x => x.ExerciseId == exerciseId)
            .OrderBy(x => x.OrderIndex)
            .AsNoTracking()
            .ToListAsync();

        var unlockedIds = await db.StudentHintUnlocks
            .Where(x => x.StudentId == studentId && x.ExerciseId == exerciseId)
            .Select(x => x.HintId)
            .ToListAsync();

        if (!exercise.AllowHints)
        {
            return [];
        }

        return hints.Select(h => new ExerciseHintSummaryDto(
            h.Id,
            h.OrderIndex,
            h.Title,
            h.PenaltyPercent,
            h.IsSolutionReveal,
            unlockedIds.Contains(h.Id),
            unlockedIds.Contains(h.Id) ? h.Content : null
        )).ToList();
    }

    public async Task<HintUnlockResponse> UnlockAsync(Guid studentId, Guid exerciseId, Guid hintId)
    {
        var exercise = await db.Exercises.AsNoTracking().FirstOrDefaultAsync(x => x.Id == exerciseId)
            ?? throw new InvalidOperationException("Exercise not found.");

        if (!exercise.AllowHints)
        {
            throw new InvalidOperationException("Hints are disabled for this exercise.");
        }

        var hint = await db.ExerciseHints.AsNoTracking().FirstOrDefaultAsync(x => x.Id == hintId && x.ExerciseId == exerciseId)
            ?? throw new InvalidOperationException("Hint not found for exercise.");

        if (hint.IsSolutionReveal && !exercise.AllowSolutionReveal)
        {
            throw new InvalidOperationException("Solution reveal is disabled for this exercise.");
        }

        var alreadyUnlocked = await db.StudentHintUnlocks
            .AnyAsync(x => x.StudentId == studentId && x.HintId == hintId);

        if (!alreadyUnlocked)
        {
            db.StudentHintUnlocks.Add(new StudentHintUnlock
            {
                StudentId = studentId,
                ExerciseId = exerciseId,
                HintId = hintId
            });
            await db.SaveChangesAsync();
        }

        var (penaltyPercent, _, _) = await ComputePenaltyAsync(studentId, exerciseId);
        var possibleXp = (int)Math.Round(exercise.XpReward * (100 - penaltyPercent) / 100.0);

        return new HintUnlockResponse(
            hint.Id,
            hint.OrderIndex,
            hint.Title,
            hint.Content,
            hint.PenaltyPercent,
            hint.IsSolutionReveal,
            possibleXp,
            exercise.XpReward);
    }

    public async Task<(int HighestPenaltyPercent, int HintsUsedCount, int HighestHintLevel)> ComputePenaltyAsync(Guid studentId, Guid exerciseId)
    {
        var exercise = await db.Exercises.AsNoTracking().FirstOrDefaultAsync(x => x.Id == exerciseId);
        if (exercise is null)
        {
            return (0, 0, 0);
        }

        var unlocks = await (from u in db.StudentHintUnlocks
                             join h in db.ExerciseHints on u.HintId equals h.Id
                             where u.StudentId == studentId && u.ExerciseId == exerciseId
                             select new { h.PenaltyPercent, h.OrderIndex, h.IsSolutionReveal })
                             .ToListAsync();

        if (unlocks.Count == 0)
        {
            return (0, 0, 0);
        }

        var revealUsed = unlocks.Any(x => x.IsSolutionReveal);
        if (revealUsed)
        {
            // When the solution is revealed, only the teacher-defined XP remains.
            var keepPercent = Math.Clamp(exercise.SolutionRevealXpPercent, 0, 100);
            var penalty = 100 - keepPercent;
            return (penalty, unlocks.Count, unlocks.Max(x => x.OrderIndex));
        }

        return (unlocks.Max(x => x.PenaltyPercent), unlocks.Count, unlocks.Max(x => x.OrderIndex));
    }
}
