# Core User Flows

## Flow 1: Authentication & Dynamic Landing
```mermaid
graph TD
    A[User enters Mobile Number] --> B[System sends 5-digit OTP via sms.ir]
    B --> C[User enters OTP code]
    C -->|Valid| D{Does user have registered pets?}
    C -->|Invalid| B
    D -->|Yes| E[Redirect to Pet Care 'Today' Dashboard]
    D -->|No| F[Redirect to Public Marketplace]
```

## Flow 2: Pet Profile Creation (Pet-First Onboarding)
```mermaid
sequenceDiagram
    actor Parent as Pet Parent
    participant Web as Next.js Web App
    participant API as FastAPI Backend
    participant DB as PostgreSQL

    Parent->>Web: Clicks 'افزودن پت جدید'
    Web->>Parent: Prompts Species (Dog, Cat, Bird, Small Pet)
    Parent->>Web: Selects Species & Enters Name, Breed, Age, Weight
    Parent->>Web: (Optional) Enters dietary preferences & uploads health book photo
    Web->>API: POST /api/v1/pets
    API->>DB: INSERT INTO pets & pet_health_profiles
    DB-->>API: Pet entity created
    API-->>Web: 201 Created (with unique QR token)
    Web-->>Parent: Shows success animation & loads 'Today' Care Dashboard
```

## Flow 3: Daily Care Routine & Task Check-off
```mermaid
graph LR
    A[Today Dashboard Loads] --> B[Fetch Species Tasks: Walk, Food, Meds, Water]
    B --> C[Parent checks off task e.g., 30m Walk]
    C --> D[Update Task Progress Bar & Log Activity Event]
    D --> E{All tasks complete?}
    E -->|Yes| F[Celebrate Daily Milestone Badge]
    E -->|No| G[Keep Remaining Tasks Visible]
```

## Flow 4: Pet-Connected Shopping & Multi-Seller Checkout
```mermaid
sequenceDiagram
    actor Parent as Pet Parent
    participant Web as Next.js Web App
    participant API as FastAPI Backend
    participant PG as ZarinPal IPG

    Parent->>Web: Browses Canonical Products
    Web->>Parent: Displays Buy Box offer (lowest price in-stock seller)
    Parent->>Web: Clicks 'افزودن به سبد' & selects Pet Avatar (e.g. Milo)
    Web->>API: POST /api/v1/cart/items (with pet_id)
    Parent->>Web: Navigates to Checkout
    Web->>API: POST /api/v1/checkout/reserve (30-min inventory lock)
    API-->>Web: Split shipment breakdown (Seller A, Seller B) + Timeslot options
    Parent->>Web: Selects delivery timeslot & confirms
    Web->>API: POST /api/v1/orders/initiate-payment
    API->>PG: Request Payment Token
    PG-->>API: Authority Token & Payment URL
    API-->>Web: Redirect URL
    Web->>PG: User enters card details & pays
    PG-->>API: Webhook / Callback Verification
    API-->>Web: Order Confirmed & SMS confirmation dispatched
```

## Flow 5: Smart Reorder & Automated Replenishment
```mermaid
graph TD
    A[Parent enters daily food consumption e.g. 200g/day] --> B[System calculates package lifespan e.g. 15kg = 75 days]
    B --> C[Cron Worker tracks remaining days]
    C --> D{7 Days remaining?}
    D -->|Yes| E[Send SMS Alert: بسته غذای میلو رو به اتمامه! تمدید آسان با یک کلیک]
    E --> F[Parent clicks SMS link to pre-filled Buy Again cart]
    F --> G[1-Click Checkout execution]
```

## Flow 6: QR Pet Passport & Lost Pet Safety
```mermaid
sequenceDiagram
    actor Finder as Citizen / Finder
    participant Web as Public Emergency Page
    participant API as FastAPI Backend
    actor Parent as Pet Parent

    Finder->>Web: Scans QR tag on pet collar (/passport/{token})
    Web->>API: GET /api/v1/passport/{token}
    API-->>Web: Public emergency card (Pet Name, Breed, Owner Emergency Phone, Medical Alert)
    Web-->>Finder: Displays Contact Owner button
    Finder->>Web: Clicks Call / Send Location Note
    Web->>API: POST /api/v1/passport/{token}/notify
    API-->>Parent: Instant SMS alert: بارکد قلاده پت شما اسکن شد!
```
