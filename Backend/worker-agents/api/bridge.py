from fastapi import APIRouter, HTTPException, status
from typing import List
import logging

from models.bridge import (
    BridgeCreateRequest, BridgeDeleteRequest, BridgeAddPortRequest, 
    BridgeRemovePortRequest, BridgeInfo, BridgeListResponse
)
from models.network import APIResponse, ResponseStatus
from services.bridge import BridgeService

# Configurar logging
logger = logging.getLogger(__name__)

# Crear router (sin prefix porque será incluido desde /network/bridge)
router = APIRouter()


@router.post("/create", response_model=APIResponse)
async def create_bridge(request: BridgeCreateRequest):
    """
    Crear un nuevo bridge de red
    
    - **name**: Nombre del bridge (máximo 15 caracteres)
    - **type**: Tipo de bridge (linux o ovs)
    - **stp**: Habilitar Spanning Tree Protocol
    """
    try:
        result = BridgeService.create_bridge(
            name=request.name,
            bridge_type=request.type,
            stp=request.stp
        )
        
        if result.get("success", False):
            return APIResponse(
                status=ResponseStatus.ok,
                message=f"Bridge {request.name} creado exitosamente",
                data=result
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Error desconocido")
            )
            
    except Exception as e:
        logger.error(f"Error en create_bridge: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )


@router.post("/delete", response_model=APIResponse)
async def delete_bridge(request: BridgeDeleteRequest):
    """
    Eliminar un bridge existente
    
    - **name**: Nombre del bridge a eliminar
    - **force**: Forzar eliminación aunque tenga interfaces conectadas
    """
    try:
        result = BridgeService.delete_bridge(
            name=request.name,
            force=request.force
        )
        
        if result.get("success", False):
            return APIResponse(
                status=ResponseStatus.ok,
                message=f"Bridge {request.name} eliminado exitosamente",
                data=result
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Error desconocido")
            )
            
    except Exception as e:
        logger.error(f"Error en delete_bridge: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )


@router.post("/add-port", response_model=APIResponse)
async def add_port_to_bridge(request: BridgeAddPortRequest):
    """
    Añadir un puerto/interfaz a un bridge
    
    - **bridge_name**: Nombre del bridge
    - **port_name**: Nombre del puerto/interfaz a añadir
    - **vlan**: VLAN ID opcional (1-4094)
    """
    try:
        result = BridgeService.add_port(
            bridge_name=request.bridge_name,
            port_name=request.port_name,
            vlan=request.vlan
        )
        
        if result.get("success", False):
            return APIResponse(
                status=ResponseStatus.ok,
                message=f"Puerto {request.port_name} añadido a bridge {request.bridge_name}",
                data=result
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Error desconocido")
            )
            
    except Exception as e:
        logger.error(f"Error en add_port_to_bridge: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )


@router.post("/remove-port", response_model=APIResponse)
async def remove_port_from_bridge(request: BridgeRemovePortRequest):
    """
    Remover un puerto/interfaz de un bridge
    
    - **bridge_name**: Nombre del bridge
    - **port_name**: Nombre del puerto/interfaz a remover
    """
    try:
        result = BridgeService.remove_port(
            bridge_name=request.bridge_name,
            port_name=request.port_name
        )
        
        if result.get("success", False):
            return APIResponse(
                status=ResponseStatus.ok,
                message=f"Puerto {request.port_name} removido de bridge {request.bridge_name}",
                data=result
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Error desconocido")
            )
            
    except Exception as e:
        logger.error(f"Error en remove_port_from_bridge: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )


@router.get("/list", response_model=BridgeListResponse)
async def list_bridges():
    """
    Listar todos los bridges existentes en el sistema
    
    Devuelve información detallada de todos los bridges (Linux y OVS)
    """
    try:
        bridges = BridgeService.list_bridges()
        return BridgeListResponse(bridges=bridges)
        
    except Exception as e:
        logger.error(f"Error en list_bridges: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listando bridges: {str(e)}"
        )


@router.get("/{bridge_name}", response_model=APIResponse)
async def get_bridge_info(bridge_name: str):
    """
    Obtener información detallada de un bridge específico
    
    - **bridge_name**: Nombre del bridge a consultar
    """
    try:
        bridge_info = BridgeService.get_bridge_info(bridge_name)
        
        if bridge_info:
            return APIResponse(
                status=ResponseStatus.ok,
                message=f"Información de bridge {bridge_name}",
                data=bridge_info
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Bridge {bridge_name} no encontrado"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en get_bridge_info: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error obteniendo información del bridge: {str(e)}"
        )
