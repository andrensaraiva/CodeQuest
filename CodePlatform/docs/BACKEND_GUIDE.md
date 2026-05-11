# Backend Guide

The API is an ASP.NET Core 9 Web API.

Run:

```powershell
cd CodePlatform/apps/api
dotnet run --launch-profile http
```

Test:

```powershell
dotnet test CodeQuest.sln
```

## Layers

- **Controllers** — thin HTTP adapters under `Controllers/`. They delegate to services and never touch `DbContext`.
- **Services** — business rules, grouped by domain under `Services/`.
- **Data** — `AppDbContext` plus `DatabaseSeeder` (demo data).
- **Entities / DTOs / Enums** — domain types and transport contracts.
- **Security** — `JwtOptions`, claims extensions.
- **Validators** — FluentValidation rules for every incoming DTO.

## Key Services

- **Auth**: JWT (HS256) + BCrypt + persisted refresh tokens (hashed with SHA256, single-use rotation, 30-day lifetime).
- **Classrooms**: role-aware access, cryptographically-strong invite codes (`RandomNumberGenerator`).
- **Learning**: tracks, modules, lessons, exercises.
- **CodeSubmission**: run/submit persistence, enrollment + publication checks, paginated history.
- **CodeRunner**: `MockCodeRunnerService` or `RoslynCodeRunnerService`, selected by `CodeRunner:Provider`.
- **Gamification**: XP, levels, badges, ranking — the award path runs inside a DB transaction to prevent duplicates under concurrent submissions.
- **Reports**: class progress and difficult students.
- **AI**: placeholder assistant.

## Conventions

- Throw `InvalidOperationException` for client-state errors → mapped to **400**.
- Throw `UnauthorizedAccessException` for forbidden access → mapped to **403**.
- Throw `KeyNotFoundException` for missing resources → mapped to **404**.
- Keep services testable: depend on `AppDbContext`, configuration, and other services; avoid static state.
- Add a FluentValidation validator next to every new DTO.
- Log via the injected `ILogger<T>`; structured fields stay readable in Serilog.
