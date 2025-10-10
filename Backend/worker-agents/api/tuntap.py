from fastapi import APIRouter, HTTPException, status
from typing import List
import logging

from models.tuntap import (
    TunTapCreateRequest, TunTapDeleteRequest, TunTapAttachRequest,
    TunTapDetachRequest, TunTapInfo
)
from models.network import APIResponse, ResponseStatus
from services.tuntap import TunTapService

# Configurar logging
logger = logging.getLogger(__name__)

# Crear router (sin prefix porque será incluido desde /network/tuntap)
router = APIRouter()


@router.post("/create", response_model=APIResponse)
async def create_tuntap(request: TunTapCreateRequest):
    """
    Crear una interfaz TUN/TAP
    
    - **name**: Nombre de la interfaz (máximo 15 caracteres)
    - **type**: Tipo de interfaz (tun o tap)
    - **mode**: Modo de operación (user, group, root)
    - **owner**: Usuario propietario opcional
    - **group**: Grupo propietario opcional
    - **bridge**: Bridge para conectar (solo TAP)
    - **persistent**: Hacer la interfaz persistente
    """
    try:
        result = TunTapService.create_tuntap(
            name=request.name,
            tap_type=request.type,
            mode=request.mode,
            owner=request.owner,
            group=request.group,
            bridge=request.bridge,
            persistent=request.persistent
        )
        
        if result.get("success", False):
            return APIResponse(
                status=ResponseStatus.ok,
                message=f"Interfaz {request.type.value.upper()} {request.name} creada exitosamente",
                data=result
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Error desconocido")
            )
            
    except Exception as e:
        logger.error(f"Error en create_tuntap: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )


@router.post("/delete", response_model=APIResponse)
async def delete_tuntap(request: TunTapDeleteRequest):
    """
    Eliminar una interfaz TUN/TAP
    
    - **name**: Nombre de la interfaz a eliminar
    """
    try:
        result = TunTapService.delete_tuntap(request.name)
        
        if result.get("success", False):
            return APIResponse(
                status=ResponseStatus.ok,
                message=f"Interfaz {request.name} eliminada exitosamente",
                data=result
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Error desconocido")
            )
            
    except Exception as e:
        logger.error(f"Error en delete_tuntap: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )


@router.post("/attach", response_model=APIResponse)
async def attach_tap_to_bridge(request: TunTapAttachRequest):
    """
    Conectar interfaz TAP a un bridge
    
    - **tap_name**: Nombre de la interfaz TAP
    - **bridge_name**: Nombre del bridge destino
    """
    try:
        result = TunTapService.attach_to_bridge(
            tap_name=request.tap_name,
            bridge_name=request.bridge_name
        )
        
        if result.get("success", False):
            return APIResponse(
                status=ResponseStatus.ok,
                message=f"TAP {request.tap_name} conectado a bridge {request.bridge_name}",
                data=result
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Error desconocido")
            )
            
    except Exception as e:
        logger.error(f"Error en attach_tap_to_bridge: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )


@router.post("/detach", response_model=APIResponse)
async def detach_tap_from_bridge(request: TunTapDetachRequest):
    """
    Desconectar interfaz TAP de un bridge
    
    - **tap_name**: Nombre de la interfaz TAP a desconectar
    """
    try:
        result = TunTapService.detach_from_bridge(request.tap_name)
        
        if result.get("success", False):
            return APIResponse(
                status=ResponseStatus.ok,
                message=f"TAP {request.tap_name} desconectado del bridge",
                data=result
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Error desconocido")
            )
            
    except Exception as e:
        logger.error(f"Error en detach_tap_from_bridge: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )


@router.post("/{interface_name}/set-ip", response_model=APIResponse)
async def set_interface_ip(interface_name: str, ip_address: str, netmask: str = "24"):
    """
    Asignar dirección IP a interfaz TUN/TAP
    
    - **interface_name**: Nombre de la interfaz
    - **ip_address**: Dirección IP a asignar
    - **netmask**: Máscara de red (por defecto 24)
    """
    try:
        result = TunTapService.set_interface_ip(
            interface_name=interface_name,
            ip_address=ip_address,
            netmask=netmask
        )
        
        if result.get("success", False):
            return APIResponse(
                status=ResponseStatus.ok,
                message=f"IP {ip_address}/{netmask} asignada a {interface_name}",
                data=result
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Error desconocido")
            )
            
    except Exception as e:
        logger.error(f"Error en set_interface_ip: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )


@router.delete("/{interface_name}/remove-ip", response_model=APIResponse)
async def remove_interface_ip(interface_name: str, ip_address: str, netmask: str = "24"):
    """
    Remover dirección IP de interfaz TUN/TAP
    
    - **interface_name**: Nombre de la interfaz
    - **ip_address**: Dirección IP a remover
    - **netmask**: Máscara de red (por defecto 24)
    """
    try:
        result = TunTapService.remove_interface_ip(
            interface_name=interface_name,
            ip_address=ip_address,
            netmask=netmask
        )
        
        if result.get("success", False):
            return APIResponse(
                status=ResponseStatus.ok,
                message=f"IP {ip_address}/{netmask} removida de {interface_name}",
                data=result
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Error desconocido")
            )
            
    except Exception as e:
        logger.error(f"Error en remove_interface_ip: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )


@router.get("/list", response_model=List[TunTapInfo])
async def list_tuntaps():
    """
    Listar todas las interfaces TUN/TAP del sistema
    
    Devuelve información detallada de todas las interfaces TUN/TAP
    """
    try:
        tuntaps = TunTapService.list_tuntaps()
        return tuntaps
        
    except Exception as e:
        logger.error(f"Error en list_tuntaps: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listando interfaces TUN/TAP: {str(e)}"
        )


@router.get("/{interface_name}", response_model=APIResponse)
async def get_tuntap_info(interface_name: str):
    """
    Obtener información detallada de una interfaz TUN/TAP específica
    
    - **interface_name**: Nombre de la interfaz a consultar
    """
    try:
        tuntap_info = TunTapService.get_tuntap_info(interface_name)
        
        if tuntap_info:
            return APIResponse(
                status=ResponseStatus.ok,
                message=f"Información de interfaz {interface_name}",
                data=tuntap_info.__dict__
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Interfaz {interface_name} no encontrada o no es TUN/TAP"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en get_tuntap_info: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error obteniendo información de la interfaz: {str(e)}"
        )
