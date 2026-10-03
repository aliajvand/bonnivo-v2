---
name: bonyo-sprint
description: Comprehensive workflow guide for executing autonomous Bonyo sprints with 3-agent orchestration, state management, and validation gates.
---

# Bonyo Autonomous Sprint Skill

## Purpose
This skill encapsulates the protocol for executing feature tasks in Bonyo without human intervention, ensuring high code quality, zero fake implementations, and strict audit gates.

## Step-by-Step Task Lifecycle
1. **Checkpoint**: Orchestrator documents baseline in `.bonyo/checkpoints/<task-id>-baseline.md`.
2. **Plan**: Orchestrator outlines files and criteria in `.bonyo/plans/<task-id>.md`.
3. **Build**: Builder implements features in `apps/web/` following clean architecture.
4. **Audit**: Auditor runs typecheck and build, reviews changed files, and logs verdict in `.bonyo/audits/<task-id>.md`.
5. **Gate Update**: If APPROVED and build passes, update `phase-1-checklist.md` and `progress.md`.
