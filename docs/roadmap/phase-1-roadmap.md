# Phase 1 Master Roadmap: Pet-First Vertical Slice Architecture

## 1. Execution Order & Prioritization Strategy
Per Founder Source of Truth, Bonyo follows a **Pet Profile First Vertical Slice** strategy across 16 structured epics:

```
[ FOUNDATION ]
  Epic 0: Product Foundation & Decisions (Complete)
  Epic 1: Repository Monorepo, Environments & Tooling
  Epic 12: Design System, RTL & Accessibility Base

[ VERTICAL SLICE 1: PET IDENTITY & DAILY CARE ]
  Epic 2: Authentication & Role-Based Access
  Epic 3: Pet Profile Hub & Multi-Species Taxonomy
  Epic 4: Daily Care Tasks & 'Today' Dashboard
  Epic 5: Health Timeline & QR Pet Passport

[ VERTICAL SLICE 2: CATALOG, PET-CONNECTED COMMERCE & REORDER ]
  Epic 6: Canonical Catalog, Search & Buy Box
  Epic 8: Pet-Connected Cart, Split Shipment & Checkout
  Epic 9: Smart Reorder & Automated Replenishment

[ VERTICAL SLICE 3: SELLER, ADMIN & OPERATIONS ]
  Epic 7: Seller Onboarding & Daily Order Panel
  Epic 10: Admin Marketplace Moderation & Disputes
  Epic 11: SMS Notifications & Dispatch Engine

[ PROGRESSIVE ENHANCEMENT & PRODUCTION HARDENING ]
  Epic 13: 3D Floating Island & 2D Fallback
  Epic 14: Analytics, QA & Security Hardening
  Epic 15: Docker Compose Staging & Pilot Launch
```

---

## 2. Epic Definitions

### EPIC 0 — Product Foundation and Decisions
- **Goal:** Codify discovery decisions into authoritative markdown specifications.
- **Priority:** P0 | **Estimate:** S | **Owner:** Product/Tech Lead
- **Status:** Done (Source of truth docs generated).

### EPIC 1 — Repository, Environments and Developer Experience
- **Goal:** Configure root workspace (`pnpm-workspace.yaml`, Turborepo), environment files, Next.js 15 app in `apps/web`, FastAPI app in `apps/backend`, and shared client in `packages/api-client`.
- **Priority:** P0 | **Estimate:** M | **Owner:** DevOps / Senior Engineer

### EPIC 2 — Authentication, Users and Role-Based Access
- **Goal:** Implement phone number + SMS OTP authentication flow via sms.ir, session tokens, and FastAPI role dependencies (`PET_PARENT`, `SELLER`, `ADMIN`).
- **Priority:** P0 | **Estimate:** M | **Owner:** Security / Backend Engineer

### EPIC 3 — Pet Profile and Household Foundation (Vertical Slice 1)
- **Goal:** Deliver multi-species pet creation, profile editing, photo upload, weight tracking, and multi-pet switcher in UI and database.
- **Priority:** P0 | **Estimate:** L | **Owner:** Full-Stack Engineer

### EPIC 4 — Daily Care, Tasks and Reminders (Vertical Slice 1)
- **Goal:** Build the species-tailored "Today" dashboard with progress indicators (dog walking, feeding, hygiene) and task completion check-offs.
- **Priority:** P0 | **Estimate:** L | **Owner:** Frontend / Backend Engineer

### EPIC 5 — Health Timeline and QR Pet Passport (Vertical Slice 1)
- **Goal:** Generate non-sequential QR passport tokens, emergency public landing card, and Lost Pet alert toggle with masked owner contact.
- **Priority:** P0 | **Estimate:** M | **Owner:** Full-Stack Engineer

### EPIC 6 — Catalog, Products, Variants and Search (Vertical Slice 2)
- **Goal:** Build Canonical Product catalog, category hierarchies, search/filtering, and the lowest-price Buy Box offer engine.
- **Priority:** P0 | **Estimate:** L | **Owner:** E-commerce Architect

### EPIC 7 — Seller Onboarding and Seller Panel (Vertical Slice 3)
- **Goal:** Seller registration, KYC submission (National ID, Sheba), inventory Excel import, and order fulfillment status management.
- **Priority:** P0 | **Estimate:** L | **Owner:** Marketplace Engineer

### EPIC 8 — Cart, Checkout, Orders and Fulfillment (Vertical Slice 2)
- **Goal:** Pet-connected cart items, 30-minute inventory reservation, Tehran scheduled courier split shipment, and ZarinPal payment gateway.
- **Priority:** P0 | **Estimate:** XL | **Owner:** Senior E-commerce Engineer

### EPIC 9 — Reorder, Recommendation Rules and Autoship Foundation (Vertical Slice 2)
- **Goal:** Calculate consumption rate from package size and daily feeding grams; trigger SMS reminder 7 days before depletion; Buy Again 1-click flow.
- **Priority:** P0 | **Estimate:** M | **Owner:** Backend / Product Engineer

### EPIC 10 — Admin, Operations, Support and Moderation (Vertical Slice 3)
- **Goal:** Admin review for sellers, catalog approval, 4-hour claim window management, and customer support chat drawer.
- **Priority:** P1 | **Estimate:** M | **Owner:** Full-Stack Engineer

### EPIC 11 — Notifications and Communication Preferences
- **Goal:** Centralized SMS notification service (OTP, order updates, feeding alerts, lost pet scans) with rate limits and quiet hours.
- **Priority:** P0 | **Estimate:** S | **Owner:** Backend Engineer

### EPIC 12 — Design System, RTL and Accessibility Base
- **Goal:** Configure Vazirmatn font, Bonyo Care color tokens in Tailwind, Radix/shadcn primitives, and full RTL layout support.
- **Priority:** P0 | **Estimate:** M | **Owner:** UI/UX Lead

### EPIC 13 — 3D Island Progressive Enhancement
- **Goal:** Lazy-loaded Three.js canvas in hero with interactive landmark links and automatic 2D SVG fallback on low-end devices.
- **Priority:** P1 | **Estimate:** M | **Owner:** Three.js Engineer

### EPIC 14 — Analytics, Observability, QA and Security Hardening
- **Goal:** Automated unit/integration tests, zero client-trust IDOR audit, and event tracking implementation.
- **Priority:** P0 | **Estimate:** M | **Owner:** QA & Security Engineer

### EPIC 15 — Staging, Pilot Launch and Post-Launch Monitoring
- **Goal:** Multi-stage Dockerfiles, Docker Compose deployment on Ubuntu VPS, Nginx reverse proxy, automated SSL, and health checks.
- **Priority:** P0 | **Estimate:** M | **Owner:** DevOps Engineer
