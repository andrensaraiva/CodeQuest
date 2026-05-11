using CodeQuest.Api.DTOs;
using CodeQuest.Api.Security;
using CodeQuest.Api.Services.AI;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CodeQuest.Api.Controllers;

[ApiController]
[Authorize]
[Route("ai")]
public sealed class AiController(IAssistantService assistant) : ControllerBase
{
    [HttpPost("hint")]
    public async Task<AiResponse> Hint(AiHintRequest request) => await assistant.GenerateHintAsync(User.GetUserId(), request);

    [HttpPost("generate-exercise")]
    public async Task<AiResponse> GenerateExercise([FromBody] Dictionary<string, string> request)
    {
        return await assistant.GenerateExerciseAsync(User.GetUserId(), request.GetValueOrDefault("topic", "conditionals"), request.GetValueOrDefault("language", "C#"), request.GetValueOrDefault("difficulty", "easy"));
    }

    [HttpPost("generate-tests")]
    public async Task<AiResponse> GenerateTests([FromBody] Dictionary<string, string> request)
    {
        return await assistant.GenerateTestsAsync(User.GetUserId(), request.GetValueOrDefault("description", ""), request.GetValueOrDefault("language", "C#"));
    }
}
