# Backend Guide

The API is an ASP.NET Core Web API.

Run:

```powershell
cd apps/api
dotnet run --launch-profile http
```

Key services:

- Auth: JWT and BCrypt.
- Classrooms: role-aware class access and student progress.
- Learning: tracks, modules, lessons, exercises.
- CodeSubmission: run/submit persistence.
- CodeRunner: mock runner abstraction.
- Gamification: XP, levels, badges, ranking.
- Reports: class progress and difficult students.
- AI: placeholder assistant.

When adding features, keep controllers thin and place business rules in services.
