using CodeQuest.Api.DTOs;
using CodeQuest.Api.Enums;
using CodeQuest.Api.Security;
using CodeQuest.Api.Services.CodeRunner;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CodeQuest.Api.Controllers;

[ApiController]
[Authorize]
[Route("submissions")]
public sealed class SubmissionsController(ICodeSubmissionService submissions) : ControllerBase
{
    [Authorize(Roles = nameof(UserRole.Student))]
    [HttpGet("me")]
    public async Task<PagedResult<SubmissionDto>> Mine([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
        => await submissions.GetMySubmissionsAsync(User.GetUserId(), new PageQuery(page, pageSize));

    [Authorize(Roles = nameof(UserRole.Teacher))]
    [HttpGet("exercises/{exerciseId:guid}")]
    public async Task<PagedResult<SubmissionDto>> ExerciseSubmissions(Guid exerciseId, [FromQuery] int page = 1, [FromQuery] int pageSize = 25)
        => await submissions.GetExerciseSubmissionsAsync(exerciseId, User.GetUserId(), new PageQuery(page, pageSize));

    [Authorize(Roles = nameof(UserRole.Teacher))]
    [HttpGet("classes/{classroomId:guid}")]
    public async Task<PagedResult<SubmissionDto>> ClassSubmissions(Guid classroomId, [FromQuery] int page = 1, [FromQuery] int pageSize = 25)
        => await submissions.GetClassSubmissionsAsync(classroomId, User.GetUserId(), new PageQuery(page, pageSize));
}
