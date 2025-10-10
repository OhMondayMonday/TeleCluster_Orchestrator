from pydantic import BaseModel, Field, validator
from typing import Optional, List
from enum import Enum


class NATAction(str, Enum):
    """Acciones de NAT/Port Forwarding"""
    dnat = "DNAT"
    snat = "SNAT"
    masquerade = "MASQUERADE"


class Protocol(str, Enum):
    """Protocolos soportados"""
    tcp = "tcp"
    udp = "udp"
    icmp = "icmp"
    all = "all"


class NATRule(BaseModel):
    """Regla de NAT/Port Forwarding"""
    id: Optional[str] = Field(None, description="ID único de la regla")
    action: NATAction = Field(..., description="Acción a realizar")
    protocol: Protocol = Field(..., description="Protocolo")
    source_ip: Optional[str] = Field(None, description="IP origen")
    source_port: Optional[int] = Field(None, description="Puerto origen")
    dest_ip: Optional[str] = Field(None, description="IP destino")
    dest_port: Optional[int] = Field(None, description="Puerto destino")
    interface: Optional[str] = Field(None, description="Interfaz de entrada/salida")
    enabled: bool = Field(default=True, description="Regla habilitada")
    
    @validator('source_port', 'dest_port')
    def validate_port(cls, v):
        if v is not None and (v < 1 or v > 65535):
            raise ValueError('El puerto debe estar entre 1 y 65535')
        return v


class PortForwardRequest(BaseModel):
    """Solicitud para crear port forwarding"""
    external_port: int = Field(..., description="Puerto externo", ge=1, le=65535)
    internal_ip: str = Field(..., description="IP interna destino")
    internal_port: int = Field(..., description="Puerto interno destino", ge=1, le=65535)
    protocol: Protocol = Field(default=Protocol.tcp, description="Protocolo")
    interface: Optional[str] = Field(None, description="Interfaz externa")
    description: Optional[str] = Field(None, description="Descripción de la regla")


class PortForwardDeleteRequest(BaseModel):
    """Solicitud para eliminar port forwarding"""
    rule_id: Optional[str] = Field(None, description="ID de la regla")
    external_port: Optional[int] = Field(None, description="Puerto externo")
    internal_ip: Optional[str] = Field(None, description="IP interna")
    internal_port: Optional[int] = Field(None, description="Puerto interno")


class MasqueradeRequest(BaseModel):
    """Solicitud para configurar masquerade/SNAT"""
    source_network: str = Field(..., description="Red origen (ej: 192.168.1.0/24)")
    output_interface: str = Field(..., description="Interfaz de salida")
    enabled: bool = Field(default=True, description="Habilitar masquerade")


class FirewallRule(BaseModel):
    """Regla de firewall"""
    id: Optional[str] = None
    chain: str = Field(..., description="Cadena iptables (INPUT, OUTPUT, FORWARD)")
    action: str = Field(..., description="Acción (ACCEPT, DROP, REJECT)")
    protocol: Protocol = Field(..., description="Protocolo")
    source: Optional[str] = Field(None, description="IP/Red origen")
    destination: Optional[str] = Field(None, description="IP/Red destino")
    port: Optional[int] = Field(None, description="Puerto")
    interface: Optional[str] = Field(None, description="Interfaz")
    enabled: bool = Field(default=True)


class NATStatus(BaseModel):
    """Estado del sistema NAT"""
    port_forwards: List[NATRule] = Field(default_factory=list)
    masquerade_rules: List[NATRule] = Field(default_factory=list)
    firewall_rules: List[FirewallRule] = Field(default_factory=list)
