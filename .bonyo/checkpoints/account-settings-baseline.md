# Baseline Checkpoint — Account Settings

Date: 2026-09-30
Task Context: Account Settings & Profile Hub (`/dashboard/profile`)
Classification: Unscoped Mission Work (No roadmap task ID forged)

## Status
- `apps/web/src/app/dashboard/profile` does not exist yet.
- Nav and Header link to `/dashboard/profile` (`apps/web/src/components/layout/mobile-bottom-nav.tsx` and `desktop-header.tsx`).
- `useAuth()` provides `user`, `isAuthenticated`, `logout`, `openAuthModal`.
- `usePet()` provides `pets`, `activePet`.
