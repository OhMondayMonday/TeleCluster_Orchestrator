import subprocess
import logging
import re
from typing import Dict, Any, Optional, List
from models.veth import VethInfo


logger = logging.getLogger(__name__)


class VethService:
    """Servicio para gestionar pares veth"""
    
    @staticmethod
    def create_veth_pair(name1: str, name2: str, 
                        bridge1: Optional[str] = None, bridge2: Optional[str] = None,
                        namespace1: Optional[str] = None, namespace2: Optional[str] = None) -> Dict[str, Any]:
        """Crear un par veth"""
        try:
            # Crear el par veth
            cmd = ["ip", "link", "add", name1, "type", "veth", "peer", "name", name2]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            # Mover a namespaces si se especifica
            if namespace1:
                ns_cmd = ["ip", "link", "set", name1, "netns", namespace1]
                subprocess.run(ns_cmd, capture_output=True, text=True, check=True)
            
            if namespace2:
                ns_cmd = ["ip", "link", "set", name2, "netns", namespace2]
                subprocess.run(ns_cmd, capture_output=True, text=True, check=True)
            
            # Conectar a bridges si se especifica
            if bridge1 and not namespace1:
                from services.bridge import BridgeService
                bridge_result = BridgeService.add_port(bridge1, name1)
                if not bridge_result.get("success", False):
                    logger.warning(f"No se pudo conectar {name1} a bridge {bridge1}")
            
            if bridge2 and not namespace2:
                from services.bridge import BridgeService
                bridge_result = BridgeService.add_port(bridge2, name2)
                if not bridge_result.get("success", False):
                    logger.warning(f"No se pudo conectar {name2} a bridge {bridge2}")
            
            # Levantar las interfaces si no están en namespace
            if not namespace1:
                up_cmd = ["ip", "link", "set", name1, "up"]
                subprocess.run(up_cmd, capture_output=True, text=True)
            
            if not namespace2:
                up_cmd = ["ip", "link", "set", name2, "up"]
                subprocess.run(up_cmd, capture_output=True, text=True)
            
            logger.info(f"Par veth creado: {name1} <-> {name2}")
            return {
                "success": True, 
                "veth_pair": [name1, name2],
                "bridges": [bridge1, bridge2],
                "namespaces": [namespace1, namespace2]
            }
            
        except subprocess.CalledProcessError as e:
            error_msg = f"Error creando par veth {name1}-{name2}: {e.stderr}"
            logger.error(error_msg)
            return {"success": False, "error": error_msg}
        except Exception as e:
            error_msg = f"Error inesperado creando par veth {name1}-{name2}: {str(e)}"
            logger.error(error_msg)
            return {"success": False, "error": error_msg}

    @staticmethod
    def delete_veth_pair(veth_name: str) -> Dict[str, Any]:
        """Eliminar un par veth (eliminando cualquier extremo se elimina el par completo)"""
        try:
            # Obtener información del par antes de eliminarlo
            veth_info = VethService.get_veth_info(veth_name)
            
            if not veth_info:
                return {"success": False, "error": f"Veth {veth_name} no encontrado"}
            
            # Eliminar el veth (esto elimina automáticamente el par)
            cmd = ["ip", "link", "delete", veth_name]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            logger.info(f"Par veth eliminado: {veth_name}")
            return {"success": True, "veth_name": veth_name}
            
        except subprocess.CalledProcessError as e:
            error_msg = f"Error eliminando veth {veth_name}: {e.stderr}"
            logger.error(error_msg)
            return {"success": False, "error": error_msg}
        except Exception as e:
            error_msg = f"Error inesperado eliminando veth {veth_name}: {str(e)}"
            logger.error(error_msg)
            return {"success": False, "error": error_msg}

    @staticmethod
    def move_veth_to_bridge(veth_name: str, bridge_name: str) -> Dict[str, Any]:
        """Mover un extremo veth a otro bridge"""
        try:
            # Primero desconectar del bridge actual si está conectado
            current_bridge = VethService._get_veth_bridge(veth_name)
            if current_bridge:
                from services.bridge import BridgeService
                BridgeService.remove_port(current_bridge, veth_name)
            
            # Conectar al nuevo bridge
            from services.bridge import BridgeService
            result = BridgeService.add_port(bridge_name, veth_name)
            
            if result.get("success", False):
                logger.info(f"Veth {veth_name} movido a bridge {bridge_name}")
                return {"success": True, "veth_name": veth_name, "new_bridge": bridge_name}
            else:
                return {"success": False, "error": result.get("error", "Error desconocido")}
                
        except Exception as e:
            error_msg = f"Error moviendo veth {veth_name} a bridge {bridge_name}: {str(e)}"
            logger.error(error_msg)
            return {"success": False, "error": error_msg}

    @staticmethod
    def move_veth_to_namespace(veth_name: str, namespace: str) -> Dict[str, Any]:
        """Mover un extremo veth a un namespace"""
        try:
            # Crear namespace si no existe
            ns_create_cmd = ["ip", "netns", "add", namespace]
            subprocess.run(ns_create_cmd, capture_output=True, text=True)  # No check=True porque puede ya existir
            
            # Mover veth al namespace
            cmd = ["ip", "link", "set", veth_name, "netns", namespace]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            # Levantar la interfaz en el namespace
            up_cmd = ["ip", "netns", "exec", namespace, "ip", "link", "set", veth_name, "up"]
            subprocess.run(up_cmd, capture_output=True, text=True)
            
            logger.info(f"Veth {veth_name} movido a namespace {namespace}")
            return {"success": True, "veth_name": veth_name, "namespace": namespace}
            
        except subprocess.CalledProcessError as e:
            error_msg = f"Error moviendo veth {veth_name} a namespace {namespace}: {e.stderr}"
            logger.error(error_msg)
            return {"success": False, "error": error_msg}

    @staticmethod
    def list_veth_pairs() -> List[VethInfo]:
        """Listar todos los pares veth"""
        veth_pairs = []
        seen_pairs = set()
        
        try:
            # Obtener todas las interfaces veth
            cmd = ["ip", "link", "show", "type", "veth"]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            for line in result.stdout.split('\n'):
                if 'veth' in line and '@' in line:
                    # Parsear línea como: "4: veth1@veth2: <BROADCAST,MULTICAST,UP,LOWER_UP>"
                    match = re.search(r'^\d+:\s+([^@]+)@([^:]+):', line)
                    if match:
                        veth1 = match.group(1)
                        veth2 = match.group(2)
                        
                        # Evitar duplicados (cada par aparece dos veces)
                        pair_key = tuple(sorted([veth1, veth2]))
                        if pair_key not in seen_pairs:
                            seen_pairs.add(pair_key)
                            
                            veth_info = VethService._build_veth_info(veth1, veth2)
                            if veth_info:
                                veth_pairs.append(veth_info)
        
        except subprocess.CalledProcessError as e:
            logger.error(f"Error listando pares veth: {e.stderr}")
        
        return veth_pairs

    @staticmethod
    def get_veth_info(veth_name: str) -> Optional[VethInfo]:
        """Obtener información de un veth específico"""
        try:
            # Obtener información del veth
            cmd = ["ip", "link", "show", veth_name]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            # Buscar el peer
            peer_match = re.search(rf'{veth_name}@([^:]+):', result.stdout)
            if not peer_match:
                return None
            
            peer_name = peer_match.group(1)
            return VethService._build_veth_info(veth_name, peer_name)
            
        except subprocess.CalledProcessError:
            return None

    @staticmethod
    def _build_veth_info(veth1: str, veth2: str) -> Optional[VethInfo]:
        """Construir objeto VethInfo a partir de los nombres"""
        try:
            # Obtener información de cada extremo
            info1 = VethService._get_veth_details(veth1)
            info2 = VethService._get_veth_details(veth2)
            
            return VethInfo(
                name1=veth1,
                name2=veth2,
                peer1=veth2,
                peer2=veth1,
                bridge1=info1.get("bridge"),
                bridge2=info2.get("bridge"),
                namespace1=info1.get("namespace"),
                namespace2=info2.get("namespace"),
                status1=info1.get("status", "unknown"),
                status2=info2.get("status", "unknown")
            )
            
        except Exception as e:
            logger.error(f"Error construyendo info veth {veth1}-{veth2}: {e}")
            return None

    @staticmethod
    def _get_veth_details(veth_name: str) -> Dict[str, Any]:
        """Obtener detalles de un extremo veth"""
        details = {"status": "down", "bridge": None, "namespace": None}
        
        try:
            # Intentar obtener info en el namespace por defecto
            cmd = ["ip", "link", "show", veth_name]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            # Determinar estado
            details["status"] = "up" if "UP" in result.stdout else "down"
            
            # Buscar bridge master
            bridge_match = re.search(r'master\s+(\S+)', result.stdout)
            if bridge_match:
                details["bridge"] = bridge_match.group(1)
            
        except subprocess.CalledProcessError:
            # Puede estar en un namespace
            details["namespace"] = VethService._find_veth_namespace(veth_name)
        
        return details

    @staticmethod
    def _find_veth_namespace(veth_name: str) -> Optional[str]:
        """Encontrar en qué namespace está un veth"""
        try:
            # Listar namespaces
            ns_cmd = ["ip", "netns", "list"]
            ns_result = subprocess.run(ns_cmd, capture_output=True, text=True, check=True)
            
            for line in ns_result.stdout.split('\n'):
                if line.strip():
                    namespace = line.split()[0]
                    
                    # Buscar veth en este namespace
                    veth_cmd = ["ip", "netns", "exec", namespace, "ip", "link", "show", veth_name]
                    veth_result = subprocess.run(veth_cmd, capture_output=True, text=True)
                    
                    if veth_result.returncode == 0:
                        return namespace
            
        except subprocess.CalledProcessError:
            pass
        
        return None

    @staticmethod
    def _get_veth_bridge(veth_name: str) -> Optional[str]:
        """Obtener el bridge al que está conectado un veth"""
        try:
            cmd = ["ip", "link", "show", veth_name]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            bridge_match = re.search(r'master\s+(\S+)', result.stdout)
            if bridge_match:
                return bridge_match.group(1)
                
        except subprocess.CalledProcessError:
            pass
        
        return None
