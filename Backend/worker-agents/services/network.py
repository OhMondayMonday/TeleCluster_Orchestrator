import subprocess
import logging
import psutil
import re
from typing import Dict, Any, List
from models.network import NetworkInterface, InterfaceType, InterfaceStatus, NetworkTopology, HealthStatus
from datetime import datetime
import platform


logger = logging.getLogger(__name__)


class NetworkService:
    """Servicio para operaciones generales de red"""
    
    @staticmethod
    def list_interfaces() -> List[NetworkInterface]:
        """Listar todas las interfaces de red"""
        interfaces = []
        
        try:
            # Usar ip link para obtener interfaces
            cmd = ["ip", "link", "show"]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            current_interface = None
            
            for line in result.stdout.split('\n'):
                line = line.strip()
                if not line:
                    continue
                
                # Línea principal de interfaz: "2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP>"
                if re.match(r'^\d+:', line):
                    if current_interface:
                        interfaces.append(current_interface)
                    
                    current_interface = NetworkService._parse_interface_line(line)
                
                # Línea secundaria con MAC: "link/ether 00:11:22:33:44:55"
                elif current_interface and line.startswith('link/'):
                    mac_match = re.search(r'link/\w+\s+([a-f0-9:]{17})', line)
                    if mac_match:
                        current_interface.mac_address = mac_match.group(1)
            
            # Añadir la última interfaz
            if current_interface:
                interfaces.append(current_interface)
            
            # Enriquecer con información adicional
            for interface in interfaces:
                NetworkService._enrich_interface_info(interface)
        
        except subprocess.CalledProcessError as e:
            logger.error(f"Error listando interfaces: {e.stderr}")
        
        return interfaces

    @staticmethod
    def get_interface_info(interface_name: str) -> NetworkInterface:
        """Obtener información detallada de una interfaz"""
        try:
            cmd = ["ip", "link", "show", interface_name]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            interface = None
            for line in result.stdout.split('\n'):
                if re.match(r'^\d+:', line):
                    interface = NetworkService._parse_interface_line(line)
                    break
            
            if interface:
                NetworkService._enrich_interface_info(interface)
                return interface
            
        except subprocess.CalledProcessError:
            pass
        
        # Retornar interfaz básica si no se puede obtener info
        return NetworkInterface(
            name=interface_name,
            type=InterfaceType.unknown,
            status=InterfaceStatus.unknown
        )

    @staticmethod
    def get_network_topology() -> NetworkTopology:
        """Obtener topología completa de red"""
        interfaces = NetworkService.list_interfaces()
        bridges = NetworkService._get_bridges()
        routes = NetworkService._get_routes()
        
        return NetworkTopology(
            interfaces=interfaces,
            bridges=bridges,
            routes=routes
        )

    @staticmethod
    def get_system_health() -> HealthStatus:
        """Obtener estado de salud del sistema"""
        try:
            # Información básica del sistema
            system_info = {
                "hostname": platform.node(),
                "platform": platform.platform(),
                "architecture": platform.architecture()[0],
                "cpu_count": psutil.cpu_count(),
                "memory_total": psutil.virtual_memory().total,
                "memory_available": psutil.virtual_memory().available,
                "disk_usage": {
                    partition.mountpoint: {
                        "total": psutil.disk_usage(partition.mountpoint).total,
                        "used": psutil.disk_usage(partition.mountpoint).used,
                        "free": psutil.disk_usage(partition.mountpoint).free
                    }
                    for partition in psutil.disk_partitions()
                    if partition.mountpoint in ['/', '/tmp', '/var']
                }
            }
            
            # Información de red
            network_info = {
                "interface_count": len(NetworkService.list_interfaces()),
                "bridge_count": len(NetworkService._get_bridges()),
                "network_connections": len(psutil.net_connections()),
                "network_io": dict(psutil.net_io_counters()._asdict())
            }
            
            # Determinar estado general
            memory_usage = (system_info["memory_total"] - system_info["memory_available"]) / system_info["memory_total"]
            
            if memory_usage > 0.9:
                status = "critical"
            elif memory_usage > 0.8:
                status = "warning"
            else:
                status = "healthy"
            
            return HealthStatus(
                status=status,
                timestamp=datetime.now().isoformat(),
                uptime=psutil.boot_time(),
                system_info=system_info,
                network_info=network_info
            )
            
        except Exception as e:
            logger.error(f"Error obteniendo estado del sistema: {e}")
            return HealthStatus(
                status="error",
                timestamp=datetime.now().isoformat(),
                uptime=0.0,
                system_info={"error": str(e)},
                network_info={}
            )

    @staticmethod
    def ping_host(target: str, count: int = 4) -> Dict[str, Any]:
        """Hacer ping a un host"""
        try:
            cmd = ["ping", "-c", str(count), target]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            # Parsear resultados
            lines = result.stdout.split('\n')
            stats_line = [line for line in lines if 'packet loss' in line]
            
            if stats_line:
                # Extraer estadísticas
                stats = stats_line[0]
                loss_match = re.search(r'(\d+)% packet loss', stats)
                packet_loss = int(loss_match.group(1)) if loss_match else 100
                
                return {
                    "success": True,
                    "target": target,
                    "packets_sent": count,
                    "packet_loss_percent": packet_loss,
                    "output": result.stdout
                }
            
        except subprocess.CalledProcessError as e:
            return {
                "success": False,
                "target": target,
                "error": e.stderr,
                "packet_loss_percent": 100
            }
        
        return {"success": False, "target": target, "error": "Unknown error"}

    @staticmethod
    def traceroute(target: str) -> Dict[str, Any]:
        """Hacer traceroute a un destino"""
        try:
            cmd = ["traceroute", "-n", target]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True, timeout=30)
            
            return {
                "success": True,
                "target": target,
                "output": result.stdout
            }
            
        except subprocess.CalledProcessError as e:
            return {
                "success": False,
                "target": target,
                "error": e.stderr
            }
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "target": target,
                "error": "Traceroute timeout"
            }

    @staticmethod
    def _parse_interface_line(line: str) -> NetworkInterface:
        """Parsear línea de interfaz de 'ip link show'"""
        # Ejemplo: "2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500"
        
        # Extraer nombre
        name_match = re.search(r'^\d+:\s+([^:@]+)', line)
        name = name_match.group(1) if name_match else "unknown"
        
        # Determinar tipo de interfaz
        interface_type = NetworkService._determine_interface_type(name, line)
        
        # Determinar estado
        status = InterfaceStatus.up if "UP" in line else InterfaceStatus.down
        
        # Extraer MTU
        mtu_match = re.search(r'mtu\s+(\d+)', line)
        mtu = int(mtu_match.group(1)) if mtu_match else None
        
        return NetworkInterface(
            name=name,
            type=interface_type,
            status=status,
            mtu=mtu
        )

    @staticmethod
    def _determine_interface_type(name: str, line: str) -> InterfaceType:
        """Determinar el tipo de interfaz basado en nombre y características"""
        
        # Interfaces físicas comunes
        if any(prefix in name for prefix in ['eth', 'ens', 'enp', 'em', 'p']):
            return InterfaceType.physical
        
        # Bridges
        if 'bridge' in line or name.startswith('br-') or name.startswith('virbr'):
            return InterfaceType.bridge
        
        # Veth pairs
        if 'veth' in name or '@' in line:
            return InterfaceType.veth
        
        # TUN/TAP
        if name.startswith('tun'):
            return InterfaceType.tun
        elif name.startswith('tap') or name.startswith('vnet'):
            return InterfaceType.tap
        
        # VLAN
        if '.' in name and any(char.isdigit() for char in name.split('.')[-1]):
            return InterfaceType.vlan
        
        # Bond
        if name.startswith('bond'):
            return InterfaceType.bond
        
        # Loopback y otras interfaces virtuales
        if name == 'lo' or name.startswith('docker') or name.startswith('veth'):
            return InterfaceType.virtual
        
        return InterfaceType.physical  # Por defecto

    @staticmethod
    def _enrich_interface_info(interface: NetworkInterface):
        """Enriquecer información de interfaz con detalles adicionales"""
        try:
            # Obtener direcciones IP
            ip_cmd = ["ip", "addr", "show", interface.name]
            ip_result = subprocess.run(ip_cmd, capture_output=True, text=True, check=True)
            
            # Extraer IPs
            ip_addresses = []
            for line in ip_result.stdout.split('\n'):
                ip_match = re.search(r'inet\s+([0-9.]+/\d+)', line)
                if ip_match:
                    ip_addresses.append(ip_match.group(1))
            
            interface.ip_addresses = ip_addresses
            
            # Obtener bridge master si aplica
            master_match = re.search(r'master\s+(\S+)', ip_result.stdout)
            if master_match:
                interface.bridge = master_match.group(1)
            
        except subprocess.CalledProcessError:
            pass

    @staticmethod
    def _get_bridges() -> List[str]:
        """Obtener lista de bridges"""
        bridges = []
        
        try:
            # Bridges Linux
            cmd = ["ip", "link", "show", "type", "bridge"]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            for line in result.stdout.split('\n'):
                match = re.search(r'^\d+:\s+([^:]+):', line)
                if match:
                    bridges.append(match.group(1))
        
        except subprocess.CalledProcessError:
            pass
        
        try:
            # Bridges OVS
            cmd = ["ovs-vsctl", "list-br"]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            for bridge in result.stdout.strip().split('\n'):
                if bridge.strip():
                    bridges.append(bridge.strip())
        
        except subprocess.CalledProcessError:
            pass
        
        return list(set(bridges))  # Remover duplicados

    @staticmethod
    def _get_routes() -> List[Dict[str, str]]:
        """Obtener tabla de rutas"""
        routes = []
        
        try:
            cmd = ["ip", "route", "show"]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            for line in result.stdout.split('\n'):
                if line.strip():
                    route = NetworkService._parse_route_line(line)
                    if route:
                        routes.append(route)
        
        except subprocess.CalledProcessError:
            pass
        
        return routes

    @staticmethod
    def _parse_route_line(line: str) -> Dict[str, str]:
        """Parsear una línea de ruta"""
        # Ejemplo: "default via 192.168.1.1 dev eth0"
        # Ejemplo: "192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.100"
        
        parts = line.split()
        route = {}
        
        if len(parts) >= 1:
            route["destination"] = parts[0]
        
        # Buscar gateway
        if "via" in parts:
            via_index = parts.index("via")
            if via_index + 1 < len(parts):
                route["gateway"] = parts[via_index + 1]
        
        # Buscar interfaz
        if "dev" in parts:
            dev_index = parts.index("dev")
            if dev_index + 1 < len(parts):
                route["interface"] = parts[dev_index + 1]
        
        # Buscar fuente
        if "src" in parts:
            src_index = parts.index("src")
            if src_index + 1 < len(parts):
                route["source"] = parts[src_index + 1]
        
        return route
