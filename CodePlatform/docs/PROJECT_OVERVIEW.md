# Project Overview

CodeQuest Academy is a gamified programming education platform for schools. It combines a learning management system, coding judge, teacher reporting dashboard, and game-like progression layer.

The platform proves this loop:

1. Teacher creates or uses a C# exercise.
2. Student opens the exercise in Monaco Editor.
3. Student runs visible tests or submits against all tests.
4. Backend compiles and executes the code (Roslyn) or falls back to a deterministic mock.
5. Backend stores code runs, submissions, test results, attempts, XP events, and badges.
6. Teacher sees progress, failed attempts, difficult exercises, and ranking.

## What Is Real

- ASP.NET Core 9 API, EF Core entities, PostgreSQL migration, JWT + refresh-token auth, BCrypt password hashing.
- React 19 frontend with dark gaming UI, routing, TanStack Query state, typed API client, lazy-loaded Monaco editor.
- Seeded C# game-logic curriculum (tracks, modules, lessons, exercises with visible/hidden tests).
- XP, levels, badges, class ranking, reports.
- Roslyn-based code runner (in-process scripting with timeout + API allowlist) for real C# evaluation.
- FluentValidation for request validation, Serilog for structured logging, rate-limited auth endpoints.
- xUnit tests for the backend; Vitest for the frontend.

## What Is Still Mocked

- The default code runner is `MockCodeRunnerService` (deterministic, no compilation). Switch to the real runner via `CodeRunner:Provider=Roslyn`.
- AI features use static/rule-based placeholder responses.
- Unity support is documented and scaffolded, not executed.
- Admin is a placeholder route.

## Bilingual UI and Theme

The interface starts in **PT-BR** by default and can switch to **EN-US**; the preference is stored in `localStorage`. Night/Day themes are tokenized in CSS so shared components respect the active mode.
