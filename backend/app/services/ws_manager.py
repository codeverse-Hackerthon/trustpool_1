"""WebSocket connection manager — in-memory, single instance.

Designed so it can be swapped for a Redis-backed manager for horizontal scaling
without changing any of the callers.
"""
from __future__ import annotations

import logging
import uuid
from collections import defaultdict

from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Tracks authenticated WebSocket connections keyed by user UUID.

    Multiple tabs / devices per user are supported.
    """

    def __init__(self) -> None:
        self._connections: dict[uuid.UUID, list[WebSocket]] = defaultdict(list)

    async def connect(self, websocket: WebSocket, user_id: uuid.UUID) -> None:
        await websocket.accept()
        self._connections[user_id].append(websocket)
        logger.info("WS connected: user=%s total_for_user=%d", user_id, len(self._connections[user_id]))

    def disconnect(self, websocket: WebSocket, user_id: uuid.UUID) -> None:
        sockets = self._connections.get(user_id, [])
        if websocket in sockets:
            sockets.remove(websocket)
        if not sockets:
            self._connections.pop(user_id, None)
        logger.info("WS disconnected: user=%s", user_id)

    async def send_to_user(self, user_id: uuid.UUID, payload: dict) -> None:
        """Send a JSON payload to all active connections of a user."""
        dead: list[WebSocket] = []
        for ws in list(self._connections.get(user_id, [])):
            try:
                await ws.send_json(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws, user_id)

    def connected_user_ids(self) -> list[uuid.UUID]:
        return list(self._connections.keys())


# Singleton — imported by routes
ws_manager = ConnectionManager()
