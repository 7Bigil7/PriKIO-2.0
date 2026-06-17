import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

router = APIRouter()

UPLOAD_DIR = "uploads"

@router.get("/api/download/{job_id}")
async def download_file(job_id: str):
    # In a real system, we'd look up the database for the exact filename/extension based on job_id.
    # For now, we look in the uploads directory for any file that starts with the job_id
    if not os.path.exists(UPLOAD_DIR):
        raise HTTPException(status_code=404, detail="Uploads directory not found")
        
    for filename in os.listdir(UPLOAD_DIR):
        if filename.startswith(job_id):
            file_path = os.path.join(UPLOAD_DIR, filename)
            return FileResponse(path=file_path, filename=filename, media_type='application/octet-stream')
            
    raise HTTPException(status_code=404, detail="File not found")
