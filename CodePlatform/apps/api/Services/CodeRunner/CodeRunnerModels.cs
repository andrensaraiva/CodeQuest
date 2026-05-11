using CodeQuest.Api.DTOs;
using CodeQuest.Api.Entities;
using CodeQuest.Api.Enums;

namespace CodeQuest.Api.Services.CodeRunner;

public sealed record TestRunRequest(ProgrammingLanguage Language, string Code, Exercise Exercise, IReadOnlyList<ExerciseTest> Tests, int TimeLimitMs = 2000, int MemoryLimitMb = 128);

public interface ICodeRunnerService
{
    Task<CodeRunResponse> RunCodeAsync(TestRunRequest request);
    Task<CodeRunResponse> RunTestsAsync(TestRunRequest request);
}
