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
    public async Task<IReadOnlyList<SubmissionDto>> Mine() => await submissions.GetMySubmissionsAsync(User.GetUserId());

    [Authorize(Roles = nameof(UserRole.Teacher))]
    [HttpGet("exercises/{exerciseId:guid}")]
    public async Task<IReadOnlyList<SubmissionDto>> ExerciseSubmissions(Guid exerciseId) => await submissions.GetExerciseSubmissionsAsync(exerciseId);

    [Authorize(Roles = nameof(UserRole.Teacher))]
    [HttpGet("classes/{classroomId:guid}")]
    public async Task<IReadOnlyList<SubmissionDto>> ClassSubmissions(Guid classroomId) => await submissions.GetClassSubmissionsAsync(classroomId);
}
