# Security, Privacy & Compliance Guidelines

## 1. Zero Client Trust Model
- Never trust frontend-supplied claims regarding roles (`PET_PARENT`, `SELLER`, `ADMIN`).
- Every request reaching the API layer validates permissions server-side through FastAPI Dependencies (`get_current_active_user`, `require_role`, `verify_pet_ownership`).

---

## 2. Insecure Direct Object Reference (IDOR) Defense
- **Pet Access:** Every route targeting `/pets/{pet_id}` performs an ownership lookup:
  ```python
  if pet.user_id != current_user.id and current_user.role != UserRole.ADMIN:
      raise HTTPException(status_code=403, detail="دسترسی غیرمجاز به پرونده این پت")
  ```
- **Order Access:** Sellers may only inspect order line items corresponding to their own store. Customer personal notes and other seller items in split orders are redacted.
- **Health Records:** Pet health telemetry and health book image URLs are restricted to the pet owner and verified clinical staff. Sellers are strictly barred from health profiles.

---

## 3. QR Passport Privacy & Anti-Abuse
- **Token Design:** QR URLs use cryptographically random 64-character tokens (e.g., `/passport/bny_qr_a982f1b4...`), completely preventing sequential enumeration or scraping.
- **Data Sanitization:** The public emergency card displays only:
  - Pet Name and Breed
  - Owner Emergency Contact (masked or call-through proxy)
  - Medical Emergency Alert (e.g. "نیاز فوری به انسولین")
  - Optional approximate lost area
  - **NEVER** displays the owner's home address, full national ID, or full medical history.
- **Rate Limiting:** Public passport endpoints enforce strict IP-based rate limiting (10 requests/minute) to mitigate harassment or automated harvesting.

---

## 4. Input Validation & API Hardening
- **Backend Validation:** Pydantic v2 schemas enforce regex on Iranian phone numbers (`^09\d{9}$`), positive decimal bounds for weight/food metrics, and safe string lengths.
- **Frontend Validation:** Zod schemas mirror backend validation on every form.
- **CORS & Headers:** Explicit origin allowlist (production domain + localhost in dev); security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`).
