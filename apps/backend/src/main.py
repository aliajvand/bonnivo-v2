from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.core.config import settings
from src.core.database import engine, Base
import src.models  # Register all ORM models
from src.api.v1.health import router as health_router
from src.api.v1.auth import router as auth_router
from src.api.v1.pets import router as pets_router
from src.api.v1.care import router as care_router
from src.api.v1.passport import router as passport_router
from src.api.v1.catalog import router as catalog_router
from src.api.v1.checkout import router as checkout_router
from src.api.v1.payment import router as payment_router
from src.api.v1.replenishment import router as replenishment_router
from src.api.v1.sellers import router as sellers_router
from src.api.v1.admin import router as admin_router
from src.api.v1.admin_auth import router as admin_auth_router
from src.api.v1.analytics import router as analytics_router
from src.api.v1.vets import router as vets_router
from src.api.v1.medical_records import router as medical_records_router
from src.api.v1.services import router as services_router
from src.api.v1.subscriptions import router as subscriptions_router
from src.api.v1.ai_copilot import router as ai_copilot_router
from src.api.v1.logistics import router as logistics_router
from src.api.v1.settlements import router as settlements_router
from src.api.v1.wms_webhooks import router as wms_router
from src.api.v1.nfc import router as nfc_router
from src.api.v1.amber_alert import router as amber_alert_router
from src.api.v1.adoption import router as adoption_router
from src.api.v1.loyalty import router as loyalty_router
from src.api.v1.discovery import router as discovery_router
from src.api.v1.coupons import router as coupons_router
from src.api.v1.wallet import router as wallet_router
from src.api.v1.events import router as events_router
from src.api.v1.trainers import router as trainers_router
from src.api.v1.boarding import router as boarding_router
from src.api.v1.feature_flags import router as feature_flags_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    # Shutdown
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Bonyo & Bonnivo Pet Care and Smart Marketplace API",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url=f"{settings.API_V1_PREFIX}/docs",
    redoc_url=f"{settings.API_V1_PREFIX}/redoc",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none';"
    if settings.APP_ENV == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# Mount Routers
app.include_router(health_router, prefix="")
app.include_router(health_router, prefix=settings.API_V1_PREFIX)
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(pets_router, prefix=settings.API_V1_PREFIX)
app.include_router(care_router, prefix=settings.API_V1_PREFIX)
app.include_router(passport_router, prefix=settings.API_V1_PREFIX)
app.include_router(catalog_router, prefix=settings.API_V1_PREFIX)
app.include_router(checkout_router, prefix=settings.API_V1_PREFIX)
app.include_router(payment_router, prefix=settings.API_V1_PREFIX)
app.include_router(replenishment_router, prefix=settings.API_V1_PREFIX)
app.include_router(sellers_router, prefix=settings.API_V1_PREFIX)
app.include_router(admin_router, prefix=settings.API_V1_PREFIX)
app.include_router(admin_auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(analytics_router, prefix=settings.API_V1_PREFIX)
app.include_router(vets_router, prefix=settings.API_V1_PREFIX)
app.include_router(medical_records_router, prefix=settings.API_V1_PREFIX)
app.include_router(services_router, prefix=settings.API_V1_PREFIX)
app.include_router(subscriptions_router, prefix=settings.API_V1_PREFIX)
app.include_router(ai_copilot_router, prefix=settings.API_V1_PREFIX)
app.include_router(logistics_router, prefix=settings.API_V1_PREFIX)
app.include_router(settlements_router, prefix=settings.API_V1_PREFIX)
app.include_router(wms_router, prefix=settings.API_V1_PREFIX)
app.include_router(nfc_router, prefix=settings.API_V1_PREFIX)
app.include_router(amber_alert_router, prefix=settings.API_V1_PREFIX)
app.include_router(adoption_router, prefix=settings.API_V1_PREFIX)
app.include_router(loyalty_router, prefix=settings.API_V1_PREFIX)
app.include_router(discovery_router, prefix=settings.API_V1_PREFIX)
app.include_router(coupons_router, prefix=settings.API_V1_PREFIX)
app.include_router(wallet_router, prefix=settings.API_V1_PREFIX)
app.include_router(events_router, prefix=settings.API_V1_PREFIX)
app.include_router(trainers_router, prefix=settings.API_V1_PREFIX)
app.include_router(boarding_router, prefix=settings.API_V1_PREFIX)
app.include_router(feature_flags_router, prefix=settings.API_V1_PREFIX)


def run_dev():
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    run_dev()
