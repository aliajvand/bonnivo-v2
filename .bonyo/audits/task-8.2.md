# Audit — Task 8.2: Implement 30-Minute Inventory Reservation & Split Shipment Engine

STATUS: APPROVED

REQUIREMENTS: PASS
IMPLEMENTATION: PASS
STATE: PASS
INTEGRATION: PASS
TYPE SAFETY: PASS
TESTS: PASS (1/1 reservation test, 12/12 full suite passed)
REGRESSION: PASS

## Evidence
- `src/api/v1/checkout.py` implements:
  - `POST /api/v1/checkout/reserve`: Atomic inventory reservation on checkout initiation.
  - Active reservation expiry set to 30 minutes from timestamp (`reservation_expires_at`).
  - Active unreleased reservation tracking against available stock (`offer.stock_quantity - active_reservations`).
  - Split shipment engine grouping items into separate seller packages.
  - Per-package shipping fee calculation (Free shipping if package subtotal >= 800,000 Tomans, else 39,000 Tomans per package).
  - 10% platform commission calculation per order item.
- Mounted in `src/main.py` under prefix `/api/v1/checkout`.
- Automated test `tests/test_inventory_reservation.py` asserts:
  - User A reserves remaining stock and multiple sellers produce distinct split packages with correct courier fees.
  - User B's concurrent attempt to reserve exhausted stock fails with HTTP 400 and clear error message.
