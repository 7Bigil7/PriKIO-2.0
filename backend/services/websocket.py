from fastapi import WebSocket, WebSocketDisconnect
from typing import List
import json
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info("Pi connected to WebSocket")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info("Pi disconnected from WebSocket")

    async def emit_job_new(self, job_id: str, otp: str, filename: str, filepath: str):
        message = {
            "event": "job:new",
            "data": {
                "job_id": job_id,
                "otp": otp,
                "filename": filename,
                "filepath": filepath
            }
        }
        await self.broadcast(message)

    async def emit_job_verified(self, job_id: str):
        message = {
            "event": "job:verified",
            "data": {
                "job_id": job_id
            }
        }
        await self.broadcast(message)

    async def broadcast(self, message: dict):
        # We broadcast to all connected Pis (typically just one)
        msg_str = json.dumps(message)
        for connection in self.active_connections.copy():
            try:
                await connection.send_text(msg_str)
            except Exception as e:
                logger.error(f"Error sending message to websocket: {e}")
                if connection in self.active_connections:
                    self.active_connections.remove(connection)

manager = ConnectionManager()
