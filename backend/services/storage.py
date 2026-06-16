import os
import shutil
import magic
from fastapi import UploadFile, HTTPException

STORAGE_DIR = os.getenv("STORAGE_DIR", "tmp/printflow")
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB
ALLOWED_MIMES = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document" # DOCX
]

def save_upload_file(upload_file: UploadFile, job_id: str) -> str:
    # 1. Read first chunk to check MIME
    chunk = upload_file.file.read(2048)
    upload_file.file.seek(0)
    
    mime_type = magic.from_buffer(chunk, mime=True)
    if mime_type not in ALLOWED_MIMES:
        raise HTTPException(status_code=400, detail=f"Invalid file type: {mime_type}. Allowed: PDF, PNG, JPG, DOCX.")
        
    # 2. Check Size by reading entirely or chunking (will enforce memory/limit)
    upload_file.file.seek(0, os.SEEK_END)
    file_size = upload_file.file.tell()
    upload_file.file.seek(0)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 100MB.")
        
    # 3. Create job directory
    job_dir = os.path.join(STORAGE_DIR, job_id)
    os.makedirs(job_dir, exist_ok=True)
    
    # 4. Save file
    safe_filename = os.path.basename(upload_file.filename)
    filepath = os.path.join(job_dir, safe_filename)
    
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
        
    return filepath
