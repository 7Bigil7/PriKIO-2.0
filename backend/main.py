import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routes.upload import router as upload_router
from routes.verify import router as verify_router
from routes.status import router as status_router
from services.websocket import manager
import logging

logging.basicConfig(level=logging.INFO)

load_dotenv()

app = FastAPI(title="PrintFlow Backend")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, restrict to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)
app.include_router(verify_router)
app.include_router(status_router)

PI_SECRET = os.getenv("PI_SECRET", "super_secret_pi_key_12345")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    # Authenticate Pi
    # Headers can be passed, or we can wait for a first authentication message.
    # We will look for X-Pi-Secret in headers
    client_secret = websocket.headers.get("x-pi-secret")
    
    if client_secret != PI_SECRET:
        await websocket.close(code=1008) # Policy Violation
        return
        
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle messages from Pi if needed (e.g., job status updates)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
