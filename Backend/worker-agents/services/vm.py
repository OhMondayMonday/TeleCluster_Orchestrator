#!/usr/bin/env python3
"""
Servicio de Gestión de Máquinas Virtuales usando libvirt
TeleCluster Orchestrator - Worker Agent
"""

import libvirt
import xml.etree.ElementTree as ET
from typing import List, Dict, Optional, Any
import logging
import time
import subprocess
import os
import re
from pathlib import Path

from models.vm import (
    VMConfig, VMInfo, VMState, VMStats, VMSnapshot, VMSnapshotCreate,
    VMMigrationConfig, VMAction, HypervisorInfo, VMListFilter,
    DiskConfig, NetworkConfig
)


class VMService:
    """Servicio para gestión de VMs con libvirt"""
    
    def __init__(self, connection_uri: str = "qemu:///system"):
        """
        Inicializar servicio de VMs
        
        Args:
            connection_uri: URI de conexión a libvirt
        """
        self.connection_uri = connection_uri
        self.conn = None
        self.logger = logging.getLogger(__name__)
        
    def _get_connection(self) -> libvirt.virConnect:
        """Obtener conexión a libvirt (lazy loading)"""
        if self.conn is None or not self.conn.isAlive():
            try:
                self.conn = libvirt.open(self.connection_uri)
                self.logger.info(f"Conectado a libvirt: {self.connection_uri}")
            except libvirt.libvirtError as e:
                self.logger.error(f"Error conectando a libvirt: {e}")
                raise RuntimeError(f"No se pudo conectar a libvirt: {e}")
        return self.conn
    
    def _vm_state_to_enum(self, state_int: int) -> VMState:
        """Convertir estado entero de libvirt a enum"""
        state_map = {
            libvirt.VIR_DOMAIN_NOSTATE: VMState.NOSTATE,
            libvirt.VIR_DOMAIN_RUNNING: VMState.RUNNING,
            libvirt.VIR_DOMAIN_BLOCKED: VMState.BLOCKED,
            libvirt.VIR_DOMAIN_PAUSED: VMState.PAUSED,
            libvirt.VIR_DOMAIN_SHUTDOWN: VMState.SHUTDOWN,
            libvirt.VIR_DOMAIN_SHUTOFF: VMState.SHUTOFF,
            libvirt.VIR_DOMAIN_CRASHED: VMState.CRASHED,
            libvirt.VIR_DOMAIN_PMSUSPENDED: VMState.PMSUSPENDED,
        }
        return state_map.get(state_int, VMState.NOSTATE)
    
    def get_hypervisor_info(self) -> HypervisorInfo:
        """Obtener información del hipervisor"""
        try:
            conn = self._get_connection()
            
            # Información básica
            hv_type = conn.getType()
            version = conn.getVersion()
            hostname = conn.getHostname()
            
            # Información de CPU
            host_info = conn.getInfo()
            cpu_model = host_info[0]
            memory_mb = host_info[1]
            cpu_count = host_info[2]
            
            # Arquitectura
            capabilities = conn.getCapabilities()
            cap_xml = ET.fromstring(capabilities)
            arch = cap_xml.find(".//arch").text if cap_xml.find(".//arch") is not None else "unknown"
            
            # Contar VMs
            active_vms = len(conn.listDomainsID())
            inactive_vms = len(conn.listDefinedDomains())
            
            # Memoria libre
            free_memory = conn.getFreeMemory() // (1024 * 1024)  # Convertir a MB
            used_memory = memory_mb - free_memory
            
            return HypervisorInfo(
                type=hv_type,
                version=str(version),
                hostname=hostname,
                max_vcpus=conn.getMaxVcpus(None),
                total_memory_mb=memory_mb,
                used_memory_mb=used_memory,
                free_memory_mb=free_memory,
                active_vms=active_vms,
                inactive_vms=inactive_vms,
                cpu_count=cpu_count,
                cpu_model=cpu_model,
                architecture=arch
            )
            
        except Exception as e:
            self.logger.error(f"Error obteniendo info del hipervisor: {e}")
            raise RuntimeError(f"Error obteniendo información del hipervisor: {e}")
    
    def list_vms(self, filters: Optional[VMListFilter] = None) -> List[VMInfo]:
        """Listar todas las VMs con filtros opcionales"""
        try:
            conn = self._get_connection()
            all_vms = []
            
            # Obtener VMs activas
            for domain_id in conn.listDomainsID():
                domain = conn.lookupByID(domain_id)
                vm_info = self._get_vm_info(domain)
                all_vms.append(vm_info)
            
            # Obtener VMs inactivas
            for domain_name in conn.listDefinedDomains():
                domain = conn.lookupByName(domain_name)
                vm_info = self._get_vm_info(domain)
                all_vms.append(vm_info)
            
            # Aplicar filtros
            if filters:
                filtered_vms = []
                for vm in all_vms:
                    # Filtrar por estado
                    if filters.state and vm.state != filters.state:
                        continue
                    
                    # Filtrar por patrón de nombre
                    if filters.name_pattern and not re.search(filters.name_pattern, vm.name):
                        continue
                    
                    filtered_vms.append(vm)
                
                # Aplicar paginación
                start_idx = filters.offset
                end_idx = start_idx + filters.limit
                all_vms = filtered_vms[start_idx:end_idx]
            
            return all_vms
            
        except Exception as e:
            self.logger.error(f"Error listando VMs: {e}")
            raise RuntimeError(f"Error listando VMs: {e}")
    
    def _get_vm_info(self, domain: libvirt.virDomain) -> VMInfo:
        """Obtener información detallada de una VM"""
        try:
            info = domain.info()
            xml_desc = domain.XMLDesc()
            xml_root = ET.fromstring(xml_desc)
            
            # Información básica
            vm_info = VMInfo(
                name=domain.name(),
                uuid=domain.UUIDString(),
                state=self._vm_state_to_enum(info[0]),
                memory_mb=info[1] // 1024,
                memory_used_mb=info[2] // 1024,
                vcpus=info[3],
                cpu_time=info[4],
                autostart=bool(domain.autostart()),
                persistent=domain.isPersistent()
            )
            
            # Buscar puerto VNC
            graphics = xml_root.find(".//graphics[@type='vnc']")
            if graphics is not None:
                vm_info.vnc_port = int(graphics.get('port', 0))
            
            # Información de redes
            interfaces = xml_root.findall(".//interface")
            networks = []
            for iface in interfaces:
                net_info = {
                    "type": iface.get("type"),
                    "mac": iface.find("mac").get("address") if iface.find("mac") is not None else None,
                    "source": None
                }
                
                # Obtener fuente según tipo
                source = iface.find("source")
                if source is not None:
                    if net_info["type"] == "bridge":
                        net_info["source"] = source.get("bridge")
                    elif net_info["type"] == "network":
                        net_info["source"] = source.get("network")
                
                networks.append(net_info)
            vm_info.networks = networks
            
            # Información de discos
            disks = []
            disk_elements = xml_root.findall(".//disk[@type='file']")
            for disk in disk_elements:
                source = disk.find("source")
                target = disk.find("target")
                if source is not None and target is not None:
                    disk_info = {
                        "path": source.get("file"),
                        "device": target.get("dev"),
                        "bus": target.get("bus"),
                        "type": disk.get("device", "disk")
                    }
                    disks.append(disk_info)
            vm_info.disks = disks
            
            # Calcular uptime si está corriendo
            if vm_info.state == VMState.RUNNING:
                vm_info.uptime = int(time.time())  # Placeholder - libvirt no tiene uptime directo
            
            return vm_info
            
        except Exception as e:
            self.logger.error(f"Error obteniendo info de VM {domain.name()}: {e}")
            raise RuntimeError(f"Error obteniendo información de VM: {e}")
    
    def get_vm_info(self, vm_name: str) -> VMInfo:
        """Obtener información de una VM específica"""
        try:
            conn = self._get_connection()
            domain = conn.lookupByName(vm_name)
            return self._get_vm_info(domain)
        except libvirt.libvirtError:
            raise RuntimeError(f"VM '{vm_name}' no encontrada")
    
    def create_vm(self, config: VMConfig) -> str:
        """Crear una nueva VM"""
        try:
            conn = self._get_connection()
            
            # Verificar que no existe VM con el mismo nombre
            try:
                conn.lookupByName(config.name)
                raise RuntimeError(f"Ya existe una VM con el nombre '{config.name}'")
            except libvirt.libvirtError:
                pass  # VM no existe, podemos continuar
            
            # Generar XML de la VM
            vm_xml = self._generate_vm_xml(config)
            
            # Crear discos si es necesario
            self._create_vm_disks(config.disks)
            
            # Definir VM
            domain = conn.defineXML(vm_xml)
            
            # Configurar autostart
            if config.autostart:
                domain.setAutostart(True)
            
            self.logger.info(f"VM '{config.name}' creada exitosamente")
            return domain.UUIDString()
            
        except Exception as e:
            self.logger.error(f"Error creando VM '{config.name}': {e}")
            raise RuntimeError(f"Error creando VM: {e}")
    
    def _generate_vm_xml(self, config: VMConfig) -> str:
        """Generar XML de configuración de VM"""
        # XML base
        xml = f"""<domain type='kvm'>
  <name>{config.name}</name>
  <memory unit='MiB'>{config.memory_mb}</memory>
  <vcpu placement='static'>{config.vcpus}</vcpu>
  <os>
    <type arch='{config.arch}' machine='pc'>hvm</type>"""
        
        # Orden de boot
        for boot_dev in config.boot_order:
            xml += f"\n    <boot dev='{boot_dev}'/>"
        
        xml += """
  </os>
  <features>
    <acpi/>
    <apic/>
  </features>
  <cpu mode='host-model'/>
  <clock offset='utc'/>
  <on_poweroff>destroy</on_poweroff>
  <on_reboot>restart</on_reboot>
  <on_crash>destroy</on_crash>
  <devices>
    <emulator>/usr/bin/qemu-system-x86_64</emulator>"""
        
        # Agregar discos
        for i, disk in enumerate(config.disks):
            target_dev = f"vd{'abcdefghijklmnopqrstuvwxyz'[i]}"
            xml += f"""
    <disk type='file' device='disk'>
      <driver name='qemu' type='{disk.format.value}'/>
      <source file='{disk.path}'/>
      <target dev='{target_dev}' bus='{disk.bus}'/>
    </disk>"""
        
        # Agregar interfaces de red
        for net in config.networks:
            xml += f"""
    <interface type='{net.network_type.value}'>"""
            
            if net.mac_address:
                xml += f"\n      <mac address='{net.mac_address}'/>"
            
            if net.source:
                if net.network_type.value == "bridge":
                    xml += f"\n      <source bridge='{net.source}'/>"
                elif net.network_type.value == "network":
                    xml += f"\n      <source network='{net.source}'/>"
            
            xml += f"""
      <model type='{net.model}'/>
    </interface>"""
        
        # Agregar VNC si se especifica puerto
        if config.vnc_port:
            xml += f"""
    <graphics type='vnc' port='{config.vnc_port}' autoport='no' listen='0.0.0.0'/>"""
        else:
            xml += """
    <graphics type='vnc' port='-1' autoport='yes' listen='0.0.0.0'/>"""
        
        xml += """
    <console type='pty'>
      <target type='serial' port='0'/>
    </console>
  </devices>
</domain>"""
        
        return xml
    
    def _create_vm_disks(self, disks: List[DiskConfig]) -> None:
        """Crear archivos de disco para la VM"""
        for disk in disks:
            disk_path = Path(disk.path)
            
            # Crear directorio si no existe
            disk_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Si el disco no existe y se especifica tamaño, crearlo
            if not disk_path.exists() and disk.size_gb:
                self.logger.info(f"Creando disco {disk.path} ({disk.size_gb}GB)")
                
                cmd = [
                    "qemu-img", "create", 
                    "-f", disk.format.value,
                    str(disk.path),
                    f"{disk.size_gb}G"
                ]
                
                result = subprocess.run(cmd, capture_output=True, text=True)
                if result.returncode != 0:
                    raise RuntimeError(f"Error creando disco {disk.path}: {result.stderr}")
    
    def execute_vm_action(self, vm_name: str, action: VMAction, force: bool = False) -> str:
        """Ejecutar acción en una VM"""
        try:
            conn = self._get_connection()
            domain = conn.lookupByName(vm_name)
            
            if action == VMAction.START:
                if domain.isActive():
                    return "VM ya está ejecutándose"
                domain.create()
                return "VM iniciada"
                
            elif action == VMAction.SHUTDOWN:
                if not domain.isActive():
                    return "VM ya está apagada"
                if force:
                    domain.destroy()
                    return "VM apagada forzadamente"
                else:
                    domain.shutdown()
                    return "Shutdown enviado a la VM"
                    
            elif action == VMAction.FORCE_SHUTDOWN:
                domain.destroy()
                return "VM apagada forzadamente"
                
            elif action == VMAction.REBOOT:
                if not domain.isActive():
                    return "VM no está ejecutándose"
                if force:
                    domain.reset()
                    return "VM reseteada"
                else:
                    domain.reboot()
                    return "Reboot enviado a la VM"
                    
            elif action == VMAction.FORCE_REBOOT:
                domain.reset()
                return "VM reseteada forzadamente"
                
            elif action == VMAction.PAUSE:
                if not domain.isActive():
                    return "VM no está ejecutándose"
                domain.suspend()
                return "VM pausada"
                
            elif action == VMAction.RESUME:
                domain.resume()
                return "VM reanudada"
                
            elif action == VMAction.SUSPEND:
                domain.managedSave()
                return "VM suspendida a disco"
                
            elif action == VMAction.RESET:
                domain.reset()
                return "VM reseteada"
                
            else:
                raise ValueError(f"Acción '{action}' no soportada")
                
        except libvirt.libvirtError as e:
            raise RuntimeError(f"Error ejecutando acción '{action}' en VM '{vm_name}': {e}")
    
    def delete_vm(self, vm_name: str, remove_disks: bool = False) -> str:
        """Eliminar una VM"""
        try:
            conn = self._get_connection()
            domain = conn.lookupByName(vm_name)
            
            # Obtener paths de discos antes de eliminar
            disk_paths = []
            if remove_disks:
                vm_info = self._get_vm_info(domain)
                disk_paths = [disk["path"] for disk in vm_info.disks if disk.get("path")]
            
            # Apagar VM si está ejecutándose
            if domain.isActive():
                domain.destroy()
            
            # Eliminar definición
            domain.undefine()
            
            # Eliminar archivos de disco si se solicita
            if remove_disks:
                for disk_path in disk_paths:
                    try:
                        os.remove(disk_path)
                        self.logger.info(f"Disco eliminado: {disk_path}")
                    except OSError as e:
                        self.logger.warning(f"No se pudo eliminar disco {disk_path}: {e}")
            
            self.logger.info(f"VM '{vm_name}' eliminada")
            return "VM eliminada exitosamente"
            
        except libvirt.libvirtError as e:
            raise RuntimeError(f"Error eliminando VM '{vm_name}': {e}")
    
    def get_vm_stats(self, vm_name: str) -> VMStats:
        """Obtener estadísticas de rendimiento de una VM"""
        try:
            conn = self._get_connection()
            domain = conn.lookupByName(vm_name)
            
            if not domain.isActive():
                raise RuntimeError(f"VM '{vm_name}' no está ejecutándose")
            
            # Información básica
            info = domain.info()
            
            # Estadísticas de CPU (placeholder - requiere implementación más compleja)
            cpu_stats = domain.getCPUStats(True)
            cpu_usage = 0.0  # Placeholder
            
            # Estadísticas de memoria
            memory_stats = domain.memoryStats()
            memory_used = memory_stats.get('rss', info[2]) * 1024  # KB to bytes
            memory_total = info[1] * 1024 * 1024  # MB to bytes
            memory_usage_percent = (memory_used / memory_total) * 100 if memory_total > 0 else 0
            
            # Estadísticas de disco (placeholder)
            disk_read_bytes = 0
            disk_write_bytes = 0
            
            # Estadísticas de red (placeholder)
            network_rx_bytes = 0
            network_tx_bytes = 0
            
            # Uptime (placeholder)
            uptime_seconds = int(time.time())
            
            return VMStats(
                name=vm_name,
                cpu_usage_percent=cpu_usage,
                memory_usage_percent=memory_usage_percent,
                memory_used_mb=memory_used // (1024 * 1024),
                memory_total_mb=memory_total // (1024 * 1024),
                disk_read_bytes=disk_read_bytes,
                disk_write_bytes=disk_write_bytes,
                network_rx_bytes=network_rx_bytes,
                network_tx_bytes=network_tx_bytes,
                uptime_seconds=uptime_seconds
            )
            
        except libvirt.libvirtError as e:
            raise RuntimeError(f"Error obteniendo estadísticas de VM '{vm_name}': {e}")
    
    def create_snapshot(self, vm_name: str, snapshot_config: VMSnapshotCreate) -> VMSnapshot:
        """Crear snapshot de una VM"""
        try:
            conn = self._get_connection()
            domain = conn.lookupByName(vm_name)
            
            # Generar XML del snapshot
            snapshot_xml = f"""<domainsnapshot>
  <name>{snapshot_config.name}</name>
  <description>{snapshot_config.description or ''}</description>
</domainsnapshot>"""
            
            # Crear snapshot
            flags = 0
            if snapshot_config.memory and domain.isActive():
                flags |= libvirt.VIR_DOMAIN_SNAPSHOT_CREATE_LIVE
            
            snapshot = domain.snapshotCreateXML(snapshot_xml, flags)
            
            # Obtener información del snapshot
            snap_xml = snapshot.getXMLDesc()
            snap_root = ET.fromstring(snap_xml)
            
            created_at = snap_root.find("creationTime").text if snap_root.find("creationTime") is not None else str(int(time.time()))
            
            return VMSnapshot(
                name=snapshot_config.name,
                vm_name=vm_name,
                created_at=created_at,
                description=snapshot_config.description,
                state=self._vm_state_to_enum(domain.info()[0]),
                memory_snapshot=snapshot_config.memory
            )
            
        except libvirt.libvirtError as e:
            raise RuntimeError(f"Error creando snapshot de VM '{vm_name}': {e}")
    
    def list_snapshots(self, vm_name: str) -> List[VMSnapshot]:
        """Listar snapshots de una VM"""
        try:
            conn = self._get_connection()
            domain = conn.lookupByName(vm_name)
            
            snapshots = []
            for snap in domain.listAllSnapshots():
                snap_xml = snap.getXMLDesc()
                snap_root = ET.fromstring(snap_xml)
                
                name = snap_root.find("name").text
                description_elem = snap_root.find("description")
                description = description_elem.text if description_elem is not None else None
                created_at = snap_root.find("creationTime").text if snap_root.find("creationTime") is not None else str(int(time.time()))
                
                # Determinar si tiene memoria
                memory_snapshot = snap_root.find("memory") is not None
                
                snapshots.append(VMSnapshot(
                    name=name,
                    vm_name=vm_name,
                    created_at=created_at,
                    description=description,
                    state=VMState.SHUTOFF,  # Los snapshots no tienen estado activo
                    memory_snapshot=memory_snapshot
                ))
            
            return snapshots
            
        except libvirt.libvirtError as e:
            raise RuntimeError(f"Error listando snapshots de VM '{vm_name}': {e}")
    
    def restore_snapshot(self, vm_name: str, snapshot_name: str) -> str:
        """Restaurar VM desde snapshot"""
        try:
            conn = self._get_connection()
            domain = conn.lookupByName(vm_name)
            snapshot = domain.snapshotLookupByName(snapshot_name)
            
            # Revertir al snapshot
            domain.revertToSnapshot(snapshot)
            
            return f"VM '{vm_name}' restaurada desde snapshot '{snapshot_name}'"
            
        except libvirt.libvirtError as e:
            raise RuntimeError(f"Error restaurando snapshot '{snapshot_name}' de VM '{vm_name}': {e}")
    
    def delete_snapshot(self, vm_name: str, snapshot_name: str) -> str:
        """Eliminar snapshot de una VM"""
        try:
            conn = self._get_connection()
            domain = conn.lookupByName(vm_name)
            snapshot = domain.snapshotLookupByName(snapshot_name)
            
            # Eliminar snapshot
            snapshot.delete()
            
            return f"Snapshot '{snapshot_name}' de VM '{vm_name}' eliminado"
            
        except libvirt.libvirtError as e:
            raise RuntimeError(f"Error eliminando snapshot '{snapshot_name}' de VM '{vm_name}': {e}")
    
    def migrate_vm(self, vm_name: str, migration_config: VMMigrationConfig) -> str:
        """Migrar VM a otro host"""
        try:
            conn = self._get_connection()
            domain = conn.lookupByName(vm_name)
            
            # Conectar al host destino
            dest_uri = f"qemu+ssh://{migration_config.destination_host}/system"
            dest_conn = libvirt.open(dest_uri)
            
            # Configurar flags de migración
            flags = libvirt.VIR_MIGRATE_PEER2PEER
            if migration_config.live:
                flags |= libvirt.VIR_MIGRATE_LIVE
            if migration_config.compressed:
                flags |= libvirt.VIR_MIGRATE_COMPRESSED
            
            # Parámetros de migración
            params = {}
            if migration_config.bandwidth_mbps:
                params[libvirt.VIR_MIGRATE_PARAM_BANDWIDTH] = migration_config.bandwidth_mbps
            
            # Ejecutar migración
            domain.migrate3(dest_conn, params, flags)
            
            dest_conn.close()
            
            return f"VM '{vm_name}' migrada exitosamente a {migration_config.destination_host}"
            
        except libvirt.libvirtError as e:
            raise RuntimeError(f"Error migrando VM '{vm_name}': {e}")
    
    def close_connection(self):
        """Cerrar conexión a libvirt"""
        if self.conn:
            self.conn.close()
            self.conn = None
            self.logger.info("Conexión a libvirt cerrada")
