using System.Text.Json;
using CodeQuest.Api.Data;
using CodeQuest.Api.DTOs;
using Microsoft.EntityFrameworkCore;

namespace CodeQuest.Api.Services.AI;

public interface IAssistantService
{
    Task<AiResponse> GenerateHintAsync(Guid userId, AiHintRequest request);
    Task<AiResponse> GenerateExerciseAsync(Guid userId, string topic, string language, string difficulty);
    Task<AiResponse> GenerateTestsAsync(Guid userId, string exerciseDescription, string language);
    Task<AiResponse> GenerateClassReportAsync(Guid userId, Guid classroomId);
}

public sealed class AssistantService(AppDbContext db) : IAssistantService
{
    public async Task<AiResponse> GenerateHintAsync(Guid userId, AiHintRequest request)
    {
        var exercise = await db.Exercises.FirstOrDefaultAsync(x => x.Id == request.ExerciseId)
            ?? throw new InvalidOperationException("Exercise not found.");

        var hints = JsonSerializer.Deserialize<string[]>(exercise.HintsJson) ?? [];
        var response = hints.FirstOrDefault() ?? "Start by matching the method signature, then compare your return value with the visible tests.";
        db.AiInteractions.Add(new Entities.AiInteraction
        {
            UserId = userId,
            ExerciseId = request.ExerciseId,
            Type = "hint",
            Prompt = request.StudentCode,
            Response = response
        });
        await db.SaveChangesAsync();
        return new AiResponse(response, true);
    }

    public Task<AiResponse> GenerateExerciseAsync(Guid userId, string topic, string language, string difficulty)
    {
        return Task.FromResult(new AiResponse($"Mock teacher assistant: draft a {difficulty} {language} exercise about {topic}, then add visible and hidden tests before publishing.", true));
    }

    public Task<AiResponse> GenerateTestsAsync(Guid userId, string exerciseDescription, string language)
    {
        return Task.FromResult(new AiResponse($"Mock teacher assistant: create boundary, normal, and edge tests for this {language} exercise. Real AI integration is documented for later.", true));
    }

    public Task<AiResponse> GenerateClassReportAsync(Guid userId, Guid classroomId)
    {
        return Task.FromResult(new AiResponse("Mock class report: focus recovery practice on the exercises with repeated failed attempts and review conditionals before boss challenges.", true));
    }
}
