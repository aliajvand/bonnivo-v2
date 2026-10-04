# Task Plan: Task 1.3 — Scaffold FastAPI Application

**Task**: Scaffold FastAPI Application (`apps/backend`)
**Status**: IN_PROGRESS
**Owner**: Builder

---

## 1. Requirements
- Setup `pyproject.toml` in `apps/backend/` with FastAPI, Pydantic v2, Pydantic-Settings, SQLAlchemy 2.0 (async), asyncpg, aiosqlite (for unit tests), Alembic, Uvicorn, Pytest, and Httpx.
- Create modular architecture:
  - `src/core/config.py`: Pydantic v2 Settings class reading from environment.
  - `src/core/database.py`: Async engine, sessionmaker, and base declarative class.
  - `src/api/v1/health.py`: `GET /health` endpoint returning status, version, and database readiness.
  - `src/main.py`: FastAPI app initialization with CORS, lifespan, and router mounting.
- Configure Alembic (`alembic.ini`, `migrations/env.py`).
- Implement automated test `tests/test_health.py`.

---

## 2. File Announcement
- `apps/backend/pyproject.toml`
- `apps/backend/alembic.ini`
- `apps/backend/migrations/env.py`
- `apps/backend/migrations/script.py.mako`
- `apps/backend/src/core/config.py`
- `apps/backend/src/core/database.py`
- `apps/backend/src/api/v1/health.py`
- `apps/backend/src/main.py`
- `apps/backend/tests/conftest.py`
- `apps/backend/tests/test_health.py`

---

## 3. Acceptance Criteria
- [ ] `uv run pytest` in `apps/backend` passes on `GET /health` with 200 OK.
