# API

Base URL: `http://localhost:5000`

All errors are returned in `application/problem+json` shape with `status`, `title`, and `detail`.

## Auth

- `POST /auth/register` — rate-limited (10 req/min/IP). Password ≥ 8 chars.
- `POST /auth/login` — rate-limited (10 req/min/IP).
- `POST /auth/refresh` — exchanges a refresh token for a new access + refresh pair; rotates the refresh token (single use).
- `POST /auth/logout` — revokes the supplied refresh token.
- `GET /auth/me` — current user (requires bearer token).

`POST /auth/login` and `POST /auth/register` return:

```json
{
  "token": "<jwt>",
  "refreshToken": "<opaque-string>",
  "user": { "id": "guid", "name": "...", "email": "...", "role": "Student", "avatarUrl": null }
}
```

## Classes

- `GET /classes`
- `POST /classes`
- `GET /classes/{id}`
- `POST /classes/join`
- `POST /classes/{id}/join`
- `GET /classes/{id}/students`
- `GET /classes/{id}/ranking`
- `GET /classes/{id}/report`
- `GET /classes/{id}/difficult-students`

## Learning

- `GET /tracks`
- `POST /tracks`
- `GET /tracks/{id}`
- `GET /tracks/{trackId}/modules`
- `POST /modules`
- `GET /modules/{id}`
- `GET /modules/{moduleId}/lessons`
- `GET /modules/{moduleId}/exercises`
- `POST /lessons`
- `GET /lessons/{id}`
- `POST /exercises`
- `GET /exercises/{id}`
- `PUT /exercises/{id}`
- `POST /exercises/{id}/publish`

## Code

- `POST /code/run` — runs visible tests. Requires the student to be enrolled in at least one classroom and the exercise to be published.
- `POST /code/submit` — runs all tests, persists the submission, awards XP on success.

## Submissions (paginated)

All submission endpoints accept `?page=1&pageSize=25` and return:

```json
{
  "items": [...],
  "page": 1,
  "pageSize": 25,
  "totalCount": 42,
  "totalPages": 2
}
```

- `GET /submissions/me` — student-only.
- `GET /submissions/exercises/{exerciseId}` — teacher only, must own the exercise.
- `GET /submissions/classes/{classroomId}` — teacher only, must own the classroom.

## Gamification

- `GET /me/xp`
- `GET /me/badges`

## AI (placeholders)

- `POST /ai/hint`
- `POST /ai/generate-exercise`
- `POST /ai/generate-tests`

## Ops

- `GET /health` — basic liveness check.

## Examples

Login:

```json
{ "email": "teacher@codequest.dev", "password": "password123" }
```

Refresh:

```json
{ "refreshToken": "<token-from-login>" }
```

Submit:

```json
{ "exerciseId": "guid", "language": "CSharp", "code": "public bool IsAlive(int h) => h > 0;" }
```
