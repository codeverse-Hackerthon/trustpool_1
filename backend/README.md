# trustPool backend

FastAPI and PostgreSQL foundation for trustPool's institutional resource-sharing platform. This Phase 1 service establishes configuration, SQLAlchemy models, Alembic migrations, health checks, and tests. Authentication, resource CRUD, bookings, and all other domain workflows intentionally begin in later phases.

## Stack

Python, FastAPI, Uvicorn, SQLAlchemy 2.x, Psycopg 3, PostgreSQL/Supabase, Alembic, Pydantic v2, Pytest, and HTTPX.

## Structure

```text
backend/
  app/            # FastAPI app, models, schemas, core utilities, routes
  alembic/        # Alembic environment and initial migration
  tests/          # Isolated health endpoint tests
  requirements.txt
```

## Local setup

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
Copy-Item .env.example .env
```

macOS/Linux activation: `source venv/bin/activate`.

Set `DATABASE_URL` in `.env` to a Supabase connection string using Psycopg 3, for example:

```text
postgresql+psycopg://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```

Never commit `.env` or place credentials in source code.

## Database migrations

```powershell
alembic upgrade head
alembic revision --autogenerate -m "describe change"
alembic downgrade -1
```

Alembic is the schema source of truth. The application does not call `create_all`.

## Run and test

```powershell
uvicorn app.main:app --reload
pytest -v
```

Swagger is available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) outside production. The public checks are `/`, `/api/v1/health`, and `/api/v1/health/db`.

## Phase 2 dependencies

## Authentication (Phase 2)

Authentication uses Argon2id password hashes, short-lived signed JWT access tokens (15 minutes by default), database-backed rotating refresh tokens (14 days by default), and current-user dependencies that load each user's current role and account status from PostgreSQL. Refresh token identifiers and SHA-256 token fingerprints are stored; raw refresh tokens are not.

Public registration always creates `STUDENT` accounts. Neither `OWNER` nor `ADMIN` can be assigned through a public payload. Authorization is reusable through `require_roles(UserRole.ADMIN)`.

Routes under `/api/v1/auth`:

- `POST /register`, `POST /login`, `POST /refresh`, `POST /logout`, `GET /me`
- `POST /verify-email/request`, `POST /verify-email/confirm`
- `POST /forgot-password`, `POST /reset-password`, `PATCH /change-password`

Set `JWT_SECRET_KEY` to a long random secret before deployment. Production refuses to start without it. For the React application, access and refresh tokens are currently returned as JSON; use in-memory access-token storage and prefer a future HttpOnly refresh-cookie layer rather than browser local storage for refresh tokens.

Email delivery is an adapter extension point. With no provider configured, requests succeed safely but no email is delivered. During development only, set `DEV_EMAIL_OUTBOX_PATH=.dev-email-outbox.txt` to write local email/reset tokens to a gitignored outbox; never enable this setting in production.

Phase 3 will use the authenticated user dependency, `users`/`institutions` schemas, and the verified-email/account-status fields. Resource CRUD will use `resources`, ownership relationships, and resource enums.
