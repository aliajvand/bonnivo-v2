import json
from typing import List, Optional
from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Bonyo API"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Environment & Modes
    APP_ENV: str = "development"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    DEMO_MODE: bool = False

    # Database
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:postgres@127.0.0.1:5433/bonnivo_dev",
        description="Async database connection string"
    )
    DATABASE_TEST_URL: Optional[str] = "sqlite+aiosqlite:///:memory:"

    # JWT Security
    JWT_SECRET: str = Field(
        default="REPLACE_ME_WITH_A_LONG_RANDOM_SECRET_KEY",
        description="JWT HMAC Secret Key"
    )
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: str = "lax"
    RATE_LIMIT_ENABLED: bool = True

    # SMS Gateway Config (Matching .env exactly)
    SMS_IR_API_KEY: Optional[str] = None
    SMS_IR_LINE_NUMBER: Optional[str] = None
    SMS_IR_TEMPLATE_ID: Optional[str] = None
    SMS_IR_OTP_PARAM_NAME: str = "Code"
    SMS_TEST_PHONE: Optional[str] = None
    SMS_TEST_MAX_SENDS: int = 3

    # OTP Controls
    OTP_LENGTH: int = 5
    OTP_TTL_SECONDS: int = 120
    OTP_MAX_ATTEMPTS: int = 5
    OTP_RESEND_COOLDOWN_SECONDS: int = 60
    OTP_MAX_PER_HOUR: int = 5

    # Groq AI
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "openai/gpt-oss-20b"
    GROQ_TIMEOUT_SECONDS: int = 20
    GROQ_MAX_RETRIES: int = 2

    # Payment Gateway
    PAYMENT_PROVIDER: str = "zarinpal"
    ZARINPAL_MERCHANT_ID: Optional[str] = None
    PAYMENT_SANDBOX: bool = True
    PAYMENT_CALLBACK_URL: str = "http://localhost:3000/checkout/callback"

    # Admin Security
    ADMIN_LOGIN_MAX_ATTEMPTS: int = 5
    ADMIN_LOGIN_LOCK_MINUTES: int = 15
    ADMIN_SESSION_HOURS: int = 8
    ADMIN_REMEMBER_DAYS: int = 14
    ADMIN_RESET_TOKEN_TTL_MINUTES: int = 30
    ENABLE_ADMIN_2FA: bool = False

    # Frontend URLs & CORS
    NEXT_PUBLIC_APP_URL: str = "http://localhost:3000"
    NEXT_PUBLIC_API_URL: str = "http://localhost:8000/api/v1"
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://bonyo.ir",
        "https://bonnivo.com",
    ]

    # QA Accounts & Verification
    ALLOW_QA_ACCOUNTS: bool = True
    QA_CUSTOMER_EMAIL: str = "customer@test.bonyo.local"
    QA_CUSTOMER_PHONE: str = "09120000001"
    QA_ADMIN_EMAIL: str = "admin@test.bonyo.local"
    QA_ADMIN_PHONE: str = "09120000002"
    QA_VET_EMAIL: str = "vet@test.bonyo.local"
    QA_VET_PHONE: str = "09120000003"
    QA_ORGANIZER_EMAIL: str = "organizer@test.bonyo.local"
    QA_ORGANIZER_PHONE: str = "09120000004"
    QA_TRAINER_EMAIL: str = "trainer@test.bonyo.local"
    QA_TRAINER_PHONE: str = "09120000005"
    QA_DEFAULT_OTP: str = "12345"

    # Sentry
    SENTRY_DSN: Optional[str] = None

    # Backward compatibility properties
    @property
    def SECRET_KEY(self) -> str:
        return self.JWT_SECRET

    @property
    def ALGORITHM(self) -> str:
        return self.JWT_ALGORITHM

    @property
    def CORS_ORIGINS(self) -> List[str]:
        return self.BACKEND_CORS_ORIGINS

    @property
    def SMS_API_KEY(self) -> str:
        return self.SMS_IR_API_KEY or ""

    @property
    def SMS_LINE_NUMBER(self) -> str:
        return self.SMS_IR_LINE_NUMBER or ""

    @property
    def SMS_SIMULATION_MODE(self) -> bool:
        return not bool(self.SMS_IR_API_KEY) or self.APP_ENV != "production"

    @model_validator(mode="after")
    def validate_production_fail_fast(self) -> "Settings":
        # Keep ENVIRONMENT in sync with APP_ENV
        if self.APP_ENV:
            self.ENVIRONMENT = self.APP_ENV
            
        is_prod = self.APP_ENV.lower() in ("production", "prod")
        if is_prod:
            violations = []
            if self.DEBUG:
                violations.append("DEBUG is True in production")
            if not self.JWT_SECRET or len(self.JWT_SECRET) < 32 or "REPLACE_ME" in self.JWT_SECRET or "bonnivo-super-secret" in self.JWT_SECRET:
                violations.append("JWT_SECRET is insecure/default/short in production")
            if self.ALLOW_QA_ACCOUNTS:
                violations.append("ALLOW_QA_ACCOUNTS is enabled in production")
            if self.DEMO_MODE:
                violations.append("DEMO_MODE is enabled in production")
            if not self.COOKIE_SECURE:
                violations.append("COOKIE_SECURE is False in production")
            if violations:
                raise ValueError(
                    f"CRITICAL PRODUCTION SECURITY VIOLATIONS DETECTED: {', '.join(violations)}"
                )
        return self

    model_config = SettingsConfigDict(
        env_file=(".env", "../../.env", "../.env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow",
    )


settings = Settings()
