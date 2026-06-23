# Project and Task Management API

A RESTful backend API for managing projects and tasks with JWT-based authentication. Users can register, log in, create projects, and organize work into tasks with status, priority, and due dates. All project and task resources are scoped to the authenticated user.

## Tech Stack

| Layer            | Technology                                     |
| ---------------- | ---------------------------------------------- |
| Runtime          | Node.js                                        |
| Language         | TypeScript                                     |
| Framework        | Express 5                                      |
| Database         | PostgreSQL 15                                  |
| ORM              | Sequelize                                      |
| Authentication   | JWT (access + refresh tokens), bcrypt          |
| Validation       | express-validator                              |
| Security         | Helmet, CORS, rate limiting, HTML sanitization |
| Logging          | Winston (daily rotate file)                    |
| Email (optional) | Resend                                         |
| Testing          | Jest, Supertest                                |
| Containerization | Docker, Docker Compose                         |

## Features

- **Authentication** — Sign up, login, profile, and refresh access tokens
- **Projects** — CRUD with pagination; statuses: `pending`, `in-progress`, `done`
- **Tasks** — CRUD per project with filtering by status/priority; priorities: `low`, `medium`, `high`
- **Authorization** — Bearer token required for protected routes; users only access their own data
- **Roles** — `admin` and `member` (default: `member`)

## API Overview

Base URL: `http://localhost:8080/api/v1`

| Method | Endpoint                    | Auth          | Description                        |
| ------ | --------------------------- | ------------- | ---------------------------------- |
| POST   | `/auth/signup`              | No            | Register a new user                |
| POST   | `/auth/login`               | No            | Login and receive tokens           |
| POST   | `/auth/refresh-token`       | Refresh token | Get a new access token             |
| GET    | `/auth/profile`             | Yes           | Get current user profile           |
| POST   | `/project`                  | Yes           | Create a project                   |
| GET    | `/project`                  | Yes           | List projects (paginated)          |
| GET    | `/project/:id`              | Yes           | Get a project                      |
| PATCH  | `/project/:id`              | Yes           | Update a project                   |
| DELETE | `/project/:id`              | Yes           | Delete a project                   |
| POST   | `/task/project/:project_id` | Yes           | Create a task in a project         |
| GET    | `/task/project/:project_id` | Yes           | List tasks (paginated, filterable) |
| GET    | `/task/:id`                 | Yes           | Get a task                         |
| PATCH  | `/task/:id`                 | Yes           | Update a task                      |
| DELETE | `/task/:id`                 | Yes           | Delete a task                      |

Protected routes expect: `Authorization: Bearer <access_token>`

## Email Verification (Disabled)

> **Important for testers:** User registration does **not** include email verification in the current setup.

The intended flow (OTP via email → verify → create account) is implemented but **commented out** in:

- `src/auth/auth.controller.ts` — `verifyEmail` handler
- `src/auth/auth.routes.ts` — `POST /auth/verify-email` route

Signup currently creates the user immediately without sending a confirmation email. This is intentional: the email provider ([Resend](https://resend.com)) requires an API key (`RESEND_API_KEY`), which is not bundled with this project so reviewers and testers can run it without external credentials.

To enable email verification later, uncomment the related code, set `RESEND_API_KEY` in `.env`, and wire up Redis for OTP storage (referenced in the commented flow).

## Prerequisites

- Node.js 18+ (Docker image uses Node 24)
- PostgreSQL 15
- npm

For Docker-based setup, only Docker and Docker Compose are required.

## Environment Variables

Copy the example file and adjust if needed:

```bash
cp .env.example .env
```

### `.env` example

```env
NODE_ENV=dev
PORT=8080
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=Bb5527980098
DB_HOST=postgres
DB_PORT=5432
ACCESS_TOKEN_SECRET=4Axm/jI3idhw+lL5EuV2TNLBBQFajwlOS7C3IQbg6rA4
REFRESH_TOKEN_SECRET=2TlM/jI7idhw+lL5EuV2TnLCBZFajwlOS1C3IQbg6rA4
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
```

| Variable                   | Description                                             |
| -------------------------- | ------------------------------------------------------- |
| `NODE_ENV`                 | Environment (`dev`,`prod`)                              |
| `PORT`                     | HTTP port (server listens on `8080`)                    |
| `DB_*`                     | PostgreSQL connection settings                          |
| `ACCESS_TOKEN_SECRET`      | Secret for signing JWT access tokens                    |
| `REFRESH_TOKEN_SECRET`     | Secret for signing JWT refresh tokens                   |
| `ACCESS_TOKEN_EXPIRES_IN`  | Access token lifetime (default in code: `15m`)          |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token lifetime (default in code: `7d`)          |
| `RESEND_API_KEY`           | Optional — only needed if email verification is enabled |

**Note:** When running PostgreSQL on your machine (not via Docker Compose), set `DB_HOST=localhost` instead of `postgres`. The value `postgres` matches the Docker Compose service name.

## Setup Instructions

### Option A — Run with Docker Compose (recommended)

1. Clone the repository and enter the project directory.

2. Create `.env` from the example above (or copy `.env.example`).

3. Start PostgreSQL and the API:

   ```bash
   docker compose up -d
   ```

   The app image runs migrations on startup (`npm run start:prod`) and listens on port **8080**.

4. Verify the API is up:

   ```bash
   curl http://localhost:8080/api/v1/auth/profile
   ```

   A `401 Unauthorized` response means the server is running.

### Option B — Run locally (development)

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env` with `DB_HOST=localhost` (or your PostgreSQL host).

3. Ensure PostgreSQL is running and the database exists (e.g. `postgres`).

4. Run migrations:

   ```bash
   npx sequelize-cli db:migrate --env development
   ```

5. Start the dev server (hot reload via nodemon + ts-node):

   ```bash
   npm run dev
   ```

   The server starts on `http://localhost:8080`.


## Project Structure

```
├── database/
│   ├── config/          # Sequelize CLI database config
│   └── migrations/      # Users, projects, tasks tables
├── src/
│   ├── auth/            # Authentication routes, controllers, validators
│   ├── project/         # Project module
│   ├── task/            # Task module
│   ├── user/            # User entity and repository
│   ├── email/           # Resend email service and templates
│   ├── middlewares/     # Auth, validation, rate limiting, errors
│   ├── config/          # Database and logger
│   └── utils/           # Tokens, responses, errors
├── docker-compose.yml
├── Dockerfile
└── .env.example
```

## Testing

```bash
npm test
```

Tests cover auth, project, and task endpoints using mocked repositories and Supertest.
