---
name: fastapi-backend
description: FastAPI production architecture, Pydantic v2, PostgreSQL, SQLAlchemy, and OpenAPI-first contracts
---
# FastAPI Backend Directives:

1. **Architecture & Standards:**
   - FastAPI modular application structure with clear separation of routers, schemas, models, and services.
   - Pydantic v2 for strict request and response schema validation.
   - OpenAPI-first approach with automated, typed docs.

2. **Database & Persistence:**
   - PostgreSQL as primary datastore.
   - SQLAlchemy (async / 2.0 style) for ORM and migrations via Alembic.
   - GeoAlchemy2 / PostGIS for spatial operations (proximity, service areas) when needed.
   - Strictly relational data modeling; JSONB used only for genuinely arbitrary payloads.

3. **Security & Dependency Injection:**
   - Dependency Injection for database sessions, authentication, and role validation.
   - Zero Client Trust: Server-side validation of all roles (`USER`, `SELLER`, `ADMIN`) and object ownership (pets, orders, health records) to eliminate IDOR.
   - Rate limiting on sensitive endpoints (OTP, login, search).

4. **Background Tasks & Jobs:**
   - Decouple long-running workloads (SMS dispatch, reminder scheduling) using background task mechanisms.
