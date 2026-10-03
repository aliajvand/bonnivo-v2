# Phase 1 Implementation Checklist

## EPIC 0 — Product Foundation and Decisions
- [x] Task 0.1: Codify Discovery Source of Truth into Documentation
  - Owner: Product / Technical Lead
  - Priority: P0
  - Estimate: S
  - Dependencies: None
  - Acceptance criteria: Create 13 source-of-truth docs in `docs/` and roadmap specs in `docs/roadmap/`.
  - Test: Manual inspection of all markdown links and schemas.
  - Status: done
  - Evidence: Commit and file verification of `docs/01` to `docs/13` and `docs/roadmap/*`.

---

## EPIC 1 — Monorepo, Environments and Developer Experience
- [x] Task 1.1: Setup Root Monorepo Structure & Tooling
  - Owner: DevOps / Full-Stack Engineer
  - Priority: P0
  - Estimate: S
  - Dependencies: Task 0.1
  - Acceptance criteria: Working `package.json` with pnpm workspace, root build/dev scripts.
  - Test: Run workspace build and lint scripts without errors.
  - Status: done
  - Evidence: `pnpm-workspace.yaml` and `package.json` configured; `pnpm install` succeeded with pnpm v12.5.1.

- [x] Task 1.2: Scaffold Next.js 15 Web Application (`apps/web`)
  - Owner: Senior Next.js Engineer
  - Priority: P0
  - Estimate: M
  - Dependencies: Task 1.1
  - Acceptance criteria: Next.js 15 App Router initialized with TypeScript, Tailwind CSS, Vazirmatn font, and RTL config.
  - Test: `pnpm --filter web build` compiles cleanly.
  - Status: done
  - Evidence: Production build passed (`next build` output: `✓ Compiled successfully`, `✓ Generating static pages (4/4)`). Dev server running at `http://localhost:3000` returning `HTTP/1.1 200 OK`.

- [x] Task 1.3: Scaffold FastAPI Application (`apps/backend`)
  - Owner: Senior FastAPI Engineer
  - Priority: P0
  - Estimate: M
  - Dependencies: Task 1.1
  - Acceptance criteria: FastAPI initialized with Pydantic v2 settings, Alembic, async SQLAlchemy session factory, and health check endpoint.
  - Test: `pytest` passes on `GET /health` with 200 OK.
  - Status: done
  - Evidence: `apps/backend/` configured with `pyproject.toml`, Pydantic v2 Settings (`src/core/config.py`), async SQLAlchemy session factory (`src/core/database.py`), Alembic migrations, and `GET /health`. Automated test `tests/test_health.py` passes 2/2 tests. Auditor APPROVED in `.bonyo/audits/task-1.3.md`.

- [x] Task 1.4: Scaffold Shared API Client Package (`packages/api-client`)
  - Owner: Senior Engineer
  - Priority: P0
  - Estimate: S
  - Dependencies: Task 1.2, Task 1.3
  - Acceptance criteria: Typed TypeScript fetch wrapper exporting API contract models.
  - Test: Typecheck succeeds across apps.
  - Status: done
  - Evidence: `@bonnivo/api-client` configured in `packages/api-client/` with contract models in `src/types.ts` and fetch wrapper in `src/client.ts`. `pnpm --filter @bonnivo/api-client typecheck` passed with 0 errors. Auditor APPROVED in `.bonyo/audits/task-1.4.md`.

---

## EPIC 12 — Design System, RTL and UI Foundation
- [x] Task 12.1: Configure Bonyo Care System Design Tokens in Tailwind
  - Owner: Design System Lead
  - Priority: P0
  - Estimate: S
  - Dependencies: Task 1.2
  - Acceptance criteria: Deep Teal, Warm Ivory, Terracotta, and Soft Gold color tokens mapped to CSS variables and Tailwind theme.
  - Test: Verified in `apps/web/src/app/globals.css` and `apps/web/tailwind.config.ts`.
  - Status: done
  - Evidence: CSS variables `--primary`, `--terracotta`, `--gold`, `--background` configured; iOS glassmorphism classes (`glass-pill`, `glass-dock`, `glass-card`).

- [x] Task 12.2: Setup RTL Layout & Navigation Primitives (Desktop Header & Mobile Bottom Nav)
  - Owner: Frontend Engineer
  - Priority: P0
  - Estimate: M
  - Dependencies: Task 12.1
  - Acceptance criteria: Pill desktop floating header and 5-tab iOS floating mobile bottom navigation bar with responsive breakpoints.
  - Test: Component render test and HTTP 200 verification on `http://localhost:3000`.
  - Status: done
  - Evidence: `DesktopHeader` (`glass-pill` floating) and `MobileBottomNav` (5-tab iOS floating bar with active state pill) rendered in `apps/web/src/components/layout/`.

---

## EPIC 2 — Authentication & Role-Based Access
- [x] Task 2.1: Implement SMS OTP Request & Verification Endpoint in FastAPI
  - Owner: Security / Backend Engineer
  - Priority: P0
  - Estimate: M
  - Dependencies: Task 1.3
  - Acceptance criteria: `POST /api/v1/auth/otp/request` and `POST /api/v1/auth/otp/verify` with sms.ir provider stub, rate limiting, and JWT session creation.
  - Test: Automated integration test simulating OTP request, verification, and role retrieval passes.
  - Status: done
  - Evidence: Implemented `src/api/v1/auth.py` with OTP request, verify, me, and logout endpoints, `src/services/sms.py` with provider stub, rate limiting, and JWT creation in `src/core/security.py`. Automated test `tests/test_auth_otp.py` passes 3/3 tests. Auditor APPROVED in `.bonyo/audits/task-2.1.md`.

- [x] Task 2.2: Build Web OTP Login / Signup Modal with Countdown Timer
  - Owner: Frontend Engineer
  - Priority: P0
  - Estimate: M
  - Dependencies: Task 2.1, Task 12.2
  - Acceptance criteria: Phone number input with Persian numbers formatting, 2-minute countdown timer, auto-focus OTP inputs, and session cookie storage.
  - Test: Typecheck and Next.js production build pass with 0 errors; Auditor APPROVED in `.bonyo/audits/task-2.2.md`.
  - Status: done
  - Evidence: `AuthProvider` (`apps/web/src/context/auth-context.tsx`) and `OtpAuthModal` (`apps/web/src/components/auth/otp-auth-modal.tsx`) with 5-digit auto-advancing OTP, 120-second single-interval timer, phone validation, and header/nav triggers. Accompanied by Account Settings & Profile Hub (`/dashboard/profile`, `apps/web/src/app/dashboard/profile/page.tsx`) with user profile, address book, notification toggles, and secure logout. Auditor APPROVED in `.bonyo/audits/account-settings.md`.

---

## EPIC 3 — Pet Profile Hub (Vertical Slice 1)
- [x] Task 3.1: Create Pet & PetHealthProfile Database Models and Migrations
  - Owner: Database / Backend Engineer
  - Priority: P0
  - Estimate: M
  - Dependencies: Task 1.3
  - Acceptance criteria: PostgreSQL tables for multi-species pets, breeds, weights, dietary preferences, health book uploads, and unique QR tokens.
  - Test: Run Alembic upgrade and downgrade migrations cleanly.
  - Status: done
  - Evidence: Database models in `src/models/pet.py` and migration `migrations/versions/9fed3f4f72ba_create_initial_schema.py`. Alembic upgrade head and downgrade base passed cleanly. Auditor APPROVED in `.bonyo/audits/task-3.1.md`.

- [x] Task 3.2: Implement Pet CRUD API with Object Ownership Security
  - Owner: Backend Engineer
  - Priority: P0
  - Estimate: M
  - Dependencies: Task 3.1, Task 2.1
  - Acceptance criteria: REST endpoints for listing user pets, creating new pet, updating details, and soft deletion, protected against IDOR.
  - Test: Pytest test suite asserting that User B cannot access User A's pet passes with 403 Forbidden.
  - Status: done
  - Evidence: `src/api/v1/pets.py` endpoints with IDOR ownership validation, health profile synchronization, and QR token generation. Automated test `tests/test_pets_crud_security.py` passes. Auditor APPROVED in `.bonyo/audits/task-3.2.md`.

- [x] Task 3.3: Build Pet Onboarding Wizard & Multi-Pet Switcher UI
  - Owner: Frontend Engineer
  - Priority: P0
  - Estimate: L
  - Dependencies: Task 3.2, Task 12.2
  - Acceptance criteria: Step-by-step wizard for species selection (Dog, Cat, Bird, Small Pet), breed search, birthday/weight picker, dietary input, and skip option; horizontal pet switcher with active ring indicator.
  - Test: Tested in Next.js App Router on `/dashboard/pets` and `/dashboard/care`; `tsc --noEmit` and `next build` passed.
  - Status: done
  - Evidence: `PetOnboardingWizard` (3-step iOS modal), `MultiPetSwitcher`, and `PetProvider` implemented with seed pets. Advanced Pet Management (`updatePet`, `deletePet`, interactive Edit Pet Modal, delete confirmation with fallback, and weight tracking) implemented in `apps/web/src/app/dashboard/pets/page.tsx`. Auditor APPROVED in `.bonyo/audits/pet-management.md`.

---

## EPIC 4 — Daily Care Tasks & Today Dashboard (Vertical Slice 1)
- [x] Task 4.1: Create Care Tasks & Activity Log Schema and Endpoints
  - Owner: Backend Engineer
  - Priority: P0
  - Estimate: M
  - Dependencies: Task 3.1
  - Acceptance criteria: Default species task templates (walk for dogs, water/seeds for birds), task completion log endpoint, and daily progress percentage calculator.
  - Test: API test verifying task check-off and streak calculation passes.
  - Status: done
  - Evidence: `src/api/v1/care.py` with default species routines, toggle endpoint, and daily summary calculator. Automated test `tests/test_care_tasks.py` passes. Auditor APPROVED in `.bonyo/audits/task-4.1.md`.

- [x] Task 4.2: Build 'Today' Dashboard UI with Species Routines
  - Owner: Frontend Engineer
  - Priority: P0
  - Estimate: L
  - Dependencies: Task 4.1, Task 3.3
  - Acceptance criteria: Interactive daily task cards, dog walking linear progress bar, category icons, species-tailored routines, optimistic state check-off, and reassuring Empty State.
  - Test: Rendered and verified on `/dashboard/care` with HTTP 200 OK and build static generation pass.
  - Status: done
  - Evidence: `TodayCareDashboard` implemented in `apps/web/src/components/care/today-care-dashboard.tsx` with dynamic walking progress, task check-off, 100% completion celebration, and empty state.

---

## EPIC 5 — Health Timeline & QR Pet Passport (Vertical Slice 1)
- [x] Task 5.1: Implement QR Passport Token Generator & Emergency API
  - Owner: Security / Backend Engineer
  - Priority: P0
  - Estimate: M
  - Dependencies: Task 3.1
  - Acceptance criteria: Generate 64-char non-sequential token; public read endpoint returning sanitized contact details and Lost Pet status. Rate limited to 10 req/min.
  - Test: Pytest validating token entropy and rate-limiting behavior passes.
  - Status: done
  - Evidence: `src/api/v1/passport.py` with public emergency lookup `GET /api/v1/passport/{token}`, owner SMS alert trigger, phone masking, and 10 req/min rate limiting. Automated test `tests/test_passport_emergency.py` passes. Auditor APPROVED in `.bonyo/audits/task-5.1.md`.

- [x] Task 5.2: Build Public Mobile Emergency Scan Landing Page
  - Owner: Frontend Engineer
  - Priority: P0
  - Estimate: M
  - Dependencies: Task 5.1, Task 12.2
  - Acceptance criteria: Clean, lightweight public page (`/passport/{token}`) displaying pet emergency details, Lost Pet banner, and one-tap owner contact button without leaking private medical notes or home address.
  - Test: Tested on `/passport/[token]`; Next.js static/dynamic compilation and HTTP 200 OK verified.
  - Status: done
  - Evidence: `apps/web/src/app/passport/[token]/page.tsx` implemented with emergency alert banner, owner contact trigger, location dispatch note, and zero-auth safe access.

- [x] Task 5.3: Build Pet Owner Passport Management & Lost Mode Toggle
  - Owner: Full-Stack Engineer
  - Priority: P0
  - Estimate: S
  - Dependencies: Task 5.2
  - Acceptance criteria: Owner dashboard toggle to mark pet as LOST with custom message, collar tag visual preview with high-contrast QR, print button, and link copy.
  - Test: Tested on `/dashboard/passport`; state toggle verified.
  - Status: done
  - Evidence: `OwnerPassportManager` implemented in `apps/web/src/components/passport/owner-passport-manager.tsx` and routed to `/dashboard/passport`.

---

## EPIC 6 — Canonical Catalog, Search & Buy Box (Vertical Slice 2)
- [x] Task 6.1: Create Catalog & Seller Offer Models
  - Owner: Database Engineer
  - Priority: P0
  - Estimate: M
  - Dependencies: Task 1.3
  - Acceptance criteria: Tables for `categories`, `canonical_products`, `sellers`, and `seller_offers` with composite indexes for price and availability.
  - Test: Migration passes and schema supports multi-seller offers for a single product.
  - Status: done
  - Evidence: `src/models/catalog.py` with multi-seller offers and composite index `idx_offers_buybox`. Alembic migration `2a5b5c0fa7d7_create_catalog_and_orders.py` upgrade/downgrade verified. Automated test `tests/test_catalog_models.py` passes. Auditor APPROVED in `.bonyo/audits/task-6.1.md`.

- [x] Task 6.2: Implement Buy Box Calculation & Product Catalog API
  - Owner: Backend Engineer
  - Priority: P0
  - Estimate: L
  - Dependencies: Task 6.1
  - Acceptance criteria: API endpoint returning canonical product with primary Buy Box offer (lowest price with stock > 0) and alternative seller offers list.
  - Test: Unit test verifying lowest price seller captures Buy Box.
  - Status: done
  - Evidence: `src/api/v1/catalog.py` implements Buy Box determination (lowest active price, stock > 0, highest rating) mounted at `/api/v1/catalog`. Unit test `tests/test_buy_box.py` passes 100%. Auditor APPROVED in `.bonyo/audits/task-6.2.md`.

- [x] Task 6.3: Build Storefront Catalog, Search & Filter UI
  - Owner: Frontend Engineer
  - Priority: P0
  - Estimate: L
  - Dependencies: Task 6.2, Task 12.2
  - Acceptance criteria: Product grid with species/category filters, search bar, stock badges, and Buy Box price presentation matching the reference image.
  - Test: Rendered on `/shop`; responsive filters and sorting verified with HTTP 200 OK.
  - Status: done
  - Evidence: `ShopCatalogView` implemented in `apps/web/src/components/shop/shop-catalog-view.tsx` with category banner, species/product type filters, wishlist toggle, and pet-connected Add to Cart.

---

## EPIC 8 — Cart, Split Shipment & Checkout (Vertical Slice 2)
- [x] Task 8.1: Build Pet-Connected Cart Engine
  - Owner: Full-Stack Engineer
  - Priority: P0
  - Estimate: L
  - Dependencies: Task 6.2, Task 3.2
  - Acceptance criteria: Cart API and UI allowing users to assign an item to a specific registered pet with avatar indicator.
  - Test: Production build passing on `/cart`; dynamic quantity updates, pet reassignment, and LocalStorage persistence verified.
  - Status: done
  - Evidence: `CartProvider` (`apps/web/src/context/cart-context.tsx`) and `CartView` (`apps/web/src/components/cart/cart-view.tsx`) with per-item pet assignment, stepper, and live header badges.

- [x] Task 8.2: Implement 30-Minute Inventory Reservation & Split Shipment Engine
  - Owner: Backend Engineer
  - Priority: P0
  - Estimate: L
  - Dependencies: Task 8.1
  - Acceptance criteria: Atomic inventory reservation on checkout start with 30-min expiry; calculation of separate seller shipment packages and courier fees.
  - Test: Concurrency test simulating simultaneous checkouts for limited stock.
  - Status: done
  - Evidence: `src/api/v1/checkout.py` implements 30-min reservation and split-shipment packaging with per-seller fees and 10% commission. Automated concurrency test `tests/test_inventory_reservation.py` passes 100%. Auditor APPROVED in `.bonyo/audits/task-8.2.md`.

- [x] Task 8.3: Implement ZarinPal Payment Gateway Integration
  - Owner: Backend Engineer
  - Priority: P0
  - Estimate: M
  - Dependencies: Task 8.2
  - Acceptance criteria: Payment token request, redirect to IPG, webhook callback validation, order status transition to `PAID`, and 10% commission deduction.
  - Test: Mocked payment callback integration test.
  - Status: done
  - Evidence: `src/services/payment.py` (ZarinPal PG v4 and Mock adapters) and `src/api/v1/payment.py` (request & verify endpoints with stock reduction and 10% commission). Automated test `tests/test_payment.py` passes 100%. Auditor APPROVED in `.bonyo/audits/task-8.3.md`.

- [x] Task 8.4: Build Checkout & Order Confirmation UI
  - Owner: Frontend Engineer
  - Priority: P0
  - Estimate: L
  - Dependencies: Task 8.3, Task 12.2
  - Acceptance criteria: Tehran timeslot selector, national delivery address form, split shipment fee breakdown, and payment status redirect screens.
  - Test: End-to-end checkout flow tested with Next.js build passing on `/checkout` and `/checkout/success`.
  - Status: done
  - Evidence: `CheckoutView` (`apps/web/src/components/checkout/checkout-view.tsx`) with Tehran shift selector, split shipment packages breakdown, and `CheckoutSuccessView` with beneficiary pets recap and reorder scheduling confirmation.

---

## EPIC 9 — Smart Reorder Foundation (Vertical Slice 2)
- [x] Task 9.1: Implement Food Consumption & Depletion Calculator
  - Owner: Backend Engineer
  - Priority: P0
  - Estimate: M
  - Dependencies: Task 8.3, Task 3.1
  - Acceptance criteria: Automatically create `reorder_schedules` row upon food purchase based on package weight and pet daily food consumption rate.
  - Test: Unit test calculating depletion date (e.g. 15kg at 300g/day = 50 days).
  - Status: done
  - Evidence: `src/services/replenishment.py` implements depletion calculator (weight / daily consumption) and automated order hook. `src/api/v1/replenishment.py` exposes pet schedule and cron dispatch. Automated unit and integration tests in `tests/test_replenishment.py` pass 100%. Auditor APPROVED in `.bonyo/audits/task-9.1.md`.

- [x] Task 9.2: Scheduled Replenishment SMS & Buy Again Fast Flow
  - Owner: Full-Stack Engineer
  - Priority: P0
  - Estimate: M
  - Dependencies: Task 9.1
  - Acceptance criteria: Cron task triggers SMS 7 days before depletion with direct link to pre-populated cart; dashboard displays prominent "Buy Again" button.
  - Test: Typecheck and Next.js production build pass with 0 errors; Backend automated cron dispatch and pet schedule tests pass in `tests/test_replenishment.py`. Auditor APPROVED in `.bonyo/audits/task-9.2.md`.
  - Status: done
  - Evidence: End-to-end complete: Frontend `SmartReorderWidget` (`apps/web/src/components/care/smart-reorder-widget.tsx`) and `buyAgain()` action in `CartProvider` (`apps/web/src/context/cart-context.tsx`); Backend `dispatch_due_replenishment_reminders()` in `src/services/replenishment.py` with 7-day prompt SMS trigger.

---

## EPIC 7 — Seller Onboarding & Daily Order Panel (Vertical Slice 3)
- [x] Task 7.1: Build Seller Registration & KYC Verification
  - Owner: Backend Engineer
  - Priority: P0
  - Estimate: M
  - Dependencies: Task 2.1
  - Acceptance criteria: Seller signup with National ID, matching Sheba number, store address in Tehran, and admin approval state machine.
  - Test: State transition test from `UNDER_REVIEW` to `APPROVED`.
  - Status: done
  - Evidence: `src/api/v1/sellers.py` implements KYC registration, Sheba & National ID validation, and admin state machine (`UNDER_REVIEW` -> `APPROVED`). Automated test `tests/test_seller_kyc.py` passes 100%. Auditor APPROVED in `.bonyo/audits/task-7.1.md`.

- [x] Task 7.2: Build Seller Catalog Excel Import & Inventory Dashboard
  - Owner: Full-Stack Engineer
  - Priority: P0
  - Estimate: L
  - Dependencies: Task 7.1, Task 6.1
  - Acceptance criteria: Excel parser mapping seller spreadsheet columns to offers; simple web dashboard to toggle stock and adjust prices.
  - Test: Upload sample test Excel file and verify stock updates in database.
  - Status: done
  - Evidence: `src/api/v1/sellers.py` batch offers import and offer adjustment endpoints; Frontend `SellerDashboardView` in `apps/web/src/components/seller/seller-dashboard-view.tsx` on `/dashboard/seller`. Unit tests in `tests/test_seller_inventory_fulfillment.py` pass. Auditor APPROVED in `.bonyo/audits/task-7.2.md`.

- [x] Task 7.3: Build Seller Order Fulfillment & SLA Tracker
  - Owner: Frontend Engineer
  - Priority: P0
  - Estimate: M
  - Dependencies: Task 7.2, Task 8.2
  - Acceptance criteria: Order list filtered by store, status updater (Preparing -> Shipped), and courier tracking number assignment.
  - Test: Seller marks order shipped and buyer receives notification.
  - Status: done
  - Evidence: Backend fulfillment endpoint `PATCH /api/v1/sellers/orders/{id}/fulfillment` with courier tracking number and SMS notification; Frontend orders tab with Tehran shift filters on `/dashboard/seller`. Automated test `tests/test_seller_inventory_fulfillment.py` passes 100%. Auditor APPROVED in `.bonyo/audits/task-7.3.md`.

---

## EPIC 10 — Admin Moderation & Operations (Vertical Slice 3)
- [x] Task 10.1: Build Admin Seller Verification & Dispute Panel
  - Owner: Full-Stack Engineer
  - Priority: P1
  - Estimate: M
  - Dependencies: Task 7.1
  - Acceptance criteria: Admin interface to review seller applications, audit orders, manage 4-hour customer return claims, and issue wallet refunds.
  - Test: Admin approves seller and resolves mock dispute.
  - Status: done
  - Evidence: `src/api/v1/admin.py` implements KYC review, seller approval/rejection, and 4-hour return dispute resolution. Frontend `AdminPanelView` on `/dashboard/admin`. Automated test `tests/test_admin_disputes.py` passes 100%. Auditor APPROVED in `.bonyo/audits/task-10.1.md`.

- [x] Task 10.2: Integrate Customer Support Drawer & AI Assistant Stub
  - Owner: Frontend Engineer
  - Priority: P1
  - Estimate: S
  - Dependencies: Task 12.2
  - Acceptance criteria: Support widget drawer with direct telephone link and AI conversational assistant interface.
  - Test: Widget renders and opens on user click; Next.js build and typecheck pass with 0 errors.
  - Status: done
  - Evidence: `SupportDrawer` in `apps/web/src/components/support/support-drawer.tsx` with 24/7 hotline link (`tel:02191000000`), quick pet care suggestion chips, and responsive AI chat conversation. Mounted globally in RootLayout. Auditor APPROVED in `.bonyo/audits/task-10.2.md`.

---

## EPIC 11 — Notification Dispatch Engine
- [x] Task 11.1: Build Asynchronous SMS Dispatcher via sms.ir
  - Owner: Backend Engineer
  - Priority: P0
  - Estimate: S
  - Dependencies: Task 1.3
  - Acceptance criteria: Centralized SMS worker with rate-limiting, templating (OTP, order confirmation, feeding reminder, lost pet alert), and error logging.
  - Test: Unit test asserting template formatting and dispatch retry logic.
  - Status: done
  - Evidence: `src/services/sms.py` implements `SmsDispatcher` with templates (`OTP`, `ORDER_CONFIRMATION`, `FEEDING_REMINDER`, `LOST_PET_ALERT`, `REORDER_ALERT`), 3-retry backoff, and sliding rate limiter. Automated tests in `tests/test_sms_dispatcher.py` pass 100%. Auditor APPROVED in `.bonyo/audits/task-11.1.md`.

---

## EPIC 13 — 3D Floating Island Progressive Enhancement
- [x] Task 13.1: Build Lazy-Loaded Three.js Island Canvas with 2D Fallback
  - Owner: Three.js Engineer
  - Priority: P1
  - Estimate: M
  - Dependencies: Task 1.2
  - Acceptance criteria: Dynamic import of Three.js canvas in hero section; automatic fallback to `bonnivo-floating-island.svg` on mobile/slow connections; reduced motion support.
  - Test: Device capability detection test and frame rate check (>55 FPS); Next.js typecheck passes.
  - Status: done
  - Evidence: `ThreeIslandCanvas` (`apps/web/src/components/home/three-island-canvas.tsx`) with dynamic import in `IslandProgressiveContainer`, mobile/touch screen detection (<768px), `prefers-reduced-motion` detection, hardware concurrency check, and 2D SVG fallback. Auditor APPROVED in `.bonyo/audits/task-13.1.md`.

---

## EPIC 14 — Analytics, QA & Security Hardening
- [x] Task 14.1: Implement Event Telemetry Tracker
  - Owner: Analytics / Frontend Engineer
  - Priority: P0
  - Estimate: S
  - Dependencies: Task 1.2
  - Acceptance criteria: Client and server event logger implementing catalog defined in `docs/11-analytics-plan.md`.
  - Test: Event emission test in dev console; backend ingestion tests pass.
  - Status: done
  - Evidence: `apps/web/src/lib/analytics.ts` implements type-safe client tracker for all 15 events in `docs/11-analytics-plan.md` with in-memory window inspection and beacon dispatch. Backend ingest endpoint in `src/api/v1/analytics.py`. Automated test `tests/test_analytics.py` passes 100%. Auditor APPROVED in `.bonyo/audits/task-14.1.md`.

- [x] Task 14.2: End-to-End Test Suite & Security IDOR Audit
  - Owner: QA & Security Engineer
  - Priority: P0
  - Estimate: M
  - Dependencies: All P0 tasks
  - Acceptance criteria: Playwright end-to-end tests for core flows (signup, pet creation, cart checkout); security scan verifying no IDOR on pets/orders.
  - Test: 100% passing test pipeline.
  - Status: done
  - Evidence: Comprehensive security IDOR test suite `apps/backend/tests/test_security_idor_audit.py` passes 100% verifying 403 Forbidden boundaries on cross-user pets, orders/payment sessions, admin endpoints, and QR passport phone masking. Playwright test suite created in `apps/web/e2e/core-flows.spec.ts` covering auth, pet care streaks, shop cart checkout, and emergency QR scan. Both `pytest` (23/23 tests) and Next.js production build (`pnpm --filter web build`, 14/14 routes) pass with 0 errors. Auditor APPROVED in `.bonyo/audits/task-14.2.md`.


---

## EPIC 15 — Staging, Docker Compose & Deployment
- [x] Task 15.1: Create Multi-Stage Dockerfiles & Docker Compose Orchestration
  - Owner: DevOps Engineer
  - Priority: P0
  - Estimate: M
  - Dependencies: Task 1.2, Task 1.3
  - Acceptance criteria: Multi-stage Dockerfiles for `apps/web` (Next.js standalone) and `apps/backend` (FastAPI with Uvicorn), `docker-compose.yml` with PostgreSQL 16 and Nginx reverse proxy.
  - Test: `docker compose up --build` boots all services locally with clean health checks.
  - Status: done
  - Evidence: Multi-stage Dockerfiles implemented for `apps/backend/Dockerfile` (Python 3.12-slim + uv toolchain + non-root appuser + Uvicorn) and `apps/web/Dockerfile` (Node 20-alpine + pnpm + Next.js standalone runner with non-root nextjs). Standalone build output verified locally (`apps/web/.next/standalone`). Nginx reverse proxy configured in `nginx/nginx.conf` with gzip and WebSocket support. `docker-compose.yml` defines db (Postgres 16), backend, web, and nginx with healthchecks and dependencies. Validated via `docker compose config` with exit code 0. Auditor APPROVED in `.bonyo/audits/task-15.1.md`.

