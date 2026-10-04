from abc import ABC, abstractmethod
from typing import Tuple, Optional
import httpx
from src.core.config import settings


class PaymentGateway(ABC):
    @abstractmethod
    async def request_payment(self, amount_tomans: int, description: str, callback_url: str, mobile: Optional[str] = None) -> Tuple[bool, str, str]:
        """
        Returns: (success: bool, authority_or_error: str, payment_url: str)
        """
        pass

    @abstractmethod
    async def verify_payment(self, authority: str, amount_tomans: int) -> Tuple[bool, str]:
        """
        Returns: (success: bool, ref_id_or_error: str)
        """
        pass


class MockPaymentGateway(PaymentGateway):
    """
    Mock adapter for CI, local tests and automated verification without external network dependency.
    """
    async def request_payment(self, amount_tomans: int, description: str, callback_url: str, mobile: Optional[str] = None) -> Tuple[bool, str, str]:
        import uuid
        mock_authority = f"A0000000000000000000000000{uuid.uuid4().hex[:8]}"
        payment_url = f"/checkout/sandbox?Authority={mock_authority}&amount={amount_tomans}"
        return True, mock_authority, payment_url

    async def verify_payment(self, authority: str, amount_tomans: int) -> Tuple[bool, str]:
        if authority.startswith("FAIL_"):
            return False, "تراکنش توسط کاربر لغو شد یا ناموفق بود."
        mock_ref_id = f"REF_{authority[-8:]}"
        return True, mock_ref_id


class ZarinPalGateway(PaymentGateway):
    def __init__(self, merchant_id: str = "00000000-0000-0000-0000-000000000000", sandbox: bool = True):
        self.merchant_id = merchant_id
        self.sandbox = sandbox
        self.base_url = "https://sandbox.zarinpal.com/pg/v4/payment" if sandbox else "https://api.zarinpal.com/pg/v4/payment"

    async def request_payment(self, amount_tomans: int, description: str, callback_url: str, mobile: Optional[str] = None) -> Tuple[bool, str, str]:
        # Zarinpal v4 accepts Rials (amount * 10)
        amount_rials = amount_tomans * 10
        payload = {
            "merchant_id": self.merchant_id,
            "amount": amount_rials,
            "description": description,
            "callback_url": callback_url,
            "metadata": {"mobile": mobile} if mobile else {},
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(f"{self.base_url}/request.json", json=payload)
                data = resp.json()
                if data.get("data") and data["data"].get("code") == 100:
                    authority = data["data"]["authority"]
                    start_pay = f"https://{'sandbox.' if self.sandbox else ''}zarinpal.com/pg/StartPay/{authority}"
                    return True, authority, start_pay
                errors = data.get("errors", {})
                return False, str(errors), ""
        except Exception as e:
            return False, str(e), ""

    async def verify_payment(self, authority: str, amount_tomans: int) -> Tuple[bool, str]:
        amount_rials = amount_tomans * 10
        payload = {
            "merchant_id": self.merchant_id,
            "amount": amount_rials,
            "authority": authority,
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(f"{self.base_url}/verify.json", json=payload)
                data = resp.json()
                if data.get("data") and data["data"].get("code") in [100, 101]:
                    ref_id = str(data["data"]["ref_id"])
                    return True, ref_id
                errors = data.get("errors", {})
                return False, str(errors)
        except Exception as e:
            return False, str(e)


def get_payment_gateway() -> PaymentGateway:
    import os
    from src.core.config import settings
    is_prod = getattr(settings, "APP_ENV", "").lower() in ("production", "prod") or os.getenv("APP_ENV", "").lower() in ("production", "prod")
    
    if is_prod:
        merchant_id = getattr(settings, "ZARINPAL_MERCHANT_ID", None) or os.getenv("ZARINPAL_MERCHANT_ID")
        if not merchant_id or len(merchant_id.strip()) < 10:
            raise ValueError("CRITICAL: ZARINPAL_MERCHANT_ID is required and must be configured in production.")
        return ZarinPalGateway(merchant_id=merchant_id, sandbox=False)

    if getattr(settings, "PAYMENT_SANDBOX", True):
        return MockPaymentGateway()

    merchant = getattr(settings, "ZARINPAL_MERCHANT_ID", None) or os.getenv("ZARINPAL_MERCHANT_ID") or "00000000-0000-0000-0000-000000000000"
    return ZarinPalGateway(merchant_id=merchant, sandbox=True)


payment_gateway = MockPaymentGateway()
