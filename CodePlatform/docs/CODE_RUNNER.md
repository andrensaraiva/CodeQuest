# Code Runner

All code execution goes through `ICodeRunnerService`:

```csharp
Task<CodeRunResponse> RunCodeAsync(TestRunRequest request);
Task<CodeRunResponse> RunTestsAsync(TestRunRequest request);
```

The request contains language, source code, exercise, tests, time limit, and memory limit. The response contains status, output, errors, test results, execution time, passed/failed counts, score, and feedback.

The runner is selected at startup by `CodeRunner:Provider`:

| Value | Service | When to use |
| --- | --- | --- |
| `Mock` (default) | `MockCodeRunnerService` | Deterministic, no compilation. Useful for UI work and demos. |
| `Roslyn` | `RoslynCodeRunnerService` | Real C# execution via `Microsoft.CodeAnalysis.CSharp.Scripting`. |

Set the timeout via `CodeRunner:TimeoutSeconds` (default `5`).

## Mock Runner

`MockCodeRunnerService` simulates C# tests with rule-based checks for the seeded exercises. It does not execute arbitrary student code. This is intentional and safer when no sandbox is available.

## Roslyn Runner

`RoslynCodeRunnerService` compiles and executes the student code together with each test inside the API process using `CSharpScript`. It enforces:

- **Timeout** per test (`CodeRunner:TimeoutSeconds`).
- **Allowlist of imports** — only `System`, `System.Linq`, `System.Collections.Generic`, `System.Text`, `System.Math`.
- **Blacklist of tokens** — submissions referencing `System.IO`, `System.Net`, `Process`, `Reflection`, `Runtime.InteropServices`, `Thread`, `AppDomain`, `Environment.Exit`, `File.`, `Directory.`, `DllImport`, or `unsafe` are rejected before compilation.
- **Per-test isolation of failures** — runtime exceptions and compilation errors are returned as failing test results, not 500s.

> ⚠️ This is not a hardened sandbox. The runner shares the API process and OS resources. It is acceptable for classroom use and CI but **not** for accepting code from the open internet. For that, replace it with Judge0 or Docker workers.

### Test format

Each `ExerciseTest` provides:

- `TestCode` — a C# expression appended to the student code. Its return value is compared to `ExpectedOutput` (string compare).
- `ExpectedOutput` — string to match. Booleans are compared as `true`/`false` lowercase, numbers via `ToString()`.

Example test for a `bool IsAlive(int health)` exercise:

```text
TestCode:       IsAlive(0)
ExpectedOutput: false
```

## Security Rules

- Never execute untrusted code without a sandbox stronger than the Roslyn in-process runner.
- Use isolated workers, Docker containers, Judge0, or cloud sandboxes for production.
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
6. Register it in `Program.cs` instead of the current runner.

## Replacing With Docker

Create a separate runner worker service.

1. API writes a job to a queue.
2. Worker starts a locked-down container.
3. Container mounts a temporary read-only test harness.
4. Run `dotnet test` with timeout.
5. Parse test output into test results.
6. Delete temp files and return results.

Do not mount host secrets or the main repo into the runner.
