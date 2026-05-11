# Roadmap

## Done

- ~~Improve permissions so teachers can only see their own exercise/class submissions.~~ (ownership checks in `CodeSubmissionService`.)
- ~~Real C# runner.~~ (`RoslynCodeRunnerService` with timeout + import allowlist + token blacklist.)
- ~~Request validation library.~~ (FluentValidation auto-validation on every DTO.)
- ~~Refresh tokens.~~ (Persisted, hashed, single-use, 30-day lifetime.)
- ~~Rate limiting on auth.~~ (Fixed-window 10 req/min/IP.)
- ~~Cryptographically-strong invite codes.~~
- ~~Structured logging.~~ (Serilog with request logging.)
- ~~Global exception handler returning `ProblemDetails`.~~
- ~~Pagination on submission endpoints.~~
- ~~Backend test project (xUnit + EF InMemory).~~
- ~~Frontend test setup (Vitest + Testing Library + jsdom).~~
- ~~CI workflow (GitHub Actions: build + lint + test for API and web).~~
- ~~Lazy-loaded Monaco editor and global `ErrorBoundary`.~~

## Next Phase

- Full teacher test editor for visible/hidden tests with live preview.
- Class-to-track assignment table.
- Lesson completion XP and streak badges.
- Container or Judge0-backed runner for code from outside the classroom.
- Background job queue for code execution (decouple submit from runner).
- Move JWT to `httpOnly` cookies and add CSRF tokens.

## Production Hardening

- Generate a PostgreSQL migration that includes `RefreshTokens` and the new indexes (currently relying on `EnsureCreated` for SQLite dev).
- Move all secrets to a secret manager.
- Audit logs for teacher/admin actions.
- E2E tests (Playwright) for the student and teacher critical paths.
- Bundle analysis and dynamic imports for teacher-only pages.

## Future Languages

- Java, JavaScript, Python runner adapters.
- Language-specific starter/test harness templates.
- Per-language resource limits.
