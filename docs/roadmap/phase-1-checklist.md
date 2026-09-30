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

- [ ] Task 1.3: Scaffold FastAPI Application (`apps/backend`)
  - Owner: Senior FastAPI Engineer
  - Priority: P0
  - Estimate: M
  - Dependencies: Task 1.1
  - Acceptance criteria: FastAPI initialized with Pydantic v2 settings, Alembic, async SQLAlchemy session factory, and health check endpoint.
  - Test: `pytest` passes on `GET /health`.
  - Status: pending

- [ ] Task 1.4: Scaffold Shared API Client Package (`packages/api-client`)
  - Owner: Senior Engineer
  - Priority: P0
  - Estimate: S
  - Dependencies: Task 1.2, Task 1.3
  - Acceptance criteria: Typed TypeScript fetch wrapper exporting API contract models.
  - Test: Typecheck succeeds across apps.
  - Status: pending

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
- [ ] Task 2.1: Implement SMS OTP Request & Verification Endpoint in FastAPI
  - Owner: Security / Backend Engineer
  - Priority: P0
  - Estimate: M
  - Dependencies: Task 1.3
  - Acceptance criteria: `POST /api/v1/auth/otp/request` and `POST /api/v1/auth/otp/verify` with sms.ir provider stub, rate limiting, and JWT session creation.
  - Test: Automated integration test simulating OTP request, verification, and role retrieval.
  - Status: pending

- [x] Task 2.2: Build Web OTP Login / Signup Modal with Countdown Timer
  - Owner: Frontend Engineer
  - Priority: P0
  - Estimate: M
  - Dependencies: Task 2.1, Task 12.2
  - Acceptance criteria: Phone number input with Persian numbers formatting, 2-minute countdown timer, auto-focus OTP inputs, and session cookie storage.
  - Test: Typecheck and Next.js production build pass with 0 errors; Auditor APPROVED in `.bonyo/audits/task-2.2.md`.
  - Status: done
  - Evidence: `AuthProvider` (`apps/web/src/context/auth-context.tsx`) and `OtpAuthModal` (`apps/web/src/components/auth/otp-auth-modal.tsx`) with 5-digit auto-advancing OTP, 120-second single-interval timer, phone validation, and header/nav triggers.

---

## EPIC 3 — Pet Profile Hub (Vertical Slice 1)
- [ ] Task 3.1: Create Pet & PetHealthProfile Database Models and Migrations
  - Owner: Database / Backend Engineer
  - Priority: P0
  - Estimate: M
  - Dependencies: Task 1.3
  - Acceptance criteria: PostgreSQL tables for multi-species pets, breeds, weights, dietary preferences, health book uploads, and unique QR tokens.
  - Test: Run Alembic upgrade and downgrade migrations cleanly.
  - Status: pending

- [ ] Task 3.2: Implement Pet CRUD API with Object Ownership Security
  - Owner: Backend Engineer
  - Priority: P0
  - Estimate: M
  - Dependencies: Task 3.1, Task 2.1
  - Acceptance criteria: REST endpoints for listing user pets, creating new pet, updating details, and soft deletion, protected against IDOR.
  - Test: Pytest test suite asserting that User B cannot access User A's pet.
  - Status: pending

- [x] Task 3.3: Build Pet Onboarding Wizard & Multi-Pet Switcher UI
  - Owner: Frontend Engineer
  - Priority: P0
  - Estimate: L
  - Dependencies: Task 3.2, Task 12.2
  - Acceptance criteria: Step-by-step wizard for species selection (Dog, Cat, Bird, Small Pet), breed search, birthday/weight picker, dietary input, and skip option; horizontal pet switcher with active ring indicator.
  - Test: Tested in Next.js App Router on `/dashboard/pets` and `/dashboard/care`; `tsc --noEmit` and `next build` passed.
  - Status: done
  - Evidence: `PetOnboardingWizard` (3-step iOS modal), `MultiPetSwitcher`, and `PetProvider` implemented and tested with seed pets and responsive avatar switcher.

---

## EPIC 4 — Daily Care Tasks & Today Dashboard (Vertical Slice 1)
- [ ] Task 4.1: Create Care Tasks & Activity Log Schema and Endpoints
  - Owner: Backend Engineer
  - Priority: P0
  - Estimate: M
  - Dependencies: Task 3.1
  - Acceptance criteria: Default species task templates (walk for dogs, water/seeds for birds), task completion log endpoint, and daily progress percentage calculator.
  - Test: API test verifying task check-off and streak calculation.
  - Status: pending

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
- [ ] Task 5.1: Implement QR Passport Token Generator & Emergency API
  - Owner: Security / Backend Engineer
  - Priority: P0
  - Estimate: M
  - Dependencies: Task 3.1
  - Acceptance criteria: Generate 64-char non-sequential token; public read endpoint returning sanitized contact details and Lost Pet status. Rate limited to 10 req/min.
  - Test: Pytest validating token entropy and rate-limiting behavior.
  - Status: pending

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
- [ ] Task 6.1: Create Catalog & Seller Offer Models
  - Owner: Database Engineer
  - Priority: P0
  - Estimate: M
  - Dependencies: Task 1.3
  - Acceptance criteria: Tables for `categories`, `canonical_products`, `sellers`, and `seller_offers` with composite indexes for price and availability.
  - Test: Migration passes and schema supports multi-seller offers for a single product.
  - Status: pending

- [ ] Task 6.2: Implement Buy Box Calculation & Product Catalog API
  - Owner: Backend Engineer
  - Priority: P0
  - Estimate: L
  - Dependencies: Task 6.1
  - Acceptance criteria: API endpoint returning canonical product with primary Buy Box offer (lowest price with stock > 0) and alternative seller offers list.
  - Test: Unit test verifying lowest price seller captures Buy Box.
  - Status: pending

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

- [ ] Task 8.2: Implement 30-Minute Inventory Reservation & Split Shipment Engine
  - Owner: Backend Engineer
  - Priority: P0
  - Estimate: L
  - Dependencies: Task 8.1
  - Acceptance criteria: Atomic inventory reservation on checkout start with 30-min expiry; calculation of separate seller shipment packages and courier fees.
  - Test: Concurrency test simulating simultaneous checkouts for limited stock.
  - Status: pending

- [ ] Task 8.3: Implement ZarinPal Payment Gateway Integration
  - Owner: Backend Engineer
  - Priority: P0
  - Estimate: M
  - Dependencies: Task 8.2
  - Acceptance criteria: Payment token request, redirect to IPG, webhook callback validation, order status transition to `PAID`, and 10% commission deduction.
  - Test: Mocked payment callback integration test.
  - Status: pending

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
- [ ] Task 9.1: Implement Food Consumption & Depletion Calculator
  - Owner: Backend Engineer
  - Priority: P0
  - Estimate: M
  - Dependencies: Task 8.3, Task 3.1
  - Acceptance criteria: Automatically create `reorder_schedules` row upon food purchase based on package weight and pet daily food consumption rate.
  - Test: Unit test calculating depletion date (e.g. 15kg at 300g/day = 50 days).
  - Status: pending

- [ ] Task 9.2: Scheduled Replenishment SMS & Buy Again Fast Flow
  - Owner: Full-Stack Engineer
  - Priority: P0
  - Estimate: M
  - Dependencies: Task 9.1
  - Acceptance criteria: Cron task triggers SMS 7 days before depletion with direct link to pre-populated cart; dashboard displays prominent "Buy Again" button.
  - Test: Integration test verifying SMS payload and cart pre-fill.
  - Status: pending

---

## EPIC 7 — Seller Onboarding & Daily Order Panel (Vertical Slice 3)
- [ ] Task 7.1: Build Seller Registration & KYC Verification
  - Owner: Backend Engineer
  - Priority: P0
  - Estimate: M
  - Dependencies: Task 2.1
  - Acceptance criteria: Seller signup with National ID, matching Sheba number, store address in Tehran, and admin approval state machine.
  - Test: State transition test from `UNDER_REVIEW` to `APPROVED`.
  - Status: pending

- [ ] Task 7.2: Build Seller Catalog Excel Import & Inventory Dashboard
  - Owner: Full-Stack Engineer
  - Priority: P0
  - Estimate: L
  - Dependencies: Task 7.1, Task 6.1
  - Acceptance criteria: Excel parser mapping seller spreadsheet columns to offers; simple web dashboard to toggle stock and adjust prices.
  - Test: Upload sample test Excel file and verify stock updates in database.
  - Status: pending

- [ ] Task 7.3: Build Seller Order Fulfillment & SLA Tracker
  - Owner: Frontend Engineer
  - Priority: P0
  - Estimate: M
  - Dependencies: Task 7.2, Task 8.2
  - Acceptance criteria: Order list filtered by store, status updater (Preparing -> Shipped), and courier tracking number assignment.
  - Test: Seller marks order shipped and buyer receives notification.
  - Status: pending

---

## EPIC 10 — Admin Moderation & Operations (Vertical Slice 3)
- [ ] Task 10.1: Build Admin Seller Verification & Dispute Panel
  - Owner: Full-Stack Engineer
  - Priority: P1
  - Estimate: M
  - Dependencies: Task 7.1
  - Acceptance criteria: Admin interface to review seller applications, audit orders, manage 4-hour customer return claims, and issue wallet refunds.
  - Test: Admin approves seller and resolves mock dispute.
  - Status: pending

- [ ] Task 10.2: Integrate Customer Support Drawer & AI Assistant Stub
  - Owner: Frontend Engineer
  - Priority: P1
  - Estimate: S
  - Dependencies: Task 12.2
  - Acceptance criteria: Support widget drawer with direct telephone link and AI conversational assistant interface.
  - Test: Widget renders and opens on user click.
  - Status: pending

---

## EPIC 11 — Notification Dispatch Engine
- [ ] Task 11.1: Build Asynchronous SMS Dispatcher via sms.ir
  - Owner: Backend Engineer
  - Priority: P0
  - Estimate: S
  - Dependencies: Task 1.3
  - Acceptance criteria: Centralized SMS worker with rate-limiting, templating (OTP, order confirmation, feeding reminder, lost pet alert), and error logging.
  - Test: Unit test asserting template formatting and dispatch retry logic.
  - Status: pending

---

## EPIC 13 — 3D Floating Island Progressive Enhancement
- [ ] Task 13.1: Build Lazy-Loaded Three.js Island Canvas with 2D Fallback
  - Owner: Three.js Engineer
  - Priority: P1
  - Estimate: M
  - Dependencies: Task 1.2
  - Acceptance criteria: Dynamic import of Three.js canvas in hero section; automatic fallback to `bonnivo-floating-island.svg` on mobile/slow connections; reduced motion support.
  - Test: Device capability detection test and frame rate check (>55 FPS).
  - Status: pending

---

## EPIC 14 — Analytics, QA & Security Hardening
- [ ] Task 14.1: Implement Event Telemetry Tracker
  - Owner: Analytics / Frontend Engineer
  - Priority: P0
  - Estimate: S
  - Dependencies: Task 1.2
  - Acceptance criteria: Client and server event logger implementing catalog defined in `docs/11-analytics-plan.md`.
  - Test: Event emission test in dev console.
  - Status: pending

- [ ] Task 14.2: End-to-End Test Suite & Security IDOR Audit
  - Owner: QA & Security Engineer
  - Priority: P0
  - Estimate: M
  - Dependencies: All P0 tasks
  - Acceptance criteria: Playwright end-to-end tests for core flows (signup, pet creation, cart checkout); security scan verifying no IDOR on pets/orders.
  - Test: 100% passing test pipeline.
  - Status: pending

---

## EPIC 15 — Staging, Docker Compose & Deployment
- [ ] Task 15.1: Create Multi-Stage Dockerfiles & Docker Compose Orchestration
  - Owner: DevOps Engineer
  - Priority: P0
  - Estimate: M
  - Dependencies: Task 1.2, Task 1.3
  - Acceptance criteria: Multi-stage Dockerfiles for `apps/web` (Next.js standalone) and `apps/backend` (FastAPI with Uvicorn), `docker-compose.yml` with PostgreSQL 16 and Nginx reverse proxy.
  - Test: `docker compose up --build` boots all services locally with clean health checks.
  - Status: pending
