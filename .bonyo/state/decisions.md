# Architectural Decisions Log

## Decision 1: Non-Interactive 3-Agent Autonomy
- **Decision:** Execute all planning, implementation, and verification steps without human prompts.
- **Rationale:** Strict developer mandate to work independently without stopping for permission.

## Decision 2: Backend-Pending Client Isolation
- **Decision:** When FastAPI endpoints are queued in Phase 1 roadmap, build standard client interfaces with realistic test simulation that adheres to the exact request/response schemas specified in `docs/04-database-schema.md` and `docs/08-api-contracts.md`.
- **Rationale:** Prevents fake data debt while allowing frontend pages and user journeys to be fully realized and testable.
