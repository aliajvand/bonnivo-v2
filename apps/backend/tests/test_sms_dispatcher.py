import pytest
from src.services.sms import SmsDispatcher, StubSmsAdapter, SMS_TEMPLATES


def test_template_formatting():
    dispatcher = SmsDispatcher(StubSmsAdapter())

    # 1. OTP
    text_otp = dispatcher.format_message("OTP", {"code": "54321"})
    assert "54321" in text_otp

    # 2. Order confirmation
    text_order = dispatcher.format_message("ORDER_CONFIRMATION", {"order_id": "BNV-1020", "link": "https://bonnivo.ir/orders/1020"})
    assert "BNV-1020" in text_order
    assert "https://bonnivo.ir/orders/1020" in text_order

    # 3. Feeding reminder
    text_feed = dispatcher.format_message("FEEDING_REMINDER", {"pet_name": "لئو", "routine_detail": "۱۵۰ گرم غذای خشک رویال"})
    assert "لئو" in text_feed
    assert "۱۵۰ گرم" in text_feed

    # 4. Lost pet alert
    text_lost = dispatcher.format_message("LOST_PET_ALERT", {"pet_name": "تدی", "finder_phone": "09121112233", "location": "تهران، ولنجک"})
    assert "تدی" in text_lost
    assert "09121112233" in text_lost

    # 5. Reorder alert
    text_reorder = dispatcher.format_message("REORDER_ALERT", {"pet_name": "میلو", "days_left": 7, "link": "https://bonnivo.ir/cart?buyAgain=1"})
    assert "میلو" in text_reorder
    assert "7" in text_reorder


@pytest.mark.asyncio
async def test_dispatcher_retry_logic():
    stub = StubSmsAdapter()
    # Instruct stub to fail on first 2 attempts, then succeed on 3rd attempt
    stub.should_fail_attempts = 2
    dispatcher = SmsDispatcher(stub, max_retries=3)

    success = await dispatcher.dispatch(
        phone_number="09120001122",
        template_name="FEEDING_REMINDER",
        params={"pet_name": "تدی", "routine_detail": "وعده عصر"},
        skip_rate_limit=True,
    )
    assert success is True
    assert len(dispatcher.dispatch_log) == 1
    assert dispatcher.dispatch_log[0]["attempts"] == 3
    assert dispatcher.dispatch_log[0]["success"] is True


@pytest.mark.asyncio
async def test_dispatcher_rate_limiting():
    stub = StubSmsAdapter()
    dispatcher = SmsDispatcher(stub)

    # First send succeeds
    res1 = await dispatcher.dispatch(
        phone_number="09125556677",
        template_name="FEEDING_REMINDER",
        params={"pet_name": "ببری", "routine_detail": "آب تازه"},
    )
    assert res1 is True

    # Immediate second send to same phone without skip_rate_limit gets rate limited
    res2 = await dispatcher.dispatch(
        phone_number="09125556677",
        template_name="FEEDING_REMINDER",
        params={"pet_name": "ببری", "routine_detail": "ناهار"},
    )
    assert res2 is False
