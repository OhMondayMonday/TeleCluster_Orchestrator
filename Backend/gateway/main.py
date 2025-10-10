"""
Gateway Agent - TeleCluster Orchestrator
Servicio para gestión de NAT/Port Forwarding usando iptables
"""

import logging
from contextlib import asynccontextmanager

try:
    import uvicorn
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
except ImportError:
    print("FastAPI no está instalado. Ejecutar: pip install fastapi uvicorn")
    exit(1)

from api.nat import router as nat_router
from models.nat import GatewayStatus, APIResponse
from services.nat import NATService


# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Instancia global del servicio NAT
nat_service = NATService()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestión del ciclo de vida de la aplicación"""
    logger.info("🚀 Iniciando Gateway Agent...")
    
    # Verificaciones de inicio
    try:
        status = nat_service.get_gateway_status()
        if not status.iptables_available:
            logger.warning("⚠️  iptables no está disponible - funcionalidad limitada")
        else:
            logger.info("✅ iptables disponible")
            
        logger.info(f"📊 Reglas cargadas: {status.total_rules} total, {status.active_rules} activas")
        logger.info("✅ Gateway Agent iniciado exitosamente")
        
    except Exception as e:
        logger.error(f"❌ Error durante el inicio: {e}")
    
    yield
    
    # Limpieza al cerrar
    logger.info("🛑 Cerrando Gateway Agent...")


# Crear aplicación FastAPI
app = FastAPI(
    title="TeleCluster Gateway Agent",
    description="""
    **Gateway Agent para TeleCluster Orchestrator**
    
    Servicio para gestión de reglas de NAT/Port Forwarding usando iptables.
    
    ## Funcionalidades principales:
    
    * **Port Forwarding (DNAT)**: Crear reglas DNAT en la cadena PREROUTING
    * **Gestión de reglas**: Listar, crear y eliminar reglas de redirección
    * **Monitoreo**: Estado del servicio y estadísticas de reglas
    
    ## Endpoints disponibles:
    
    * `POST /nat/forward` - Crear nueva regla de port forwarding
    * `DELETE /nat/forward` - Eliminar regla existente
    * `GET /nat/forwards` - Listar todas las reglas activas
    * `GET /status` - Estado del gateway
    * `POST /flush` - Eliminar todas las reglas (⚠️ usar con cuidado)
    
    ---
    
    **Nota**: Este servicio requiere permisos de administrador para modificar iptables.
    """,
    version="1.0.0",
    contact={
        "name": "TeleCluster Team",
        "email": "support@telecluster.com",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
    lifespan=lifespan
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar orígenes específicos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(nat_router)


@app.get("/",
         summary="Información del servicio",
         description="Endpoint raíz con información básica del gateway")
async def root():
    """Información básica del gateway"""
    return {
        "service": "TeleCluster Gateway Agent",
        "version": "1.0.0",
        "description": "Servicio para gestión de NAT/Port Forwarding",
        "endpoints": {
            "nat_management": "/nat/",
            "status": "/status",
            "docs": "/docs",
            "redoc": "/redoc"
        }
    }


@app.get("/status",
         response_model=GatewayStatus,
         summary="Estado del gateway",
         description="Estado actual del servicio gateway")
async def get_gateway_status():
    """Estado actual del gateway"""
    try:
        return nat_service.get_gateway_status()
    except Exception as e:
        logger.error(f"Error obteniendo estado: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error obteniendo estado del sistema"
        )


@app.post("/flush",
          response_model=APIResponse,
          summary="Eliminar todas las reglas",
          description="⚠️ Elimina todas las reglas NAT del gateway")
async def flush_all_rules():
    """
    Elimina todas las reglas NAT del gateway
    
    ⚠️ **ADVERTENCIA**: Esta operación es irreversible
    """
    try:
        nat_service.flush_all_rules()
        return APIResponse(
            success=True,
            message="Todas las reglas NAT han sido eliminadas"
        )
    except Exception as e:
        logger.error(f"Error eliminando reglas: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error eliminando reglas: {str(e)}"
        )


@app.get("/health",
         summary="Health check",
         description="Endpoint para verificar que el servicio está funcionando")
async def health_check():
    """Health check básico"""
    return {"status": "healthy", "service": "gateway-agent"}


if __name__ == "__main__":
    # Configuración para desarrollo
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8002,
        reload=True,
        log_level="info"
    )
