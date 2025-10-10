from fastapi import APIRouter, HTTPException, status
from typing import List
import logging

from models.vlan import (
    VLANCreateRequest, VLANDeleteRequest, VLANAddToBridgeRequest,
    VLANRemoveFromBridgeRequest, VLANInfo, BridgeVLANInfo
)
from models.network import APIResponse, ResponseStatus
from services.vlan import VLANService

# Configurar logging
logger = logging.getLogger(__name__)

# Crear router (sin prefix porque será incluido desde /network/vlan)
router = APIRouter()


@router.post("/create", response_model=APIResponse)
async def create_vlan(request: VLANCreateRequest):
    """
    Crear una interfaz VLAN
    
    - **parent_interface**: Interfaz padre para la VLAN
    - **vlan_id**: ID de la VLAN (1-4094)
    - **name**: Nombre personalizado opcional para la interfaz VLAN
    - **protocol**: Protocolo VLAN (802.1Q o 802.1ad)
    """
    try:
        result = VLANService.create_vlan(
            parent_interface=request.parent_interface,
            vlan_id=request.vlan_id,
            name=request.name,
            protocol=request.protocol
        )
        
        if result.get("success", False):
            return APIResponse(
                status=ResponseStatus.ok,
                message=f"VLAN {request.vlan_id} creada en {request.parent_interface}",
                data=result
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Error desconocido")
            )
            
    except Exception as e:
        logger.error(f"Error en create_vlan: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )


@router.post("/delete", response_model=APIResponse)
async def delete_vlan(request: VLANDeleteRequest):
    """
    Eliminar una interfaz VLAN
    
    - **parent_interface**: Interfaz padre
    - **vlan_id**: ID de la VLAN a eliminar
    """
    try:
        result = VLANService.delete_vlan(
            parent_interface=request.parent_interface,
            vlan_id=request.vlan_id
        )
        
        if result.get("success", False):
            return APIResponse(
                status=ResponseStatus.ok,
                message=f"VLAN {request.vlan_id} eliminada de {request.parent_interface}",
                data=result
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Error desconocido")
            )
            
    except Exception as e:
        logger.error(f"Error en delete_vlan: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )


@router.post("/add-to-bridge", response_model=APIResponse)
async def add_vlan_to_bridge(request: VLANAddToBridgeRequest):
    """
    Añadir VLAN a un puerto de bridge
    
    - **bridge_name**: Nombre del bridge
    - **port_name**: Puerto del bridge
    - **vlan_id**: ID de la VLAN (1-4094)
    - **tagged**: VLAN tagged (true) o untagged (false)
    """
    try:
        result = VLANService.add_vlan_to_bridge(
            bridge_name=request.bridge_name,
            port_name=request.port_name,
            vlan_id=request.vlan_id,
            tagged=request.tagged
        )
        
        if result.get("success", False):
            return APIResponse(
                status=ResponseStatus.ok,
                message=f"VLAN {request.vlan_id} añadida al puerto {request.port_name}",
                data=result
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Error desconocido")
            )
            
    except Exception as e:
        logger.error(f"Error en add_vlan_to_bridge: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )


@router.post("/remove-from-bridge", response_model=APIResponse)
async def remove_vlan_from_bridge(request: VLANRemoveFromBridgeRequest):
    """
    Remover VLAN de un puerto de bridge
    
    - **bridge_name**: Nombre del bridge
    - **port_name**: Puerto del bridge
    - **vlan_id**: ID de la VLAN a remover
    """
    try:
        result = VLANService.remove_vlan_from_bridge(
            bridge_name=request.bridge_name,
            port_name=request.port_name,
            vlan_id=request.vlan_id
        )
        
        if result.get("success", False):
            return APIResponse(
                status=ResponseStatus.ok,
                message=f"VLAN {request.vlan_id} removida del puerto {request.port_name}",
                data=result
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Error desconocido")
            )
            
    except Exception as e:
        logger.error(f"Error en remove_vlan_from_bridge: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )


@router.get("/list", response_model=List[VLANInfo])
async def list_vlans():
    """
    Listar todas las interfaces VLAN del sistema
    
    Devuelve información detallada de todas las VLANs configuradas
    """
    try:
        vlans = VLANService.list_vlans()
        return vlans
        
    except Exception as e:
        logger.error(f"Error en list_vlans: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listando VLANs: {str(e)}"
        )


@router.get("/bridge-vlans", response_model=List[BridgeVLANInfo])
async def list_bridge_vlans():
    """
    Listar VLANs configuradas en bridges OVS
    
    Devuelve información de VLANs tagged y untagged en puertos de bridges OVS
    """
    try:
        bridge_vlans = VLANService.list_bridge_vlans()
        return bridge_vlans
        
    except Exception as e:
        logger.error(f"Error en list_bridge_vlans: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listando VLANs de bridges: {str(e)}"
        )


@router.get("/{parent_interface}/{vlan_id}", response_model=APIResponse)
async def get_vlan_info(parent_interface: str, vlan_id: int):
    """
    Obtener información detallada de una VLAN específica
    
    - **parent_interface**: Interfaz padre
    - **vlan_id**: ID de la VLAN
    """
    try:
        # Validar VLAN ID
        if vlan_id < 1 or vlan_id > 4094:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="VLAN ID debe estar entre 1 y 4094"
            )
        
        vlan_info = VLANService.get_vlan_info(parent_interface, vlan_id)
        
        if vlan_info:
            return APIResponse(
                status=ResponseStatus.ok,
                message=f"Información de VLAN {vlan_id} en {parent_interface}",
                data=vlan_info.__dict__
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"VLAN {vlan_id} no encontrada en {parent_interface}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en get_vlan_info: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error obteniendo información de VLAN: {str(e)}"
        )
