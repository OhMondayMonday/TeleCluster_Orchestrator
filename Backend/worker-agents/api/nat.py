from fastapi import APIRouter, HTTPException, status
import logging

from models.nat import (
    PortForwardRequest, PortForwardDeleteRequest, MasqueradeRequest,
    NATStatus, Protocol
)
from models.network import APIResponse, ResponseStatus
from services.nat import NATService

# Configurar logging
logger = logging.getLogger(__name__)

# Crear router (sin prefix porque será incluido desde /network/nat)
router = APIRouter()


@router.post("/forward", response_model=APIResponse)
async def add_port_forward(request: PortForwardRequest):
    """
    Crear regla de port forwarding (DNAT)
    
    - **external_port**: Puerto externo (1-65535)
    - **internal_ip**: IP interna destino
    - **internal_port**: Puerto interno destino (1-65535)
    - **protocol**: Protocolo (tcp, udp, icmp, all)
    - **interface**: Interfaz externa opcional
    - **description**: Descripción de la regla
    """
    try:
        result = NATService.add_port_forward(
            external_port=request.external_port,
            internal_ip=request.internal_ip,
            internal_port=request.internal_port,
            protocol=request.protocol,
            interface=request.interface,
            description=request.description
        )
        
        if result.get("success", False):
            return APIResponse(
                status=ResponseStatus.ok,
                message=f"Port forward creado: {request.external_port} -> {request.internal_ip}:{request.internal_port}",
                data=result
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Error desconocido")
            )
            
    except Exception as e:
        logger.error(f"Error en add_port_forward: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )


@router.delete("/forward", response_model=APIResponse)
async def remove_port_forward(request: PortForwardDeleteRequest):
    """
    Eliminar regla de port forwarding
    
    Se puede eliminar por rule_id o por combinación de parámetros:
    - **rule_id**: ID de la regla (preferido)
    - **external_port**: Puerto externo
    - **internal_ip**: IP interna
    - **internal_port**: Puerto interno
    """
    try:
        result = NATService.remove_port_forward(
            rule_id=request.rule_id,
            external_port=request.external_port,
            internal_ip=request.internal_ip,
            internal_port=request.internal_port
        )
        
        if result.get("success", False):
            return APIResponse(
                status=ResponseStatus.ok,
                message="Regla de port forward eliminada",
                data=result
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Error desconocido")
            )
            
    except Exception as e:
        logger.error(f"Error en remove_port_forward: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )


@router.post("/masquerade", response_model=APIResponse)
async def add_masquerade(request: MasqueradeRequest):
    """
    Añadir regla de masquerade/SNAT
    
    - **source_network**: Red origen (ej: 192.168.1.0/24)
    - **output_interface**: Interfaz de salida
    - **enabled**: Habilitar masquerade (por defecto true)
    """
    try:
        result = NATService.add_masquerade(
            source_network=request.source_network,
            output_interface=request.output_interface
        )
        
        if result.get("success", False):
            return APIResponse(
                status=ResponseStatus.ok,
                message=f"Masquerade añadido: {request.source_network} -> {request.output_interface}",
                data=result
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Error desconocido")
            )
            
    except Exception as e:
        logger.error(f"Error en add_masquerade: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )


@router.delete("/masquerade", response_model=APIResponse)
async def remove_masquerade(source_network: str, output_interface: str):
    """
    Eliminar regla de masquerade
    
    - **source_network**: Red origen
    - **output_interface**: Interfaz de salida
    """
    try:
        result = NATService.remove_masquerade(
            source_network=source_network,
            output_interface=output_interface
        )
        
        if result.get("success", False):
            return APIResponse(
                status=ResponseStatus.ok,
                message=f"Masquerade eliminado: {source_network} -> {output_interface}",
                data=result
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Error desconocido")
            )
            
    except Exception as e:
        logger.error(f"Error en remove_masquerade: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )


@router.post("/firewall", response_model=APIResponse)
async def add_firewall_rule(
    chain: str,
    action: str, 
    protocol: Protocol = Protocol.all,
    source: str = None,
    destination: str = None,
    port: int = None,
    interface: str = None
):
    """
    Añadir regla de firewall
    
    - **chain**: Cadena iptables (INPUT, OUTPUT, FORWARD)
    - **action**: Acción (ACCEPT, DROP, REJECT)
    - **protocol**: Protocolo (tcp, udp, icmp, all)
    - **source**: IP/Red origen opcional
    - **destination**: IP/Red destino opcional
    - **port**: Puerto opcional
    - **interface**: Interfaz opcional
    """
    try:
        result = NATService.add_firewall_rule(
            chain=chain,
            action=action,
            protocol=protocol,
            source=source,
            destination=destination,
            port=port,
            interface=interface
        )
        
        if result.get("success", False):
            return APIResponse(
                status=ResponseStatus.ok,
                message=f"Regla firewall añadida: {chain} {action}",
                data=result
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Error desconocido")
            )
            
    except Exception as e:
        logger.error(f"Error en add_firewall_rule: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )


@router.get("/status", response_model=NATStatus)
async def get_nat_status():
    """
    Obtener estado completo del sistema NAT y firewall
    
    Devuelve todas las reglas configuradas:
    - Port forwards (DNAT)
    - Reglas de masquerade (SNAT)
    - Reglas de firewall
    """
    try:
        nat_status = NATService.list_nat_rules()
        return nat_status
        
    except Exception as e:
        logger.error(f"Error en get_nat_status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error obteniendo estado NAT: {str(e)}"
        )


@router.post("/flush-nat", response_model=APIResponse)
async def flush_nat_rules():
    """
    Limpiar todas las reglas NAT (DNAT/SNAT)
    
    ⚠️  ADVERTENCIA: Esta operación eliminará todas las reglas de port forwarding 
    y masquerade. Use con precaución.
    """
    try:
        result = NATService.flush_nat_rules()
        
        if result.get("success", False):
            return APIResponse(
                status=ResponseStatus.ok,
                message="Todas las reglas NAT han sido eliminadas",
                data=result
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Error desconocido")
            )
            
    except Exception as e:
        logger.error(f"Error en flush_nat_rules: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )


@router.post("/flush-firewall", response_model=APIResponse)
async def flush_firewall_rules():
    """
    Limpiar todas las reglas de firewall
    
    ⚠️  ADVERTENCIA: Esta operación eliminará todas las reglas de firewall.
    Use con precaución ya que puede afectar la conectividad.
    """
    try:
        result = NATService.flush_firewall_rules()
        
        if result.get("success", False):
            return APIResponse(
                status=ResponseStatus.ok,
                message="Todas las reglas de firewall han sido eliminadas",
                data=result
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Error desconocido")
            )
            
    except Exception as e:
        logger.error(f"Error en flush_firewall_rules: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )
