# Setup

## Without Docker

The development config uses SQLite by default.

1. Start the API:

```powershell
cd CodePlatform/apps/api
dotnet run --launch-profile http
```

The API creates `codequest-dev.db` in `apps/api` and seeds demo data.

2. Start the web app:

```powershell
cd CodePlatform/apps/web
npm install
npm run dev
```

3. Open:

- Web: `http://localhost:5173`
- Swagger: `http://localhost:5000/swagger`
- Health: `http://localhost:5000/health`

## With Docker / PostgreSQL

1. Start PostgreSQL:

```powershell
cd CodePlatform
docker compose up -d
```

2. Set the provider to PostgreSQL and start the API:

```powershell
cd apps/api
dotnet user-secrets set "Database:Provider" "Postgres"
dotnet run --launch-profile http
```

3. Start the web app:

```powershell
cd CodePlatform/apps/web
npm install
npm run dev
```

## Real C# Runner (Roslyn)

The default runner is the deterministic mock. To execute real C# submissions:

```powershell
cd CodePlatform/apps/api
dotnet user-secrets set "CodeRunner:Provider" "Roslyn"
# Optional: timeout per test in seconds (default 5)
dotnet user-secrets set "CodeRunner:TimeoutSeconds" "5"
```

See [`CODE_RUNNER.md`](CODE_RUNNER.md) for the security model.

## Tests

```powershell
# Backend
dotnet test CodeQuest.sln

# Frontend
cd CodePlatform/apps/web
npm test
```

## Environment

The development default uses SQLite:

- `Database:Provider=Sqlite`
- `ConnectionStrings:SqliteConnection=Data Source=codequest-dev.db`

PostgreSQL connection string is also in `apps/api/appsettings.Development.json`.

For **production**, set every secret via environment variables, user secrets, or your platform's secret manager — the API fails to start if `Jwt:Key` is missing or shorter than 32 chars in non-development environments:

- `ConnectionStrings__DefaultConnection`
- `Jwt__Issuer`
- `Jwt__Key` (32+ characters, random)
- `Jwt__ExpirationHours` (optional, default 12)
- `Database__AutoMigrate=false`
- `Cors__AllowedOrigins__0=https://your-frontend.example`
- `CodeRunner__Provider=Roslyn` (or your judge of choice once implemented)
- `VITE_API_URL` (frontend build-time)
