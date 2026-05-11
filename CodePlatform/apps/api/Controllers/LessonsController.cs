using CodeQuest.Api.DTOs;
using CodeQuest.Api.Enums;
using CodeQuest.Api.Services.Learning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CodeQuest.Api.Controllers;

[ApiController]
[Authorize]
[Route("lessons")]
public sealed class LessonsController(ILearningService learning) : ControllerBase
{
    [Authorize(Roles = nameof(UserRole.Teacher))]
    [HttpPost]
    public async Task<LessonDto> Create(CreateLessonRequest request) => await learning.CreateLessonAsync(request);

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<LessonDto>> Get(Guid id)
    {
        var lesson = await learning.GetLessonAsync(id);
        return lesson is null ? NotFound() : Ok(lesson);
    }
}
