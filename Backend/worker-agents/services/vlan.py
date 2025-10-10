import subprocess
import logging
import re
from typing import Dict, Any, List, Optional
from models.vlan import VLANProtocol, VLANInfo, BridgeVLANInfo


logger = logging.getLogger(__name__)


class VLANService:
    """Servicio para gestionar VLANs"""
    
    @staticmethod
    def create_vlan(parent_interface: str, vlan_id: int, 
                   name: Optional[str] = None, 
                   protocol: VLANProtocol = VLANProtocol.ieee8021q) -> Dict[str, Any]:
        """Crear una interfaz VLAN"""
        try:
            # Generar nombre si no se proporciona
            if not name:
                name = f"{parent_interface}.{vlan_id}"
            
            # Crear la interfaz VLAN
            cmd = ["ip", "link", "add", "link", parent_interface, "name", name, 
                   "type", "vlan", "id", str(vlan_id)]
            
            # Añadir protocolo si es diferente de 802.1Q
            if protocol == VLANProtocol.ieee8021ad:
                cmd.extend(["protocol", "802.1ad"])
            
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            # Levantar la interfaz VLAN
            up_cmd = ["ip", "link", "set", name, "up"]
            subprocess.run(up_cmd, capture_output=True, text=True)
            
            logger.info(f"VLAN {vlan_id} creada en {parent_interface} como {name}")
            return {
                "success": True, 
                "parent_interface": parent_interface,
                "vlan_id": vlan_id,
                "interface_name": name,
                "protocol": protocol.value
            }
            
        except subprocess.CalledProcessError as e:
            error_msg = f"Error creando VLAN {vlan_id} en {parent_interface}: {e.stderr}"
            logger.error(error_msg)
            return {"success": False, "error": error_msg}
        except Exception as e:
            error_msg = f"Error inesperado creando VLAN {vlan_id}: {str(e)}"
            logger.error(error_msg)
            return {"success": False, "error": error_msg}

    @staticmethod
    def delete_vlan(parent_interface: str, vlan_id: int) -> Dict[str, Any]:
        """Eliminar una interfaz VLAN"""
        try:
            # Buscar la interfaz VLAN
            vlan_interface = VLANService._find_vlan_interface(parent_interface, vlan_id)
            
            if not vlan_interface:
                return {"success": False, "error": f"VLAN {vlan_id} no encontrada en {parent_interface}"}
            
            # Eliminar la interfaz VLAN
            cmd = ["ip", "link", "delete", vlan_interface]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            logger.info(f"VLAN {vlan_id} eliminada de {parent_interface}")
            return {
                "success": True, 
                "parent_interface": parent_interface,
                "vlan_id": vlan_id,
                "interface_name": vlan_interface
            }
            
        except subprocess.CalledProcessError as e:
            error_msg = f"Error eliminando VLAN {vlan_id} de {parent_interface}: {e.stderr}"
            logger.error(error_msg)
            return {"success": False, "error": error_msg}

    @staticmethod
    def add_vlan_to_bridge(bridge_name: str, port_name: str, vlan_id: int, tagged: bool = True) -> Dict[str, Any]:
        """Añadir VLAN a un puerto de bridge (principalmente para OVS)"""
        try:
            # Verificar si es bridge OVS
            from services.bridge import BridgeService
            bridge_info = BridgeService.get_bridge_info(bridge_name)
            
            if not bridge_info:
                return {"success": False, "error": f"Bridge {bridge_name} no encontrado"}
            
            if bridge_info.get("type") == "ovs":
                # Configurar VLAN en OVS
                if tagged:
                    cmd = ["ovs-vsctl", "set", "port", port_name, f"trunks={vlan_id}"]
                else:
                    cmd = ["ovs-vsctl", "set", "port", port_name, f"tag={vlan_id}"]
                
                result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            else:
                # Para bridges Linux, crear interfaz VLAN y conectarla
                vlan_result = VLANService.create_vlan(port_name, vlan_id)
                if vlan_result.get("success"):
                    vlan_interface = vlan_result["interface_name"]
                    bridge_result = BridgeService.add_port(bridge_name, vlan_interface)
                    if not bridge_result.get("success"):
                        return {"success": False, "error": bridge_result.get("error")}
            
            logger.info(f"VLAN {vlan_id} añadida al puerto {port_name} en bridge {bridge_name}")
            return {
                "success": True,
                "bridge_name": bridge_name,
                "port_name": port_name,
                "vlan_id": vlan_id,
                "tagged": tagged
            }
            
        except subprocess.CalledProcessError as e:
            error_msg = f"Error añadiendo VLAN {vlan_id} al bridge {bridge_name}: {e.stderr}"
            logger.error(error_msg)
            return {"success": False, "error": error_msg}

    @staticmethod
    def remove_vlan_from_bridge(bridge_name: str, port_name: str, vlan_id: int) -> Dict[str, Any]:
        """Remover VLAN de un puerto de bridge"""
        try:
            from services.bridge import BridgeService
            bridge_info = BridgeService.get_bridge_info(bridge_name)
            
            if not bridge_info:
                return {"success": False, "error": f"Bridge {bridge_name} no encontrado"}
            
            if bridge_info.get("type") == "ovs":
                # Remover VLAN de OVS
                # Primero obtener VLANs actuales
                get_cmd = ["ovs-vsctl", "get", "port", port_name, "trunks"]
                try:
                    result = subprocess.run(get_cmd, capture_output=True, text=True, check=True)
                    current_vlans = result.stdout.strip().strip('[]').split(',')
                    current_vlans = [v.strip() for v in current_vlans if v.strip() != str(vlan_id)]
                    
                    # Reconfigurar sin la VLAN
                    if current_vlans:
                        new_trunks = ','.join(current_vlans)
                        set_cmd = ["ovs-vsctl", "set", "port", port_name, f"trunks={new_trunks}"]
                    else:
                        set_cmd = ["ovs-vsctl", "remove", "port", port_name, "trunks"]
                    
                    subprocess.run(set_cmd, capture_output=True, text=True, check=True)
                except:
                    # Intentar remover tag
                    tag_cmd = ["ovs-vsctl", "remove", "port", port_name, "tag"]
                    subprocess.run(tag_cmd, capture_output=True, text=True)
            else:
                # Para bridges Linux, eliminar la interfaz VLAN
                vlan_interface = f"{port_name}.{vlan_id}"
                BridgeService.remove_port(bridge_name, vlan_interface)
                VLANService.delete_vlan(port_name, vlan_id)
            
            logger.info(f"VLAN {vlan_id} removida del puerto {port_name} en bridge {bridge_name}")
            return {
                "success": True,
                "bridge_name": bridge_name,
                "port_name": port_name,
                "vlan_id": vlan_id
            }
            
        except subprocess.CalledProcessError as e:
            error_msg = f"Error removiendo VLAN {vlan_id} del bridge {bridge_name}: {e.stderr}"
            logger.error(error_msg)
            return {"success": False, "error": error_msg}

    @staticmethod
    def list_vlans() -> List[VLANInfo]:
        """Listar todas las interfaces VLAN"""
        vlans = []
        
        try:
            # Buscar interfaces VLAN usando ip link
            cmd = ["ip", "link", "show", "type", "vlan"]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            for line in result.stdout.split('\n'):
                if 'vlan' in line and '@' in line:
                    # Parsear línea como: "5: eth0.100@eth0: <BROADCAST,MULTICAST,UP,LOWER_UP>"
                    match = re.search(r'^\d+:\s+([^@]+)@([^:]+):', line)
                    if match:
                        vlan_interface = match.group(1)
                        parent_interface = match.group(2)
                        
                        # Extraer VLAN ID del nombre
                        vlan_id_match = re.search(r'\.(\d+)$', vlan_interface)
                        if vlan_id_match:
                            vlan_id = int(vlan_id_match.group(1))
                            
                            vlan_info = VLANService._get_vlan_details(vlan_interface, parent_interface, vlan_id)
                            if vlan_info:
                                vlans.append(vlan_info)
        
        except subprocess.CalledProcessError:
            pass
        
        return vlans

    @staticmethod
    def list_bridge_vlans() -> List[BridgeVLANInfo]:
        """Listar VLANs configuradas en bridges OVS"""
        bridge_vlans = []
        
        try:
            # Obtener bridges OVS
            cmd = ["ovs-vsctl", "list-br"]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            for bridge_name in result.stdout.strip().split('\n'):
                if bridge_name.strip():
                    bridge_name = bridge_name.strip()
                    
                    # Obtener puertos del bridge
                    ports_cmd = ["ovs-vsctl", "list-ports", bridge_name]
                    ports_result = subprocess.run(ports_cmd, capture_output=True, text=True, check=True)
                    
                    for port_name in ports_result.stdout.strip().split('\n'):
                        if port_name.strip():
                            port_name = port_name.strip()
                            port_vlans = VLANService._get_port_vlans(bridge_name, port_name)
                            bridge_vlans.extend(port_vlans)
        
        except subprocess.CalledProcessError:
            pass
        
        return bridge_vlans

    @staticmethod
    def get_vlan_info(parent_interface: str, vlan_id: int) -> Optional[VLANInfo]:
        """Obtener información de una VLAN específica"""
        vlan_interface = VLANService._find_vlan_interface(parent_interface, vlan_id)
        
        if vlan_interface:
            return VLANService._get_vlan_details(vlan_interface, parent_interface, vlan_id)
        
        return None

    @staticmethod
    def _find_vlan_interface(parent_interface: str, vlan_id: int) -> Optional[str]:
        """Encontrar el nombre de la interfaz VLAN"""
        possible_names = [
            f"{parent_interface}.{vlan_id}",
            f"vlan{vlan_id}",
            f"{parent_interface}_{vlan_id}"
        ]
        
        for name in possible_names:
            try:
                cmd = ["ip", "link", "show", name]
                result = subprocess.run(cmd, capture_output=True, text=True, check=True)
                if parent_interface in result.stdout and "vlan" in result.stdout:
                    return name
            except subprocess.CalledProcessError:
                continue
        
        return None

    @staticmethod
    def _get_vlan_details(vlan_interface: str, parent_interface: str, vlan_id: int) -> Optional[VLANInfo]:
        """Obtener detalles de una interfaz VLAN"""
        try:
            cmd = ["ip", "link", "show", vlan_interface]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            # Determinar estado
            status = "up" if "UP" in result.stdout else "down"
            
            # Extraer MTU
            mtu_match = re.search(r'mtu\s+(\d+)', result.stdout)
            mtu = int(mtu_match.group(1)) if mtu_match else None
            
            # Determinar protocolo (por defecto 802.1Q)
            protocol = VLANProtocol.ieee8021q
            if "802.1ad" in result.stdout:
                protocol = VLANProtocol.ieee8021ad
            
            return VLANInfo(
                parent_interface=parent_interface,
                vlan_id=vlan_id,
                interface_name=vlan_interface,
                protocol=protocol,
                status=status,
                mtu=mtu
            )
            
        except subprocess.CalledProcessError:
            return None

    @staticmethod
    def _get_port_vlans(bridge_name: str, port_name: str) -> List[BridgeVLANInfo]:
        """Obtener VLANs de un puerto OVS"""
        vlans = []
        
        try:
            # Obtener tag VLAN (untagged)
            tag_cmd = ["ovs-vsctl", "get", "port", port_name, "tag"]
            try:
                tag_result = subprocess.run(tag_cmd, capture_output=True, text=True, check=True)
                tag = tag_result.stdout.strip()
                if tag and tag != "[]":
                    vlans.append(BridgeVLANInfo(
                        bridge_name=bridge_name,
                        port_name=port_name,
                        vlan_id=int(tag),
                        tagged=False
                    ))
            except:
                pass
            
            # Obtener trunks VLAN (tagged)
            trunk_cmd = ["ovs-vsctl", "get", "port", port_name, "trunks"]
            try:
                trunk_result = subprocess.run(trunk_cmd, capture_output=True, text=True, check=True)
                trunks = trunk_result.stdout.strip().strip('[]')
                if trunks:
                    for vlan_id in trunks.split(','):
                        vlan_id = vlan_id.strip()
                        if vlan_id.isdigit():
                            vlans.append(BridgeVLANInfo(
                                bridge_name=bridge_name,
                                port_name=port_name,
                                vlan_id=int(vlan_id),
                                tagged=True
                            ))
            except:
                pass
        
        except subprocess.CalledProcessError:
            pass
        
        return vlans
