import os
import secrets
from dotenv import load_dotenv

load_dotenv()

# In-memory stores (replaces Redis for local Windows development)
otp_store = {}
attempts_store = {}
status_store = {}

def generate_otp() -> str:
    """Generate a 4-digit zero-padded OTP using cryptographically secure RNG."""
    val = secrets.randbelow(10000)
    return f"{val:04d}"

def store_otp(job_id: str, otp: str, ttl: int = 300):
    """Store the OTP in memory."""
    otp_store[job_id] = otp
    attempts_store[job_id] = 0
    status_store[job_id] = "pending"

def verify_otp_only(entered_otp: str) -> dict:
    """Validate OTP by finding the job that matches the OTP string."""
    for job_id, stored_otp in list(otp_store.items()):
        if stored_otp == entered_otp:
            # Check attempts
            attempts = attempts_store.get(job_id, 0)
            if attempts >= 5:
                return {"success": False, "message": "Too many attempts. Job locked.", "job_id": job_id}
            
            # Match - delete OTP
            del otp_store[job_id]
            del attempts_store[job_id]
            status_store[job_id] = "verified"
            return {"success": True, "job_id": job_id}
            
    return {"success": False, "message": "Invalid OTP"}

def verify_otp(job_id: str, entered_otp: str) -> dict:
    """Validate OTP from memory with rate limiting (max 5 attempts)."""
    
    attempts = attempts_store.get(job_id, 0)
    if attempts >= 5:
        return {"success": False, "message": "Too many attempts. Job locked."}

    stored_otp = otp_store.get(job_id)
    if not stored_otp:
        return {"success": False, "message": "OTP expired or invalid job"}

    if stored_otp == entered_otp:
        # Match - delete OTP to enforce single-use
        del otp_store[job_id]
        del attempts_store[job_id]
        status_store[job_id] = "verified"
        return {"success": True}
    else:
        # Increment attempt counter
        attempts_store[job_id] += 1
        return {"success": False, "message": "Invalid OTP"}

def set_job_status(job_id: str, status: str):
    status_store[job_id] = status

def get_job_status(job_id: str) -> str:
    return status_store.get(job_id, "unknown")
