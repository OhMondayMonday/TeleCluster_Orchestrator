"""
TeleCluster Orchestrator API
Main FastAPI application entry point

Developer: Miguel Angel Alvizuri
Email: a20212472@pucp.edu.pe
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Import configuration
from config.settings import (
    API_TITLE,
    API_VERSION,
    API_DESCRIPTION,
    CORS_ORIGINS,
    DEVELOPER_NAME,
    DEVELOPER_EMAIL,
    UPLOAD_DIR
)

# Import routers
from api.images import router as images_router

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title=API_TITLE,
    description=API_DESCRIPTION,
    version=API_VERSION
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(images_router)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "OK",
        "message": API_TITLE,
        "version": API_VERSION,
        "developer": DEVELOPER_NAME,
        "email": DEVELOPER_EMAIL,
        "upload_dir": str(UPLOAD_DIR.absolute())
    }


@app.get("/api/v1/health")
async def health_check():
    """Detailed health check"""
    from datetime import datetime
    from api.images import images_db
    
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "upload_dir": str(UPLOAD_DIR),
        "upload_dir_exists": UPLOAD_DIR.exists(),
        "images_count": len(images_db)
    }


if __name__ == "__main__":
    import uvicorn
    import os
    
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8001))
    
    print(f"""
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 TeleCluster Orchestrator API                         ║
║                                                            ║
║   Status: Running                                          ║
║   Host: {host}                                        ║
║   Port: {port}                                               ║
║   Docs: http://{host}:{port}/docs                      ║
║                                                            ║
║   Developer: {DEVELOPER_NAME}                         ║
║   Email: {DEVELOPER_EMAIL}                             ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    """)
    
    uvicorn.run("main:app", host=host, port=port, reload=False)
