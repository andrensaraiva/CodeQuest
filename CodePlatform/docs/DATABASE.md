# Database

The production database target is PostgreSQL through EF Core. For local development without Docker, the API can use SQLite through `Database:Provider=Sqlite`.

Core tables:

- `Users`: admin, teacher, student accounts with hashed passwords.
- `Classrooms`: teacher-owned classes with invite codes.
- `ClassStudents`: many-to-many enrollment between students and classes.
- `Tracks`: language/course path, currently C#.
- `Modules`: ordered worlds/stages inside a track.
- `Lessons`: structured lesson blocks stored as JSON.
- `Exercises`: coding quests with starter code, reference solution, skills, hints, XP.
- `ExerciseTests`: visible and hidden tests.
- `Submissions`: submitted student code, score, feedback, attempt number.
- `SubmissionTestResults`: per-test pass/fail result.
- `CodeRuns`: run-button logs.
- `XpEvents`: immutable XP ledger.
- `Badges` and `StudentBadges`: achievement catalog and unlocks.
- `AiInteractions`: placeholder AI logs.

Relationships:

- Teacher owns classrooms, tracks, and exercises.
- Track has many modules.
- Module has many lessons and exercises.
- Exercise has many tests and submissions.
- Submission has many test results.
- Student has many XP events and badges.

Migration:

`apps/api/Migrations/InitialCreate` contains the first schema.

SQLite local development uses `EnsureCreated` instead of the PostgreSQL migration because the first migration was generated for Npgsql. Use SQLite for quick local testing and PostgreSQL migrations for production-like development.
