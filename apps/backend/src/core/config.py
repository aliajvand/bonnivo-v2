from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "Bonyo API"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    DEMO_MODE: bool = False

    # Database
    DATABASE_URL: str = Field(
        default="sqlite+aiosqlite:///./bonnivo.db",
        description="Async database connection string"
    )

    # JWT Security
    SECRET_KEY: str = Field(
        default="bonnivo-super-secret-production-grade-key-2026",
        description="JWT HMAC Secret"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # SMS Gateway Stub / Config
    SMS_API_KEY: str = "stub_sms_key_ir"
    SMS_LINE_NUMBER: str = "3000777"
    SMS_SIMULATION_MODE: bool = True

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://bonyo.ir",
        "https://bonnivo.com",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow",
    )


settings = Settings()
