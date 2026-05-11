# AI Handoff

The user wants a production-ready MVP for a gamified programming education platform named CodeQuest Academy.

Maintain these decisions:

- C# is the primary language.
- ASP.NET Core was chosen because the curriculum is C#-first.
- PostgreSQL and EF Core are the source of truth.
- Code execution must stay behind `ICodeRunnerService`.
- The current runner is explicitly mocked and documented.
- The UI is dark, gaming/community-inspired, neon green accented, and original.
- Unity support should progress through pure C# logic, script analysis, then project submissions.

Where to add features:

- New backend business logic: `apps/api/Services`.
- New API routes: `apps/api/Controllers`.
- New entities: `Entities/DomainEntities.cs` and `AppDbContext`.
- New frontend screens: `apps/web/src/features`.
- Shared UI: `apps/web/src/components`.

Do not:

- Run untrusted student code in the API.
- Leak hidden tests or reference solutions.
- Change seeded demo credentials without updating docs.
- Replace the dark gaming design with a generic school admin UI.
