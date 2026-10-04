import pytest
from httpx import AsyncClient
from tests.test_pets_crud_security import get_user_token


@pytest.mark.asyncio
async def test_care_tasks_and_progress_summary(client: AsyncClient):
    token = await get_user_token(client, "09121112233")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create a Dog
    pet_res = await client.post(
        "/api/v1/pets",
        json={"name": "تدی", "species": "DOG", "breed": "پودل"},
        headers=headers,
    )
    assert pet_res.status_code == 201
    pet_id = pet_res.json()["id"]

    # 2. Fetch care tasks (auto-seeds defaults)
    tasks_res = await client.get(f"/api/v1/care/tasks?pet_id={pet_id}", headers=headers)
    assert tasks_res.status_code == 200
    tasks = tasks_res.json()
    assert len(tasks) == 3
    walk_task = next(t for t in tasks if t["category"] == "WALK")
    assert walk_task["is_completed"] is False

    # 3. Toggle walk task
    toggle_res = await client.post(f"/api/v1/care/tasks/{walk_task['id']}/toggle", headers=headers)
    assert toggle_res.status_code == 200
    assert toggle_res.json()["is_completed"] is True

    # 4. Check summary
    summary_res = await client.get(f"/api/v1/care/summary?pet_id={pet_id}", headers=headers)
    assert summary_res.status_code == 200
    summary = summary_res.json()
    assert summary["total_tasks"] == 3
    assert summary["completed_tasks"] == 1
    assert summary["progress_percentage"] == 33
    assert summary["walk_completed_minutes"] == 40

    # 5. Complete remaining tasks
    for t in tasks:
        if t["id"] != walk_task["id"]:
            await client.post(f"/api/v1/care/tasks/{t['id']}/toggle", headers=headers)

    final_summary_res = await client.get(f"/api/v1/care/summary?pet_id={pet_id}", headers=headers)
    assert final_summary_res.json()["progress_percentage"] == 100
    assert final_summary_res.json()["completed_tasks"] == 3
