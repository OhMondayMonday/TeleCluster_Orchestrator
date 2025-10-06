"""
Configuration settings for TeleCluster Orchestrator API
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API Configuration
API_TITLE = "TeleCluster Orchestrator API"
API_DESCRIPTION = "API para gestión de imágenes de VM y recursos cloud"
API_VERSION = "1.0.0"

# Server Configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8001))

# CORS Configuration
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

# Storage Configuration
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "./uploads/images"))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", 21474836480))  # 20GB default

# Allowed file extensions
ALLOWED_EXTENSIONS = [".iso", ".qcow2", ".vmdk", ".vhd", ".img", ".png", ".jpg", ".txt"]

# Developer Info
DEVELOPER_NAME = "Miguel Angel Alvizuri"
DEVELOPER_EMAIL = "a20212472@pucp.edu.pe"
