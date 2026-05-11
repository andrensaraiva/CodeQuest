using System.Diagnostics;
using CodeQuest.Api.DTOs;
using CodeQuest.Api.Entities;
using CodeQuest.Api.Enums;
using Microsoft.CodeAnalysis.CSharp.Scripting;
using Microsoft.CodeAnalysis.Scripting;

namespace CodeQuest.Api.Services.CodeRunner;

public sealed class RoslynCodeRunnerService(IConfiguration config, ILogger<RoslynCodeRunnerService> logger) : ICodeRunnerService
{
    private static readonly string[] ForbiddenTokens =
    {
        "System.IO",
        "System.Net",
        "System.Diagnostics.Process",
        "System.Reflection",
        "System.Runtime.InteropServices",
        "System.Threading.Thread",
        "AppDomain",
        "Environment.Exit",
        "File.",
        "Directory.",
        "Process.",
        "DllImport",
        "unsafe",
    };

    private readonly int _timeoutMs = config.GetValue("CodeRunner:TimeoutSeconds", 5) * 1000;

    public Task<CodeRunResponse> RunCodeAsync(TestRunRequest request)
    {
        var visibleTests = request.Tests.Where(x => !x.IsHidden).ToList();
        return RunTestsAsync(request with { Tests = visibleTests });
    }

    public async Task<CodeRunResponse> RunTestsAsync(TestRunRequest request)
    {
        if (request.Language != ProgrammingLanguage.CSharp)
        {
            return new CodeRunResponse(
                CodeRunStatus.Failed, "", "Only C# is supported by the Roslyn runner.", null, [], 0, 0, request.Tests.Count, 0,
                "This language is planned but not active yet.");
        }

        var blocked = ForbiddenTokens.FirstOrDefault(token => request.Code.Contains(token, StringComparison.OrdinalIgnoreCase));
        if (blocked is not null)
        {
            return new CodeRunResponse(
                CodeRunStatus.Failed, "", $"Use of '{blocked}' is not allowed in student code.", null, [], 0, 0, request.Tests.Count, 0,
                "Your submission references a forbidden API. Stick to language fundamentals.");
        }

        var watch = Stopwatch.StartNew();
        var options = ScriptOptions.Default
            .WithReferences(
                typeof(object).Assembly,
                typeof(Enumerable).Assembly,
                typeof(System.Collections.Generic.List<>).Assembly)
            .WithImports("System", "System.Linq", "System.Collections.Generic", "System.Text", "System.Math");

        Script<object>? compiledStudent = null;
        try
        {
            compiledStudent = CSharpScript.Create<object>(request.Code, options);
            var diagnostics = compiledStudent.Compile();
            var errors = diagnostics.Where(d => d.Severity == Microsoft.CodeAnalysis.DiagnosticSeverity.Error).ToList();
            if (errors.Count > 0)
            {
                var msg = string.Join("\n", errors.Select(d => d.GetMessage()));
                return new CodeRunResponse(CodeRunStatus.CompilationError, "", null, msg, [], (int)watch.ElapsedMilliseconds, 0, request.Tests.Count, 0,
                    "Compilation failed. Check the syntax and method signatures.");
            }
        }
        catch (CompilationErrorException ex)
        {
            return new CodeRunResponse(CodeRunStatus.CompilationError, "", null, ex.Message, [], (int)watch.ElapsedMilliseconds, 0, request.Tests.Count, 0,
                "Compilation failed. Check the syntax and method signatures.");
        }

        var results = new List<RunnerTestResultDto>();
        foreach (var test in request.Tests)
        {
            results.Add(await RunSingleTestAsync(compiledStudent, request.Code, test));
        }

        watch.Stop();
        var passedCount = results.Count(x => x.Passed);
        var failedCount = results.Count - passedCount;
        var score = results.Count == 0 ? 0 : (int)Math.Round((double)passedCount / results.Count * 100);
        var status = failedCount == 0 ? CodeRunStatus.Completed : CodeRunStatus.Failed;
        var feedback = failedCount == 0
            ? "All tests passed."
            : "Some tests failed. Inspect the visible outputs and adjust your logic.";

        return new CodeRunResponse(
            status,
            failedCount == 0 ? "All tests passed." : "Some tests failed.",
            null, null, results,
            (int)watch.ElapsedMilliseconds,
            passedCount, failedCount, score, feedback);
    }

    private async Task<RunnerTestResultDto> RunSingleTestAsync(Script<object> studentScript, string studentCode, ExerciseTest test)
    {
        var testWatch = Stopwatch.StartNew();
        using var cts = new CancellationTokenSource(_timeoutMs);
        try
        {
            var fullScript = string.IsNullOrWhiteSpace(test.TestCode)
                ? studentCode
                : studentCode + "\n" + test.TestCode;

            var options = studentScript.Options;
            var result = await CSharpScript.EvaluateAsync<object?>(fullScript, options, cancellationToken: cts.Token);
            testWatch.Stop();

            var actual = FormatValue(result);
            var passed = string.Equals(actual.Trim(), test.ExpectedOutput.Trim(), StringComparison.Ordinal);
            return new RunnerTestResultDto(
                test.Id,
                test.Name,
                passed,
                test.IsHidden && !passed ? null : test.ExpectedOutput,
                test.IsHidden && !passed ? null : actual,
                passed ? null : "Output did not match the expected value.",
                test.IsHidden,
                (int)testWatch.ElapsedMilliseconds);
        }
        catch (OperationCanceledException)
        {
            testWatch.Stop();
            return new RunnerTestResultDto(test.Id, test.Name, false, test.IsHidden ? null : test.ExpectedOutput, null,
                $"Test exceeded {_timeoutMs}ms time limit.", test.IsHidden, (int)testWatch.ElapsedMilliseconds);
        }
        catch (CompilationErrorException ex)
        {
            testWatch.Stop();
            logger.LogDebug(ex, "Test compilation error for test {TestName}", test.Name);
            return new RunnerTestResultDto(test.Id, test.Name, false, test.IsHidden ? null : test.ExpectedOutput, null,
                $"Compilation error: {ex.Message}", test.IsHidden, (int)testWatch.ElapsedMilliseconds);
        }
        catch (Exception ex)
        {
            testWatch.Stop();
            logger.LogDebug(ex, "Test runtime error for test {TestName}", test.Name);
            return new RunnerTestResultDto(test.Id, test.Name, false, test.IsHidden ? null : test.ExpectedOutput, null,
                $"Runtime error: {ex.Message}", test.IsHidden, (int)testWatch.ElapsedMilliseconds);
        }
    }

    private static string FormatValue(object? value) => value switch
    {
        null => "",
        bool b => b ? "true" : "false",
        string s => s,
        _ => value.ToString() ?? "",
    };
}
