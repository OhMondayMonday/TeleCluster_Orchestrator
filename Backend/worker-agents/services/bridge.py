import subprocess
import logging
from typing import List, Optional, Dict, Any
from models.bridge import BridgeType, BridgeInfo
import json
import re


logger = logging.getLogger(__name__)


class BridgeService:
    """Servicio para gestionar bridges de red"""
    
    @staticmethod
    def create_bridge(name: str, bridge_type: BridgeType = BridgeType.linux, stp: bool = False) -> Dict[str, Any]:
        """Crear un bridge de red"""
        try:
            if bridge_type == BridgeType.linux:
                # Crear bridge Linux estándar
                cmd = ["ip", "link", "add", "name", name, "type", "bridge"]
                result = subprocess.run(cmd, capture_output=True, text=True, check=True)
                
                # Configurar STP si está habilitado
                if stp:
                    stp_cmd = ["ip", "link", "set", name, "type", "bridge", "stp_state", "1"]
                    subprocess.run(stp_cmd, capture_output=True, text=True, check=True)
                
                # Levantar el bridge
                up_cmd = ["ip", "link", "set", name, "up"]
                subprocess.run(up_cmd, capture_output=True, text=True, check=True)
                
            elif bridge_type == BridgeType.ovs:
                # Crear bridge OVS
                cmd = ["ovs-vsctl", "add-br", name]
                result = subprocess.run(cmd, capture_output=True, text=True, check=True)
                
            logger.info(f"Bridge {name} creado exitosamente (tipo: {bridge_type})")
            return {"success": True, "bridge_name": name, "type": bridge_type.value}
            
        except subprocess.CalledProcessError as e:
            error_msg = f"Error creando bridge {name}: {e.stderr}"
            logger.error(error_msg)
            return {"success": False, "error": error_msg}
        except Exception as e:
            error_msg = f"Error inesperado creando bridge {name}: {str(e)}"
            logger.error(error_msg)
            return {"success": False, "error": error_msg}

    @staticmethod
    def delete_bridge(name: str, force: bool = False) -> Dict[str, Any]:
        """Eliminar un bridge"""
        try:
            # Verificar si el bridge existe
            bridge_info = BridgeService.get_bridge_info(name)
            if not bridge_info:
                return {"success": False, "error": f"Bridge {name} no encontrado"}
            
            bridge_type = bridge_info.get("type", "linux")
            
            if bridge_type == "ovs":
                # Eliminar bridge OVS
                cmd = ["ovs-vsctl", "del-br", name]
            else:
                # Eliminar bridge Linux
                if force:
                    # Desconectar todas las interfaces primero
                    BridgeService._disconnect_all_ports(name)
                
                # Bajar el bridge
                down_cmd = ["ip", "link", "set", name, "down"]
                subprocess.run(down_cmd, capture_output=True, text=True)
                
                # Eliminar el bridge
                cmd = ["ip", "link", "delete", name, "type", "bridge"]
            
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            logger.info(f"Bridge {name} eliminado exitosamente")
            return {"success": True, "bridge_name": name}
            
        except subprocess.CalledProcessError as e:
            error_msg = f"Error eliminando bridge {name}: {e.stderr}"
            logger.error(error_msg)
            return {"success": False, "error": error_msg}
        except Exception as e:
            error_msg = f"Error inesperado eliminando bridge {name}: {str(e)}"
            logger.error(error_msg)
            return {"success": False, "error": error_msg}

    @staticmethod
    def add_port(bridge_name: str, port_name: str, vlan: Optional[int] = None) -> Dict[str, Any]:
        """Añadir puerto a un bridge"""
        try:
            bridge_info = BridgeService.get_bridge_info(bridge_name)
            if not bridge_info:
                return {"success": False, "error": f"Bridge {bridge_name} no encontrado"}
            
            bridge_type = bridge_info.get("type", "linux")
            
            if bridge_type == "ovs":
                # Añadir puerto a OVS bridge
                cmd = ["ovs-vsctl", "add-port", bridge_name, port_name]
                if vlan:
                    cmd.extend(["tag=" + str(vlan)])
            else:
                # Añadir puerto a bridge Linux
                cmd = ["ip", "link", "set", port_name, "master", bridge_name]
            
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            # Levantar el puerto
            up_cmd = ["ip", "link", "set", port_name, "up"]
            subprocess.run(up_cmd, capture_output=True, text=True)
            
            logger.info(f"Puerto {port_name} añadido a bridge {bridge_name}")
            return {"success": True, "bridge_name": bridge_name, "port_name": port_name}
            
        except subprocess.CalledProcessError as e:
            error_msg = f"Error añadiendo puerto {port_name} a bridge {bridge_name}: {e.stderr}"
            logger.error(error_msg)
            return {"success": False, "error": error_msg}

    @staticmethod
    def remove_port(bridge_name: str, port_name: str) -> Dict[str, Any]:
        """Remover puerto de un bridge"""
        try:
            bridge_info = BridgeService.get_bridge_info(bridge_name)
            if not bridge_info:
                return {"success": False, "error": f"Bridge {bridge_name} no encontrado"}
            
            bridge_type = bridge_info.get("type", "linux")
            
            if bridge_type == "ovs":
                # Remover puerto de OVS bridge
                cmd = ["ovs-vsctl", "del-port", bridge_name, port_name]
            else:
                # Remover puerto de bridge Linux
                cmd = ["ip", "link", "set", port_name, "nomaster"]
            
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            logger.info(f"Puerto {port_name} removido de bridge {bridge_name}")
            return {"success": True, "bridge_name": bridge_name, "port_name": port_name}
            
        except subprocess.CalledProcessError as e:
            error_msg = f"Error removiendo puerto {port_name} de bridge {bridge_name}: {e.stderr}"
            logger.error(error_msg)
            return {"success": False, "error": error_msg}

    @staticmethod
    def list_bridges() -> List[BridgeInfo]:
        """Listar todos los bridges"""
        bridges = []
        
        # Obtener bridges Linux
        try:
            cmd = ["ip", "link", "show", "type", "bridge"]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            for line in result.stdout.split('\n'):
                if 'bridge' in line and '@' not in line:
                    match = re.search(r'^\d+:\s+([^:]+):', line)
                    if match:
                        bridge_name = match.group(1)
                        bridge_info = BridgeService._get_linux_bridge_info(bridge_name)
                        if bridge_info:
                            bridges.append(bridge_info)
        except subprocess.CalledProcessError:
            pass
        
        # Obtener bridges OVS
        try:
            cmd = ["ovs-vsctl", "list-br"]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            for bridge_name in result.stdout.strip().split('\n'):
                if bridge_name.strip():
                    bridge_info = BridgeService._get_ovs_bridge_info(bridge_name.strip())
                    if bridge_info:
                        bridges.append(bridge_info)
        except subprocess.CalledProcessError:
            pass
        
        return bridges

    @staticmethod
    def get_bridge_info(bridge_name: str) -> Optional[Dict[str, Any]]:
        """Obtener información de un bridge específico"""
        # Intentar como bridge Linux primero
        info = BridgeService._get_linux_bridge_info(bridge_name)
        if info:
            return info.__dict__
        
        # Intentar como bridge OVS
        info = BridgeService._get_ovs_bridge_info(bridge_name)
        if info:
            return info.__dict__
        
        return None

    @staticmethod
    def _get_linux_bridge_info(bridge_name: str) -> Optional[BridgeInfo]:
        """Obtener información de un bridge Linux"""
        try:
            # Verificar si existe
            cmd = ["ip", "link", "show", bridge_name]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            if "bridge" not in result.stdout:
                return None
            
            # Obtener puertos
            ports = []
            try:
                ports_cmd = ["ip", "link", "show", "master", bridge_name]
                ports_result = subprocess.run(ports_cmd, capture_output=True, text=True, check=True)
                
                for line in ports_result.stdout.split('\n'):
                    match = re.search(r'^\d+:\s+([^:@]+)', line)
                    if match:
                        ports.append(match.group(1))
            except:
                pass
            
            # Determinar estado
            status = "up" if "UP" in result.stdout else "down"
            
            return BridgeInfo(
                name=bridge_name,
                type=BridgeType.linux,
                stp=False,  # TODO: Detectar STP
                ports=ports,
                vlans=[],   # TODO: Detectar VLANs
                status=status
            )
            
        except subprocess.CalledProcessError:
            return None

    @staticmethod
    def _get_ovs_bridge_info(bridge_name: str) -> Optional[BridgeInfo]:
        """Obtener información de un bridge OVS"""
        try:
            # Verificar si existe
            cmd = ["ovs-vsctl", "br-exists", bridge_name]
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                return None
            
            # Obtener puertos
            ports = []
            try:
                ports_cmd = ["ovs-vsctl", "list-ports", bridge_name]
                ports_result = subprocess.run(ports_cmd, capture_output=True, text=True, check=True)
                ports = [port.strip() for port in ports_result.stdout.split('\n') if port.strip()]
            except:
                pass
            
            return BridgeInfo(
                name=bridge_name,
                type=BridgeType.ovs,
                stp=False,  # TODO: Detectar STP en OVS
                ports=ports,
                vlans=[],   # TODO: Detectar VLANs en OVS
                status="up"  # OVS bridges are typically always up
            )
            
        except subprocess.CalledProcessError:
            return None

    @staticmethod
    def _disconnect_all_ports(bridge_name: str):
        """Desconectar todos los puertos de un bridge"""
        try:
            bridge_info = BridgeService.get_bridge_info(bridge_name)
            if not bridge_info:
                return
            
            for port in bridge_info.get("ports", []):
                BridgeService.remove_port(bridge_name, port)
        except Exception as e:
            logger.warning(f"Error desconectando puertos del bridge {bridge_name}: {e}")
