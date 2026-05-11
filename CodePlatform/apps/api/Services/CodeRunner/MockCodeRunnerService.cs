using System.Diagnostics;
using CodeQuest.Api.DTOs;
using CodeQuest.Api.Enums;

namespace CodeQuest.Api.Services.CodeRunner;

public sealed class MockCodeRunnerService : ICodeRunnerService
{
    public Task<CodeRunResponse> RunCodeAsync(TestRunRequest request)
    {
        var visibleTests = request.Tests.Where(x => !x.IsHidden).ToList();
        return RunTestsAsync(request with { Tests = visibleTests });
    }

    public Task<CodeRunResponse> RunTestsAsync(TestRunRequest request)
    {
        var watch = Stopwatch.StartNew();
        if (request.Language != ProgrammingLanguage.CSharp)
        {
            return Task.FromResult(new CodeRunResponse(
                CodeRunStatus.Failed,
                "",
                "Only C# has a mock runner in the MVP.",
                null,
                [],
                0,
                0,
                request.Tests.Count,
                0,
                "This language is planned but not active yet."));
        }

        var normalized = Normalize(request.Code);
        var understandsExercise = LooksCorrect(request.Exercise.Title, normalized);
        var results = request.Tests.Select(test =>
        {
            var passed = understandsExercise;
            var actual = passed ? test.ExpectedOutput : BuildIncorrectOutput(test.ExpectedOutput);
            return new RunnerTestResultDto(
                test.Id,
                test.Name,
                passed,
                test.IsHidden && !passed ? null : test.ExpectedOutput,
                test.IsHidden && !passed ? null : actual,
                passed ? null : FeedbackFor(request.Exercise.Title),
                test.IsHidden,
                Random.Shared.Next(12, 38));
        }).ToList();

        watch.Stop();
        var passedCount = results.Count(x => x.Passed);
        var failedCount = results.Count - passedCount;
        var score = results.Count == 0 ? 0 : (int)Math.Round((double)passedCount / results.Count * 100);
        var status = failedCount == 0 ? CodeRunStatus.Completed : CodeRunStatus.Failed;
        var feedback = failedCount == 0
            ? "Quest cleared. All tests passed."
            : FeedbackFor(request.Exercise.Title);

        return Task.FromResult(new CodeRunResponse(
            status,
            failedCount == 0 ? "All visible checks passed in the MVP mock runner." : "Some checks failed in the MVP mock runner.",
            null,
            null,
            results,
            (int)watch.ElapsedMilliseconds + results.Sum(x => x.ExecutionTimeMs),
            passedCount,
            failedCount,
            score,
            feedback));
    }

    private static bool LooksCorrect(string title, string code)
    {
        return title switch
        {
            "Player Health Check" => code.Contains("health>0") || code.Contains("health>=1"),
            "Calculate Damage" => (code.Contains("attack-defense") || code.Contains("attack - defense")) &&
                                  (code.Contains("math.max") || code.Contains("if(") || code.Contains("if (") || code.Contains("<0")),
            "Can Enter Dungeon" => code.Contains("playerlevel>=requiredlevel") || code.Contains("playerlevel >= requiredlevel"),
            "Calculate XP Reward" => code.Contains("defeatedenemies*25") || code.Contains("defeatedenemies * 25"),
            "Boss - Simple Turn Result" or "Boss — Simple Turn Result" => code.Contains("victory") && code.Contains("defeat") && code.Contains("continue") && code.Contains("enemyhealth") && code.Contains("playerhealth"),
            _ => !code.Contains("return0;") && !code.Contains("returnfalse;") && !code.Contains("return\"\";")
        };
    }

    private static string Normalize(string code)
    {
        return code
            .Replace("\r", "")
            .Replace("\n", "")
            .Replace("\t", "")
            .Replace(" ", "")
            .ToLowerInvariant();
    }

    private static string BuildIncorrectOutput(string expected)
    {
        if (bool.TryParse(expected, out var b))
        {
            return (!b).ToString().ToLowerInvariant();
        }

        if (int.TryParse(expected, out var i))
        {
            return (i + 1).ToString();
        }

        return "Unexpected";
    }

    private static string FeedbackFor(string title)
    {
        return title switch
        {
            "Player Health Check" => "Check the boundary: health greater than zero means alive, zero and negative values do not.",
            "Calculate Damage" => "Your damage formula needs to subtract defense and clamp negative damage to zero.",
            "Can Enter Dungeon" => "Remember that equal levels should be accepted, so use an at-least comparison.",
            "Calculate XP Reward" => "Each defeated enemy is worth 25 XP. Multiply the count by the reward value.",
            "Boss - Simple Turn Result" or "Boss — Simple Turn Result" => "Order the battle outcomes carefully: enemy defeated means Victory, player defeated means Defeat, otherwise Continue.",
            _ => "Review the method return value and compare it with the visible examples."
        };
    }
}
