import pytest
from httpx import AsyncClient, ASGITransport
from src.main import app


@pytest.mark.asyncio
async def test_analytics_event_ingestion():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Single event
        single_event = {
            "event": "cart_item_added",
            "payload": {
                "product_id": "prod-101",
                "seller_id": "seller-01",
                "pet_id": "pet-teddy",
                "price_toman": 450000,
            },
            "timestamp": "2026-09-30T10:00:00Z",
            "sessionId": "sess_test_12345",
        }
        res_single = await ac.post("/api/v1/analytics/events", json=single_event)
        assert res_single.status_code == 200
        assert res_single.json()["status"] == "recorded"
        assert res_single.json()["count"] == 1

        # Batch events
        batch_events = [
            {
                "event": "checkout_initiated",
                "payload": {"total_items": 2, "split_sellers_count": 2},
                "timestamp": "2026-09-30T10:05:00Z",
                "sessionId": "sess_test_12345",
            },
            {
                "event": "payment_completed",
                "payload": {"order_id": "ord-9988", "amount_toman": 900000, "commission_toman": 90000},
                "timestamp": "2026-09-30T10:10:00Z",
                "sessionId": "sess_test_12345",
            },
        ]
        res_batch = await ac.post("/api/v1/analytics/events", json=batch_events)
        assert res_batch.status_code == 200
        assert res_batch.json()["count"] == 2
