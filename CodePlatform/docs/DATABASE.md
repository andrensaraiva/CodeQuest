# Database

The production database target is PostgreSQL through EF Core. For local development without Docker, the API can use SQLite through `Database:Provider=Sqlite`.

## Core tables

- `Users` — admin, teacher, student accounts with BCrypt-hashed passwords.
- `RefreshTokens` — persisted refresh tokens (SHA256-hashed, with `ExpiresAt` and `RevokedAt`). Single-use, rotated on every refresh.
- `Classrooms` — teacher-owned classes with cryptographically-strong invite codes.
- `ClassStudents` — many-to-many enrollment between students and classes.
- `Tracks` — language/course paths.
- `Modules` — ordered worlds/stages inside a track.
- `Lessons` — structured lesson blocks stored as JSON.
- `Exercises` — coding quests with starter code, reference solution, skills, hints, XP.
- `ExerciseTests` — visible and hidden tests, optional `TestCode` consumed by the Roslyn runner.
- `Submissions` — submitted student code, score, feedback, attempt number.
- `SubmissionTestResults` — per-test pass/fail result.
- `CodeRuns` — run-button logs.
- `XpEvents` — immutable XP ledger.
- `Badges` and `StudentBadges` — achievement catalog and unlocks.
- `AiInteractions` — placeholder AI logs.

## Indexes

- Unique: `Users.Email`, `Classrooms.InviteCode`, `ClassStudents(ClassroomId, StudentId)`, `StudentBadges(StudentId, BadgeId)`, `RefreshTokens.TokenHash`.
- Lookup: `RefreshTokens.UserId`, `Submissions(StudentId, ExerciseId)`, `Submissions.CreatedAt`, `XpEvents(StudentId, SourceType, SourceId, Reason)`.

## Relationships

- Teacher owns classrooms, tracks, and exercises.
- Track has many modules.
- Module has many lessons and exercises.
- Exercise has many tests and submissions.
- Submission has many test results.
- Student has many XP events, badges, and refresh tokens.

## Migrations

`apps/api/Migrations/InitialCreate` is the first PostgreSQL schema. New entities added since then (notably `RefreshTokens` and the extra indexes) require a new migration before deploying to a Postgres environment:

```powershell
dotnet tool run dotnet-ef migrations add AddRefreshTokensAndIndexes `
  --project CodePlatform/apps/api/CodeQuest.Api.csproj `
  --startup-project CodePlatform/apps/api/CodeQuest.Api.csproj `
  -o Migrations
```

SQLite local development uses `EnsureCreated` instead of the PostgreSQL migration because migrations are generated for Npgsql. Use SQLite for quick local testing and PostgreSQL migrations for production-like development.
