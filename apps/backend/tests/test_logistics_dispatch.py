import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.order import Order, OrderStatus
from src.models.logistics import CourierStatus, DeliveryTier


async def get_user_token(client: AsyncClient, phone: str) -> str:
    await client.post("/api/v1/auth/otp/request", json={"phone_number": phone})
    from src.services.sms import default_sms_provider, StubSmsAdapter
    assert isinstance(default_sms_provider, StubSmsAdapter)
    code = default_sms_provider.sent_otps[phone]
    res = await client.post("/api/v1/auth/otp/verify", json={"phone_number": phone, "code": code})
    assert res.status_code == 200
    return res.json()["access_token"]


@pytest.mark.asyncio
async def test_tehran_dispatch_and_state_machine(client: AsyncClient, db_session: AsyncSession):
    # 1. Test Delivery Fee Estimation for Tehran 22 districts
    res_fee_dist1 = await client.get("/api/v1/logistics/estimate-fee?district=1&tier=EXPRESS_3H")
    assert res_fee_dist1.status_code == 200
    data_fee1 = res_fee_dist1.json()
    assert data_fee1["sla_hours"] == 3
    assert data_fee1["fee_toman"] == 85000  # 45k + 40k express

    res_fee_dist18 = await client.get("/api/v1/logistics/estimate-fee?district=18&tier=STANDARD")
    assert res_fee_dist18.status_code == 200
    assert res_fee_dist18.json()["fee_toman"] == 65000

    # Invalid district check (> 22)
    res_bad_dist = await client.get("/api/v1/logistics/estimate-fee?district=25")
    assert res_bad_dist.status_code == 400

    # 2. Setup user and order
    token_user = await get_user_token(client, "09120001122")
    headers_user = {"Authorization": f"Bearer {token_user}"}

    # Fetch user profile id
    profile_res = await client.get("/api/v1/auth/me", headers=headers_user)
    user_id = profile_res.json()["id"]

    order = Order(
        user_id=user_id,
        status=OrderStatus.PAID,
        total_amount_tomans=1500000,
        shipping_address="تهران، ولنجک، خیابان گلستان، پلاک ۴",
    )
    db_session.add(order)
    await db_session.commit()

    # 3. Dispatch Courier (COURIER_ASSIGNED)
    dispatch_payload = {
        "order_id": order.id,
        "courier_name": "رضا مرادی",
        "courier_phone": "09195556677",
        "tehran_district": 1,
        "delivery_tier": "EXPRESS_3H",
    }
    dispatch_res = await client.post("/api/v1/logistics/dispatch", json=dispatch_payload, headers=headers_user)
    assert dispatch_res.status_code == 201
    shipment = dispatch_res.json()
    assert shipment["status"] == "COURIER_ASSIGNED"
    assert shipment["courier_name"] == "رضا مرادی"
    shipment_id = shipment["id"]

    # 4. State Machine Transition: COURIER_ASSIGNED -> PICKED_UP (Valid)
    res_picked = await client.put(
        f"/api/v1/logistics/shipments/{shipment_id}/status",
        json={"new_status": "PICKED_UP"},
        headers=headers_user,
    )
    assert res_picked.status_code == 200
    assert res_picked.json()["status"] == "PICKED_UP"

    # 5. Invalid State Machine Transition Test:
    # Cannot jump from PICKED_UP directly to DELIVERED (must go through IN_TRANSIT)
    res_invalid = await client.put(
        f"/api/v1/logistics/shipments/{shipment_id}/status",
        json={"new_status": "DELIVERED"},
        headers=headers_user,
    )
    assert res_invalid.status_code == 400
    assert "ماشین حالت" in res_invalid.json()["detail"]

    # 6. Valid Transition: PICKED_UP -> IN_TRANSIT
    res_transit = await client.put(
        f"/api/v1/logistics/shipments/{shipment_id}/status",
        json={"new_status": "IN_TRANSIT"},
        headers=headers_user,
    )
    assert res_transit.status_code == 200
    assert res_transit.json()["status"] == "IN_TRANSIT"

    # 7. Update Courier Location
    loc_res = await client.put(
        f"/api/v1/logistics/shipments/{shipment_id}/location",
        json={"latitude": 35.7981, "longitude": 51.4112},
        headers=headers_user,
    )
    assert loc_res.status_code == 200
    assert loc_res.json()["lat"] == 35.7981

    # 8. Valid Transition: IN_TRANSIT -> DELIVERED
    res_delivered = await client.put(
        f"/api/v1/logistics/shipments/{shipment_id}/status",
        json={"new_status": "DELIVERED"},
        headers=headers_user,
    )
    assert res_delivered.status_code == 200
    assert res_delivered.json()["status"] == "DELIVERED"
    assert res_delivered.json()["delivered_at"] is not None

    # 9. Track Order Shipment API (User A)
    track_res = await client.get(f"/api/v1/logistics/orders/{order.id}/tracking", headers=headers_user)
    assert track_res.status_code == 200
    assert track_res.json()["id"] == shipment_id
