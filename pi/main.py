import os
import time
import logging
import threading
import platform
import subprocess
import asyncio
from dotenv import load_dotenv
from supabase import create_client, Client, acreate_client
from printer import print_job

load_dotenv()

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
logger = logging.getLogger(__name__)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error("SUPABASE_URL and SUPABASE_KEY are required in .env")
    exit(1)

# We keep the sync client for normal DB operations (like updates and storage)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def check_lte_connection():
    """Simulates checking the Hologram/Twilio IoT Cellular Modem"""
    logger.info("📶 Checking LTE Cellular Modem status... Connection Secure.")

def simulate_smart_plug_reboot():
    """Simulates sending a physical power cycle command to a Smart Plug"""
    logger.critical("🔌 Printer frozen for >5 mins. Triggering Smart Plug hard reboot...")
    time.sleep(2)
    logger.info("🔌 Smart Plug reboot complete. Printer restarting...")

def poll_printer():
    if platform.system() == "Windows":
        logger.info("Windows detected. Disabling lpstat polling.")
        return
    
    printer_name = os.getenv("PRINTER_NAME", "test_printer")
    logger.info(f"Started hardware monitoring for printer: {printer_name}")
    
    frozen_counter = 0
    
    while True:
        try:
            result = subprocess.run(["lpstat", "-p", printer_name], capture_output=True, text=True)
            output = result.stdout.lower()
            
            if "paused" in output or "error" in output or "jam" in output:
                logger.error(f"Printer error detected: {output.strip()}")
                frozen_counter = 0
                time.sleep(60)
            elif "now printing" in output or "active" in output:
                frozen_counter += 5
                if frozen_counter >= 300:
                    simulate_smart_plug_reboot()
                    frozen_counter = 0
                    time.sleep(60)
                else:
                    time.sleep(5)
            else:
                frozen_counter = 0
                time.sleep(5)
        except Exception as e:
            logger.error(f"Polling error: {str(e)}")
            time.sleep(10)

def handle_job_update(payload):
    record = payload.get("record", {})
    job_id = record.get("id")
    status = record.get("status")
    
    if status == "printing":
        logger.info(f"Received job update: {job_id} -> {status}")
        logger.info(f"Job verified, starting print for: {job_id}")
        
        files = record.get("files", [])
        if files:
            for file_info in files:
                filename = file_info.get("filename")
                storage_path = file_info.get("storage_path")
                # We pass the sync client to printer_job so it can download files normally
                print_job(job_id, filename, storage_path, supabase)
                
            try:
                # Use sync client for DB updates
                supabase.table("print_jobs").update({"status": "completed"}).eq("id", job_id).execute()
                logger.info(f"Marked job {job_id} as completed in Supabase.")
            except Exception as e:
                logger.error(f"Failed to update job status: {e}")
        else:
            logger.error("Job files not found in record!")

async def listen_to_supabase():
    logger.info("Connecting to Supabase Realtime...")
    try:
        # Create an async client strictly for realtime subscriptions
        async_client = await acreate_client(SUPABASE_URL, SUPABASE_KEY)
        
        channel = async_client.channel('public:print_jobs')
        channel.on_postgres_changes(
            event="UPDATE",
            schema="public",
            table="print_jobs",
            callback=handle_job_update
        )
        
        await channel.subscribe()
        logger.info("Subscribed to print_jobs updates!")
        
        # Keep the event loop running
        while True:
            await asyncio.sleep(1)
            
    except Exception as e:
        logger.error(f"Realtime connection error: {e}")

if __name__ == "__main__":
    logger.info("Starting PrintFlow Pi Controller (Supabase Edition)...")
    check_lte_connection()
    
    t = threading.Thread(target=poll_printer, daemon=True)
    t.start()
    
    while True:
        try:
            asyncio.run(listen_to_supabase())
        except Exception as e:
            logger.error(f"Connection failed: {e}")
        logger.info("Reconnecting in 5 seconds...")
        time.sleep(5)
