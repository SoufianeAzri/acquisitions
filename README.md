# Acquisitions API

REST API built with Express 5, Neon (serverless Postgres), and Drizzle ORM.

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [Docker Desktop](https://docs.docker.com/get-docker/) (for containerized development/production)
- A [Neon](https://console.neon.tech) account with a project created

## Quick Start (without Docker)

```bash
npm install
cp .env.example .env        # fill in DATABASE_URL, JWT_SECRET
npm run db:migrate
npm run dev                  # http://localhost:3000
```

## Docker Setup

The project uses a multi-stage `Dockerfile` with separate Docker Compose files for dev and prod. Both stages create a dedicated non-root user (`appuser`) and transfer ownership of `/app` to that user for security.

### Development (Neon Local)

[Neon Local](https://neon.com/docs/local/neon-local) runs a local proxy that creates an **ephemeral database branch** from your Neon project. The branch is created when the container starts and deleted when it stops — giving you a fresh, isolated copy of your database each time.

#### 1. Configure environment

Copy and edit `.env.development` with your Neon credentials:

```env
NEON_API_KEY=napi_xxxx          # Settings → API Keys in Neon Console
NEON_PROJECT_ID=proud-dawn-1234 # Settings → General in Neon Console
PARENT_BRANCH_ID=br_xxxx        # Branch ID to fork from (usually your main branch)
```

#### 2. Start the stack

```powershell
docker compose -f docker-compose.dev.yml up --build
```

This starts two services:

- **neon-local** — Neon Local proxy on port 5432. Creates an ephemeral branch from `PARENT_BRANCH_ID`.
- **app** — The API on port 3000 with file watching enabled. Source files are bind-mounted for live reload.

The app connects to `postgres://neon:npg@neon-local:5432/neondb` automatically. The `NEON_LOCAL_HOST` env var tells `database.js` to configure the Neon serverless driver for local HTTP mode.

#### 3. Run migrations (inside the container)

```powershell
docker compose -f docker-compose.dev.yml exec app npm run db:migrate
```

#### 4. Stop and clean up

```powershell
docker compose -f docker-compose.dev.yml down
```

Stopping the Neon Local container automatically deletes the ephemeral branch.

### Production (Neon Cloud)

In production, the app connects directly to your Neon Cloud database — no local proxy.

#### 1. Configure environment

Edit `.env.production` and set your real credentials:

```env
JWT_SECRET=<strong-random-secret>
DATABASE_URL=postgres://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
ARCJET_KEY=<your-arcjet-key>
```

#### 2. Start the stack

```powershell
docker compose -f docker-compose.prod.yml up --build -d
```

This runs the app with:
- Production-only `node_modules` (no dev dependencies)
- Non-root `appuser` for security
- Health check on `/health`
- Automatic restart (`unless-stopped`)

#### 3. Stop

```powershell
docker compose -f docker-compose.prod.yml down
```

## How DATABASE_URL Switches Between Environments

| Environment | DATABASE_URL | How it's set |
|-------------|-------------|--------------|
| Development | `postgres://neon:npg@neon-local:5432/neondb` | Set in `docker-compose.dev.yml` `environment` block |
| Production  | `postgres://...neon.tech...` | Read from `.env.production` |

In development, `database.js` detects the `NEON_LOCAL_HOST` env var and configures the Neon serverless driver to use HTTP against the local proxy. In production, `NEON_LOCAL_HOST` is absent, so the driver connects to Neon Cloud normally.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with file watching |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting |
| `npm run db:generate` | Generate Drizzle migration from model changes |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:studio` | Open Drizzle Studio |

## Project Structure

```
src/
├── config/         # Database and logger configuration
├── controllers/    # Request handlers (validation + response)
├── middleware/      # Express middleware
├── models/         # Drizzle table schemas
├── routes/         # Express route definitions
├── services/       # Business logic and DB operations
├── utils/          # Shared helpers (JWT, cookies, formatting)
├── validations/    # Zod request schemas
├── app.js          # Express app setup and middleware
├── index.js        # Entrypoint
└── server.js       # HTTP listener
```
