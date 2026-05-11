# API

Base URL: `http://localhost:5000`

Auth:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

Classes:

- `GET /classes`
- `POST /classes`
- `GET /classes/{id}`
- `POST /classes/join`
- `POST /classes/{id}/join`
- `GET /classes/{id}/students`
- `GET /classes/{id}/ranking`
- `GET /classes/{id}/report`
- `GET /classes/{id}/difficult-students`

Learning:

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

Code:

- `POST /code/run`
- `POST /code/submit`

Submissions:

- `GET /submissions/me`
- `GET /submissions/exercises/{exerciseId}`
- `GET /submissions/classes/{classroomId}`

Gamification:

- `GET /me/xp`
- `GET /me/badges`

AI:

- `POST /ai/hint`
- `POST /ai/generate-exercise`
- `POST /ai/generate-tests`

Example login:

```json
{
  "email": "teacher@codequest.dev",
  "password": "password123"
}
```

Example code submit:

```json
{
  "exerciseId": "guid",
  "language": "CSharp",
  "code": "public class Program { ... }"
}
```
