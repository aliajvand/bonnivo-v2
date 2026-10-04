"""
Deterministic QA and Development Seed Users for Autonomous Role Simulation.
Provides non-production credentials and test fixtures for Customer, Admin,
Veterinarian, Event Organizer, and Trainer personas.
"""

from typing import List, Dict, Any
from src.models.user import User, UserRole

QA_PERSONAS: List[Dict[str, Any]] = [
    {
        "id": "qa-usr-customer",
        "phone_number": "09120000001",
        "full_name": "سارا محمدی (مشتری تستی)",
        "role": UserRole.PET_PARENT,
        "is_active": True,
    },
    {
        "id": "qa-usr-admin",
        "phone_number": "09120000002",
        "full_name": "مدیر ارشد سامانه بونیو",
        "role": UserRole.ADMIN,
        "is_active": True,
    },
    {
        "id": "qa-usr-vet",
        "phone_number": "09120000003",
        "full_name": "دکتر آریا رادمنش (دامپزشک)",
        "role": UserRole.VETERINARIAN,
        "is_active": True,
    },
    {
        "id": "qa-usr-organizer",
        "phone_number": "09120000004",
        "full_name": "مهندس بهنام کبیری (برگزارکننده)",
        "role": UserRole.EVENT_ORGANIZER,
        "is_active": True,
    },
    {
        "id": "qa-usr-trainer",
        "phone_number": "09120000005",
        "full_name": "سپهر رفیعی (مربی و رفتارشناس)",
        "role": UserRole.TRAINER,
        "is_active": True,
    },
]


def get_qa_user(role: UserRole) -> User:
    """Retrieve a detached User model representing a deterministic QA persona."""
    for p in QA_PERSONAS:
        if p["role"] == role:
            return User(
                id=p["id"],
                phone_number=p["phone_number"],
                full_name=p["full_name"],
                role=p["role"],
                is_active=p["is_active"],
            )
    raise ValueError(f"No QA persona configured for role: {role}")
