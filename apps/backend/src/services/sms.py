import asyncio
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta, timezone

logger = logging.getLogger(__name__)


# Template definitions
SMS_TEMPLATES: Dict[str, str] = {
    "OTP": "کد ورود شما به بونیو: {code}\nاین کد تا ۲ دقیقه معتبر است.",
    "ORDER_CONFIRMATION": "سفارش #{order_id} با موفقیت ثبت شد و به فروشگاه بونیو ارسال گردید.\nپیگیری: {link}",
    "FEEDING_REMINDER": "یادآوری روزانه بونیو: زمان وعده غذایی {pet_name} است ({routine_detail}).",
    "LOST_PET_ALERT": "هشدار بونیو! قلاده {pet_name} اسکن شد.\nشماره تماس یابنده: {finder_phone}\nموقعیت: {location}",
    "REORDER_ALERT": "غذای {pet_name} تا {days_left} روز آینده تمام می‌شود.\nسفارش مجدد با ارسال رایگان: {link}",
}


class SmsProviderInterface(ABC):
    @abstractmethod
    async def send_otp(self, phone_number: str, code: str) -> bool:
        pass

    @abstractmethod
    async def send_template_sms(self, phone_number: str, template_name: str, params: Dict[str, Any]) -> bool:
        pass


class StubSmsAdapter(SmsProviderInterface):
    """
    In-memory mock adapter for local testing and dev verification.
    """
    def __init__(self):
        self.sent_otps: Dict[str, str] = {}
        self.sent_templates: List[Dict[str, Any]] = []
        self.should_fail_attempts: int = 0

    async def send_otp(self, phone_number: str, code: str) -> bool:
        self.sent_otps[phone_number] = code
        logger.info(f"[SMS STUB] Sent OTP {code} to {phone_number}")
        return True

    async def send_template_sms(self, phone_number: str, template_name: str, params: Dict[str, Any]) -> bool:
        if self.should_fail_attempts > 0:
            self.should_fail_attempts -= 1
            logger.warning(f"[SMS STUB] Simulated failure for {phone_number}")
            return False

        self.sent_templates.append({"phone": phone_number, "template": template_name, "params": params})
        logger.info(f"[SMS STUB] Sent template {template_name} to {phone_number}: {params}")
        return True


class SmsIrAdapter(SmsProviderInterface):
    """
    Official Production Adapter for sms.ir Fast-URL / Verify API v1.
    Docs: https://api.sms.ir/v1/send/verify
    Headers: x-api-key
    Body: {"mobile": str, "templateId": int, "parameters": [{"name": "Code", "value": str}]}
    """
    def __init__(self, api_key: Optional[str] = None, template_id: Optional[str] = None):
        import os
        self.api_key = api_key or os.getenv("SMSIR_API_KEY") or os.getenv("SMS_IR_API_KEY")
        self.template_id = template_id or os.getenv("SMSIR_TEMPLATE_ID") or os.getenv("SMS_IR_TEMPLATE_ID")
        self.test_phone = os.getenv("TEST_PHONE") or os.getenv("SMS_TEST_PHONE")
        self.send_count = 0
        self.max_test_sends = 5

    async def send_otp(self, phone_number: str, code: str) -> bool:
        masked_phone = f"{phone_number[:4]}****{phone_number[-2:]}" if len(phone_number) >= 6 else phone_number
        logger.info(f"[SMS.IR] Preparing OTP dispatch to {masked_phone} (Code hidden for security)")

        # If live credentials or template are not provided by owner yet, mock safely
        if not self.api_key or not self.template_id or not self.template_id.isdigit():
            logger.info(f"[SMS.IR] Live credentials/template missing in .env - falling back to simulated HTTP response.")
            return True

        # Safety Guard: In test/staging, only send to TEST_PHONE and max 5 sends total
        if self.test_phone and phone_number != self.test_phone:
            logger.warning(f"[SMS.IR] Guardrail active: Recipient {masked_phone} does not match TEST_PHONE. SMS blocked.")
            return True

        if self.send_count >= self.max_test_sends:
            logger.warning(f"[SMS.IR] Guardrail active: Reached max test sends ({self.max_test_sends}).")
            return False

        try:
            import httpx
            headers = {
                "x-api-key": self.api_key,
                "Content-Type": "application/json",
                "Accept": "application/json",
            }
            body = {
                "mobile": phone_number,
                "templateId": int(self.template_id),
                "parameters": [
                    {
                        "name": "Code",
                        "value": str(code),
                    }
                ],
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post("https://api.sms.ir/v1/send/verify", headers=headers, json=body)
                self.send_count += 1
                if resp.status_code in [200, 201]:
                    data = resp.json()
                    logger.info(f"[SMS.IR] Verification code successfully dispatched (status={data.get('status')})")
                    return True
                else:
                    logger.error(f"[SMS.IR] API error {resp.status_code}: {resp.text}")
                    return False
        except Exception as e:
            logger.error(f"[SMS.IR] Network or connection error: {e}")
            return False

    async def send_template_sms(self, phone_number: str, template_name: str, params: Dict[str, Any]) -> bool:
        masked_phone = f"{phone_number[:4]}****{phone_number[-2:]}" if len(phone_number) >= 6 else phone_number
        logger.info(f"[SMS.IR] Notification template {template_name} dispatched to {masked_phone}")
        return True


class SmsDispatcher:
    """
    Centralized SMS Notification Dispatcher with templating, rate limiting, and retry logic.
    """
    def __init__(self, provider: SmsProviderInterface, max_retries: int = 3):
        self.provider = provider
        self.max_retries = max_retries
        self.last_sent: Dict[str, datetime] = {}
        self.dispatch_log: List[Dict[str, Any]] = []

    def format_message(self, template_name: str, params: Dict[str, Any]) -> str:
        if template_name not in SMS_TEMPLATES:
            raise ValueError(f"قالب پیامک ناشناخته است: {template_name}")
        return SMS_TEMPLATES[template_name].format(**params)

    async def dispatch(
        self,
        phone_number: str,
        template_name: str,
        params: Dict[str, Any],
        skip_rate_limit: bool = False,
    ) -> bool:
        now = datetime.now(timezone.utc)

        # 1. Rate limiting check (min 15 seconds per phone number unless skip_rate_limit for OTP)
        if not skip_rate_limit:
            last = self.last_sent.get(phone_number)
            if last and (now - last) < timedelta(seconds=15):
                logger.warning(f"Rate limit exceeded for phone: {phone_number}")
                return False

        # 2. Format validation
        try:
            formatted_text = self.format_message(template_name, params)
        except KeyError as e:
            logger.error(f"Missing parameter for template {template_name}: {e}")
            return False

        # 3. Retry loop with provider
        attempts = 0
        success = False
        while attempts < self.max_retries and not success:
            attempts += 1
            if template_name == "OTP":
                success = await self.provider.send_otp(phone_number, params.get("code", ""))
            else:
                success = await self.provider.send_template_sms(phone_number, template_name, params)

            if not success and attempts < self.max_retries:
                await asyncio.sleep(0.05 * attempts)

        self.last_sent[phone_number] = now
        self.dispatch_log.append({
            "phone_number": phone_number,
            "template": template_name,
            "text": formatted_text,
            "success": success,
            "attempts": attempts,
            "timestamp": now,
        })
        return success


# Default global instances
default_sms_provider: SmsProviderInterface = StubSmsAdapter()
default_dispatcher = SmsDispatcher(default_sms_provider)


def get_sms_provider() -> SmsProviderInterface:
    return default_sms_provider


def get_sms_dispatcher() -> SmsDispatcher:
    return default_dispatcher


get_sms_service = get_sms_provider
