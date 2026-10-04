# Phase 2, 3 & 4 Implementation Checklist: Bonyo Ecosystem Expansion

This document tracks the autonomous engineering sprint for Phases 2, 3, and 4 across backend, web, mobile, and AI services.

---

## EPIC 16 — Health & Vet Booking System (Phase 2)

- [x] Task 16.1: Vet Booking Domain Models & API Endpoints
  - Owner: Senior Backend Engineer
  - Priority: P0
  - Estimate: M
  - Dependencies: Task 3.1, Task 2.1
  - Acceptance criteria: SQLAlchemy models for Clinic, Veterinarian, Shift, Timeslot, and Appointment. Endpoints for listing clinics, searching by specialty/district, querying available slots, and booking with pet attribution. IDOR protection so only appointment owner or clinic can access booking details.
  - Test: `pytest tests/test_vet_booking.py` passes 100%.
  - Status: done
  - Evidence: Implemented `apps/backend/src/models/vet.py` (`Clinic`, `Veterinarian`, `Appointment`), router `apps/backend/src/api/v1/vets.py` (`GET /clinics`, `GET /clinics/{id}`, `GET /vets/{id}/timeslots`, `POST /appointments`, `GET /appointments/my`, `PUT /appointments/{id}/cancel`), registered in `src/main.py`. Verified via `pytest tests/test_vet_booking.py` (100% pass). Auditor APPROVED in `.bonyo/audits/phase-2-health-network.md`.

- [x] Task 16.2: Shared Medical Records & Digital Prescription Engine
  - Owner: Senior Backend Engineer
  - Priority: P0
  - Estimate: M
  - Dependencies: Task 16.1, Task 3.2
  - Acceptance criteria: Digital medical records system allowing verified veterinarians to log examination notes, prescriptions, vaccinations, and allergy updates linked directly to the pet's health record. Read access restricted to pet owner and attending vet.
  - Test: `pytest tests/test_medical_records.py` passes 100%.
  - Status: done
  - Evidence: Implemented `apps/backend/src/models/vet.py` (`MedicalRecord`), router `apps/backend/src/api/v1/medical_records.py` (`POST /medical-records`, `GET /medical-records/pets/{pet_id}`), auto-updating pet weight and storing JSON prescriptions. Verified via `pytest tests/test_medical_records.py` (100% pass). Auditor APPROVED in `.bonyo/audits/phase-2-health-network.md`.

- [x] Task 16.3: Vet Directory, Booking Flow & Appointment Management UI
  - Owner: Senior Frontend Engineer
  - Priority: P0
  - Estimate: L
  - Dependencies: Task 16.1, Task 12.2
  - Acceptance criteria: Clinic discovery directory (`/vets`) with Tehran district filters and specialities. Interactive clinic profile with calendar shift & slot picker, pet selector, booking confirmation, and dashboard appointment management (`/dashboard/appointments`).
  - Test: `pnpm --filter web typecheck` and `pnpm --filter web build` succeed.
  - Status: done
  - Evidence: Built `apps/web/src/types/vet.ts`, API client `apps/web/src/lib/api/vets.ts`, directory page `apps/web/src/app/vets/page.tsx`, booking profile `apps/web/src/app/vets/[id]/page.tsx`, user dashboard `apps/web/src/app/dashboard/appointments/page.tsx`, and desktop header integration. Verified via `tsc --noEmit` and `next build` (18/18 static pages compiled). Auditor APPROVED in `.bonyo/audits/phase-2-health-network.md`.

---

## EPIC 17 — In-Home & Facility Pet Services: Grooming & Boarding (Phase 2)

- [x] Task 17.1: Service Booking with Automated Vaccine Validation
  - Owner: Full-Stack Engineer
  - Priority: P1
  - Estimate: M
  - Dependencies: Task 16.2, Task 3.2
  - Acceptance criteria: Booking interface and API for grooming and boarding services. Automated prerequisite validation checking whether the selected pet has valid rabies and polyvalent vaccines on their digital health passport before allowing booking.
  - Test: Automated unit tests verify booking blocked for unvaccinated pets and approved for up-to-date pets.
  - Status: done
  - Evidence: Implemented `apps/backend/src/api/v1/services.py` (`POST /services/booking`) validating valid rabies & polyvalent vaccines on `MedicalRecord`. Blocked unvaccinated pets with 400 Bad Request; approved vaccinated pets. Integrated services tab in `apps/web/src/app/dashboard/appointments/page.tsx`. Verified via `pytest tests/test_services_vaccine_guard.py` (100% pass). Auditor APPROVED in `.bonyo/audits/phase-2-health-network.md`.

---

## EPIC 18 — Smart Auto-Replenish Subscriptions (Phase 2)

- [x] Task 18.1: Periodic Food & Care Subscription Engine
  - Owner: Full-Stack Engineer
  - Priority: P0
  - Estimate: M
  - Dependencies: Task 9.1, Task 8.3
  - Acceptance criteria: Database models and API for recurring pet food subscriptions linked to pet consumption calculations. Customer dashboard (`/dashboard/subscriptions`) allowing users to pause, change delivery cycle, swap products, or cancel subscriptions.
  - Test: `pytest tests/test_subscriptions.py` passes 100%; web build passes.
  - Status: done
  - Evidence: Implemented `apps/backend/src/models/subscription.py` (`PetFoodSubscription`), router `apps/backend/src/api/v1/subscriptions.py` (`POST`, `GET /my`, `PUT /{id}/pause`, `PUT /{id}/resume`, `PUT /{id}/cancel`), frontend types & client `apps/web/src/lib/api/subscriptions.ts`, and full management UI `apps/web/src/app/dashboard/subscriptions/page.tsx`. Verified via `pytest tests/test_subscriptions.py` and `next build`. Auditor APPROVED in `.bonyo/audits/phase-2-health-network.md`.

---

## EPIC 19 — Bonyo Care AI Copilot (Phase 2)

- [x] Task 19.1: Biometric-Grounded AI Health & Nutrition Assistant
  - Owner: AI & Backend Engineer
  - Priority: P1
  - Estimate: M
  - Dependencies: Task 3.2, Task 4.1
  - Acceptance criteria: Streaming Server-Sent Events (SSE) AI assistant endpoint (`/api/v1/ai-copilot/chat`) primed with pet biometrics (species, breed, age, weight, allergies). Interactive floating chat drawer on the Care Dashboard (`/dashboard/care`).
  - Test: Streaming endpoint test passes; client component renders in Care view.
  - Status: done
  - Evidence: Implemented `apps/backend/src/api/v1/ai_copilot.py` streaming SSE chunks with biometric grounding. Built `apps/web/src/components/care/bonyo-copilot-drawer.tsx` and integrated in `apps/web/src/app/dashboard/care/page.tsx`. Verified via `pytest tests/test_ai_copilot.py` and `next build`. Auditor APPROVED in `.bonyo/audits/phase-2-health-network.md`.

---

## EPIC 20 — Distributed Tehran Logistics & Express Dispatch (Phase 3)

- [x] Task 20.1: District-Aware Express Routing & Shipment Tracking State Machine
  - Owner: Backend Engineer
  - Priority: P1
  - Estimate: M
  - Dependencies: Task 8.2
  - Acceptance criteria: Logistics dispatch models handling Tehran's 22 urban districts, estimating courier delivery windows (under 3 hours for express), and state machine transitions: `COURIER_ASSIGNED`, `PICKED_UP`, `IN_TRANSIT`, `DELIVERED`.
  - Test: Automated courier state machine test passes.
  - Status: done
  - Evidence: Implemented `apps/backend/src/models/logistics.py` (`CourierShipment`, `CourierStatus`, `DeliveryTier`), router `apps/backend/src/api/v1/logistics.py` (`/estimate-fee`, `/dispatch`, `/shipments/{id}/status`, `/location`, `/tracking`). Validated strict state machine transitions with illegal skips blocked. Verified via `pytest tests/test_logistics_dispatch.py` (100% pass). Auditor APPROVED in `.bonyo/audits/phase-3-logistics-marketplace.md`.

---

## EPIC 21 — Multi-Vendor Automated Settlement (Phase 3)

- [x] Task 21.1: Vendor Payout Calculation & IBAN/Paya Reconciliation
  - Owner: Fintech & Backend Engineer
  - Priority: P1
  - Estimate: M
  - Dependencies: Task 8.3, Task 7.3
  - Acceptance criteria: Automated ledger calculating platform commission (10%), seller net balance, tax withholding, and generating batch Paya bank settlement records.
  - Test: Accounting balance invariant tests pass.
  - Status: done
  - Evidence: Implemented `apps/backend/src/models/settlement.py` (`VendorSettlement`), router `apps/backend/src/api/v1/settlements.py` (`/calculate`, `/my`, `/confirm-paya`). Verified accounting invariants (10% platform commission, 9% VAT, net payout, `commission + tax + net == gross`), unique Paya reference numbers, and seller tenant authorization. Verified via `pytest tests/test_vendor_settlement.py` (100% pass). Auditor APPROVED in `.bonyo/audits/phase-3-logistics-marketplace.md`.

---

## EPIC 22 — Supplier WMS & Inventory Sync Webhooks (Phase 3)

- [x] Task 22.1: Automated WMS Stock Synchronization Webhooks
  - Owner: Backend Engineer
  - Priority: P1
  - Estimate: S
  - Dependencies: Task 7.2
  - Acceptance criteria: Secure webhook receiver with HMAC signature verification allowing external ERP/accounting software (Sepidar, Hamkaran) to synchronize stock changes in real-time.
  - Test: HMAC signature validation and batch stock update tests pass.
  - Status: done
  - Evidence: Implemented `apps/backend/src/api/v1/wms_webhooks.py` (`POST /webhooks/wms/sync-stock`) with HMAC-SHA256 signature verification (`X-Bonyo-Signature`). Rejects tampered payloads with 401; verifies seller multi-tenant boundary on `SellerOffer`. Verified via `pytest tests/test_wms_webhooks.py` (100% pass). Auditor APPROVED in `.bonyo/audits/phase-3-logistics-marketplace.md`.

---

## EPIC 23 — Live Courier Map & Fleet Tracking (Phase 3)

- [x] Task 23.1: Interactive Courier Live Tracking Map Component
  - Owner: Frontend Engineer
  - Priority: P1
  - Estimate: M
  - Dependencies: Task 20.1, Task 8.4
  - Acceptance criteria: Live tracking view on order detail page displaying interactive route map, simulated/live courier vehicle marker, distance, and dynamic estimated delivery time.
  - Test: Web typecheck and build pass cleanly.
  - Status: done
  - Evidence: Created `apps/web/src/components/logistics/live-courier-map.tsx` with animated vehicle marker, Tehran route vector, distance, ETA countdown, and status progression bar. Added dedicated order tracking page `apps/web/src/app/dashboard/tracking/page.tsx` linked directly from `/checkout/success`. Verified via `tsc --noEmit` and `next build` (19/19 static pages compiled). Auditor APPROVED in `.bonyo/audits/phase-3-logistics-marketplace.md`.

---

## EPIC 24 — Smart NFC Collar Tag Integration (Phase 4)

- [x] Task 24.1: NFC Tag Provisioning & Cryptographic Identity Mapping
  - Owner: Security & Hardware Engineer
  - Priority: P1
  - Estimate: S
  - Dependencies: Task 5.1
  - Acceptance criteria: Secure mapping service linking physical NTAG213/215 NFC chips to pet digital passports via immutable cryptographic hardware IDs.
  - Test: NFC token claim and resolution test suite passes.
  - Status: done
  - Evidence: Implemented `apps/backend/src/models/nfc.py` (`SmartCollarTag`) and `apps/backend/src/api/v1/nfc.py` with `/provision`, `/claim`, `/resolve/{hardware_token}`, and `/{tag_id}/revoke`. Public tap returns emergency contact without leaking private notes. IDOR protection ensures non-owners cannot claim or revoke. Verified via `pytest tests/test_nfc_tags.py` (100% pass). Auditor APPROVED in `.bonyo/audits/phase-4-hardware-social.md`.

---

## EPIC 25 — Community Lost Pet Amber Alert (Phase 4)

- [x] Task 25.1: Geo-Fenced Community Push & SMS Broadcast System
  - Owner: Backend Engineer
  - Priority: P1
  - Estimate: M
  - Dependencies: Task 5.3, Task 11.1
  - Acceptance criteria: Geo-fenced broadcast engine notifying registered Bonyo pet owners and partnered clinics within a 3km radius when a pet is declared LOST.
  - Test: Geo-radius query and dispatch stub test passes.
  - Status: done
  - Evidence: Implemented `apps/backend/src/models/amber_alert.py` (`LostPetAlert`) and `apps/backend/src/api/v1/amber_alert.py` with `/broadcast`, `/active-alerts`, and `/{id}/resolve`. Automatically updates `pet.is_lost` and computes recipients across Tehran 22 districts. Verified via `pytest tests/test_amber_alert.py` (100% pass). Auditor APPROVED in `.bonyo/audits/phase-4-hardware-social.md`.

---

## EPIC 26 — Ethical Pet Adoption & Rehoming Hub (Phase 4)

- [x] Task 26.1: Ethical Adoption Directory & Guardian Vetting Workflow
  - Owner: Product & Full-Stack Engineer
  - Priority: P2
  - Estimate: M
  - Dependencies: Task 3.1
  - Acceptance criteria: Adoption portal (`/adopt`) strictly for rescue/rehoming with guardian suitability questionnaire, prohibiting commercial breeding and illegal sales.
  - Test: Application submission and approval state machine tests pass.
  - Status: done
  - Evidence: Implemented `apps/backend/src/models/adoption.py` (`AdoptionListing`, `AdoptionApplication`) and `apps/backend/src/api/v1/adoption.py`. Server enforces `adoption_fee_tomans == 0` (commercial sale requests rejected with 400). Created responsive web portal `apps/web/src/app/adopt/page.tsx` with ethical charter, species filters, rescue badges, and guardian application modal. Verified via `pytest tests/test_adoption.py` and `next build` (20/20 static pages). Auditor APPROVED in `.bonyo/audits/phase-4-hardware-social.md`.

---

## EPIC 27 — Bonyo Paw Points Gamification & Loyalty (Phase 4)

- [x] Task 27.1: Daily Care Streaks Rewards & Storefront Discount Conversion
  - Owner: Full-Stack Engineer
  - Priority: P2
  - Estimate: S
  - Dependencies: Task 4.1, Task 8.1
  - Acceptance criteria: Points engine rewarding care streak milestones (7 days, 30 days) and converting points into checkout discount vouchers.
  - Test: Points calculation and checkout coupon application tests pass.
  - Status: done
  - Evidence: Implemented `apps/backend/src/models/loyalty.py` (`PawPointsLedger`, `PawDiscountVoucher`) and `apps/backend/src/api/v1/loyalty.py` (`/balance`, `/reward-streak`, `/redeem-voucher`, `/vouchers`). Ledgers prevent duplicate claims with cycle idempotency. Created `apps/web/src/components/dashboard/paw-points-widget.tsx` integrated in `/dashboard/care`. Verified via `pytest tests/test_loyalty.py` (100% pass) and `next build`. Auditor APPROVED in `.bonyo/audits/phase-4-hardware-social.md`.

---

## EPIC 28 — Visual Redesign, Canonical Brand & Design Tokens

- [x] Task 28.1: Unified Apple/Metis Color Palette & Semantic Tokens
  - Owner: Design Lead & Frontend Engineer
  - Priority: P0
  - Estimate: M
  - Acceptance criteria: Complete replacement of rejected color palette with fresh Emerald Mint (`#10b981`), Metis Cobalt Blue (`#2563eb`), dark slate surfaces (`#090d16`, `#0f172a`), and crisp light surfaces (`#ffffff`, `#f8fafc`). Full Light & Dark mode support via semantic CSS variables and SSR-safe `ThemeProvider`.
  - Test: `tsc --noEmit` and `pnpm build` pass. Theme toggle switches dynamically.
  - Status: done
  - Evidence: Overhauled `apps/web/src/app/globals.css`, `apps/web/tailwind.config.ts`, created `apps/web/src/context/theme-context.tsx` and `apps/web/src/components/ui/theme-toggle.tsx`. Integrated into root `apps/web/src/app/layout.tsx`. Auditor APPROVED.

- [x] Task 28.2: Official Canonical Bonyo Vector Logo Component
  - Owner: Frontend Engineer & Design Agent
  - Priority: P0
  - Estimate: S
  - Acceptance criteria: Extract and render official Bonyo paw silhouette SVG mark without text substitution or raster distortion, supporting horizontal, mark, and compact variants across light and dark themes.
  - Test: `bonyo-logo.tsx` renders across headers and footers with zero raster blur.
  - Status: done
  - Evidence: Implemented `apps/web/src/components/brand/bonyo-logo.tsx` with vector path extracted from `public/icons/bonnivo-logo-mark.svg`. Integrated in desktop header, mobile top bar, and footer. Auditor APPROVED.

- [x] Task 28.3: Role-Aware Header & Floating Glass Luminous Dock Navigation
  - Owner: Frontend Engineer & Auditor
  - Priority: P0
  - Estimate: M
  - Acceptance criteria: Role-aware navigation for Customer, Admin, Vet, Organizer, and Trainer. Floating rectangular glass dock navigation with animated circular luminous halo glow indicator (`#10b981`) for mobile. One-click role switcher for instant QA simulation.
  - Test: Desktop header and mobile bottom dock adapt seamlessly to active role.
  - Status: done
  - Evidence: Implemented `apps/web/src/components/layout/desktop-header.tsx`, `apps/web/src/components/layout/mobile-bottom-nav.tsx`, and `apps/web/src/components/layout/role-switcher.tsx`. Active halo dot indicator pulses dynamically on active tab. Auditor APPROVED.

---

## EPIC 29 — Role-Based Ergonomic Dashboards & Analytics Scoping

- [x] Task 29.1: Metis-Inspired Admin Operations Dashboard
  - Owner: Frontend & Backend Engineer
  - Priority: P0
  - Estimate: L
  - Acceptance criteria: Admin dashboard (`/dashboard/admin`) featuring 4 top KPI metric cards, interactive revenue SVG multi-line chart, 7-day user growth bar chart, donut order distribution chart, seller KYC verification queue, 4-hour guarantee dispute resolution, and security audit log. Global analytics scope.
  - Test: `next build` compiles `/dashboard/admin` statically with zero errors.
  - Status: done
  - Evidence: Rebuilt `apps/web/src/components/admin/admin-panel-view.tsx` with full Metis information architecture, tabs, and interactive actions. Verified via `next build`. Auditor APPROVED.

- [x] Task 29.2: Clinical Veterinarian Workspace Dashboard
  - Owner: Full-Stack Engineer
  - Priority: P0
  - Estimate: M
  - Acceptance criteria: Vet workspace (`/dashboard/vet`) with today's scheduled/in-progress appointments, patient consent-based records, allergy alerts, examination actions, and clinic-scoped analytics.
  - Test: `next build` compiles `/dashboard/vet` cleanly.
  - Status: done
  - Evidence: Created `apps/web/src/app/dashboard/vet/page.tsx` with appointment state transitions, allergy callouts, and scoped clinical KPIs. Auditor APPROVED.

- [x] Task 29.3: Event Organizer Dashboard & QR Check-in Simulator
  - Owner: Full-Stack Engineer
  - Priority: P0
  - Estimate: M
  - Acceptance criteria: Organizer hub (`/dashboard/organizer`) with event capacity metrics, ticket sales, revenue calculations, and interactive QR ticket check-in simulator with duplication alerts. Organizer-scoped analytics.
  - Test: `next build` compiles `/dashboard/organizer` cleanly.
  - Status: done
  - Evidence: Created `apps/web/src/app/dashboard/organizer/page.tsx` with capacity progress bars, ticket validator, and organizer metrics. Auditor APPROVED.

- [x] Task 29.4: Trainer & Behavioral Workspace Dashboard
  - Owner: Full-Stack Engineer
  - Priority: P1
  - Estimate: M
  - Acceptance criteria: Trainer workspace (`/dashboard/trainer`) with scheduled obedience/behavioral sessions, client context (strictly isolated from private medical health records), training packages, and verified reviews. Trainer-scoped analytics.
  - Test: `next build` compiles `/dashboard/trainer` cleanly.
  - Status: done
  - Evidence: Created `apps/web/src/app/dashboard/trainer/page.tsx` with session completion actions, package pricing, and zero medical data leakage. Auditor APPROVED.

- [x] Task 29.5: Customer "Today" Care & Pet Hub
  - Owner: Frontend Engineer
  - Priority: P0
  - Estimate: M
  - Acceptance criteria: Consumer-grade pet hub (`/dashboard`) with active pet context, daily care task checklist with interactive completion, QR passport shortcut, autoship summary, and upcoming appointment reminders.
  - Test: `next build` compiles `/dashboard` cleanly.
  - Status: done
  - Evidence: Created `apps/web/src/app/dashboard/page.tsx` with pet switcher, progress bar, daily tasks, and shortcuts. Auditor APPROVED.

---

## EPIC 30 — Commerce & 3D Pedestal Product Detail Page (PDP)

- [x] Task 30.1: 3D / 360° Pedestal PDP with Buy Box Offers & Compatibility
  - Owner: Frontend & 3D Graphics Engineer
  - Priority: P0
  - Estimate: L
  - Acceptance criteria: High-fidelity PDP (`/shop/[slug]`) matching mobile reference image: 3D/360° rotatable view on stone pedestal, floating price badge, floating rating badge, floating quantity selector, packaging variant selector chips, pet compatibility indicator, Buy Box multi-seller guarantee, and prominent Add to Cart CTA.
  - Test: `next build` compiles `/shop/[slug]` as dynamic server-rendered route.
  - Status: done
  - Evidence: Implemented `apps/web/src/app/shop/[slug]/page.tsx` and integrated direct product card links from `apps/web/src/components/shop/shop-catalog-view.tsx`. Verified via `next build` and typecheck. Auditor APPROVED.

---

## EPIC 31 — Native Mobile Application Architecture (`apps/mobile`)

- [x] Task 31.1: Expo Router + NativeWind Mobile Architecture
  - Owner: Mobile Engineer
  - Priority: P0
  - Estimate: L
  - Acceptance criteria: Complete mobile application in `apps/mobile` built with React Native, Expo Router, NativeWind, and Zustand. Features floating rectangular dock with animated circular luminous halo glow, offline-first care tasks, catalog with 3D pedestal viewer screen, pet QR passport card, and multi-role switcher for simulation.
  - Test: Package config, app config, tailwind, babel, tsconfig, state stores, and tab screens pass static checks.
  - Status: done
  - Evidence: Implemented `apps/mobile/package.json`, `app.json`, `tailwind.config.js`, `babel.config.js`, `tsconfig.json`, state stores (`use-auth-store.ts`, `use-pet-store.ts`, `use-cart-store.ts`), and screens (`_layout.tsx`, `(tabs)/_layout.tsx`, `(tabs)/index.tsx`, `(tabs)/care.tsx`, `(tabs)/shop.tsx`, `(tabs)/pets.tsx`, `(tabs)/more.tsx`, `product/[id].tsx`). Auditor APPROVED.

---

## EPIC 32 — Unified Environment Templates & Deterministic QA Personas

- [x] Task 32.1: Unified Environment Templates with Zero Secret Leakage
  - Owner: DevOps & Security Engineer
  - Priority: P0
  - Estimate: S
  - Acceptance criteria: Production-grade `.env.example` templates across root, backend, web, and mobile containing placeholder variables for SMS.ir, Groq, database, JWT, and CORS without committing real secrets.
  - Test: `.env.example` files exist in all required subdirectories and are tracked.
  - Status: done
  - Evidence: Created `.env.example`, `apps/backend/.env.example`, `apps/web/.env.example`, and `apps/mobile/.env.example`. Auditor APPROVED.

- [x] Task 32.2: Deterministic QA Seed Personas & Role Simulation Suite
  - Owner: Backend & QA Engineer
  - Priority: P0
  - Estimate: S
  - Acceptance criteria: Reserved test identities for all 5 roles (`customer@test.bonyo.local`, `admin@test.bonyo.local`, `vet@test.bonyo.local`, `organizer@test.bonyo.local`, `trainer@test.bonyo.local`), UserRole enum extension, and automated test suite.
  - Test: `pytest tests/test_qa_role_simulation.py` passes 100%.
  - Status: done
  - Evidence: Updated `apps/backend/src/models/user.py` (`UserRole` extended with VETERINARIAN, EVENT_ORGANIZER, TRAINER), created `apps/backend/src/fixtures/qa_seeds.py`, and verified with `apps/backend/tests/test_qa_role_simulation.py` (37/37 backend tests pass). Auditor APPROVED.

---

## EPIC 33 — Production Product Management, Image Pipeline, Excel Import & Groq LLM

- [x] Task 33.1: Admin Product Management, 1:1 Image Pipeline & SVG Security Sanitization
  - Owner: Senior Backend & Frontend Engineer
  - Priority: P0
  - Estimate: M
  - Acceptance criteria: Admin product catalog management with full CRUD, stock & pricing tiers, 1:1 aspect ratio image normalization, and secure SVG sanitization stripping script tags, event handlers, and malicious payloads.
  - Test: `pytest tests/test_production_catalog_and_discovery.py` passes image pipeline security tests.
  - Status: done
  - Evidence: Implemented `apps/backend/src/services/image_pipeline.py` (safe XML parser, SVG sanitization, SHA256 deduplication, 1:1 aspect ratio metadata), `ProductImage` database model in `catalog.py`, Admin endpoints in `api/v1/admin.py`, and frontend manager `apps/web/src/components/admin/admin-product-management.tsx`. Auditor APPROVED.

- [x] Task 33.2: Bulk Excel/CSV Import with Dry-Run Preview & Transactional Commit
  - Owner: Backend Engineer
  - Priority: P0
  - Estimate: M
  - Acceptance criteria: Template generation, upload validation with row-level error reporting, duplicate SKU detection, dry-run preview, and transactional database commit.
  - Test: `pytest tests/test_production_catalog_and_discovery.py` passes Excel import unit tests.
  - Status: done
  - Evidence: Implemented `apps/backend/src/services/excel_import.py` (`generate_template_csv`, `parse_and_validate_import`, `commit_import_rows`), Admin import endpoints (`/import/template`, `/import/preview`, `/import/commit`), and interactive frontend modal in `apps/web/src/components/admin/admin-product-management.tsx`. Auditor APPROVED.

- [x] Task 33.3: Groq LLM Content Generation with Grounded Persian Copy & SEO
  - Owner: AI & Backend Engineer
  - Priority: P1
  - Estimate: M
  - Acceptance criteria: Server-side Groq API integration transforming raw supplier text into structured Persian titles, markdown feature bullets, FAQs, and SEO meta tags without hallucinating ingredients or medical claims.
  - Test: `pytest tests/test_production_catalog_and_discovery.py` passes LLM generator tests.
  - Status: done
  - Evidence: Implemented `apps/backend/src/services/groq_service.py` with grounded Persian prompt and fallback engine, mounted at `POST /api/v1/admin/products/generate-content`. Integrated interactive "تولید خودکار محتوا با هوش مصنوعی" button in Admin UI. Auditor APPROVED.

- [x] Task 33.4: Verified Purchase Reviews Engine with Backend Order Joining
  - Owner: Full-Stack Engineer
  - Priority: P0
  - Estimate: M
  - Acceptance criteria: Reviews engine where verified purchase status is computed strictly by joining Orders, OrderItems, and SellerOffers with paid status. Public PDP review list, star ratings, and Admin moderation queue.
  - Test: `pytest tests/test_production_catalog_and_discovery.py` passes verified review verification test.
  - Status: done
  - Evidence: Created `ProductReview` model in `apps/backend/src/models/catalog.py`, endpoints in `api/v1/catalog.py` and `admin.py`, verified reviews section on `/shop/[slug]`, and review moderation dashboard in `apps/web/src/components/admin/admin-reviews-management.tsx`. Auditor APPROVED.

---

## EPIC 34 — Progressive 5→10→20 KM Geospatial Discovery & Zero-404 Route Integrity

- [x] Task 34.1: Stepped Radius Discovery Router & Interactive Tehran Radar Map
  - Owner: Full-Stack Engineer
  - Priority: P0
  - Estimate: M
  - Acceptance criteria: Geospatial discovery enforcing mandatory progressive search radius: Step 1 (5 KM) -> Step 2 (10 KM) -> Step 3 (20 KM) -> Step 4 (Zero results). Interactive browser radar map with category filters (Vets, Trainers, Boarding, Events) and card-marker synchronization.
  - Test: `pytest tests/test_production_catalog_and_discovery.py` passes stepped radius tests; `next build` compiles `/discover`.
  - Status: done
  - Evidence: Implemented `apps/backend/src/api/v1/discovery.py` with Haversine distance and progressive radius logic. Created interactive discovery page `apps/web/src/app/discover/page.tsx` with Tehran SVG radar grid, category pills, and card/marker synchronization. Auditor APPROVED.

- [x] Task 34.2: Zero Dead-End Public Ecosystem & Legal Policy Pages
  - Owner: Frontend & Product Engineer
  - Priority: P0
  - Estimate: M
  - Acceptance criteria: Implement all public directory and legal destination routes (`/trainers`, `/boarding`, `/events`, `/privacy`, `/terms`, `/return-policy`, `/medical-disclaimer`) and canonical `DesktopFooter` to ensure zero broken links across the entire ecosystem.
  - Test: `next build` compiles all 32/32 routes with 0 errors.
  - Status: done
  - Evidence: Implemented `apps/web/src/app/trainers/page.tsx`, `boarding/page.tsx`, `events/page.tsx`, `privacy/page.tsx`, `terms/page.tsx`, `return-policy/page.tsx`, `medical-disclaimer/page.tsx`, and `apps/web/src/components/layout/desktop-footer.tsx`. Verified via `pnpm --filter web build` (32/32 routes static/dynamic compiled). Auditor APPROVED.


