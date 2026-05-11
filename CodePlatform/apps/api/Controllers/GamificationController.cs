using CodeQuest.Api.DTOs;
using CodeQuest.Api.Security;
using CodeQuest.Api.Services.Gamification;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CodeQuest.Api.Controllers;

[ApiController]
[Authorize]
public sealed class GamificationController(IGamificationService gamification) : ControllerBase
{
    [HttpGet("me/xp")]
    public async Task<XpSummaryDto> Xp() => await gamification.GetXpSummaryAsync(User.GetUserId());

    [HttpGet("me/badges")]
    public async Task<IReadOnlyList<BadgeDto>> Badges() => await gamification.GetBadgesAsync(User.GetUserId());
}
