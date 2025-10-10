#!/usr/bin/env python3
"""
Modelos para Gestión de Máquinas Virtuales
TeleCluster Orchestrator - Worker Agent
"""

from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from enum import Enum


class VMState(str, Enum):
    """Estados de VM según libvirt"""
    NOSTATE = "nostate"
    RUNNING = "running"  
    BLOCKED = "blocked"
    PAUSED = "paused"
    SHUTDOWN = "shutdown"
    SHUTOFF = "shutoff"
    CRASHED = "crashed"
    PMSUSPENDED = "pmsuspended"


class DiskFormat(str, Enum):
    """Formatos de disco soportados"""
    QCOW2 = "qcow2"
    RAW = "raw"
    VDI = "vdi"
    VMDK = "vmdk"


class NetworkType(str, Enum):
    """Tipos de red para VMs"""
    BRIDGE = "bridge"
    NAT = "nat"
    ISOLATED = "isolated"
    HOSTDEV = "hostdev"


class DiskConfig(BaseModel):
    """Configuración de disco para VM"""
    path: str = Field(..., description="Ruta del archivo de disco")
    size_gb: Optional[int] = Field(None, description="Tamaño en GB (para nuevos discos)")
    format: DiskFormat = Field(DiskFormat.QCOW2, description="Formato del disco")
    bus: str = Field("virtio", description="Tipo de bus (virtio, ide, scsi)")


class NetworkConfig(BaseModel):
    """Configuración de red para VM"""
    network_type: NetworkType = Field(..., description="Tipo de conexión de red")
    source: Optional[str] = Field(None, description="Fuente de red (bridge name, network name)")
    mac_address: Optional[str] = Field(None, description="Dirección MAC específica")
    model: str = Field("virtio", description="Modelo de tarjeta de red")


class VMConfig(BaseModel):
    """Configuración completa para crear VM"""
    name: str = Field(..., description="Nombre único de la VM")
    memory_mb: int = Field(..., description="Memoria RAM en MB")
    vcpus: int = Field(..., description="Número de CPUs virtuales")
    disks: List[DiskConfig] = Field(..., description="Configuración de discos")
    networks: List[NetworkConfig] = Field(..., description="Configuración de redes")
    os_type: str = Field("linux", description="Tipo de SO (linux, windows)")
    arch: str = Field("x86_64", description="Arquitectura del procesador")
    boot_order: List[str] = Field(["hd"], description="Orden de booteo (hd, cdrom, network)")
    vnc_port: Optional[int] = Field(None, description="Puerto VNC (auto si no se especifica)")
    autostart: bool = Field(False, description="Iniciar automáticamente con el host")


class VMInfo(BaseModel):
    """Información completa de una VM"""
    name: str
    uuid: str
    state: VMState
    memory_mb: int
    memory_used_mb: int
    vcpus: int
    cpu_time: int
    autostart: bool
    persistent: bool
    vnc_port: Optional[int] = None
    networks: List[Dict[str, Any]] = []
    disks: List[Dict[str, Any]] = []
    uptime: Optional[int] = None


class VMStats(BaseModel):
    """Estadísticas de rendimiento de VM"""
    name: str
    cpu_usage_percent: float
    memory_usage_percent: float
    memory_used_mb: int
    memory_total_mb: int
    disk_read_bytes: int
    disk_write_bytes: int
    network_rx_bytes: int
    network_tx_bytes: int
    uptime_seconds: int


class VMSnapshot(BaseModel):
    """Información de snapshot de VM"""
    name: str
    vm_name: str
    created_at: str
    description: Optional[str] = None
    state: VMState
    memory_snapshot: bool = False


class VMSnapshotCreate(BaseModel):
    """Configuración para crear snapshot"""
    name: str = Field(..., description="Nombre del snapshot")
    description: Optional[str] = Field(None, description="Descripción del snapshot")
    memory: bool = Field(False, description="Incluir estado de memoria")


class VMMigrationConfig(BaseModel):
    """Configuración para migración de VM"""
    destination_host: str = Field(..., description="Host destino")
    live: bool = Field(True, description="Migración en vivo")
    compressed: bool = Field(False, description="Comprimir datos de migración")
    bandwidth_mbps: Optional[int] = Field(None, description="Ancho de banda límite en Mbps")


class VMAction(str, Enum):
    """Acciones disponibles para VMs"""
    START = "start"
    SHUTDOWN = "shutdown"
    FORCE_SHUTDOWN = "force_shutdown"
    REBOOT = "reboot"
    FORCE_REBOOT = "force_reboot"
    PAUSE = "pause"
    RESUME = "resume"
    SUSPEND = "suspend"
    RESET = "reset"


class VMActionRequest(BaseModel):
    """Request para ejecutar acción en VM"""
    action: VMAction = Field(..., description="Acción a ejecutar")
    force: bool = Field(False, description="Forzar acción si es necesario")


class HypervisorInfo(BaseModel):
    """Información del hipervisor"""
    type: str
    version: str
    hostname: str
    max_vcpus: int
    total_memory_mb: int
    used_memory_mb: int
    free_memory_mb: int
    active_vms: int
    inactive_vms: int
    cpu_count: int
    cpu_model: str
    architecture: str


class VMListFilter(BaseModel):
    """Filtros para listar VMs"""
    state: Optional[VMState] = Field(None, description="Filtrar por estado")
    name_pattern: Optional[str] = Field(None, description="Patrón de nombre (regex)")
    limit: int = Field(100, description="Límite de resultados")
    offset: int = Field(0, description="Offset para paginación")


# Responses API
class VMResponse(BaseModel):
    """Response estándar para operaciones de VM"""
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    vm_name: Optional[str] = None


class VMListResponse(BaseModel):
    """Response para listado de VMs"""
    success: bool
    total_count: int
    filtered_count: int
    vms: List[VMInfo]


class HypervisorResponse(BaseModel):
    """Response para información del hipervisor"""
    success: bool
    hypervisor: HypervisorInfo


class VMStatsResponse(BaseModel):
    """Response para estadísticas de VM"""
    success: bool
    stats: VMStats


class VMSnapshotResponse(BaseModel):
    """Response para operaciones de snapshot"""
    success: bool
    message: str
    snapshot: Optional[VMSnapshot] = None


class VMSnapshotListResponse(BaseModel):
    """Response para listado de snapshots"""
    success: bool
    vm_name: str
    snapshots: List[VMSnapshot]
