using CodeQuest.Api.DTOs;
using CodeQuest.Api.Security;
using CodeQuest.Api.Services.Editor;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CodeQuest.Api.Controllers;

[ApiController]
[Authorize]
[Route("me")]
public sealed class MeController(IEditorSettingsService editor) : ControllerBase
{
    [HttpGet("editor-settings")]
    public Task<EditorSettingsDto> GetEditorSettings()
    {
        return editor.GetAsync(User.GetUserId());
    }

    [HttpPut("editor-settings")]
    public Task<EditorSettingsDto> UpdateEditorSettings(EditorSettingsDto request)
    {
        return editor.UpdateAsync(User.GetUserId(), request);
    }
}
