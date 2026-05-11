using CodeQuest.Api.DTOs;
using CodeQuest.Api.Enums;
using CodeQuest.Api.Security;
using CodeQuest.Api.Services.Learning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CodeQuest.Api.Controllers;

[ApiController]
[Authorize]
[Route("tracks")]
public sealed class TracksController(ILearningService learning) : ControllerBase
{
    [HttpGet]
    public async Task<IReadOnlyList<TrackDto>> GetTracks() => await learning.GetTracksAsync();

    [Authorize(Roles = nameof(UserRole.Teacher))]
    [HttpPost]
    public async Task<TrackDto> CreateTrack(CreateTrackRequest request) => await learning.CreateTrackAsync(User.GetUserId(), request);

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TrackDto>> Get(Guid id)
    {
        var track = await learning.GetTrackEntityAsync(id);
        return track is null ? NotFound() : Ok(new TrackDto(track.Id, track.Title, track.Description, track.Language, track.Theme, track.Modules.Count));
    }

    [HttpGet("{trackId:guid}/modules")]
    public async Task<IReadOnlyList<ModuleDto>> Modules(Guid trackId)
    {
        return await learning.GetModulesAsync(trackId, User.GetRole() == UserRole.Student ? User.GetUserId() : null);
    }
}
