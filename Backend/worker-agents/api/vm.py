#!/usr/bin/env python3
"""
API REST para Gestión de Máquinas Virtuales
TeleCluster Orchestrator - Worker Agent
"""

from fastapi import APIRouter, HTTPException, status, Query, Path
from typing import List, Optional
import logging

from models.vm import (
    VMConfig, VMInfo, VMStats, VMSnapshot, VMSnapshotCreate,
    VMMigrationConfig, VMAction, VMActionRequest, HypervisorInfo,
    VMListFilter, VMResponse, VMListResponse, HypervisorResponse,
    VMStatsResponse, VMSnapshotResponse, VMSnapshotListResponse
)
from services.vm import VMService

# Configurar logging
logger = logging.getLogger(__name__)

# Crear router (sin prefix porque será incluido desde /vm)
router = APIRouter()

# Servicio de VMs
vm_service = VMService()


@router.get("/hypervisor", 
            response_model=HypervisorResponse,
            summary="Información del Hipervisor",
            description="Obtiene información detallada del hipervisor y recursos del sistema")
async def get_hypervisor_info():
    """Obtener información del hipervisor"""
    try:
        hypervisor = vm_service.get_hypervisor_info()
        return HypervisorResponse(success=True, hypervisor=hypervisor)
    except Exception as e:
        logger.error(f"Error obteniendo info del hipervisor: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error obteniendo información del hipervisor: {str(e)}"
        )


@router.get("/list",
            response_model=VMListResponse,
            summary="Listar Máquinas Virtuales",
            description="Lista todas las VMs con filtros opcionales")
async def list_vms(
    state: Optional[str] = Query(None, description="Filtrar por estado"),
    name_pattern: Optional[str] = Query(None, description="Patrón de nombre (regex)"),
    limit: int = Query(100, description="Límite de resultados", ge=1, le=1000),
    offset: int = Query(0, description="Offset para paginación", ge=0)
):
    """Listar VMs con filtros opcionales"""
    try:
        filters = VMListFilter(
            state=state,
            name_pattern=name_pattern,
            limit=limit,
            offset=offset
        )
        
        vms = vm_service.list_vms(filters)
        total_count = len(vm_service.list_vms())  # Sin filtros para total
        
        return VMListResponse(
            success=True,
            total_count=total_count,
            filtered_count=len(vms),
            vms=vms
        )
    except Exception as e:
        logger.error(f"Error listando VMs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listando VMs: {str(e)}"
        )


@router.get("/{vm_name}",
            response_model=VMResponse,
            summary="Información de VM",
            description="Obtiene información detallada de una VM específica")
async def get_vm_info(
    vm_name: str = Path(..., description="Nombre de la VM")
):
    """Obtener información de una VM específica"""
    try:
        vm_info = vm_service.get_vm_info(vm_name)
        return VMResponse(
            success=True,
            message="Información de VM obtenida",
            data=vm_info.dict(),
            vm_name=vm_name
        )
    except RuntimeError as e:
        if "no encontrada" in str(e):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error obteniendo info de VM {vm_name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error obteniendo información de VM: {str(e)}"
        )


@router.post("/create",
             response_model=VMResponse,
             summary="Crear Máquina Virtual",
             description="Crea una nueva máquina virtual con la configuración especificada")
async def create_vm(config: VMConfig):
    """Crear nueva VM"""
    try:
        vm_uuid = vm_service.create_vm(config)
        return VMResponse(
            success=True,
            message=f"VM '{config.name}' creada exitosamente",
            data={"uuid": vm_uuid, "name": config.name},
            vm_name=config.name
        )
    except RuntimeError as e:
        if "Ya existe" in str(e):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=str(e)
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error creando VM {config.name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creando VM: {str(e)}"
        )


@router.post("/{vm_name}/action",
             response_model=VMResponse,
             summary="Ejecutar Acción en VM",
             description="Ejecuta una acción específica en la VM (start, stop, reboot, etc.)")
async def execute_vm_action(
    vm_name: str = Path(..., description="Nombre de la VM"),
    action_request: VMActionRequest = ...
):
    """Ejecutar acción en VM"""
    try:
        result = vm_service.execute_vm_action(
            vm_name, 
            action_request.action, 
            action_request.force
        )
        return VMResponse(
            success=True,
            message=result,
            vm_name=vm_name
        )
    except RuntimeError as e:
        if "no encontrada" in str(e):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error ejecutando acción {action_request.action} en VM {vm_name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error ejecutando acción: {str(e)}"
        )


@router.delete("/{vm_name}",
               response_model=VMResponse,
               summary="Eliminar VM",
               description="Elimina una VM y opcionalmente sus discos")
async def delete_vm(
    vm_name: str = Path(..., description="Nombre de la VM"),
    remove_disks: bool = Query(False, description="Eliminar también los archivos de disco")
):
    """Eliminar VM"""
    try:
        result = vm_service.delete_vm(vm_name, remove_disks)
        return VMResponse(
            success=True,
            message=result,
            vm_name=vm_name
        )
    except RuntimeError as e:
        if "no encontrada" in str(e):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error eliminando VM {vm_name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error eliminando VM: {str(e)}"
        )


@router.get("/{vm_name}/stats",
            response_model=VMStatsResponse,
            summary="Estadísticas de VM",
            description="Obtiene estadísticas de rendimiento en tiempo real de una VM")
async def get_vm_stats(
    vm_name: str = Path(..., description="Nombre de la VM")
):
    """Obtener estadísticas de VM"""
    try:
        stats = vm_service.get_vm_stats(vm_name)
        return VMStatsResponse(success=True, stats=stats)
    except RuntimeError as e:
        if "no encontrada" in str(e) or "no está ejecutándose" in str(e):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error obteniendo estadísticas de VM {vm_name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error obteniendo estadísticas: {str(e)}"
        )


# Endpoints de Snapshots
@router.post("/{vm_name}/snapshots",
             response_model=VMSnapshotResponse,
             summary="Crear Snapshot",
             description="Crea un snapshot de la VM")
async def create_snapshot(
    vm_name: str = Path(..., description="Nombre de la VM"),
    snapshot_config: VMSnapshotCreate = ...
):
    """Crear snapshot de VM"""
    try:
        snapshot = vm_service.create_snapshot(vm_name, snapshot_config)
        return VMSnapshotResponse(
            success=True,
            message=f"Snapshot '{snapshot_config.name}' creado",
            snapshot=snapshot
        )
    except RuntimeError as e:
        if "no encontrada" in str(e):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error creando snapshot en VM {vm_name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creando snapshot: {str(e)}"
        )


@router.get("/{vm_name}/snapshots",
            response_model=VMSnapshotListResponse,
            summary="Listar Snapshots",
            description="Lista todos los snapshots de una VM")
async def list_snapshots(
    vm_name: str = Path(..., description="Nombre de la VM")
):
    """Listar snapshots de VM"""
    try:
        snapshots = vm_service.list_snapshots(vm_name)
        return VMSnapshotListResponse(
            success=True,
            vm_name=vm_name,
            snapshots=snapshots
        )
    except RuntimeError as e:
        if "no encontrada" in str(e):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error listando snapshots de VM {vm_name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listando snapshots: {str(e)}"
        )


@router.post("/{vm_name}/snapshots/{snapshot_name}/restore",
             response_model=VMResponse,
             summary="Restaurar Snapshot",
             description="Restaura la VM al estado de un snapshot específico")
async def restore_snapshot(
    vm_name: str = Path(..., description="Nombre de la VM"),
    snapshot_name: str = Path(..., description="Nombre del snapshot")
):
    """Restaurar VM desde snapshot"""
    try:
        result = vm_service.restore_snapshot(vm_name, snapshot_name)
        return VMResponse(
            success=True,
            message=result,
            vm_name=vm_name
        )
    except RuntimeError as e:
        if "no encontrada" in str(e):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error restaurando snapshot {snapshot_name} de VM {vm_name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error restaurando snapshot: {str(e)}"
        )


@router.delete("/{vm_name}/snapshots/{snapshot_name}",
               response_model=VMResponse,
               summary="Eliminar Snapshot",
               description="Elimina un snapshot específico de la VM")
async def delete_snapshot(
    vm_name: str = Path(..., description="Nombre de la VM"),
    snapshot_name: str = Path(..., description="Nombre del snapshot")
):
    """Eliminar snapshot de VM"""
    try:
        result = vm_service.delete_snapshot(vm_name, snapshot_name)
        return VMResponse(
            success=True,
            message=result,
            vm_name=vm_name
        )
    except RuntimeError as e:
        if "no encontrada" in str(e):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error eliminando snapshot {snapshot_name} de VM {vm_name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error eliminando snapshot: {str(e)}"
        )


@router.post("/{vm_name}/migrate",
             response_model=VMResponse,
             summary="Migrar VM",
             description="Migra la VM a otro host")
async def migrate_vm(
    vm_name: str = Path(..., description="Nombre de la VM"),
    migration_config: VMMigrationConfig = ...
):
    """Migrar VM a otro host"""
    try:
        result = vm_service.migrate_vm(vm_name, migration_config)
        return VMResponse(
            success=True,
            message=result,
            vm_name=vm_name
        )
    except RuntimeError as e:
        if "no encontrada" in str(e):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error migrando VM {vm_name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error migrando VM: {str(e)}"
        )
