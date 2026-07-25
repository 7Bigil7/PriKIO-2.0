import logging
import time
import subprocess
import os

logger = logging.getLogger(__name__)

def print_job(job_id, file_info, supabase_client):
    """
    Downloads the file from Supabase Storage and sends it to the physical printer via CUPS
    """
    filename = file_info.get("filename")
    storage_path = file_info.get("storage_path")
    copies = file_info.get("copies", 1)
    sides = file_info.get("sides", "Single")
    color_mode = file_info.get("color_mode", "B&W")

    logger.info(f"============ PRINTING ============")
    logger.info(f"Job ID: {job_id}")
    logger.info(f"Filename: {filename}")
    logger.info(f"Settings: Copies={copies}, Sides={sides}, Color={color_mode}")
    
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
            
            # Construct CUPS command with options
            lp_cmd = ["lp", "-d", printer_name]
            
            # Copies
            if copies and int(copies) > 1:
                lp_cmd.extend(["-n", str(copies)])
            
            # Sides (Duplex)
            if sides.lower() == "double":
                lp_cmd.extend(["-o", "sides=two-sided-long-edge"])
            else:
                lp_cmd.extend(["-o", "sides=one-sided"])
                
            # Color Mode
            if color_mode.lower() == "color":
                lp_cmd.extend(["-o", "print-color-mode=color"])
            else:
                lp_cmd.extend(["-o", "print-color-mode=monochrome"])

            # Add the filepath at the end
            lp_cmd.append(local_filepath)

            # Run the lp command
            result = subprocess.run(
                lp_cmd,
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
