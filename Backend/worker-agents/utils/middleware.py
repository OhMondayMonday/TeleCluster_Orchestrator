from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
import logging
import time
from typing import Callable
import traceback

logger = logging.getLogger(__name__)


async def logging_middleware(request: Request, call_next: Callable) -> JSONResponse:
    """
    Middleware para logging de requests y responses
    """
    start_time = time.time()
    
    # Log request
    logger.info(
        f"Request: {request.method} {request.url.path} "
        f"from {request.client.host if request.client else 'unknown'}"
    )
    
    try:
        response = await call_next(request)
        
        # Calcular tiempo de procesamiento
        process_time = time.time() - start_time
        
        # Log response
        logger.info(
            f"Response: {response.status_code} for {request.method} {request.url.path} "
            f"in {process_time:.3f}s"
        )
        
        # Añadir header con tiempo de procesamiento
        response.headers["X-Process-Time"] = str(process_time)
        
        return response
        
    except Exception as e:
        process_time = time.time() - start_time
        
        logger.error(
            f"Error processing {request.method} {request.url.path} "
            f"after {process_time:.3f}s: {str(e)}"
        )
        
        # Log traceback completo para debugging
        logger.debug(f"Traceback: {traceback.format_exc()}")
        
        # Retornar error genérico
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "error": "Internal server error",
                "message": "An unexpected error occurred"
            }
        )


async def security_headers_middleware(request: Request, call_next: Callable) -> JSONResponse:
    """
    Middleware para añadir headers de seguridad
    """
    response = await call_next(request)
    
    # Headers de seguridad básicos
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    # Header personalizado para identificar el worker
    response.headers["X-Worker-Agent"] = "TeleCluster-Worker/1.0"
    
    return response


async def cors_middleware(request: Request, call_next: Callable) -> JSONResponse:
    """
    Middleware básico para CORS (desarrollo)
    """
    response = await call_next(request)
    
    # Headers CORS básicos (ajustar según necesidades)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    
    return response


def validation_error_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handler personalizado para errores de validación
    """
    logger.warning(f"Validation error in {request.method} {request.url.path}: {exc}")
    
    return JSONResponse(
        status_code=422,
        content={
            "status": "error",
            "error": "Validation error",
            "message": "Invalid request data",
            "details": str(exc)
        }
    )


def http_error_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """
    Handler personalizado para errores HTTP
    """
    logger.warning(
        f"HTTP error {exc.status_code} in {request.method} {request.url.path}: {exc.detail}"
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "error": f"HTTP {exc.status_code}",
            "message": exc.detail
        }
    )


def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handler general para excepciones no controladas
    """
    logger.error(
        f"Unhandled exception in {request.method} {request.url.path}: {exc}",
        exc_info=True
    )
    
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "error": "Internal server error",
            "message": "An unexpected error occurred"
        }
    )
