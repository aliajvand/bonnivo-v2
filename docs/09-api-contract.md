# REST API Contracts (OpenAPI-First Specification)

All API responses strictly adhere to standardized JSON payloads:
```json
{
  "success": true,
  "data": {},
  "error": null
}
```

---

## 1. Authentication Endpoints

### 1.1 Request OTP
`POST /api/v1/auth/otp/request`
- **Rate Limit:** 3 requests / 5 minutes per IP/Phone.
- **Request:**
  ```json
  {
    "phone_number": "09123456789"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "message": "کد تأیید پیامک شد",
      "retry_after_seconds": 120
    }
  }
  ```

### 1.2 Verify OTP
`POST /api/v1/auth/otp/verify`
- **Request:**
  ```json
  {
    "phone_number": "09123456789",
    "otp_code": "84920"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "access_token": "eyJhbGciOi...",
      "token_type": "Bearer",
      "user": {
        "id": "c8b411d3-...",
        "phone_number": "09123456789",
        "role": "PET_PARENT",
        "has_registered_pets": true
      }
    }
  }
  ```

---

## 2. Pet Hub & Care Endpoints

### 2.1 List User Pets
`GET /api/v1/pets`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "9bf234e1-...",
        "name": "میلو (Milo)",
        "species": "DOG",
        "breed": "گلدن رتریور",
        "weight_kg": 28.5,
        "avatar_url": "/uploads/pets/milo.jpg",
        "qr_passport_token": "bny_qr_98f12a",
        "is_lost": false
      }
    ]
  }
  ```

### 2.2 Create Pet Profile
`POST /api/v1/pets`
- **Request:**
  ```json
  {
    "name": "میلو",
    "species": "DOG",
    "breed": "گلدن رتریور",
    "sex": "MALE",
    "birth_date": "2023-04-15",
    "weight_kg": 28.5,
    "is_neutered": true,
    "dietary_preferences": "غذای خشک مرغ و برنج بدون سویا",
    "daily_food_grams": 350
  }
  ```

### 2.3 Get Today's Care Routine
`GET /api/v1/pets/{pet_id}/care/today`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "date": "1405-07-09",
      "tasks": [
        {
          "id": "task_1",
          "title": "پیاده‌روی صبحگاهی",
          "category": "WALK",
          "target_value": 30,
          "target_metric": "MINUTES",
          "is_completed": true,
          "completed_at": "2026-09-30T08:30:00Z"
        },
        {
          "id": "task_2",
          "title": "وعده غذای عصر",
          "category": "FOOD",
          "target_value": 175,
          "target_metric": "GRAMS",
          "is_completed": false
        }
      ],
      "daily_progress_percentage": 50
    }
  }
  ```

---

## 3. Public QR Pet Passport (Zero-Auth / Rate-Limited)

### 3.1 View Emergency Passport
`GET /api/v1/passport/{token}`
- **Security:** Strict Rate Limit (10 req/min per IP), Sanitized fields.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "pet_name": "میلو",
      "species": "DOG",
      "breed": "گلدن رتریور",
      "is_lost": true,
      "lost_alert_message": "میلو در محدوده پارک لاله گم شده و نیاز فوری به داروی تنفسی دارد.",
      "emergency_contact": "0912***4567",
      "medical_alert": "حساس به پنی‌سیلین"
    }
  }
  ```

---

## 4. Multi-Vendor Marketplace & Buy Box

### 4.1 Browse Canonical Products
`GET /api/v1/products?species=DOG&category=food`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "id": "prod_1",
          "title_fa": "غذای خشک سگ رویال کنین مدل مکسی ادالت ۱۵ کیلوگرم",
          "slug": "royal-canin-maxi-adult-15kg",
          "brand": "Royal Canin",
          "image_url": "/icons/food.png",
          "buy_box_offer": {
            "seller_id": "seller_tehran_pet",
            "store_name": "پت‌شاپ نیاوران",
            "price_toman": 4850000,
            "discounted_price_toman": 4490000,
            "stock_quantity": 8,
            "lead_time_hours": 3
          },
          "offers_count": 3
        }
      ]
    }
  }
  ```

---

## 5. Pet-Connected Cart & Checkout

### 5.1 Add Item with Pet Assignment
`POST /api/v1/cart/items`
- **Request:**
  ```json
  {
    "seller_offer_id": "offer_849",
    "quantity": 1,
    "pet_id": "9bf234e1-..."
  }
  ```

### 5.2 30-Minute Checkout Reservation
`POST /api/v1/checkout/reserve`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "reservation_expires_at": "2026-09-30T10:45:00Z",
      "split_shipments": [
        {
          "seller_id": "seller_1",
          "store_name": "پت‌شاپ نیاوران",
          "items": ["prod_1"],
          "courier_fee_toman": 85000,
          "available_timeslots": ["امروز ۱۶ الی ۱۹", "فردا ۱۰ الی ۱۳"]
        }
      ],
      "total_payable_toman": 4575000
    }
  }
  ```
