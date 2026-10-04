import logging
from typing import Dict, Any, List, Union
from pydantic import BaseModel
from fastapi import APIRouter, status

logger = logging.getLogger("bonnivo.analytics")

router = APIRouter(prefix="/analytics", tags=["Telemetry & Analytics"])


class EventPayload(BaseModel):
    event: str
    payload: Dict[str, Any]
    timestamp: str
    sessionId: str


@router.post("/events", status_code=status.HTTP_200_OK)
async def ingest_analytics_events(data: Union[EventPayload, List[EventPayload]]):
    events = data if isinstance(data, list) else [data]
    for ev in events:
        logger.info(f"[TELEMETRY] event={ev.event} session={ev.sessionId} payload={ev.payload}")
    return {"status": "recorded", "count": len(events)}
