using CodeQuest.Api.DTOs;
using CodeQuest.Api.Security;
using CodeQuest.Api.Services.Reports;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CodeQuest.Api.Controllers;

[ApiController]
[Authorize(Roles = "Teacher")]
[Route("classes/{classroomId:guid}")]
public sealed class ReportsController(IReportService reports) : ControllerBase
{
    [HttpGet("report")]
    public async Task<ClassReportDto> Report(Guid classroomId)
    {
        return await reports.GetClassReportAsync(classroomId, User.GetUserId(), User.GetRole());
    }

    [HttpGet("difficult-students")]
    public async Task<IReadOnlyList<StudentProgressDto>> DifficultStudents(Guid classroomId)
    {
        return await reports.GetDifficultStudentsAsync(classroomId, User.GetUserId(), User.GetRole());
    }
}
