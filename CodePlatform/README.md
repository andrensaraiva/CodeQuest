# CodeQuest Academy

CodeQuest Academy is a production-oriented MVP for a gamified programming learning platform for schools. It focuses on C# game-logic exercises, automatic correction through a runner abstraction, XP, badges, class ranking, teacher dashboards, and learning progress reports.

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, TanStack Query, React Router, Zustand, Monaco Editor.
- Backend: ASP.NET Core Web API, EF Core, PostgreSQL, JWT authentication.
- Runner: mock C# runner behind `ICodeRunnerService`; ready for Judge0, Docker workers, or cloud runners.

## Implemented Features

- Student and teacher registration/login with JWT.
- Demo seed data: teacher, 5 students, class, C# track, modules, lessons, exercises, tests, badges, submissions.
- Student dashboard, learning map, lessons, Monaco exercise page, run/submit flow, feedback, attempts, XP, badges, ranking.
- Teacher dashboard, class list/detail, exercise creator, progress reports.
- Hidden tests are not exposed to students through exercise APIs.
- EF Core migration and PostgreSQL Docker Compose.

## Requirements

- .NET SDK 9
- Node.js 20.19+ or 22.13+ recommended. The local build was verified on Node 22.12 with Vite pinned.
- Docker Desktop for PostgreSQL, or a local PostgreSQL instance.

## Run Locally Without Docker

The development profile uses SQLite by default, so you can test the app without Docker or PostgreSQL.

```powershell
cd c:\Users\Professor\Desktop\CodePlatform\apps\api
dotnet restore
dotnet run --launch-profile http
```

The API creates `apps/api/codequest-dev.db` automatically and seeds demo data.

In another terminal:

```powershell
cd c:\Users\Professor\Desktop\CodePlatform\apps\web
npm install
npm run dev
```

Open `http://localhost:5173`. API Swagger is available at `http://localhost:5000/swagger`.

## Run Locally With PostgreSQL/Docker

```powershell
docker compose up -d
cd apps/api
dotnet user-secrets set "Database:Provider" "Postgres"
dotnet restore
dotnet run --launch-profile http
```

In another terminal:

```powershell
cd apps/web
npm install
npm run dev
```

The API auto-applies migrations and seed data on startup while `Database:AutoMigrate` is true.

## Demo Accounts

- Teacher: `teacher@codequest.dev` / `password123`
- Students: `student1@codequest.dev` through `student5@codequest.dev` / `password123`
- Class invite code: `JOGOS2026`

## Useful Commands

```powershell
dotnet build apps/api/CodeQuest.Api.csproj
dotnet tool run dotnet-ef migrations add MigrationName --project apps/api/CodeQuest.Api.csproj --startup-project apps/api/CodeQuest.Api.csproj -o Migrations
npm --prefix apps/web run build
```

## Current Limitations

- Code execution is mocked. It never executes arbitrary student code in the API process.
- Exercise publishing to a specific class is implicit through the shared seeded track.
- Teacher builder creates a simple exercise shape; a richer test editor is the next step.
- Admin and Unity pages are scaffolds.

Read the full docs in `docs/`, especially `docs/CONTINUATION_GUIDE.md`.
