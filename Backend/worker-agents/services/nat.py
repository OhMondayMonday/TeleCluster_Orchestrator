import subprocess
import logging
import re
import uuid
from typing import Dict, Any, List, Optional
from models.nat import NATAction, Protocol, NATRule, PortForwardRequest, MasqueradeRequest, FirewallRule, NATStatus


logger = logging.getLogger(__name__)


class NATService:
    """Servicio para gestionar NAT, port forwarding y firewall"""
    
    @staticmethod
    def add_port_forward(external_port: int, internal_ip: str, internal_port: int,
                        protocol: Protocol = Protocol.tcp, interface: Optional[str] = None,
                        description: Optional[str] = None) -> Dict[str, Any]:
        """Añadir regla de port forwarding (DNAT)"""
        try:
            rule_id = str(uuid.uuid4())[:8]
            
            # Construir regla DNAT
            cmd = ["iptables", "-t", "nat", "-A", "PREROUTING"]
            
            if interface:
                cmd.extend(["-i", interface])
            
            if protocol != Protocol.all:
                cmd.extend(["-p", protocol.value])
            
            cmd.extend([
                "--dport", str(external_port),
                "-j", "DNAT",
                "--to-destination", f"{internal_ip}:{internal_port}"
            ])
            
            # Añadir comentario para identificar la regla
            if description:
                cmd.extend(["-m", "comment", "--comment", f"{rule_id}:{description}"])
            else:
                cmd.extend(["-m", "comment", "--comment", f"{rule_id}:port_forward"])
            
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            # Añadir regla FORWARD para permitir el tráfico
            forward_cmd = ["iptables", "-A", "FORWARD", "-d", internal_ip]
            if protocol != Protocol.all:
                forward_cmd.extend(["-p", protocol.value])
            forward_cmd.extend([
                "--dport", str(internal_port),
                "-j", "ACCEPT",
                "-m", "comment", "--comment", f"{rule_id}:forward"
            ])
            
            subprocess.run(forward_cmd, capture_output=True, text=True, check=True)
            
            logger.info(f"Port forward creado: {external_port} -> {internal_ip}:{internal_port}")
            return {
                "success": True,
                "rule_id": rule_id,
                "external_port": external_port,
                "internal_ip": internal_ip,
                "internal_port": internal_port,
                "protocol": protocol.value
            }
            
        except subprocess.CalledProcessError as e:
            error_msg = f"Error creando port forward: {e.stderr}"
            logger.error(error_msg)
            return {"success": False, "error": error_msg}

    @staticmethod
    def remove_port_forward(rule_id: Optional[str] = None, external_port: Optional[int] = None,
                           internal_ip: Optional[str] = None, internal_port: Optional[int] = None) -> Dict[str, Any]:
        """Remover regla de port forwarding"""
        try:
            removed_rules = []
            
            if rule_id:
                # Buscar y remover por ID
                removed_rules.extend(NATService._remove_rules_by_comment(rule_id))
            else:
                # Buscar por parámetros
                if external_port and internal_ip and internal_port:
                    # Buscar reglas que coincidan
                    matching_rules = NATService._find_matching_forward_rules(
                        external_port, internal_ip, internal_port
                    )
                    for rule in matching_rules:
                        removed_rules.extend(NATService._remove_rules_by_comment(rule))
            
            if removed_rules:
                logger.info(f"Reglas de port forward removidas: {removed_rules}")
                return {"success": True, "removed_rules": removed_rules}
            else:
                return {"success": False, "error": "No se encontraron reglas coincidentes"}
                
        except Exception as e:
            error_msg = f"Error removiendo port forward: {str(e)}"
            logger.error(error_msg)
            return {"success": False, "error": error_msg}

    @staticmethod
    def add_masquerade(source_network: str, output_interface: str) -> Dict[str, Any]:
        """Añadir regla de masquerade/SNAT"""
        try:
            rule_id = str(uuid.uuid4())[:8]
            
            # Añadir regla MASQUERADE
            cmd = [
                "iptables", "-t", "nat", "-A", "POSTROUTING",
                "-s", source_network,
                "-o", output_interface,
                "-j", "MASQUERADE",
                "-m", "comment", "--comment", f"{rule_id}:masquerade"
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            # Habilitar IP forwarding si no está habilitado
            NATService._enable_ip_forwarding()
            
            logger.info(f"Masquerade añadido: {source_network} -> {output_interface}")
            return {
                "success": True,
                "rule_id": rule_id,
                "source_network": source_network,
                "output_interface": output_interface
            }
            
        except subprocess.CalledProcessError as e:
            error_msg = f"Error añadiendo masquerade: {e.stderr}"
            logger.error(error_msg)
            return {"success": False, "error": error_msg}

    @staticmethod
    def remove_masquerade(source_network: str, output_interface: str) -> Dict[str, Any]:
        """Remover regla de masquerade"""
        try:
            # Buscar y remover reglas coincidentes
            cmd = [
                "iptables", "-t", "nat", "-D", "POSTROUTING",
                "-s", source_network,
                "-o", output_interface,
                "-j", "MASQUERADE"
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            logger.info(f"Masquerade removido: {source_network} -> {output_interface}")
            return {"success": True, "source_network": source_network, "output_interface": output_interface}
            
        except subprocess.CalledProcessError as e:
            error_msg = f"Error removiendo masquerade: {e.stderr}"
            logger.error(error_msg)
            return {"success": False, "error": error_msg}

    @staticmethod
    def add_firewall_rule(chain: str, action: str, protocol: Protocol = Protocol.all,
                         source: Optional[str] = None, destination: Optional[str] = None,
                         port: Optional[int] = None, interface: Optional[str] = None) -> Dict[str, Any]:
        """Añadir regla de firewall"""
        try:
            rule_id = str(uuid.uuid4())[:8]
            
            cmd = ["iptables", "-A", chain.upper()]
            
            if interface:
                if chain.upper() == "INPUT":
                    cmd.extend(["-i", interface])
                elif chain.upper() == "OUTPUT":
                    cmd.extend(["-o", interface])
            
            if protocol != Protocol.all:
                cmd.extend(["-p", protocol.value])
            
            if source:
                cmd.extend(["-s", source])
            
            if destination:
                cmd.extend(["-d", destination])
            
            if port:
                if protocol == Protocol.tcp or protocol == Protocol.udp:
                    cmd.extend(["--dport", str(port)])
            
            cmd.extend(["-j", action.upper()])
            cmd.extend(["-m", "comment", "--comment", f"{rule_id}:firewall"])
            
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            logger.info(f"Regla firewall añadida: {chain} {action}")
            return {
                "success": True,
                "rule_id": rule_id,
                "chain": chain,
                "action": action,
                "protocol": protocol.value
            }
            
        except subprocess.CalledProcessError as e:
            error_msg = f"Error añadiendo regla firewall: {e.stderr}"
            logger.error(error_msg)
            return {"success": False, "error": error_msg}

    @staticmethod
    def list_nat_rules() -> NATStatus:
        """Listar todas las reglas NAT y firewall"""
        port_forwards = []
        masquerade_rules = []
        firewall_rules = []
        
        try:
            # Obtener reglas NAT
            nat_cmd = ["iptables", "-t", "nat", "-L", "-n", "--line-numbers"]
            nat_result = subprocess.run(nat_cmd, capture_output=True, text=True, check=True)
            
            # Parsear reglas DNAT (port forwards)
            port_forwards = NATService._parse_dnat_rules(nat_result.stdout)
            
            # Parsear reglas MASQUERADE
            masquerade_rules = NATService._parse_masquerade_rules(nat_result.stdout)
            
            # Obtener reglas de filtro (firewall)
            filter_cmd = ["iptables", "-L", "-n", "--line-numbers"]
            filter_result = subprocess.run(filter_cmd, capture_output=True, text=True, check=True)
            
            firewall_rules = NATService._parse_firewall_rules(filter_result.stdout)
            
        except subprocess.CalledProcessError as e:
            logger.error(f"Error listando reglas NAT: {e.stderr}")
        
        return NATStatus(
            port_forwards=port_forwards,
            masquerade_rules=masquerade_rules,
            firewall_rules=firewall_rules
        )

    @staticmethod
    def flush_nat_rules() -> Dict[str, Any]:
        """Limpiar todas las reglas NAT"""
        try:
            # Flush NAT table
            subprocess.run(["iptables", "-t", "nat", "-F"], capture_output=True, text=True, check=True)
            
            logger.info("Reglas NAT limpiadas")
            return {"success": True}
            
        except subprocess.CalledProcessError as e:
            error_msg = f"Error limpiando reglas NAT: {e.stderr}"
            logger.error(error_msg)
            return {"success": False, "error": error_msg}

    @staticmethod
    def flush_firewall_rules() -> Dict[str, Any]:
        """Limpiar todas las reglas de firewall"""
        try:
            # Flush filter table
            subprocess.run(["iptables", "-F"], capture_output=True, text=True, check=True)
            
            logger.info("Reglas firewall limpiadas")
            return {"success": True}
            
        except subprocess.CalledProcessError as e:
            error_msg = f"Error limpiando reglas firewall: {e.stderr}"
            logger.error(error_msg)
            return {"success": False, "error": error_msg}

    @staticmethod
    def _enable_ip_forwarding():
        """Habilitar IP forwarding en el sistema"""
        try:
            with open('/proc/sys/net/ipv4/ip_forward', 'w') as f:
                f.write('1')
        except Exception as e:
            logger.warning(f"No se pudo habilitar IP forwarding: {e}")

    @staticmethod
    def _remove_rules_by_comment(rule_id: str) -> List[str]:
        """Remover reglas por comentario/ID"""
        removed = []
        
        try:
            # Buscar en tabla NAT
            nat_cmd = ["iptables", "-t", "nat", "-L", "-n", "--line-numbers"]
            nat_result = subprocess.run(nat_cmd, capture_output=True, text=True, check=True)
            
            lines = nat_result.stdout.split('\n')
            for line in lines:
                if rule_id in line:
                    # Extraer cadena y número de línea
                    parts = line.split()
                    if len(parts) > 0 and parts[0].isdigit():
                        line_num = parts[0]
                        chain = NATService._find_chain_for_line(nat_result.stdout, line)
                        if chain:
                            del_cmd = ["iptables", "-t", "nat", "-D", chain, line_num]
                            subprocess.run(del_cmd, capture_output=True, text=True)
                            removed.append(f"nat:{chain}:{line_num}")
            
            # Buscar en tabla filter
            filter_cmd = ["iptables", "-L", "-n", "--line-numbers"]
            filter_result = subprocess.run(filter_cmd, capture_output=True, text=True, check=True)
            
            lines = filter_result.stdout.split('\n')
            for line in lines:
                if rule_id in line:
                    parts = line.split()
                    if len(parts) > 0 and parts[0].isdigit():
                        line_num = parts[0]
                        chain = NATService._find_chain_for_line(filter_result.stdout, line)
                        if chain:
                            del_cmd = ["iptables", "-D", chain, line_num]
                            subprocess.run(del_cmd, capture_output=True, text=True)
                            removed.append(f"filter:{chain}:{line_num}")
        
        except subprocess.CalledProcessError:
            pass
        
        return removed

    @staticmethod
    def _find_chain_for_line(iptables_output: str, target_line: str) -> Optional[str]:
        """Encontrar la cadena a la que pertenece una línea"""
        lines = iptables_output.split('\n')
        current_chain = None
        
        for line in lines:
            if line.startswith('Chain '):
                current_chain = line.split()[1]
            elif line == target_line and current_chain:
                return current_chain
        
        return None

    @staticmethod
    def _find_matching_forward_rules(external_port: int, internal_ip: str, internal_port: int) -> List[str]:
        """Encontrar reglas de port forward que coincidan con los parámetros"""
        # Implementación simplificada que busca comentarios
        # En una implementación real, se parsearian las reglas más detalladamente
        return []

    @staticmethod
    def _parse_dnat_rules(nat_output: str) -> List[NATRule]:
        """Parsear reglas DNAT del output de iptables"""
        rules = []
        
        lines = nat_output.split('\n')
        in_prerouting = False
        
        for line in lines:
            if 'Chain PREROUTING' in line:
                in_prerouting = True
                continue
            elif line.startswith('Chain '):
                in_prerouting = False
                continue
            
            if in_prerouting and 'DNAT' in line:
                # Parsear regla DNAT
                rule = NATService._parse_nat_rule_line(line, NATAction.dnat)
                if rule:
                    rules.append(rule)
        
        return rules

    @staticmethod
    def _parse_masquerade_rules(nat_output: str) -> List[NATRule]:
        """Parsear reglas MASQUERADE del output de iptables"""
        rules = []
        
        lines = nat_output.split('\n')
        in_postrouting = False
        
        for line in lines:
            if 'Chain POSTROUTING' in line:
                in_postrouting = True
                continue
            elif line.startswith('Chain '):
                in_postrouting = False
                continue
            
            if in_postrouting and 'MASQUERADE' in line:
                # Parsear regla MASQUERADE
                rule = NATService._parse_nat_rule_line(line, NATAction.masquerade)
                if rule:
                    rules.append(rule)
        
        return rules

    @staticmethod
    def _parse_firewall_rules(filter_output: str) -> List[FirewallRule]:
        """Parsear reglas de firewall del output de iptables"""
        rules = []
        
        # Implementación simplificada
        # En una implementación real, se parsearian todas las reglas detalladamente
        
        return rules

    @staticmethod
    def _parse_nat_rule_line(line: str, action: NATAction) -> Optional[NATRule]:
        """Parsear una línea de regla NAT"""
        try:
            # Implementación simplificada del parseo
            # En una implementación real, se parsearian todos los campos
            
            rule_id = None
            comment_match = re.search(r'\/\*\s*([^:]+):', line)
            if comment_match:
                rule_id = comment_match.group(1)
            
            return NATRule(
                id=rule_id,
                action=action,
                protocol=Protocol.tcp,  # Simplificado
                enabled=True
            )
        
        except Exception:
            return None
