import subprocess
import logging
import pwd
import grp
from typing import Dict, Any, List, Optional
from models.tuntap import TunTapType, TunTapMode, TunTapInfo


logger = logging.getLogger(__name__)


class TunTapService:
    """Servicio para gestionar interfaces TUN/TAP"""
    
    @staticmethod
    def create_tuntap(name: str, tap_type: TunTapType, mode: TunTapMode = TunTapMode.root,
                     owner: Optional[str] = None, group: Optional[str] = None,
                     bridge: Optional[str] = None, persistent: bool = False) -> Dict[str, Any]:
        """Crear interfaz TUN/TAP"""
        try:
            # Construir comando ip tuntap
            cmd = ["ip", "tuntap", "add", "dev", name, "mode", tap_type.value]
            
            # Añadir owner si se especifica
            if owner:
                try:
                    # Validar que el usuario existe
                    pwd.getpwnam(owner)
                    cmd.extend(["user", owner])
                except KeyError:
                    return {"success": False, "error": f"Usuario {owner} no existe"}
            
            # Añadir group si se especifica
            if group:
                try:
                    # Validar que el grupo existe
                    grp.getgrnam(group)
                    cmd.extend(["group", group])
                except KeyError:
                    return {"success": False, "error": f"Grupo {group} no existe"}
            
            # Crear la interfaz
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            # Levantar la interfaz
            up_cmd = ["ip", "link", "set", name, "up"]
            subprocess.run(up_cmd, capture_output=True, text=True)
            
            # Conectar a bridge si se especifica (solo para TAP)
            if bridge and tap_type == TunTapType.tap:
                from services.bridge import BridgeService
                bridge_result = BridgeService.add_port(bridge, name)
                if not bridge_result.get("success", False):
                    logger.warning(f"No se pudo conectar {name} a bridge {bridge}")
            
            # Hacer persistente si se solicita
            if persistent:
                # Para hacer persistente, necesitamos usar tunctl o equivalente
                # Por simplicidad, lo marcamos pero no implementamos la persistencia aquí
                pass
            
            logger.info(f"Interfaz {tap_type.value.upper()} {name} creada exitosamente")
            return {
                "success": True,
                "name": name,
                "type": tap_type.value,
                "owner": owner,
                "group": group,
                "bridge": bridge if tap_type == TunTapType.tap else None,
                "persistent": persistent
            }
            
        except subprocess.CalledProcessError as e:
            error_msg = f"Error creando interfaz {tap_type.value.upper()} {name}: {e.stderr}"
            logger.error(error_msg)
            return {"success": False, "error": error_msg}
        except Exception as e:
            error_msg = f"Error inesperado creando {tap_type.value.upper()} {name}: {str(e)}"
            logger.error(error_msg)
            return {"success": False, "error": error_msg}

    @staticmethod
    def delete_tuntap(name: str) -> Dict[str, Any]:
        """Eliminar interfaz TUN/TAP"""
        try:
            # Verificar que la interfaz existe
            tuntap_info = TunTapService.get_tuntap_info(name)
            if not tuntap_info:
                return {"success": False, "error": f"Interfaz {name} no encontrada"}
            
            # Desconectar del bridge si está conectado
            if tuntap_info.bridge:
                from services.bridge import BridgeService
                BridgeService.remove_port(tuntap_info.bridge, name)
            
            # Eliminar la interfaz
            cmd = ["ip", "tuntap", "del", "dev", name, "mode", tuntap_info.type.value]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            logger.info(f"Interfaz {tuntap_info.type.value.upper()} {name} eliminada")
            return {"success": True, "name": name}
            
        except subprocess.CalledProcessError as e:
            error_msg = f"Error eliminando interfaz {name}: {e.stderr}"
            logger.error(error_msg)
            return {"success": False, "error": error_msg}

    @staticmethod
    def attach_to_bridge(tap_name: str, bridge_name: str) -> Dict[str, Any]:
        """Conectar interfaz TAP a bridge"""
        try:
            # Verificar que es una interfaz TAP
            tuntap_info = TunTapService.get_tuntap_info(tap_name)
            if not tuntap_info:
                return {"success": False, "error": f"Interfaz {tap_name} no encontrada"}
            
            if tuntap_info.type != TunTapType.tap:
                return {"success": False, "error": f"Solo las interfaces TAP pueden conectarse a bridges"}
            
            # Desconectar del bridge actual si existe
            if tuntap_info.bridge:
                TunTapService.detach_from_bridge(tap_name)
            
            # Conectar al nuevo bridge
            from services.bridge import BridgeService
            result = BridgeService.add_port(bridge_name, tap_name)
            
            if result.get("success", False):
                logger.info(f"TAP {tap_name} conectado a bridge {bridge_name}")
                return {"success": True, "tap_name": tap_name, "bridge_name": bridge_name}
            else:
                return {"success": False, "error": result.get("error", "Error desconocido")}
                
        except Exception as e:
            error_msg = f"Error conectando TAP {tap_name} a bridge {bridge_name}: {str(e)}"
            logger.error(error_msg)
            return {"success": False, "error": error_msg}

    @staticmethod
    def detach_from_bridge(tap_name: str) -> Dict[str, Any]:
        """Desconectar interfaz TAP de bridge"""
        try:
            # Obtener información actual
            tuntap_info = TunTapService.get_tuntap_info(tap_name)
            if not tuntap_info or not tuntap_info.bridge:
                return {"success": False, "error": f"TAP {tap_name} no está conectado a ningún bridge"}
            
            # Desconectar del bridge
            from services.bridge import BridgeService
            result = BridgeService.remove_port(tuntap_info.bridge, tap_name)
            
            if result.get("success", False):
                logger.info(f"TAP {tap_name} desconectado de bridge {tuntap_info.bridge}")
                return {"success": True, "tap_name": tap_name, "previous_bridge": tuntap_info.bridge}
            else:
                return {"success": False, "error": result.get("error", "Error desconocido")}
                
        except Exception as e:
            error_msg = f"Error desconectando TAP {tap_name}: {str(e)}"
            logger.error(error_msg)
            return {"success": False, "error": error_msg}

    @staticmethod
    def list_tuntaps() -> List[TunTapInfo]:
        """Listar todas las interfaces TUN/TAP"""
        tuntaps = []
        
        try:
            # Obtener todas las interfaces
            cmd = ["ip", "link", "show"]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            for line in result.stdout.split('\n'):
                # Buscar líneas que contengan tun o tap
                if any(keyword in line.lower() for keyword in ['tun', 'tap']):
                    # Parsear nombre de la interfaz
                    import re
                    match = re.search(r'^\d+:\s+([^:@]+)', line)
                    if match:
                        interface_name = match.group(1).strip()
                        
                        # Determinar tipo basado en el nombre y características
                        tuntap_type = TunTapService._determine_tuntap_type(interface_name, line)
                        if tuntap_type:
                            tuntap_info = TunTapService._get_tuntap_details(interface_name, tuntap_type)
                            if tuntap_info:
                                tuntaps.append(tuntap_info)
        
        except subprocess.CalledProcessError as e:
            logger.error(f"Error listando interfaces TUN/TAP: {e.stderr}")
        
        return tuntaps

    @staticmethod
    def get_tuntap_info(name: str) -> Optional[TunTapInfo]:
        """Obtener información de una interfaz TUN/TAP específica"""
        try:
            cmd = ["ip", "link", "show", name]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            # Determinar tipo
            tuntap_type = TunTapService._determine_tuntap_type(name, result.stdout)
            if not tuntap_type:
                return None
            
            return TunTapService._get_tuntap_details(name, tuntap_type)
            
        except subprocess.CalledProcessError:
            return None

    @staticmethod
    def _determine_tuntap_type(interface_name: str, interface_info: str) -> Optional[TunTapType]:
        """Determinar si una interfaz es TUN o TAP"""
        # Verificar por nombre
        if interface_name.startswith('tun'):
            return TunTapType.tun
        elif interface_name.startswith('tap'):
            return TunTapType.tap
        
        # Verificar por información de la interfaz
        # Las interfaces TUN no tienen dirección MAC, las TAP sí
        if 'link/none' in interface_info:
            return TunTapType.tun
        elif any(keyword in interface_info.lower() for keyword in ['ether', 'link/ether']):
            # Podría ser TAP si tiene MAC pero no es una interfaz física estándar
            if any(keyword in interface_name.lower() for keyword in ['tap', 'vnet']):
                return TunTapType.tap
        
        return None

    @staticmethod
    def _get_tuntap_details(name: str, tuntap_type: TunTapType) -> Optional[TunTapInfo]:
        """Obtener detalles completos de una interfaz TUN/TAP"""
        try:
            cmd = ["ip", "link", "show", name]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            # Determinar estado
            status = "up" if "UP" in result.stdout else "down"
            
            # Extraer MTU
            import re
            mtu_match = re.search(r'mtu\s+(\d+)', result.stdout)
            mtu = int(mtu_match.group(1)) if mtu_match else None
            
            # Buscar bridge master
            bridge = None
            bridge_match = re.search(r'master\s+(\S+)', result.stdout)
            if bridge_match:
                bridge = bridge_match.group(1)
            
            # Obtener owner/group (esto es más complejo y puede requerir acceso a /proc)
            owner, group = TunTapService._get_tuntap_ownership(name)
            
            return TunTapInfo(
                name=name,
                type=tuntap_type,
                owner=owner,
                group=group,
                bridge=bridge,
                persistent=False,  # Difícil de determinar sin acceso a configuración
                status=status,
                mtu=mtu
            )
            
        except subprocess.CalledProcessError:
            return None

    @staticmethod
    def _get_tuntap_ownership(interface_name: str) -> tuple[Optional[str], Optional[str]]:
        """Obtener owner/group de una interfaz TUN/TAP"""
        # Esta función es compleja de implementar sin acceso privilegiado
        # Por simplicidad, retornamos None
        # En una implementación real, se podría revisar /proc/net/tun o usar otras técnicas
        return None, None

    @staticmethod
    def set_interface_ip(interface_name: str, ip_address: str, netmask: str = "24") -> Dict[str, Any]:
        """Asignar dirección IP a interfaz TUN/TAP"""
        try:
            cmd = ["ip", "addr", "add", f"{ip_address}/{netmask}", "dev", interface_name]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            logger.info(f"IP {ip_address}/{netmask} asignada a {interface_name}")
            return {"success": True, "interface": interface_name, "ip": ip_address, "netmask": netmask}
            
        except subprocess.CalledProcessError as e:
            error_msg = f"Error asignando IP a {interface_name}: {e.stderr}"
            logger.error(error_msg)
            return {"success": False, "error": error_msg}

    @staticmethod
    def remove_interface_ip(interface_name: str, ip_address: str, netmask: str = "24") -> Dict[str, Any]:
        """Remover dirección IP de interfaz TUN/TAP"""
        try:
            cmd = ["ip", "addr", "del", f"{ip_address}/{netmask}", "dev", interface_name]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            logger.info(f"IP {ip_address}/{netmask} removida de {interface_name}")
            return {"success": True, "interface": interface_name, "ip": ip_address}
            
        except subprocess.CalledProcessError as e:
            error_msg = f"Error removiendo IP de {interface_name}: {e.stderr}"
            logger.error(error_msg)
            return {"success": False, "error": error_msg}
