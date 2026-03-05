# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Acquisitions is a Node.js REST API built with Express 5, using Neon (serverless Postgres) as the database via Drizzle ORM. It uses ES modules (`"type": "module"`) throughout and JWT-based cookie authentication.

## Commands

- **Dev server:** `npm run dev` (uses `node --watch`)
- **Lint:** `npm run lint` / `npm run lint:fix`
- **Format:** `npm run format` / `npm run format:check`
- **Generate DB migration:** `npm run db:generate`
- **Run DB migration:** `npm run db:migrate`
- **Drizzle Studio:** `npm run db:studio`
- **No test framework is configured yet.** The `test` script is a placeholder.

## Architecture

The app uses a layered architecture with clear separation of concerns:

**Routes → Controllers → Services → Database**

- `src/index.js` — Entrypoint; imports `server.js`.
- `src/server.js` — Starts the Express listener on `PORT`.
- `src/app.js` — Creates and configures the Express app (helmet, cors, morgan, cookie-parser, JSON parsing) and mounts route groups. Health check at `/health`, API root at `/api`.
- `src/routes/` — Express routers defining HTTP endpoints. All API routes are mounted under `/api` (e.g. `/api/auth`).
- `src/controllers/` — Request handlers. Validate input using Zod schemas, call services, format responses. Errors are forwarded to Express via `next(error)`.
- `src/services/` — Business logic and database operations using Drizzle ORM.
- `src/models/` — Drizzle table schema definitions (e.g. `users` table in `user.model.js`). These are also the source of truth for `drizzle-kit generate`.
- `src/validations/` — Zod schemas for request validation (imported by controllers).
- `src/utils/` — Shared helpers: JWT sign/verify (`jwt.js`), cookie management (`cookies.js`), validation formatting (`format.js`).
- `src/config/database.js` — Neon + Drizzle client setup.
- `src/config/logger.js` — Winston logger: files (`logs/error.log`, `logs/combined.log`) + console in non-production.

## Import Aliases

The project uses Node.js subpath imports defined in `package.json`:

```
#config/*    → ./src/config/*
#controllers/* → ./src/controllers/*
#middleware/* → ./src/middleware/*
#models/*    → ./src/models/*
#utils/*     → ./src/utils/*
#services/*  → ./src/services/*
#routes/*    → ./src/routes/*
#validations/* → ./src/validations/*
```

Always use these `#`-prefixed aliases for internal imports instead of relative paths.

## Code Style

- ESLint + Prettier enforced. 2-space indent, single quotes, semicolons required.
- Arrow functions preferred (`prefer-arrow-callback`). Use `const` over `let`; no `var`.
- Unused function parameters prefixed with `_` are allowed (`argsIgnorePattern: "^_"`).
- End-of-line: LF (not CRLF).

## Database

- **Provider:** Neon (serverless Postgres) via `@neondatabase/serverless`.
- **ORM:** Drizzle ORM with `neon-http` driver.
- **Schema location:** `src/models/*.js` — Drizzle table definitions.
- **Migrations:** Generated into `drizzle/` directory. After changing a model, run `npm run db:generate` then `npm run db:migrate`.
- **Config:** `drizzle.config.js` at project root.

## Environment Variables

Defined in `.env` (see `.env.example`): `PORT`, `NODE_ENV`, `LOG_LEVEL`, `DATABASE_URL`. JWT_SECRET is read in `src/utils/jwt.js`.
