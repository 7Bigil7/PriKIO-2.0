import logging
import time
import subprocess
import os

logger = logging.getLogger(__name__)

def print_job(job_id, filename, storage_path, supabase_client):
    """
    Downloads the file from Supabase Storage and sends it to the physical printer via CUPS
    """
    logger.info(f"============ PRINTING ============")
    logger.info(f"Job ID: {job_id}")
    logger.info(f"Filename: {filename}")
    
    # 1. Download the file from Supabase Storage
    logger.info(f"Downloading {storage_path} from Supabase...")
    
    try:
        # Get the file data from the 'documents' bucket
        response = supabase_client.storage.from_('documents').download(storage_path)
        
        import tempfile
        import platform
        # Save locally
        local_filepath = os.path.join(tempfile.gettempdir(), filename)
        with open(local_filepath, "wb") as f:
            f.write(response)
            
        logger.info(f"File downloaded to {local_filepath}")
        
        # 2. Print depending on OS
        if platform.system() == "Windows":
            logger.info("Windows detected. Opening default print dialog...")
            os.startfile(local_filepath, "print")
            logger.info("Print command sent to Windows spooler!")
        else:
            printer_name = os.getenv("PRINTER_NAME", "test_printer")
            logger.info(f"Sending to CUPS printer: {printer_name}...")
            
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
