# Audit — Task 9.1: Implement Food Consumption & Depletion Calculator

STATUS: APPROVED

REQUIREMENTS: PASS
IMPLEMENTATION: PASS
STATE: PASS
INTEGRATION: PASS
TYPE SAFETY: PASS
TESTS: PASS (2/2 replenishment tests, 15/15 full backend suite passed)
REGRESSION: PASS

## Evidence
- `src/services/replenishment.py` implements:
  - `calculate_depletion_schedule(package_weight_grams, daily_consumption_grams, start_date)` returning `depletion_date`, `prompt_date` (7 days before depletion), and total supply days.
  - `create_schedules_from_order(db, order)` invoked automatically upon payment verification for any order items assigned to pets with food package weights.
  - `dispatch_due_replenishment_reminders(db)` which queries schedules where `prompt_date <= now` and sends SMS reminder with a 1-tap cart link, updating `sms_sent = True`.
- `src/api/v1/replenishment.py` implements:
  - `GET /api/v1/replenishment/pet/{pet_id}`: Returns active reorder schedule, supply days, days remaining, and depletion percentage for frontend widget.
  - `POST /api/v1/replenishment/dispatch-cron`: Operational cron trigger for automated scheduled replenishment.
- Automated tests in `tests/test_replenishment.py`:
  - Unit test verifies: 15kg (15,000g) at 300g/day yields exactly 50 days of supply and a prompt date at day 43.
  - End-to-end integration test verifies: Order payment triggers schedule creation, API exposes 50 days supply, and cron dispatch sends SMS and flags `sms_sent = True`.
