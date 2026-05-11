using CodeQuest.Api.DTOs;
using CodeQuest.Api.Enums;
using CodeQuest.Api.Security;
using CodeQuest.Api.Services.Learning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CodeQuest.Api.Controllers;

[ApiController]
[Authorize]
[Route("modules")]
public sealed class ModulesController(ILearningService learning) : ControllerBase
{
    [Authorize(Roles = nameof(UserRole.Teacher))]
    [HttpPost]
    public async Task<ModuleDto> Create(CreateModuleRequest request) => await learning.CreateModuleAsync(request);

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ModuleDto>> Get(Guid id)
    {
        var module = await learning.GetModuleAsync(id, User.GetRole() == UserRole.Student ? User.GetUserId() : null);
        return module is null ? NotFound() : Ok(module);
    }

    [HttpGet("{moduleId:guid}/lessons")]
    public async Task<IReadOnlyList<LessonDto>> Lessons(Guid moduleId) => await learning.GetLessonsAsync(moduleId);

    [HttpGet("{moduleId:guid}/exercises")]
    public async Task<IReadOnlyList<ExerciseDto>> Exercises(Guid moduleId)
    {
        return await learning.GetExercisesAsync(moduleId, User.IsInRole(nameof(UserRole.Teacher)));
    }
}
