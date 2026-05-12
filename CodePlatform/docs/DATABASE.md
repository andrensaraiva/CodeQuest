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
- `ExerciseHints` — structured hint levels per exercise (added May 2026). Each row has `Title`, `Content`, `PenaltyPercent`, `IsSolutionReveal`, `OrderIndex`.
- `StudentHintUnlocks` — tracks which hints a student unlocked for an exercise (added May 2026).
- `StudentEditorSettings` — per-user Monaco editor preferences (added May 2026). One row per user, unique `UserId` index.

Additional columns added in May 2026:
- `Exercises.AllowHints`, `Exercises.AllowSolutionReveal`, `Exercises.SolutionRevealXpPercent`.
- `Submissions.HintsUsedCount`, `Submissions.HighestHintLevelUsed`, `Submissions.HintPenaltyPercent`, `Submissions.XpBeforePenalty`, `Submissions.XpAwarded`.

## Indexes

- Unique: `Users.Email`, `Classrooms.InviteCode`, `ClassStudents(ClassroomId, StudentId)`, `StudentBadges(StudentId, BadgeId)`, `RefreshTokens.TokenHash`, `StudentEditorSettings.UserId`, `StudentHintUnlocks(StudentId, ExerciseId, HintId)`.
- Lookup: `RefreshTokens.UserId`, `Submissions(StudentId, ExerciseId)`, `Submissions.CreatedAt`, `XpEvents(StudentId, SourceType, SourceId, Reason)`, `ExerciseHints(ExerciseId, OrderIndex)`.

## Relationships

- Teacher owns classrooms, tracks, and exercises.
- Track has many modules.
- Module has many lessons and exercises.
- Exercise has many tests and submissions.
- Submission has many test results.
- Student has many XP events, badges, and refresh tokens.

## Migrations

`apps/api/Migrations/InitialCreate` is the first PostgreSQL schema. New entities added since then (`RefreshTokens`, `ExerciseHints`, `StudentHintUnlocks`, `StudentEditorSettings`, and the new columns on `Exercises` / `Submissions`) require a new migration before deploying to a Postgres environment:

```powershell
dotnet tool run dotnet-ef migrations add HintsAndEditorSettings `
  --project CodePlatform/apps/api/CodeQuest.Api.csproj `
  --startup-project CodePlatform/apps/api/CodeQuest.Api.csproj `
  -o Migrations
```

SQLite local development uses `EnsureCreated` instead of the PostgreSQL migration because migrations are generated for Npgsql. The first time you run after pulling the May 2026 update against an existing SQLite database, delete `codequest-dev.db` so `EnsureCreated` rebuilds the schema with the new tables and columns — `EnsureCreated` does not migrate.
