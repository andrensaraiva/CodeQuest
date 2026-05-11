# Architecture

The repo uses a small monorepo structure:

- `apps/api`: ASP.NET Core 9 Web API.
- `apps/web`: React 19 / Vite frontend.
- `apps/tests`: xUnit test project for the API.
- `packages`: reserved for shared UI/types later.
- `docs`: continuation and system documentation.

## Backend

Controllers are thin HTTP adapters. Services own the business rules:

- `AuthService` — register, login, JWT issuance, refresh-token rotation, password requirements.
- `ClassroomService` — class creation (with cryptographically-strong invite codes), joining, role-aware access, student progress.
- `LearningService` — tracks, modules, lessons, exercises.
- `CodeSubmissionService` — run, submit, paginated attempt history, enrollment + ownership checks.
- `ICodeRunnerService` — real (`RoslynCodeRunnerService`) or mock (`MockCodeRunnerService`) runner, selected by `CodeRunner:Provider`.
- `GamificationService` — XP, levels, badges, ranking, with a DB transaction guarding completion awards.
- `ReportService` — class progress and difficulty reports.
- `AssistantService` — placeholder AI responses.

### Cross-cutting

- **Validation**: `FluentValidation` auto-validates every request DTO; rules live in `Validators/RequestValidators.cs`.
- **Auth options**: `JwtOptions` (issuer, key, expiration) is bound from configuration and validated at startup — the API fails fast in production when the key is missing or shorter than 32 chars.
- **Exception handling**: `UseExceptionHandler` maps `InvalidOperationException → 400`, `UnauthorizedAccessException → 403`, `KeyNotFoundException → 404`. Responses follow the `ProblemDetails` shape.
- **Rate limiting**: `AddRateLimiter` with a fixed-window policy `auth` (10 req/min per IP) applied to `/auth/*`.
- **CORS**: origins come from `Cors:AllowedOrigins` in `appsettings.json`.
- **Logging**: Serilog with `UseSerilogRequestLogging`; thresholds in `appsettings.Serilog`.
- **Health**: `GET /health` exposes a basic liveness check.

## Frontend

The frontend is feature-organized:

- `features/auth` — landing, login, register.
- `features/student` — dashboard, learning map, module, lesson, exercise, badges, ranking.
- `features/teacher` — dashboard, classes, builder, reports.
- `components` — layout (`AppShell`, `ErrorBoundary`), UI primitives, gamification widgets, preference controls.
- `api/client.ts` — typed API wrapper with automatic refresh-token retry on 401 and a global redirect to `/login` when refresh fails.
- `stores/authStore.ts` — Zustand store for access token + refresh token + user, persisted in `localStorage`.
- `i18n/preferences.tsx` — language + theme provider with PT-BR/EN-US dictionaries.

The Monaco editor is loaded lazily via `React.lazy` so the editor chunk never blocks the initial paint.
