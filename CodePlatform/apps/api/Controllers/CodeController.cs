using CodeQuest.Api.DTOs;
using CodeQuest.Api.Security;
using CodeQuest.Api.Services.CodeRunner;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CodeQuest.Api.Controllers;

[ApiController]
[Authorize(Roles = "Student")]
[Route("code")]
public sealed class CodeController(ICodeSubmissionService submissions) : ControllerBase
{
    [HttpPost("run")]
    public async Task<CodeRunResponse> Run(CodeRunRequest request)
    {
        return await submissions.RunAsync(User.GetUserId(), request);
    }

    [HttpPost("submit")]
    public async Task<SubmissionDto> Submit(SubmitCodeRequest request)
    {
        return await submissions.SubmitAsync(User.GetUserId(), request);
    }
}
