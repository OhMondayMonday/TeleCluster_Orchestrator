"""
API endpoints for image management
"""
from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from typing import Optional
import os
from datetime import datetime
from pathlib import Path

from config.settings import UPLOAD_DIR, ALLOWED_EXTENSIONS

# Router
router = APIRouter(prefix="/api/v1", tags=["images"])

# In-memory storage
images_db = []


@router.get("/images")
async def get_images():
    """Get all uploaded images"""
    return {
        "success": True,
        "count": len(images_db),
        "images": images_db
    }


@router.get("/images/{image_id}")
async def get_image(image_id: str):
    """Get a specific image by ID"""
    image = next((img for img in images_db if img["id"] == image_id), None)
    
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    return {
        "success": True,
        "image": image
    }


@router.post("/images/upload")
async def upload_image(
    file: UploadFile = File(...),
    name: str = Form(...),
    os_type: str = Form(...),
    version: str = Form(...),
    architecture: str = Form(default="x86_64"),
    description: Optional[str] = Form(default=None)
):
    """
    Upload a new OS image
    
    Args:
        file: The image file (ISO, QCOW2, VMDK, VHD)
        name: Display name of the image
        os_type: Type of OS (Linux, Windows, Custom)
        version: Version of the OS
        architecture: CPU architecture (x86_64, arm64, i386)
        description: Optional description
    """
    
    # Validate file extension
    file_extension = Path(file.filename).suffix.lower()
    
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Generate unique filename
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    safe_filename = f"{timestamp}_{file.filename}"
    file_path = UPLOAD_DIR / safe_filename
    
    # Save file
    try:
        # Read file content
        content = await file.read()
        
        # Write synchronously
        with open(file_path, 'wb') as out_file:
            out_file.write(content)
        
        # Get file size
        file_size = os.path.getsize(file_path)
        file_size_gb = round(file_size / (1024 ** 3), 2)
        
        # Create image record
        image_record = {
            "id": f"img-{timestamp}",
            "name": name,
            "os": os_type,
            "version": version,
            "architecture": architecture,
            "description": description,
            "filename": safe_filename,
            "file_path": str(file_path),
            "size": f"{file_size_gb} GB",
            "size_bytes": file_size,
            "extension": file_extension,
            "status": "active",
            "downloads": 0,
            "created": datetime.utcnow().isoformat(),
            "uploaded_by": "superadmin"
        }
        
        images_db.append(image_record)
        
        return {
            "success": True,
            "message": "Image uploaded successfully",
            "image": image_record
        }
        
    except Exception as e:
        # Clean up file if upload failed
        if file_path.exists():
            os.remove(file_path)
        
        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {str(e)}"
        )


@router.delete("/images/{image_id}")
async def delete_image(image_id: str):
    """Delete an image"""
    image = next((img for img in images_db if img["id"] == image_id), None)
    
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Delete file from disk
    file_path = Path(image["file_path"])
    if file_path.exists():
        os.remove(file_path)
    
    # Remove from list
    images_db.remove(image)
    
    return {
        "success": True,
        "message": "Image deleted successfully"
    }


@router.get("/images/{image_id}/download")
async def download_image(image_id: str):
    """Increment download counter"""
    image = next((img for img in images_db if img["id"] == image_id), None)
    
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Increment download counter
    image["downloads"] += 1
    
    return {
        "success": True,
        "message": "Download recorded",
        "downloads": image["downloads"]
    }


@router.get("/stats")
async def get_stats():
    """Get system statistics"""
    total_size = sum(img["size_bytes"] for img in images_db)
    
    total_downloads = sum(img["downloads"] for img in images_db)
    
    os_counts = {}
    for img in images_db:
        os_type = img["os"]
        os_counts[os_type] = os_counts.get(os_type, 0) + 1
    
    return {
        "success": True,
        "stats": {
            "total_images": len(images_db),
            "total_size_bytes": total_size,
            "total_downloads": total_downloads,
            "by_os": os_counts
        }
    }
