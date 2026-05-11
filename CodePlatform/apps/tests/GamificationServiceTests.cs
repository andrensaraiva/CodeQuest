using CodeQuest.Api.Data;
using CodeQuest.Api.Entities;
using CodeQuest.Api.Enums;
using CodeQuest.Api.Services.Gamification;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.EntityFrameworkCore.InMemory.Infrastructure.Internal;

namespace CodeQuest.Api.Tests;

public class GamificationServiceTests
{
    [Fact]
    public void CalculateLevel_StartsAtOne()
    {
        GamificationService.CalculateLevel(0).Should().Be(1);
        GamificationService.CalculateLevel(99).Should().Be(1);
        GamificationService.CalculateLevel(100).Should().Be(2);
        GamificationService.CalculateLevel(550).Should().Be(6);
    }

    [Fact]
    public async Task AwardExerciseCompletion_DoesNotDuplicateXp()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;

        await using var db = new AppDbContext(options);
        var student = new User { Name = "Student", Email = "s@x.dev", PasswordHash = "x", Role = UserRole.Student };
        var exercise = new Exercise { Title = "T", Description = "D", XpReward = 25, CreatedByTeacherId = Guid.NewGuid() };
        db.Users.Add(student);
        db.Exercises.Add(exercise);
        await db.SaveChangesAsync();

        var service = new GamificationService(db);
        await service.AwardExerciseCompletionAsync(student.Id, exercise, failedAttemptsBeforeSuccess: 0);
        await service.AwardExerciseCompletionAsync(student.Id, exercise, failedAttemptsBeforeSuccess: 0);

        var total = await db.XpEvents.Where(x => x.StudentId == student.Id).SumAsync(x => x.Amount);
        total.Should().Be(25);
    }
}
