# Task Plan — Task 9.2: Scheduled Replenishment & Buy Again Fast Flow

## 1. Requirements & Acceptance Criteria
- Smart Replenishment Widget showing food consumption rate, estimated days remaining, and depletion status for the active pet.
- Prominent "خرید مجدد سریع (Smart Buy Again)" CTA button.
- Fast reorder flow:
  1. Resolve canonical product & current seller offer (using current price).
  2. Resolve pet assignment (keep active pet or previous assigned pet).
  3. Merge with existing cart items seamlessly (no duplicates, update quantity).
  4. Direct feedback with option to navigate straight to `/cart` or `/checkout`.
- Handle edge cases: Graceful handling if item is out of stock.
- Backend dependency classification:
  - Frontend Buy Again UI and Cart injection: Complete.
  - Backend Cron SMS Trigger (Task 9.1 / 9.2 backend): Queued behind FastAPI & Celery background worker.
  - Classification: `FRONTEND_COMPLETE_BACKEND_BLOCKED`.

## 2. Files to Create
- `apps/web/src/components/care/smart-reorder-widget.tsx`

## 3. Files to Modify
- `apps/web/src/context/cart-context.tsx` (add `buyAgain(productId, petId)` method)
- `apps/web/src/components/care/today-care-dashboard.tsx` (embed SmartReorderWidget)

## 4. Verification Protocol
- `pnpm --filter web typecheck`
- Auditor verification in `.bonyo/audits/task-9.2.md`
- `pnpm --filter web build`
