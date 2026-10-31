"""Phase 10 — WebSocket notifications endpoint.

Endpoint: /api/v1/ws/notifications

Authentication:
  - Client passes the JWT access token as a query parameter: ?token=<JWT>
  - The connection is rejected if the token is invalid or the user is inactive.

Design:
  - In-memory connection manager (ws_manager singleton).
  - Notifications are persisted to PostgreSQL first.
  - WebSocket pushes are delivery shortcuts, not replacements for DB persistence.
  - Each user can have multiple simultaneous connections (multiple tabs/devices).
  - Private notifications are sent only to the correct recipient.
"""
from __future__ import annotations

import logging
import uuid

from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import AccountStatus, User
from app.services.security import decode_token
from app.services.ws_manager import ws_manager

router = APIRouter(tags=["WebSocket"])
logger = logging.getLogger(__name__)


def _authenticate_ws(token: str, db: Session) -> User | None:
    """Validate JWT and return User, or None if invalid."""
    try:
        payload = decode_token(token, expected_type="access")
        user_id = uuid.UUID(str(payload["sub"]))
    except Exception:
        return None

    user = db.get(User, user_id)
    if user and user.account_status is AccountStatus.ACTIVE:
        return user
    return None


@router.websocket("/ws/notifications")
async def ws_notifications(
    websocket: WebSocket,
    token: str = Query(...),
    db: Session = Depends(get_db),
) -> None:
    user = _authenticate_ws(token, db)
    if user is None:
        await websocket.close(code=4001, reason="Unauthorized")
        return

    await ws_manager.connect(websocket, user.id)
    logger.info("WS authenticated: user=%s", user.id)

    try:
        # Keep the connection alive; listen for client pings or disconnect
        while True:
            data = await websocket.receive_text()
            # Only heartbeat pings are accepted from the client side.
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, user.id)
        logger.info("WS closed: user=%s", user.id)
    except Exception as exc:
        logger.error("WS error for user=%s: %s", user.id, exc)
        ws_manager.disconnect(websocket, user.id)
