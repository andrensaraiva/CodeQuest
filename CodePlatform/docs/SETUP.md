# Setup

## Without Docker

The development config uses SQLite by default.

1. Start the API:

```powershell
cd apps/api
dotnet run --launch-profile http
```

The API creates `codequest-dev.db` in `apps/api` and seeds demo data.

2. Start the web app:

```powershell
cd apps/web
npm install
npm run dev
```

3. Open:

- Web: `http://localhost:5173`
- Swagger: `http://localhost:5000/swagger`

## With Docker/PostgreSQL

1. Start PostgreSQL:

```powershell
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
cd apps/web
npm install
npm run dev
```

4. Open:

- Web: `http://localhost:5173`
- Swagger: `http://localhost:5000/swagger`

## Environment

The development default uses SQLite:

- `Database:Provider=Sqlite`
- `ConnectionStrings:SqliteConnection=Data Source=codequest-dev.db`

PostgreSQL connection string is also in `apps/api/appsettings.Development.json`.

For production, set:

- `ConnectionStrings__DefaultConnection`
- `Jwt__Issuer`
- `Jwt__Key`
- `Database__AutoMigrate=false`
- `VITE_API_URL`
