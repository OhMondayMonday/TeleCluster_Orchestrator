#!/usr/bin/env python3
"""
TeleCluster Worker Agent

Agente worker para orquestador cloud IaaS orientado a laboratorios, 
investigación y uso académico. Expone API REST para operaciones de 
red y virtualización.

Author: TeleCluster Team
Version: 1.0.0
"""

import logging
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.openapi.utils import get_openapi

# Importar configuración y utilidades
from utils.logging import setup_logging, validate_environment, check_permissions
from utils.middleware import (
    logging_middleware, security_headers_middleware,
    validation_error_handler, http_error_handler, general_exception_handler
)

# Importar routers
from api import bridge, veth, vlan, tuntap, nat, network, vm

# Configurar logging
setup_logging(level="INFO")
logger = logging.getLogger("worker_agent")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestión del ciclo de vida de la aplicación"""
    
    # Startup
    logger.info("🚀 Iniciando TeleCluster Worker Agent...")
    
    # Validar entorno
    env_check = validate_environment()
    if not env_check['all_required_available']:
        missing = [cmd for cmd, available in env_check['required'].items() if not available]
        logger.error(f"❌ Comandos requeridos no disponibles: {missing}")
        sys.exit(1)
    else:
        logger.info("✅ Todos los comandos requeridos están disponibles")
    
    # Verificar permisos
    perms = check_permissions()
    if not perms['can_modify_network']:
        logger.warning("⚠️  Sin permisos para modificar interfaces de red")
    if not perms['can_modify_iptables']:
        logger.warning("⚠️  Sin permisos para modificar iptables")
    
    if perms['root_user']:
        logger.info("✅ Ejecutando como root - todos los permisos disponibles")
    else:
        logger.warning("⚠️  No ejecutando como root - funcionalidad limitada")
    
    logger.info("🎯 Worker Agent iniciado correctamente")
    
    yield
    
    # Shutdown
    logger.info("🛑 Cerrando TeleCluster Worker Agent...")


# Crear aplicación FastAPI
app = FastAPI(
    title="TeleCluster Worker Agent",
    description="""
    API REST para agente worker del orquestador cloud TeleCluster.
    
    ## Funcionalidades
    
    * **Bridges**: Crear y gestionar bridges Linux y OVS
    * **Veth Pairs**: Crear pares veth para conectar VMs
    * **VLANs**: Configurar VLANs en interfaces y bridges
    * **TUN/TAP**: Gestionar interfaces TUN/TAP
    * **NAT/Firewall**: Port forwarding y reglas de firewall
    * **Network**: Monitoreo y diagnóstico de red
    
    ## Arquitectura de Red
    
    - **ens3**: Interfaz WAN conectada a Internet (bridge br-ex)
    - **ens4**: Red interna entre servidores (bridge br-int)
    - **br-ex**: Bridge externo para salida/entrada a Internet
    - **br-int**: Bridge interno para redes virtuales y overlays
    
    ## Uso
    
    Las VMs pueden conectarse a uno o ambos bridges según sus necesidades:
    - Solo br-int: Comunicación interna entre VMs
    - Solo br-ex: Acceso directo a Internet
    - Ambos: Comunicación interna + acceso a Internet
    """,
    version="1.0.0",
    contact={
        "name": "TeleCluster Team",
        "email": "admin@telecluster.local"
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT"
    },
    lifespan=lifespan
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar origins exactos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Añadir middlewares personalizados
app.middleware("http")(logging_middleware)
app.middleware("http")(security_headers_middleware)

# Registrar handlers de errores
app.add_exception_handler(HTTPException, http_error_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Registrar routers principales
app.include_router(network.router, prefix="/network", tags=["network"])
app.include_router(vm.router, prefix="/vm", tags=["vm"])

# Registrar sub-routers de red (para compatibilidad)
app.include_router(bridge.router, prefix="/bridge", tags=["bridge"])
app.include_router(veth.router, prefix="/veth", tags=["veth"])
app.include_router(vlan.router, prefix="/vlan", tags=["vlan"])
app.include_router(tuntap.router, prefix="/tuntap", tags=["tuntap"])
app.include_router(nat.router, prefix="/nat", tags=["nat"])


@app.get("/", tags=["root"])
async def root():
    """
    Endpoint raíz - información básica del worker
    """
    return {
        "service": "TeleCluster Worker Agent",
        "version": "1.0.0",
        "status": "running",
        "description": "API REST para operaciones de red y virtualización",
        "docs_url": "/docs",
        "health_check": "/network/status"
    }


@app.get("/health", tags=["health"])
async def health_check():
    """
    Health check básico para monitoreo
    """
    try:
        # Verificar comandos básicos
        env_check = validate_environment()
        perms = check_permissions()
        
        status = "healthy"
        if not env_check['all_required_available']:
            status = "unhealthy"
        elif not perms['can_modify_network']:
            status = "degraded"
        
        return {
            "status": status,
            "timestamp": "2024-01-01T00:00:00Z",  # Se actualizará dinámicamente
            "environment": env_check,
            "permissions": perms
        }
        
    except Exception as e:
        logger.error(f"Error en health check: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e)
            }
        )


def custom_openapi():
    """
    Personalizar esquema OpenAPI
    """
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    
    # Añadir información adicional
    openapi_schema["info"]["x-logo"] = {
        "url": "https://example.com/logo.png"
    }
    
    # Añadir ejemplos de uso
    openapi_schema["info"]["x-examples"] = {
        "create_bridge": {
            "summary": "Crear bridge",
            "value": {
                "name": "br-vm01",
                "type": "linux",
                "stp": False
            }
        },
        "create_veth": {
            "summary": "Crear par veth",
            "value": {
                "name1": "veth101",
                "name2": "veth102",
                "bridge1": "br-int",
                "bridge2": "br-int"
            }
        }
    }
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema


# Asignar función personalizada
app.openapi = custom_openapi


if __name__ == "__main__":
    import uvicorn
    
    logger.info("🚀 Iniciando servidor de desarrollo...")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
        access_log=False  # Usamos nuestro middleware personalizado
    )