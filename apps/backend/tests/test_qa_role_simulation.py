import pytest
from src.models.user import User, UserRole
from src.fixtures.qa_seeds import QA_PERSONAS, get_qa_user


@pytest.mark.asyncio
async def test_qa_personas_exist_and_cover_all_roles():
    """Verify that deterministic QA personas exist for all 5 major simulation roles."""
    expected_roles = {
        UserRole.PET_PARENT,
        UserRole.ADMIN,
        UserRole.VETERINARIAN,
        UserRole.EVENT_ORGANIZER,
        UserRole.TRAINER,
    }

    covered_roles = {p["role"] for p in QA_PERSONAS}
    assert expected_roles.issubset(covered_roles), "All simulation roles must be covered by QA personas"

    for persona in QA_PERSONAS:
        assert persona["phone_number"].startswith("0912000000"), "QA phone numbers must use the reserved test range"
        user = get_qa_user(persona["role"])
        assert user.role == persona["role"]
        assert user.is_active is True
