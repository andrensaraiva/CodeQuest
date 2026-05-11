# Code Runner

All code execution goes through `ICodeRunnerService`.

```csharp
Task<CodeRunResponse> RunCodeAsync(TestRunRequest request);
Task<CodeRunResponse> RunTestsAsync(TestRunRequest request);
```

The request contains language, source code, exercise, tests, time limit, and memory limit. The response contains status, output, errors, test results, execution time, passed/failed counts, score, and feedback.

## MVP Runner

`MockCodeRunnerService` simulates C# tests with rule-based checks for the seeded exercises. It does not execute arbitrary student code. This is intentional and safer for the MVP.

## Security Rules

- Never execute student code in the API process.
- Use isolated workers, Docker containers, Judge0, or cloud sandboxes.
- Enforce CPU, memory, file system, and network limits.
- Store execution logs.
- Do not expose hidden expected values to students.

## Replacing With Judge0

Create `Judge0CodeRunnerService` implementing `ICodeRunnerService`.

1. Map `ProgrammingLanguage.CSharp` to the Judge0 C# language id.
2. Wrap student code and generated tests in a full source file or unit-test harness.
3. Submit to Judge0 with time and memory limits.
4. Poll for result.
5. Convert Judge0 stdout/stderr/status into `CodeRunResponse`.
6. Register it in `Program.cs` instead of `MockCodeRunnerService`.

## Replacing With Docker

Create a separate runner worker service.

1. API writes a job to a queue.
2. Worker starts a locked-down container.
3. Container mounts a temporary read-only test harness.
4. Run `dotnet test` with timeout.
5. Parse test output into test results.
6. Delete temp files and return results.

Do not mount host secrets or the main repo into the runner.
