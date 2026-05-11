# Project Overview

CodeQuest Academy is a gamified programming education MVP for schools. It combines a learning management system, coding judge, teacher reporting dashboard, and game-like progression layer.

The MVP proves this loop:

1. Teacher creates or uses a C# exercise.
2. Student opens the exercise in Monaco Editor.
3. Student runs visible tests or submits against all tests.
4. Backend stores code runs, submissions, test results, attempts, XP events, and badges.
5. Teacher sees progress, failed attempts, difficult exercises, and ranking.

## Real In MVP

- ASP.NET Core API, EF Core entities, PostgreSQL migration, JWT auth, password hashing.
- React frontend with dark gaming UI, routing, state, API client, Monaco editor.
- Seeded C# game-logic curriculum.
- XP, levels, badges, ranking, reports.

## Mocked In MVP

- The code runner is mocked through `MockCodeRunnerService`.
- AI features use static/rule-based placeholder responses.
- Unity support is documented and scaffolded, not executed.
- Admin is a placeholder route.
