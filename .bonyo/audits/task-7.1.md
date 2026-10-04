# Audit — Task 7.1: Build Seller Registration & KYC Verification

STATUS: APPROVED

REQUIREMENTS: PASS
IMPLEMENTATION: PASS
STATE: PASS
INTEGRATION: PASS
TYPE SAFETY: PASS
TESTS: PASS (1/1 seller KYC test, 16/16 full suite passed)
REGRESSION: PASS

## Evidence
- `src/api/v1/sellers.py` implements:
  - `POST /api/v1/sellers/register`: Validates 10-digit National ID and standard 26-char Iranian Sheba format (`IR...`), creates `Seller` record with initial status `UNDER_REVIEW` and `is_verified=False`.
  - `GET /api/v1/sellers/me`: Returns current user's seller profile.
  - `PATCH /api/v1/sellers/{seller_id}/status`: Admin-only state machine enforcing allowed status transitions (`UNDER_REVIEW` -> `APPROVED` / `REJECTED`, `APPROVED` -> `SUSPENDED`).
  - Sets `is_verified=True` and upgrades user role to `UserRole.SELLER` upon approval.
  - Rejects unauthorized status modification attempts with 403 Forbidden.
- Mounted in `src/main.py` under prefix `/api/v1/sellers`.
- Automated test `tests/test_seller_kyc.py` verifies:
  - Rejection of invalid Sheba numbers (422 Unprocessable Entity).
  - Normal user denied permission to self-approve (403 Forbidden).
  - Invalid state transition (e.g. `UNDER_REVIEW` -> `SUSPENDED`) rejected (400 Bad Request).
  - Admin approval transitions state to `APPROVED`, sets `is_verified=True`, and elevates applicant's role to `SELLER`.
