# Product Analytics & Event Tracking Plan

## 1. Event Naming Conventions
All events follow the `object_action` format and include session and user context.

---

## 2. Event Catalog

### 2.1 Identity & Onboarding
| Event Name | Trigger | Payload |
| :--- | :--- | :--- |
| `user_otp_requested` | User submits phone number | `{ phone_masked: "0912***6789" }` |
| `user_otp_verified` | Correct OTP entered | `{ user_id, is_new_user: boolean }` |
| `pet_profile_created` | User saves new pet | `{ pet_id, species, breed, has_weight: boolean }` |

### 2.2 Daily Pet Care
| Event Name | Trigger | Payload |
| :--- | :--- | :--- |
| `care_task_completed` | User checks off a routine item | `{ pet_id, task_id, category, duration_minutes }` |
| `care_day_completed` | 100% of daily tasks achieved | `{ pet_id, total_tasks: number }` |
| `reminder_sms_dispatched` | Cron sends reminder SMS | `{ user_id, pet_id, reminder_type }` |

### 2.3 Commerce & Pet-Connected Checkout
| Event Name | Trigger | Payload |
| :--- | :--- | :--- |
| `product_viewed` | Canonical product detail viewed | `{ product_id, category_slug, brand }` |
| `cart_item_added` | Item added with pet avatar | `{ product_id, seller_id, pet_id, price_toman }` |
| `checkout_initiated` | User reaches checkout screen | `{ cart_id, total_items, split_sellers_count }` |
| `inventory_locked` | 30-min lock confirmed | `{ order_id, lock_duration_minutes: 30 }` |
| `payment_completed` | ZarinPal callback verified | `{ order_id, amount_toman, commission_toman }` |
| `buy_again_clicked` | One-click reorder CTA clicked | `{ pet_id, product_id, days_since_last_order }` |

### 2.4 QR Passport & Safety
| Event Name | Trigger | Payload |
| :--- | :--- | :--- |
| `qr_passport_scanned` | Public scan URL loaded | `{ qr_token, is_lost_active: boolean }` |
| `lost_pet_toggled` | Owner turns on lost mode | `{ pet_id, has_custom_message: boolean }` |
| `emergency_contact_dialed` | Finder taps call button | `{ qr_token }` |
