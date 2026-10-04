# Architecture & Product Decisions

## Decision: Multi-Species Open Pet Data Model
Status: approved
Owner: Founder
Date: 2026-09-30

### Decision
The Pet Profile schema must support multiple animal species from day one (Dogs, Cats, Birds, Small Pets, and larger animals) via an extensible taxonomy rather than hardcoded canine/feline models.

### Reason
The Iranian pet market includes substantial populations of bird and small mammal owners. Designing an extensible schema avoids future migration friction.

### Impact
Database schema will utilize an extensible species/breed relation with species-specific activity metrics stored cleanly.

### Alternatives
Hardcoding dog/cat attributes first and retrofitting other species later.

---

## Decision: Zero-Inventory Curated Marketplace with Buy Box
Status: approved
Owner: Founder
Date: 2026-09-30

### Decision
Bonyo operates without holding central inventory (Zero-Inventory). Canonical Products will be listed centrally, while authorized sellers provide offers (price, stock, SLA). The lowest-priced in-stock offer captures the Buy Box.

### Reason
Minimizes capital expenditure and warehouse logistics risk while ensuring users receive competitive market prices.

### Impact
Product catalog is split into `CanonicalProduct` and `SellerOffer`. Multi-seller orders will execute split fulfillment.

### Alternatives
Direct merchant-only listings (Digikala style uncurated duplicates) or 1P centralized warehousing.

---

## Decision: Fixed 10% Commission Revenue Model
Status: approved
Owner: Founder
Date: 2026-09-30

### Decision
Monetization in Phase 1 relies exclusively on a flat 10% commission on fulfilled transactions. Subscriptions and listing fees are out of scope.

### Reason
Simple, predictable for seller adoption, and completely aligned with seller success during the launch phase.

### Impact
Payment settlement calculations subtract 10% commission prior to seller payout.

### Alternatives
Tiered commission, subscription tiers, or ad placements.

---

## Decision: Split Shipment and Scheduled Courier Delivery in Tehran
Status: approved
Owner: Founder
Date: 2026-09-30

### Decision
Tehran orders support customer-selected delivery days and timeslots. If items come from multiple shops, distinct delivery fees and packages (Split Shipment) are clearly presented. Standard postal/Tipax shipping applies nationally for dry items.

### Reason
Live delivery expectation management is critical for perishable or urgent pet supplies in Tehran.

### Impact
Checkout engine handles multi-origin logistics and calculates separate shipment packages.

### Alternatives
Holding orders until all items arrive at a consolidation depot before final delivery.

---

## Decision: 30-Minute Checkout Inventory Lock
Status: approved
Owner: Founder
Date: 2026-09-30

### Decision
When a user initiates checkout, item quantities are temporarily reserved for 30 minutes. If stock depletes, the user is offered a graceful fallback to switch sellers.

### Reason
Prevents race conditions and inventory conflicts between online orders and physical pet shop sales.

### Impact
Backend requires timed reservation state management on inventory rows.

### Alternatives
Optimistic stock checking only at final payment webhook, causing failed order refunds.

---

## Decision: SMS OTP Authentication via sms.ir
Status: approved
Owner: Founder
Date: 2026-09-30

### Decision
Authentication is strictly mobile phone number + SMS verification code using `sms.ir`. Email/password is deferred.

### Reason
Standardized, frictionless authentication behavior in Iran with highest delivery and conversion rates.

### Impact
Backend integrates sms.ir client with strict rate-limiting and redis-backed or database token validation.

### Alternatives
Passwords, social logins, or email magic links.

---

## Decision: Optional Pet Onboarding with Dynamic Home Route
Status: approved
Owner: Founder
Date: 2026-09-30

### Decision
Pet registration is optional during initial signup. Users with registered pets land on the "Pet Care Dashboard" as home; users without pets land on the "Public Marketplace".

### Reason
Prevents drop-off for casual shoppers who want to quickly purchase a single item without filling out pet surveys.

### Impact
Frontend routing dynamically evaluates user pet count to render the appropriate landing experience.

### Alternatives
Forcing pet registration before allowing store access.

---

## Decision: ZarinPal Payment Gateway with Wallet Refund Option
Status: approved
Owner: Founder
Date: 2026-09-30

### Decision
Initial payment gateway is ZarinPal, architected to allow plugging in direct bank IPGs (Saman/Mellat) or SnappPay later. Refunds can be returned via IBAN or credited to user wallet balance.

### Reason
Reliable setup for marketplace launch with rapid developer verification.

### Impact
Clean gateway adapter interface in backend payment service.

### Alternatives
Direct banking contracts requiring extended regulatory approvals.

---

## Decision: 3D Floating Island with 2D SVG Fallback
Status: approved
Owner: Founder
Date: 2026-09-30

### Decision
The landing page hero features an interactive 3D floating island built with Three.js / React Three Fiber, dynamically imported with `ssr: false`. Low-spec devices and slow connections automatically fall back to the optimized 2D SVG graphic.

### Reason
Creates a memorable brand aesthetic without compromising Core Web Vitals or accessibility on budget mobile devices.

### Impact
Web app embeds capability detection to conditionally mount Canvas or the existing SVG vector graphic.

### Alternatives
Mandatory 3D canvas or pure static 2D illustration.

---

## Decision: Docker Compose on Ubuntu VPS for Deployment
Status: approved
Owner: Founder
Date: 2026-09-30

### Decision
Phase 1 production and staging infrastructure runs via Docker Compose on an Ubuntu VPS with Nginx reverse proxy and Let's Encrypt automated SSL.

### Reason
Cost-effective, highly portable, lightweight, and straightforward to maintain without Kubernetes overhead.

### Impact
Deployment scripts, multi-stage Dockerfiles for Next.js and FastAPI, and `docker-compose.yml` form the baseline ops.

### Alternatives
Managed Kubernetes clusters or serverless platforms with cross-border latency issues.
