# MyCotoka

A Cotoka-style **Device as a Service (DaaS)** prototype — manage a device fleet, the clients leasing them, and the subscriptions linking them.

**Live demo:** https://my-cotoka-one.vercel.app

| Username   | Password     | Role        |
| ---------- | ------------ | ----------- |
| `admin`    | `Admin1234!` | Admin       |
| `testuser` | `Test1234!`  | ClientAdmin |

## Stack

- **Backend:** ASP.NET Core Web API (.NET 10) + EF Core + Pomelo (MySQL)
- **Frontend:** React + Vite + Fluent UI v9 + Recharts
- **Database:** MySQL 8.0
- **Auth:** JWT + BCrypt, role-based (`Admin` / `ClientAdmin`)

## Deployment

| Layer       | Host                                           |
| ----------- | ---------------------------------------------- |
| Frontend    | [Vercel](https://vercel.com)                   |
| Backend API | [Render](https://render.com) (Docker)          |
| Database    | [Aiven](https://aiven.io) (MySQL, Free-0 tier) |

## Features

- Full CRUD for Devices, Clients, Subscriptions (search, add, edit, delete)
- Admin-only Users management page
- Dashboard: fleet status, revenue-by-client, subscription trend, top plans
- Containerized backend (Docker Compose, MySQL health check)

## Run it locally

**Prerequisites:** Docker Desktop, Node.js 18+, and (for Option 2) the .NET 10 SDK.

### Option 1 — Docker (backend + database, no .NET SDK needed)

```bash
echo "JWT_KEY=$(openssl rand -base64 32)" > .env
docker compose up -d --build

cd frontend/mycotoka-web
npm install
npm run dev
```

- API: `http://localhost:5017`
- App: `http://localhost:5173`

Check both containers are healthy: `docker ps` should show `mycotoka-mysql` and `mycotoka-api` as `Up`.

### Option 2 — Local backend (`dotnet run`), MySQL still in Docker

```bash
docker compose up -d mysql

cd backend/MyCotoka.Api
dotnet user-secrets init
dotnet user-secrets set "Jwt:Key" "$(openssl rand -base64 32)"
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "server=localhost;port=3306;database=mycotoka_db;user=mycotoka_user;password=mycotoka_pass"
dotnet run
```

In a separate terminal:

```bash
cd frontend/mycotoka-web
npm install
npm run dev
```

Both the backend and frontend must keep running in their own terminals — neither one starts the other.

