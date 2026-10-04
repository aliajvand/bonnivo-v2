# Bonnivo / Bonyo Autonomous 3-Agent Engineering Policy

This repository operates under a strict, non-interactive 3-Agent System:

## 1. Roles & Separation of Concerns
1. **Orchestrator (`.agents/agents/orchestrator.md`)**:
   - Master technical coordinator and product architect.
   - Plans tasks (`.bonyo/plans/<task-id>.md`), manages shared state, handles handoffs, checks baseline checkpoints, enforces gates.
2. **Builder (`.agents/agents/builder.md`)**:
   - Senior Full-Stack Frontend Engineer.
   - Writes production-grade, typed, SSR-safe, mobile/RTL-first TypeScript code.
   - Never fakes authentication, OTP, payments, or backend data. Builds clean integration boundaries when backend is pending.
3. **Auditor (`.agents/agents/auditor.md`)**:
   - Independent QA and software auditor.
   - Audits requirements, integration, state persistence, security, responsiveness, accessibility, and regressions.
   - Runs independent verification commands (`typecheck` and `build`).
   - Issues either `APPROVED` or `FAILED` with actionable fix requirements (max 3 cycles per task).

## 2. Non-Interactive Execution Rules
- Never ask the user routine confirmation or permission questions.
- Autonomously resolve technical conflicts using the unified Source-of-Truth hierarchy.
- Finite verification commands only: `pnpm --filter web typecheck` and `pnpm --filter web build`.
- Never run long-running dev servers (`next dev` / `pnpm dev`) in background or watch modes.

## 3. Scope & Directory Guardrails
- Work strictly within the monorepo structure (`apps/web`, `packages/*`, `docs/*`, `.agents/*`, `.bonyo/*`).
- Never delete user changes or run destructive commands like `git reset --hard`.
- Preserve pre-task state checkpoints in `.bonyo/checkpoints/<task-id>-baseline.md`.
