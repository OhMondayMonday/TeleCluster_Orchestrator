from fastapi import APIRouter, HTTPException, status, Query
from typing import List
import logging

# Importar todos los sub-routers
from api import bridge, veth, vlan, tuntap, nat
from models.network import NetworkInterface, NetworkTopology, HealthStatus, APIResponse, ResponseStatus
from services.network import NetworkService

# Configurar logging
logger = logging.getLogger(__name__)

# Crear router principal de red
router = APIRouter(prefix="/network", tags=["network"])

# Incluir sub-routers de red (sin prefijos adicionales porque ya están en /network)
bridge_router = APIRouter(tags=["network-bridge"])
bridge_router.include_router(bridge.router, prefix="/bridge")

veth_router = APIRouter(tags=["network-veth"])  
veth_router.include_router(veth.router, prefix="/veth")

vlan_router = APIRouter(tags=["network-vlan"])
vlan_router.include_router(vlan.router, prefix="/vlan")

tuntap_router = APIRouter(tags=["network-tuntap"])
tuntap_router.include_router(tuntap.router, prefix="/tuntap")

nat_router = APIRouter(tags=["network-nat"])
nat_router.include_router(nat.router, prefix="/nat")

# Incluir todos los sub-routers en el router principal
router.include_router(bridge_router)
router.include_router(veth_router) 
router.include_router(vlan_router)
router.include_router(tuntap_router)
router.include_router(nat_router)


@router.get("/interfaces", response_model=List[NetworkInterface])
async def list_interfaces():
    """
    Listar todas las interfaces de red del sistema
    
    Devuelve información detallada de todas las interfaces:
    - Físicas (eth, ens, enp)
    - Bridges (br-, virbr)
    - Veth pairs
    - TUN/TAP
    - VLAN
    - Virtuales (lo, docker)
    """
    try:
        interfaces = NetworkService.list_interfaces()
        return interfaces
        
    except Exception as e:
        logger.error(f"Error en list_interfaces: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listando interfaces: {str(e)}"
        )


@router.get("/interface/{interface_name}", response_model=APIResponse)
async def get_interface_info(interface_name: str):
    """
    Obtener información detallada de una interfaz específica
    
    - **interface_name**: Nombre de la interfaz a consultar
    """
    try:
        interface = NetworkService.get_interface_info(interface_name)
        
        return APIResponse(
            status=ResponseStatus.ok,
            message=f"Información de interfaz {interface_name}",
            data=interface.__dict__
        )
        
    except Exception as e:
        logger.error(f"Error en get_interface_info: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error obteniendo información de interfaz: {str(e)}"
        )


@router.get("/topology", response_model=NetworkTopology)
async def get_network_topology():
    """
    Obtener la topología completa de red del sistema
    
    Incluye:
    - Todas las interfaces de red
    - Bridges configurados
    - Tabla de rutas
    """
    try:
        topology = NetworkService.get_network_topology()
        return topology
        
    except Exception as e:
        logger.error(f"Error en get_network_topology: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error obteniendo topología de red: {str(e)}"
        )


@router.get("/status", response_model=HealthStatus)
async def get_system_health():
    """
    Obtener estado de salud del sistema worker
    
    Incluye:
    - Estado general (healthy, warning, critical, error)
    - Información del sistema (CPU, memoria, disco)
    - Estadísticas de red
    - Tiempo de actividad
    """
    try:
        health = NetworkService.get_system_health()
        return health
        
    except Exception as e:
        logger.error(f"Error en get_system_health: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error obteniendo estado del sistema: {str(e)}"
        )


@router.post("/ping", response_model=APIResponse)
async def ping_host(target: str, count: int = Query(default=4, ge=1, le=20)):
    """
    Hacer ping a un host desde el worker
    
    - **target**: IP o hostname destino
    - **count**: Número de pings (1-20, por defecto 4)
    """
    try:
        result = NetworkService.ping_host(target=target, count=count)
        
        if result.get("success", False):
            return APIResponse(
                status=ResponseStatus.ok,
                message=f"Ping a {target} completado",
                data=result
            )
        else:
            return APIResponse(
                status=ResponseStatus.warning,
                message=f"Ping a {target} falló",
                data=result
            )
        
    except Exception as e:
        logger.error(f"Error en ping_host: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error ejecutando ping: {str(e)}"
        )


@router.post("/traceroute", response_model=APIResponse)
async def traceroute_host(target: str):
    """
    Hacer traceroute a un destino desde el worker
    
    - **target**: IP o hostname destino
    """
    try:
        result = NetworkService.traceroute(target=target)
        
        if result.get("success", False):
            return APIResponse(
                status=ResponseStatus.ok,
                message=f"Traceroute a {target} completado",
                data=result
            )
        else:
            return APIResponse(
                status=ResponseStatus.warning,
                message=f"Traceroute a {target} falló",
                data=result
            )
        
    except Exception as e:
        logger.error(f"Error en traceroute_host: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error ejecutando traceroute: {str(e)}"
        )


@router.get("/routes", response_model=APIResponse)
async def get_routing_table():
    """
    Obtener la tabla de rutas del sistema
    
    Devuelve todas las rutas configuradas en el sistema
    """
    try:
        topology = NetworkService.get_network_topology()
        
        return APIResponse(
            status=ResponseStatus.ok,
            message="Tabla de rutas obtenida",
            data={"routes": topology.routes}
        )
        
    except Exception as e:
        logger.error(f"Error en get_routing_table: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error obteniendo tabla de rutas: {str(e)}"
        )


@router.get("/bridges", response_model=APIResponse)
async def get_bridges_summary():
    """
    Obtener resumen de todos los bridges del sistema
    
    Lista simplificada de bridges (Linux y OVS)
    """
    try:
        topology = NetworkService.get_network_topology()
        
        return APIResponse(
            status=ResponseStatus.ok,
            message="Lista de bridges obtenida",
            data={"bridges": topology.bridges}
        )
        
    except Exception as e:
        logger.error(f"Error en get_bridges_summary: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error obteniendo bridges: {str(e)}"
        )
