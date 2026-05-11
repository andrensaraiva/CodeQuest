using CodeQuest.Api.DTOs;
using CodeQuest.Api.Enums;
using CodeQuest.Api.Security;
using CodeQuest.Api.Services.Classrooms;
using CodeQuest.Api.Services.Gamification;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CodeQuest.Api.Controllers;

[ApiController]
[Authorize]
[Route("classes")]
public sealed class ClassesController(IClassroomService classrooms, IGamificationService gamification) : ControllerBase
{
    [HttpGet]
    public async Task<IReadOnlyList<ClassroomDto>> GetClasses()
    {
        return await classrooms.GetClassroomsAsync(User.GetUserId(), User.GetRole());
    }

    [Authorize(Roles = nameof(UserRole.Teacher))]
    [HttpPost]
    public async Task<ActionResult<ClassroomDto>> Create(CreateClassroomRequest request)
    {
        return Ok(await classrooms.CreateAsync(User.GetUserId(), request));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ClassroomDto>> Get(Guid id)
    {
        var classroom = await classrooms.GetAsync(id, User.GetUserId(), User.GetRole());
        return classroom is null ? NotFound() : Ok(classroom);
    }

    [Authorize(Roles = nameof(UserRole.Student))]
    [HttpPost("join")]
    public async Task<IActionResult> JoinByCode(JoinClassRequest request)
    {
        await classrooms.JoinAsync(User.GetUserId(), request.InviteCode);
        return NoContent();
    }

    [Authorize(Roles = nameof(UserRole.Student))]
    [HttpPost("{id:guid}/join")]
    public async Task<IActionResult> Join(Guid id, JoinClassRequest request)
    {
        await classrooms.JoinAsync(User.GetUserId(), request.InviteCode);
        return NoContent();
    }

    [HttpGet("{id:guid}/students")]
    public async Task<IReadOnlyList<StudentProgressDto>> Students(Guid id)
    {
        return await classrooms.GetStudentsAsync(id, User.GetUserId(), User.GetRole());
    }

    [HttpGet("{id:guid}/ranking")]
    public async Task<IReadOnlyList<RankingEntryDto>> Ranking(Guid id)
    {
        return await gamification.GetClassRankingAsync(id);
    }
}
