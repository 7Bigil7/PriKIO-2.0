import uuid
from fastapi import APIRouter, UploadFile, File
from services.storage import save_upload_file
from services.otp import generate_otp, store_otp, set_job_status
from services.websocket import manager

router = APIRouter()

@router.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    job_id = str(uuid.uuid4())
    
    # Save file and validate (MIME & size)
    filepath = save_upload_file(file, job_id)
    
    # Generate OTP
    otp = generate_otp()
    
    # Store OTP in Redis (TTL 300s)
    store_otp(job_id, otp, ttl=300)
    set_job_status(job_id, "pending")
    
    # Emit WebSocket event
    await manager.emit_job_new(job_id=job_id, otp=otp, filename=file.filename, filepath=filepath)
    
    return {
        "job_id": job_id,
        "otp": otp,
        "expires_in": 300
    }
