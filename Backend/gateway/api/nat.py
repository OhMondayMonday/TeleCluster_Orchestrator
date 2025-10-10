"""
Endpoints API para gestión de NAT/Port Forwarding (PREROUTING DNAT)
"""

from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
import logging

from models.nat import (
    PortForwardRequest, 
    PortForwardResponse, 
    PortForwardListResponse,
    DeletePortForwardRequest,
    APIResponse
)
from services.nat import NATService

# Configurar logging
logger = logging.getLogger(__name__)

# Router para endpoints NAT
router = APIRouter(prefix="/nat", tags=["NAT/Port Forwarding"])

# Instancia del servicio NAT (singleton)
nat_service = NATService()


def get_nat_service() -> NATService:
    """Dependency injection para el servicio NAT"""
    return nat_service


@router.post("/forward",
             response_model=PortForwardResponse,
             summary="Crear regla de port forwarding",
             description="Crea una nueva regla DNAT en la cadena PREROUTING para redirigir tráfico")
async def create_port_forward(
    request: PortForwardRequest,
    service: NATService = Depends(get_nat_service)
) -> PortForwardResponse:
    """
    Crea una nueva regla de port forwarding (DNAT en PREROUTING)
    
    - **external_port**: Puerto externo que recibirá el tráfico
    - **internal_ip**: IP interna hacia donde redirigir
    - **internal_port**: Puerto interno de destino
    - **protocol**: Protocolo (tcp/udp)
    - **description**: Descripción opcional
    """
    try:
        rule_id = service.create_port_forward(request)
        created_rule = service.get_port_forward(rule_id)
        
        return PortForwardResponse(
            success=True,
            message=f"Port forwarding creado: {request.external_port}/{request.protocol} -> {request.internal_ip}:{request.internal_port}",
            rule_id=rule_id,
            rule=created_rule
        )
    
    except ValueError as e:
        logger.warning(f"Error de validación creando port forward: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except RuntimeError as e:
        logger.error(f"Error de sistema creando port forward: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error configurando regla iptables: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Error inesperado creando port forward: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.delete("/forward",
               response_model=APIResponse,
               summary="Eliminar regla de port forwarding",
               description="Elimina una regla DNAT existente por ID o puerto externo")
async def delete_port_forward(
    delete_request: DeletePortForwardRequest,
    service: NATService = Depends(get_nat_service)
) -> APIResponse:
    """
    Elimina una regla de port forwarding existente
    
    Puede eliminarse por:
    - **rule_id**: ID único de la regla
    - **external_port**: Puerto externo de la regla (requiere protocol si hay ambigüedad)
    """
    try:
        success = service.delete_port_forward(
            rule_id=delete_request.rule_id,
            external_port=delete_request.external_port
        )
        
        if success:
            identifier = delete_request.rule_id or f"puerto {delete_request.external_port}"
            return APIResponse(
                success=True,
                message=f"Regla de port forwarding eliminada: {identifier}"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Regla no encontrada"
            )
    
    except ValueError as e:
        logger.warning(f"Error de validación eliminando port forward: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except RuntimeError as e:
        logger.error(f"Error de sistema eliminando port forward: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error eliminando regla iptables: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Error inesperado eliminando port forward: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.get("/forwards",
            response_model=PortForwardListResponse,
            summary="Listar reglas de port forwarding",
            description="Lista todas las reglas DNAT activas en PREROUTING")
async def list_port_forwards(
    service: NATService = Depends(get_nat_service)
) -> PortForwardListResponse:
    """
    Lista todas las reglas de port forwarding activas
    
    Retorna todas las reglas DNAT configuradas en la cadena PREROUTING
    """
    try:
        rules = service.list_port_forwards()
        return PortForwardListResponse(
            success=True,
            total_count=len(rules),
            rules=rules
        )
    
    except Exception as e:
        logger.error(f"Error listando port forwards: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error obteniendo lista de reglas"
        )
