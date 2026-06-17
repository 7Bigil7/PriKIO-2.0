import os
import time
import json
import logging
import websocket
import requests
from dotenv import load_dotenv
from printer import print_job

load_dotenv()

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
logger = logging.getLogger(__name__)

BACKEND_WS_URL = os.getenv("BACKEND_WS_URL")
BACKEND_API_URL = os.getenv("BACKEND_API_URL")
PI_SECRET = os.getenv("PI_SECRET")

job_cache = {}

def on_message(ws, message):
    data = json.loads(message)
    event = data.get("event")
    payload = data.get("data", {})
    
    if event == "job:new":
        job_id = payload.get("job_id")
        logger.info(f"New print job received: {job_id}")
        job_cache[job_id] = payload
        
    elif event == "job:verified":
        job_id = payload.get("job_id")
        logger.info(f"Job verified, starting print for: {job_id}")
        job_info = job_cache.get(job_id)
        if job_info:
            print_job(job_id, job_info.get("filename"), BACKEND_API_URL)
        else:
            logger.error("Job details not found in local cache!")

def on_error(ws, error):
    logger.error(f"WebSocket error: {error}")

def on_close(ws, close_status_code, close_msg):
    logger.warning("WebSocket connection closed. Reconnecting in 5 seconds...")
    time.sleep(5)
    connect_websocket()

def on_open(ws):
    logger.info("Connected to Backend WebSocket successfully!")

def connect_websocket():
    headers = {"x-pi-secret": PI_SECRET} if PI_SECRET else {}
    ws = websocket.WebSocketApp(
        BACKEND_WS_URL,
        header=headers,
        on_open=on_open,
        on_message=on_message,
        on_error=on_error,
        on_close=on_close
    )
    ws.run_forever()

if __name__ == "__main__":
    logger.info("Starting PrintFlow Pi Controller...")
    connect_websocket()
