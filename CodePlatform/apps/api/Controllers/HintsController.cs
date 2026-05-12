using CodeQuest.Api.DTOs;
using CodeQuest.Api.Enums;
using CodeQuest.Api.Security;
using CodeQuest.Api.Services.Learning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CodeQuest.Api.Controllers;

[ApiController]
[Authorize(Roles = nameof(UserRole.Student))]
[Route("exercises/{exerciseId:guid}/hints")]
public sealed class HintsController(IHintService hints) : ControllerBase
{
    [HttpGet]
    public async Task<IReadOnlyList<ExerciseHintSummaryDto>> List(Guid exerciseId)
    {
        return await hints.ListAsync(User.GetUserId(), exerciseId);
    }

    [HttpPost("{hintId:guid}/unlock")]
    public async Task<HintUnlockResponse> Unlock(Guid exerciseId, Guid hintId)
    {
        return await hints.UnlockAsync(User.GetUserId(), exerciseId, hintId);
    }
}
