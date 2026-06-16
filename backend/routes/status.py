from fastapi import APIRouter
from services.otp import get_job_status

router = APIRouter()

@router.get("/api/job/{job_id}/status")
async def get_status(job_id: str):
    status = get_job_status(job_id)
    return {"job_id": job_id, "status": status}
