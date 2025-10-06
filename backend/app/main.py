"""FastAPI main application."""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from app.auth.routes import router as auth_router
from app.users.routes import router as users_router
from app.shared.schemas import ApiResponse
from app.db import test_connection

# Create FastAPI app
app = FastAPI(
    title="TeleCluster Orchestrator API",
    description="User Management API with JWT and RBAC",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(users_router)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    db_status = "connected" if test_connection() else "disconnected"
    
    return {
        "ok": True,
        "data": {
            "status": "healthy",
            "database": db_status,
            "service": "TeleCluster Orchestrator API",
            "version": "1.0.0"
        }
    }


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "ok": True,
        "data": {
            "message": "TeleCluster Orchestrator API",
            "version": "1.0.0",
            "docs": "/docs",
            "health": "/health"
        }
    }


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle all unhandled exceptions."""
    return JSONResponse(
        status_code=500,
        content={
            "ok": False,
            "error": "Error interno del servidor",
            "details": str(exc)
        }
    )


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
