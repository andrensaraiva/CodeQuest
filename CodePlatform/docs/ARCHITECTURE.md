# Architecture

The repo uses a small monorepo structure:

- `apps/api`: ASP.NET Core Web API.
- `apps/web`: React/Vite frontend.
- `packages`: reserved for shared UI/types later.
- `docs`: continuation and system documentation.

## Backend

Controllers are thin HTTP adapters. Services own business logic:

- `AuthService`: register, login, JWT.
- `ClassroomService`: class creation, joining, student progress.
- `LearningService`: tracks, modules, lessons, exercises.
- `CodeSubmissionService`: run, submit, attempt storage.
- `MockCodeRunnerService`: mocked C# test execution.
- `GamificationService`: XP, levels, badges, ranking.
- `ReportService`: class progress and difficulty reports.
- `AssistantService`: AI placeholder.

## Frontend

The frontend is feature-organized:

- `features/auth`: landing/login/register.
- `features/student`: dashboard, map, lesson, exercise, badges, ranking.
- `features/teacher`: dashboard, classes, builder, reports.
- `components`: reusable layout, UI, gamification components.
- `api/client.ts`: typed API wrapper.
- `stores/authStore.ts`: persisted auth session.
