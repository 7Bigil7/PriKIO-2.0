from fastapi import APIRouter
from typing import Optional
from pydantic import BaseModel
from services.otp import verify_otp, verify_otp_only
from services.websocket import manager

router = APIRouter()

class VerifyRequest(BaseModel):
    job_id: Optional[str] = None
    otp_entered: str

@router.post("/api/verify-otp")
async def verify_otp_endpoint(req: VerifyRequest):
    if req.job_id:
        result = verify_otp(req.job_id, req.otp_entered)
        job_to_emit = req.job_id
    else:
        result = verify_otp_only(req.otp_entered)
        job_to_emit = result.get("job_id")
        
    if result["success"] and job_to_emit:
        # Emit job:verified to Pi
        await manager.emit_job_verified(job_to_emit)
        return {"success": True}
    else:
        return {"success": False, "message": result.get("message", "Invalid OTP")}
