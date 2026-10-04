# Phase 1 Scope Specification

## Scope Summary (Executive Overview)
Phase 1 delivers the **Commerce + Pet Daily Care MVP** for Bonyo in Tehran and nationally for parcel shipping. The core loop couples pet identity creation with daily care tracking, smart food replenishment, and multi-vendor checkout.

---

## 1. Must Have (P0)

### 1.1 Authentication & Account
- Phone number input + SMS OTP (via sms.ir infrastructure).
- Role-based server authorization (`Pet Parent`, `Seller`, `Admin`).
- Profile management and session persistence.

### 1.2 Pet Profile Hub
- Multi-species support: Dog, Cat, Birds, Small pets (extensible schema).
- Pet attributes: Name, species, breed, sex, birth date / estimated age, weight, neutered/spayed status, microchip number (optional).
- Health & Diet notes: Dietary preferences, known allergies, vaccination records, photo upload for health book.
- Multi-pet profile switcher.

### 1.3 Daily Care & Today Dashboard
- "Today" view displaying species-tailored routines (e.g., dog walking progress bar, bird cage cleaning, cat grooming).
- Task check-off, snooze, and reschedule.
- Feeding reminders and medication/vaccine calendar.
- SMS notifications for critical events (missed essential tasks, feeding alerts).

### 1.4 QR Pet Passport & Lost Pet Safety
- Non-sequential, unique tokenized QR code per pet.
- Public emergency scan landing page showing strictly owner-approved public contact details.
- Lost Pet status trigger with approximate geographic display on map (no precise private address leaked).
- Rate-limited and abuse-protected scan endpoints.

### 1.5 Curated Multi-Vendor Marketplace
- Canonical Product catalog with seller-specific offers (price, stock, delivery SLA).
- Buy Box logic (defaulting to the lowest-priced offer with stock).
- Product search, filtering by species, category, brand, and weight/flavor variants.
- Weekly Excel/CSV seller catalog import (name, barcode, category, weight, flavor, MSRP, discounted price, stock).

### 1.6 Cart, Checkout & Split Shipment
- Pet-connected cart: Map each item to a specific registered pet with visual avatar.
- Multi-seller checkout with split shipment calculation and delivery schedule selection.
- Tehran delivery: Live estimated courier pricing with safe pricing buffer + timeslot selection.
- National delivery: Standard postal/Tipax shipping for non-perishable goods.
- 30-minute inventory lock upon checkout initiation to prevent race conditions.
- Payment gateway integration with ZarinPal.

### 1.7 Smart Reorder Foundation
- Input daily consumption estimate during pet onboarding or product assignment.
- Automated SMS replenishment notification 5 to 7 days before package exhaustion.
- "Buy Again" fast reorder button in dashboard and order history.

### 1.8 Seller & Admin Foundation
- Seller onboarding: Mobile signup, KYC checklist (National ID, matching IBAN/Sheba, phone/in-person verification).
- Seller dashboard: Order list, SLA tracker, stock updates, fulfillment status updates.
- Admin dashboard: Seller verification, catalog approval, dispute resolution (4-hour post-delivery window).

---

## 2. Should Have (P1)
- 3D Floating Island hero graphic in Next.js header with seamless 2D SVG fallback.
- AI customer support chat widget integration for fast issue resolution.
- Official digital pre-invoice (PDF/printable) generation.
- Wallet credit balance for instant order refunds.

---

## 3. Could Have (P2)
- Advanced spatial search for nearby pet shops using PostGIS.
- Household pet profile sharing (read-only invites).

---

## 4. Won't Have Now (Explicitly Out of Phase 1 Scope)
- Full veterinarian booking and online consultations.
- Prescription issuing and prescription medication sales.
- AI automated medical diagnosis.
- Social feed, public pet community walls, follower graphs.
- Full trainer, groomer, walker, or boarding marketplaces.
- Live boarding camera streams.
- Subscription billing / automatic card-on-file charging (Autoship in Phase 1 is strictly SMS reminder + Buy Again).
- Multi-currency or international localization.
