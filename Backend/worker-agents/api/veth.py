from fastapi import APIRouter, HTTPException, status
from typing import List
import logging

from models.veth import VethCreateRequest, VethDeleteRequest, VethMoveRequest, VethInfo
from models.network import APIResponse, ResponseStatus
from services.veth import VethService

# Configurar logging
logger = logging.getLogger(__name__)

# Crear router (sin prefix porque será incluido desde /network/veth)
router = APIRouter()


@router.post("/create", response_model=APIResponse)
async def create_veth_pair(request: VethCreateRequest):
    """
    Crear un par veth
    
    - **name1**: Nombre del primer extremo del par veth
    - **name2**: Nombre del segundo extremo del par veth
    - **bridge1**: Bridge opcional para conectar el primer extremo
    - **bridge2**: Bridge opcional para conectar el segundo extremo
    - **namespace1**: Namespace opcional para mover el primer extremo
    - **namespace2**: Namespace opcional para mover el segundo extremo
    """
    try:
        result = VethService.create_veth_pair(
            name1=request.name1,
            name2=request.name2,
            bridge1=request.bridge1,
            bridge2=request.bridge2,
            namespace1=request.namespace1,
            namespace2=request.namespace2
        )
        
        if result.get("success", False):
            return APIResponse(
                status=ResponseStatus.ok,
                message=f"Par veth creado: {request.name1} <-> {request.name2}",
                data=result
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Error desconocido")
            )
            
    except Exception as e:
        logger.error(f"Error en create_veth_pair: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )


@router.post("/delete", response_model=APIResponse)
async def delete_veth_pair(request: VethDeleteRequest):
    """
    Eliminar un par veth
    
    - **name**: Nombre de cualquier extremo del par veth (elimina todo el par)
    """
    try:
        result = VethService.delete_veth_pair(request.name)
        
        if result.get("success", False):
            return APIResponse(
                status=ResponseStatus.ok,
                message=f"Par veth eliminado: {request.name}",
                data=result
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Error desconocido")
            )
            
    except Exception as e:
        logger.error(f"Error en delete_veth_pair: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )


@router.post("/move-to-bridge", response_model=APIResponse)
async def move_veth_to_bridge(request: VethMoveRequest):
    """
    Mover un extremo veth a otro bridge
    
    - **veth_name**: Nombre del extremo veth a mover
    - **target_bridge**: Bridge destino
    """
    try:
        if not request.target_bridge:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="target_bridge es requerido"
            )
        
        result = VethService.move_veth_to_bridge(
            veth_name=request.veth_name,
            bridge_name=request.target_bridge
        )
        
        if result.get("success", False):
            return APIResponse(
                status=ResponseStatus.ok,
                message=f"Veth {request.veth_name} movido a bridge {request.target_bridge}",
                data=result
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Error desconocido")
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en move_veth_to_bridge: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )


@router.post("/move-to-namespace", response_model=APIResponse)
async def move_veth_to_namespace(request: VethMoveRequest):
    """
    Mover un extremo veth a un namespace
    
    - **veth_name**: Nombre del extremo veth a mover
    - **target_namespace**: Namespace destino
    """
    try:
        if not request.target_namespace:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="target_namespace es requerido"
            )
        
        result = VethService.move_veth_to_namespace(
            veth_name=request.veth_name,
            namespace=request.target_namespace
        )
        
        if result.get("success", False):
            return APIResponse(
                status=ResponseStatus.ok,
                message=f"Veth {request.veth_name} movido a namespace {request.target_namespace}",
                data=result
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Error desconocido")
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en move_veth_to_namespace: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )


@router.get("/list", response_model=List[VethInfo])
async def list_veth_pairs():
    """
    Listar todos los pares veth existentes en el sistema
    
    Devuelve información detallada de todos los pares veth
    """
    try:
        veth_pairs = VethService.list_veth_pairs()
        return veth_pairs
        
    except Exception as e:
        logger.error(f"Error en list_veth_pairs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listando pares veth: {str(e)}"
        )


@router.get("/{veth_name}", response_model=APIResponse)
async def get_veth_info(veth_name: str):
    """
    Obtener información detallada de un veth específico
    
    - **veth_name**: Nombre del veth a consultar
    """
    try:
        veth_info = VethService.get_veth_info(veth_name)
        
        if veth_info:
            return APIResponse(
                status=ResponseStatus.ok,
                message=f"Información de veth {veth_name}",
                data=veth_info.__dict__
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Veth {veth_name} no encontrado"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en get_veth_info: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error obteniendo información del veth: {str(e)}"
        )
