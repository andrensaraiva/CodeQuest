# Continuation Guide

This file is for the next developer or AI continuing CodeQuest Academy.

## Current Architecture

- Backend: `apps/api`, ASP.NET Core 9, EF Core, PostgreSQL, JWT.
- Frontend: `apps/web`, React/TypeScript/Vite/Tailwind.
- Database migrations: `apps/api/Migrations`.
- Seed data: `apps/api/Data/DatabaseSeeder.cs`.
- Runner abstraction: `apps/api/Services/CodeRunner`.

## Important Files

- `Program.cs`: dependency injection, auth, CORS, Swagger, migration/seed startup.
- `Data/AppDbContext.cs`: EF schema configuration.
- `Entities/DomainEntities.cs`: domain model.
- `DTOs/ApiDtos.cs`: API contracts.
- `Services/CodeRunner/MockCodeRunnerService.cs`: mocked runner.
- `apps/web/src/features/student/StudentPages.tsx`: student learning loop.
- `apps/web/src/features/teacher/TeacherPages.tsx`: teacher MVP flow.
- `apps/web/src/components/ui/primitives.tsx`: UI primitives.

## Implemented

- Auth, classrooms, learning content, exercises, visible/hidden tests, run/submit, submissions, XP, badges, ranking, reports, AI placeholder, Unity placeholder.

## Missing

- Real isolated runner.
- Full exercise test editor.
- Class-track assignments.
- Fine-grained teacher ownership checks for all report/submission routes.
- Automated tests.
- Admin console.

## Warnings

- Do not execute arbitrary code in the API process.
- Do not expose `ReferenceSolution` or hidden expected outputs to students.
- Keep `XpEvents` as an append-only ledger.
- Replace JWT dev key before deployment.
- Keep Game Jolt only as broad inspiration; do not copy exact UI or assets.

## Next Development Steps

1. Add backend validation and tests for auth/permissions.
2. Add assignment model: `ClassroomTrack`.
3. Build teacher test editor with add/remove visible and hidden tests.
4. Replace mock runner with Judge0 or Docker worker.
5. Add lesson completion events.
6. Add JavaScript/Python runner templates after C# runner is stable.
