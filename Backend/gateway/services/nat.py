"""
Servicio para gestión de reglas NAT/Port Forwarding usando iptables
"""

import subprocess
import logging
import uuid
import json
import os
from datetime import datetime
from typing import List, Optional, Dict

from models.nat import PortForwardRequest, PortForwardRule, GatewayStatus


class NATService:
    """Servicio para gestión de reglas NAT (DNAT en PREROUTING)"""
    
    def __init__(self, rules_file: str = "/tmp/gateway_rules.json"):
        """
        Inicializa el servicio NAT
        
        Args:
            rules_file: Archivo para persistir las reglas configuradas
        """
        self.logger = logging.getLogger(__name__)
        self.rules_file = rules_file
        self.rules: Dict[str, PortForwardRule] = {}
        self._load_rules()
    
    def _run_command(self, command: str) -> subprocess.CompletedProcess:
        """
        Ejecuta un comando de sistema de forma segura
        
        Args:
            command: Comando a ejecutar
            
        Returns:
            CompletedProcess con el resultado
            
        Raises:
            RuntimeError: Si el comando falla
        """
        try:
            self.logger.info(f"Ejecutando comando: {command}")
            result = subprocess.run(
                command, 
                shell=True, 
                capture_output=True, 
                text=True, 
                check=True
            )
            self.logger.debug(f"Comando exitoso: {result.stdout}")
            return result
        except subprocess.CalledProcessError as e:
            error_msg = f"Error ejecutando comando '{command}': {e.stderr}"
            self.logger.error(error_msg)
            raise RuntimeError(error_msg)
    
    def _check_iptables_available(self) -> bool:
        """
        Verifica si iptables está disponible en el sistema
        
        Returns:
            True si iptables está disponible
        """
        try:
            subprocess.run(['iptables', '--version'], 
                         capture_output=True, check=True)
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            return False
    
    def _load_rules(self):
        """Carga las reglas desde el archivo de persistencia"""
        if os.path.exists(self.rules_file):
            try:
                with open(self.rules_file, 'r') as f:
                    data = json.load(f)
                    for rule_data in data.values():
                        rule_data['created_at'] = datetime.fromisoformat(rule_data['created_at'])
                        self.rules[rule_data['id']] = PortForwardRule(**rule_data)
                self.logger.info(f"Cargadas {len(self.rules)} reglas desde {self.rules_file}")
            except Exception as e:
                self.logger.error(f"Error cargando reglas: {e}")
                self.rules = {}
    
    def _save_rules(self):
        """Guarda las reglas en el archivo de persistencia"""
        try:
            data = {}
            for rule_id, rule in self.rules.items():
                rule_dict = rule.dict()
                rule_dict['created_at'] = rule_dict['created_at'].isoformat()
                data[rule_id] = rule_dict
            
            with open(self.rules_file, 'w') as f:
                json.dump(data, f, indent=2)
            self.logger.debug(f"Reglas guardadas en {self.rules_file}")
        except Exception as e:
            self.logger.error(f"Error guardando reglas: {e}")
    
    def _port_in_use(self, port: int, protocol: str) -> bool:
        """
        Verifica si un puerto externo ya está siendo usado
        
        Args:
            port: Puerto a verificar
            protocol: Protocolo (tcp/udp)
            
        Returns:
            True si el puerto está en uso
        """
        for rule in self.rules.values():
            if (rule.external_port == port and 
                rule.protocol == protocol and 
                rule.active):
                return True
        return False
    
    def create_port_forward(self, request: PortForwardRequest) -> str:
        """
        Crea una nueva regla de port forwarding (DNAT en PREROUTING)
        
        Args:
            request: Datos de la regla a crear
            
        Returns:
            ID de la regla creada
            
        Raises:
            ValueError: Si el puerto ya está en uso o datos inválidos
            RuntimeError: Si falla la creación de la regla iptables
        """
        # Verificar si iptables está disponible
        if not self._check_iptables_available():
            raise RuntimeError("iptables no está disponible en el sistema")
        
        # Verificar si el puerto ya está en uso
        if self._port_in_use(request.external_port, request.protocol):
            raise ValueError(
                f"Puerto {request.external_port}/{request.protocol} ya está en uso"
            )
        
        # Generar ID único para la regla
        rule_id = str(uuid.uuid4())[:8]
        
        # Crear la regla iptables DNAT en PREROUTING
        iptables_cmd = (
            f"iptables -t nat -A PREROUTING "
            f"-p {request.protocol} --dport {request.external_port} "
            f"-j DNAT --to-destination {request.internal_ip}:{request.internal_port} "
            f"-m comment --comment 'GATEWAY-{rule_id}'"
        )
        
        try:
            self._run_command(iptables_cmd)
        except RuntimeError as e:
            raise RuntimeError(f"Error creando regla iptables: {e}")
        
        # Crear el objeto regla
        rule = PortForwardRule(
            id=rule_id,
            external_port=request.external_port,
            internal_ip=request.internal_ip,
            internal_port=request.internal_port,
            protocol=request.protocol,
            description=request.description,
            created_at=datetime.now(),
            active=True
        )
        
        # Guardar la regla
        self.rules[rule_id] = rule
        self._save_rules()
        
        self.logger.info(
            f"Regla NAT creada: {request.external_port}/{request.protocol} -> "
            f"{request.internal_ip}:{request.internal_port} (ID: {rule_id})"
        )
        
        return rule_id
    
    def delete_port_forward(self, rule_id: Optional[str] = None, 
                          external_port: Optional[int] = None,
                          protocol: str = "tcp") -> bool:
        """
        Elimina una regla de port forwarding
        
        Args:
            rule_id: ID de la regla a eliminar
            external_port: Puerto externo (alternativa al rule_id)
            protocol: Protocolo (usado con external_port)
            
        Returns:
            True si la regla fue eliminada exitosamente
            
        Raises:
            ValueError: Si no se encuentra la regla
            RuntimeError: Si falla la eliminación de la regla iptables
        """
        target_rule = None
        target_rule_id = None
        
        # Buscar la regla por ID o puerto
        if rule_id:
            if rule_id in self.rules:
                target_rule = self.rules[rule_id]
                target_rule_id = rule_id
        elif external_port:
            for rid, rule in self.rules.items():
                if (rule.external_port == external_port and 
                    rule.protocol == protocol and 
                    rule.active):
                    target_rule = rule
                    target_rule_id = rid
                    break
        
        if not target_rule:
            raise ValueError("Regla no encontrada")
        
        # Eliminar la regla de iptables
        # Primero listar las reglas PREROUTING para encontrar la línea exacta
        try:
            list_cmd = "iptables -t nat -S PREROUTING"
            result = self._run_command(list_cmd)
            
            # Buscar la regla con nuestro comentario
            for line in result.stdout.split('\n'):
                if f"GATEWAY-{target_rule_id}" in line:
                    # Convertir la línea de -A a -D para eliminarla
                    delete_cmd = line.replace("-A PREROUTING", "iptables -t nat -D PREROUTING")
                    self._run_command(delete_cmd)
                    break
            else:
                self.logger.warning(f"Regla iptables no encontrada para ID: {target_rule_id}")
        
        except RuntimeError as e:
            raise RuntimeError(f"Error eliminando regla iptables: {e}")
        
        # Marcar la regla como inactiva y eliminar del almacén
        del self.rules[target_rule_id]
        self._save_rules()
        
        self.logger.info(f"Regla NAT eliminada: ID {target_rule_id}")
        return True
    
    def list_port_forwards(self) -> List[PortForwardRule]:
        """
        Lista todas las reglas de port forwarding activas
        
        Returns:
            Lista de reglas activas
        """
        return [rule for rule in self.rules.values() if rule.active]
    
    def get_port_forward(self, rule_id: str) -> Optional[PortForwardRule]:
        """
        Obtiene una regla específica por ID
        
        Args:
            rule_id: ID de la regla
            
        Returns:
            Regla encontrada o None
        """
        return self.rules.get(rule_id)
    
    def get_gateway_status(self) -> GatewayStatus:
        """
        Obtiene el estado actual del gateway
        
        Returns:
            Estado del gateway
        """
        active_rules = len([r for r in self.rules.values() if r.active])
        total_rules = len(self.rules)
        
        return GatewayStatus(
            status="running" if self._check_iptables_available() else "error",
            active_rules=active_rules,
            total_rules=total_rules,
            iptables_available=self._check_iptables_available(),
            last_update=datetime.now()
        )
    
    def flush_all_rules(self):
        """
        Elimina todas las reglas NAT del gateway (solo las creadas por este servicio)
        
        Raises:
            RuntimeError: Si falla la eliminación
        """
        try:
            # Listar reglas PREROUTING
            list_cmd = "iptables -t nat -S PREROUTING"
            result = self._run_command(list_cmd)
            
            # Eliminar todas las reglas que contengan nuestro comentario
            for line in result.stdout.split('\n'):
                if "GATEWAY-" in line:
                    delete_cmd = line.replace("-A PREROUTING", "iptables -t nat -D PREROUTING")
                    try:
                        self._run_command(delete_cmd)
                    except RuntimeError:
                        # Continuar aunque falle una regla específica
                        continue
        
        except RuntimeError as e:
            raise RuntimeError(f"Error eliminando reglas: {e}")
        
        # Limpiar el almacén de reglas
        self.rules.clear()
        self._save_rules()
        
        self.logger.info("Todas las reglas NAT del gateway han sido eliminadas")
