# CodeQuest Academy

CodeQuest Academy is a gamified programming learning platform for schools. It focuses on C# game-logic exercises, real code execution through a runner abstraction, XP, badges, class ranking, teacher dashboards, and learning progress reports.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS v4, TanStack Query, React Router 7, Zustand, Monaco Editor (lazy-loaded).
- **Backend**: ASP.NET Core 9, EF Core, PostgreSQL/SQLite, JWT + refresh tokens, BCrypt, FluentValidation, Serilog, rate limiting.
- **Runner**: `MockCodeRunnerService` (default) or `RoslynCodeRunnerService` (real C# via `Microsoft.CodeAnalysis.CSharp.Scripting`), selectable by configuration. Pluggable for Judge0 or Docker workers.
- **Tests**: xUnit + EF InMemory (API), Vitest + Testing Library (web).
- **CI**: GitHub Actions runs build, lint, and tests on every push / PR.

## Implemented Features

- Student and teacher registration/login with JWT + refresh-token rotation.
- Demo seed data: teacher, 5 students, class, C# track, modules, lessons, exercises, tests, badges.
- Student dashboard, learning map, lessons, Monaco exercise page, run/submit flow with feedback, attempts, XP, badges, ranking.
- Teacher dashboard, class list/detail, exercise creator, progress reports.
- Hidden tests stay hidden from students through every API.
- Real C# code execution (opt-in) with per-test timeout and an import allowlist.
- Paginated submission history.
- Health endpoint at `/health`.
- PT-BR / EN-US interface and Night / Day themes.

## Requirements

- .NET SDK 9
- Node.js 20+ recommended.
- Docker Desktop for PostgreSQL, or a local PostgreSQL instance (optional for dev — SQLite is the default).

## Run Locally Without Docker

```powershell
cd CodePlatform/apps/api
dotnet restore
dotnet run --launch-profile http
```

The API creates `apps/api/codequest-dev.db` automatically and seeds demo data.

In another terminal:

```powershell
cd CodePlatform/apps/web
npm install
npm run dev
```

Open `http://localhost:5173`. Swagger at `http://localhost:5000/swagger`, health at `http://localhost:5000/health`.

## Run With PostgreSQL/Docker

```powershell
cd CodePlatform
docker compose up -d
cd apps/api
dotnet user-secrets set "Database:Provider" "Postgres"
dotnet restore
dotnet run --launch-profile http
```

```powershell
cd CodePlatform/apps/web
npm install
npm run dev
```

## Enable the Real C# Runner

```powershell
cd CodePlatform/apps/api
dotnet user-secrets set "CodeRunner:Provider" "Roslyn"
dotnet user-secrets set "CodeRunner:TimeoutSeconds" "5"   # optional, default 5
```

The Roslyn runner compiles and executes student code in-process with a timeout and an API allowlist. It is **not** a sandbox. See [`docs/CODE_RUNNER.md`](docs/CODE_RUNNER.md).

## Tests

```powershell
# API
dotnet test CodeQuest.sln

# Web
cd CodePlatform/apps/web
npm test
```

## Demo Accounts

- Teacher: `teacher@codequest.dev` / `password123`
- Students: `student1@codequest.dev` … `student5@codequest.dev` / `password123`
- Class invite code: `JOGOS2026`

## Useful Commands

```powershell
dotnet build CodeQuest.sln
dotnet tool run dotnet-ef migrations add MigrationName `
  --project CodePlatform/apps/api/CodeQuest.Api.csproj `
  --startup-project CodePlatform/apps/api/CodeQuest.Api.csproj `
  -o Migrations
npm --prefix CodePlatform/apps/web run build
npm --prefix CodePlatform/apps/web run lint
```

## Current Limitations

- Default code execution is mocked; opt-in to Roslyn for real evaluation. Roslyn is in-process and is not a hardened sandbox — use Judge0 or Docker for code from outside the classroom.
- Exercise publishing to a specific class is implicit through the shared seeded track.
- Teacher builder creates a simple exercise shape; a richer test editor is the next step.
- Admin and Unity pages are scaffolds.
- New `RefreshTokens` table needs a PostgreSQL migration before production deploy (SQLite dev uses `EnsureCreated`).

Read the full docs in [`docs/`](docs/), especially [`docs/CONTINUATION_GUIDE.md`](docs/CONTINUATION_GUIDE.md) and [`docs/ROADMAP.md`](docs/ROADMAP.md).
