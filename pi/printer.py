import logging
import time
import requests
import subprocess
import os

logger = logging.getLogger(__name__)

def print_job(job_id, filename, backend_api_url):
    """
    Downloads the file and sends it to the physical printer via CUPS
    """
    logger.info(f"============ PRINTING ============")
    logger.info(f"Job ID: {job_id}")
    logger.info(f"Filename: {filename}")
    
    # 1. Download the file
    download_url = f"{backend_api_url}/api/download/{job_id}"
    logger.info(f"Downloading from {download_url}...")
    
    try:
        response = requests.get(download_url)
        response.raise_for_status()
        
        # Save locally
        local_filepath = os.path.join("/tmp", filename)
        with open(local_filepath, "wb") as f:
            f.write(response.content)
            
        logger.info(f"File downloaded to {local_filepath}")
        
        # 2. Print using CUPS 'lp' command
        printer_name = os.getenv("PRINTER_NAME", "test_printer")
        logger.info(f"Sending to printer: {printer_name}...")
        
        # Run the lp command
        result = subprocess.run(
            ["lp", "-d", printer_name, local_filepath],
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            logger.info(f"CUPS Output: {result.stdout.strip()}")
            logger.info("Pages sent to printer successfully!")
        else:
            logger.error(f"CUPS Error: {result.stderr.strip()}")
            
    except Exception as e:
        logger.error(f"Failed to print job: {str(e)}")
        
    logger.info(f"==================================")
