# Database Schema & Relational Data Model

## 1. Overview
The database layer uses **PostgreSQL 16** with strict relational modeling via SQLAlchemy 2.0. JSONB is reserved strictly for audit log metadata and dynamic UI attribute tags.

---

## 2. Core Entities & Relationships

### 2.1 Identity & Access (`users`, `user_sessions`)
```sql
CREATE TYPE user_role AS ENUM ('PET_PARENT', 'SELLER', 'ADMIN');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    role user_role DEFAULT 'PET_PARENT' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

### 2.2 Pet Hub & Health (`pets`, `pet_health_profiles`)
```sql
CREATE TYPE pet_species AS ENUM ('DOG', 'CAT', 'BIRD', 'SMALL_PET', 'OTHER');
CREATE TYPE pet_sex AS ENUM ('MALE', 'FEMALE', 'UNKNOWN');

CREATE TABLE pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(50) NOT NULL,
    species pet_species NOT NULL,
    breed VARCHAR(100),
    sex pet_sex DEFAULT 'UNKNOWN' NOT NULL,
    birth_date DATE,
    estimated_age_months INT,
    weight_kg NUMERIC(5,2),
    is_neutered BOOLEAN DEFAULT FALSE,
    microchip_number VARCHAR(50),
    avatar_url TEXT,
    qr_passport_token VARCHAR(64) UNIQUE NOT NULL,
    is_lost BOOLEAN DEFAULT FALSE,
    lost_alert_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_pets_user_id ON pets(user_id);
CREATE INDEX idx_pets_qr_token ON pets(qr_passport_token);

CREATE TABLE pet_health_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE NOT NULL,
    dietary_preferences TEXT,
    allergies TEXT,
    vaccination_records JSONB DEFAULT '[]'::jsonb,
    health_book_image_url TEXT,
    medical_notes TEXT,
    daily_food_grams NUMERIC(6,2),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

### 2.3 Daily Care & Routines (`care_tasks`, `task_completions`)
```sql
CREATE TYPE task_frequency AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM');

CREATE TABLE care_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(100) NOT NULL,
    species pet_species NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'WALK', 'FOOD', 'MEDICATION', 'HYGIENE'
    target_metric VARCHAR(50),      -- e.g. 'MINUTES', 'GRAMS'
    target_value INT,              -- e.g. 30 for 30 minutes walk
    scheduled_time TIME,
    frequency task_frequency DEFAULT 'DAILY' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE task_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES care_tasks(id) ON DELETE CASCADE NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    achieved_value INT,
    notes TEXT
);

CREATE INDEX idx_task_completions_task_date ON task_completions(task_id, completed_at);
```

### 2.4 Multi-Vendor Catalog (`categories`, `canonical_products`, `seller_offers`)
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    title_fa VARCHAR(100) NOT NULL,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    icon_name VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE canonical_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) NOT NULL,
    title_fa VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    brand VARCHAR(100),
    target_species pet_species NOT NULL,
    description_fa TEXT,
    image_gallery JSONB DEFAULT '[]'::jsonb,
    barcode VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE sellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    store_name_fa VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    national_id VARCHAR(20) NOT NULL,
    sheba_number VARCHAR(30) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    city VARCHAR(50) DEFAULT 'Tehran' NOT NULL,
    address TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'UNDER_REVIEW' NOT NULL, -- 'APPROVED', 'SUSPENDED'
    commission_rate NUMERIC(4,2) DEFAULT 0.10 NOT NULL, -- 10% default
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE seller_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_product_id UUID REFERENCES canonical_products(id) ON DELETE CASCADE NOT NULL,
    seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE NOT NULL,
    price_toman BIGINT NOT NULL,
    discounted_price_toman BIGINT,
    stock_quantity INT DEFAULT 0 NOT NULL,
    lead_time_hours INT DEFAULT 24 NOT NULL,
    is_buy_box BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_seller_product UNIQUE(canonical_product_id, seller_id)
);

CREATE INDEX idx_offers_product_price ON seller_offers(canonical_product_id, price_toman);
```

### 2.5 Carts & Pet-Connected Checkout (`carts`, `cart_items`, `orders`, `shipments`)
```sql
CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID REFERENCES carts(id) ON DELETE CASCADE NOT NULL,
    seller_offer_id UUID REFERENCES seller_offers(id) NOT NULL,
    pet_id UUID REFERENCES pets(id) ON DELETE SET NULL, -- Connects item to pet avatar
    quantity INT DEFAULT 1 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TYPE order_status AS ENUM (
    'PENDING_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REFUNDED'
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    order_number VARCHAR(32) UNIQUE NOT NULL,
    status order_status DEFAULT 'PENDING_PAYMENT' NOT NULL,
    total_items_amount_toman BIGINT NOT NULL,
    total_delivery_fee_toman BIGINT NOT NULL,
    final_amount_toman BIGINT NOT NULL,
    shipping_address JSONB NOT NULL,
    delivery_timeslot VARCHAR(100),
    inventory_locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    seller_id UUID REFERENCES sellers(id) NOT NULL,
    tracking_number VARCHAR(100),
    courier_name VARCHAR(50), -- 'EXPRESS_COURIER', 'TIPAX', 'POST'
    shipment_fee_toman BIGINT NOT NULL,
    status VARCHAR(50) DEFAULT 'PREPARING' NOT NULL,
    delivered_at TIMESTAMPTZ,
    claim_deadline_at TIMESTAMPTZ
);
```

### 2.6 Smart Reorder Schedules (`reorder_schedules`)
```sql
CREATE TABLE reorder_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE NOT NULL,
    canonical_product_id UUID REFERENCES canonical_products(id) NOT NULL,
    package_weight_grams NUMERIC(8,2) NOT NULL,
    daily_consumption_grams NUMERIC(6,2) NOT NULL,
    estimated_depletion_date DATE NOT NULL,
    alert_triggered_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```
