using CodeQuest.Api.DTOs;
using CodeQuest.Api.Data;
using CodeQuest.Api.Enums;
using CodeQuest.Api.Security;
using CodeQuest.Api.Services.Learning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CodeQuest.Api.Controllers;

[ApiController]
[Authorize]
[Route("exercises")]
public sealed class ExercisesController(ILearningService learning, AppDbContext db) : ControllerBase
{
    [Authorize(Roles = nameof(UserRole.Teacher))]
    [HttpPost]
    public async Task<ExerciseDto> Create(CreateExerciseRequest request)
    {
        return await learning.CreateExerciseAsync(User.GetUserId(), request);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ExerciseDto>> Get(Guid id)
    {
        var includeHidden = User.IsInRole(nameof(UserRole.Teacher));
        var exercise = await learning.GetExerciseAsync(id, includeHidden);
        if (exercise is null)
        {
            return NotFound();
        }

        if (!includeHidden && !exercise.IsPublished)
        {
            return NotFound();
        }

        return Ok(exercise);
    }

    [Authorize(Roles = nameof(UserRole.Teacher))]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ExerciseDto>> Update(Guid id, CreateExerciseRequest request)
    {
        var existing = await learning.GetExerciseEntityAsync(id);
        if (existing is null || existing.CreatedByTeacherId != User.GetUserId())
        {
            return NotFound();
        }

        existing.Title = request.Title;
        existing.Description = request.Description;
        existing.Language = request.Language;
        existing.Difficulty = request.Difficulty;
        existing.StarterCode = request.StarterCode;
        existing.ReferenceSolution = request.ReferenceSolution;
        existing.XpReward = request.XpReward;
        existing.SkillsJson = request.SkillsJson;
        existing.HintsJson = request.HintsJson;
        existing.IsPublished = request.IsPublished;
        if (request.AllowHints.HasValue) existing.AllowHints = request.AllowHints.Value;
        if (request.AllowSolutionReveal.HasValue) existing.AllowSolutionReveal = request.AllowSolutionReveal.Value;
        if (request.SolutionRevealXpPercent.HasValue) existing.SolutionRevealXpPercent = request.SolutionRevealXpPercent.Value;
        existing.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return Ok(await learning.GetExerciseAsync(id, true));
    }

    [Authorize(Roles = nameof(UserRole.Teacher))]
    [HttpPost("{id:guid}/publish")]
    public async Task<ActionResult<ExerciseDto>> Publish(Guid id)
    {
        var exercise = await learning.PublishExerciseAsync(id, User.GetUserId());
        return exercise is null ? NotFound() : Ok(exercise);
    }
}
