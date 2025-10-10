"""
Modelos Pydantic para gestión de NAT/Port Forwarding
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime
import ipaddress


class PortForwardRequest(BaseModel):
    """Modelo para crear una regla de port forwarding (DNAT)"""
    external_port: int = Field(
        ..., 
        ge=1, 
        le=65535, 
        description="Puerto externo a redireccionar"
    )
    internal_ip: str = Field(
        ..., 
        description="IP interna de destino"
    )
    internal_port: int = Field(
        ..., 
        ge=1, 
        le=65535, 
        description="Puerto interno de destino"
    )
    protocol: str = Field(
        default="tcp", 
        description="Protocolo (tcp/udp)"
    )
    description: Optional[str] = Field(
        None, 
        max_length=200, 
        description="Descripción opcional de la regla"
    )

    @validator('protocol')
    def validate_protocol(cls, v):
        if v.lower() not in ['tcp', 'udp']:
            raise ValueError('Protocol must be tcp or udp')
        return v.lower()

    @validator('internal_ip')
    def validate_ip(cls, v):
        try:
            ipaddress.ip_address(v)
        except ValueError:
            raise ValueError('Invalid IP address format')
        return v


class PortForwardRule(BaseModel):
    """Modelo para representar una regla de port forwarding activa"""
    id: str = Field(..., description="ID único de la regla")
    external_port: int = Field(..., description="Puerto externo")
    internal_ip: str = Field(..., description="IP interna de destino")
    internal_port: int = Field(..., description="Puerto interno de destino")
    protocol: str = Field(..., description="Protocolo (tcp/udp)")
    description: Optional[str] = Field(None, description="Descripción de la regla")
    created_at: datetime = Field(..., description="Fecha de creación")
    active: bool = Field(default=True, description="Estado de la regla")


class PortForwardResponse(BaseModel):
    """Respuesta al crear/modificar una regla de port forwarding"""
    success: bool = Field(..., description="Indica si la operación fue exitosa")
    message: str = Field(..., description="Mensaje descriptivo de la operación")
    rule_id: Optional[str] = Field(None, description="ID de la regla creada/modificada")
    rule: Optional[PortForwardRule] = Field(None, description="Datos de la regla")


class PortForwardListResponse(BaseModel):
    """Respuesta para listar reglas de port forwarding"""
    success: bool = Field(..., description="Indica si la operación fue exitosa")
    total_count: int = Field(..., description="Número total de reglas")
    rules: List[PortForwardRule] = Field(..., description="Lista de reglas activas")


class DeletePortForwardRequest(BaseModel):
    """Modelo para eliminar una regla de port forwarding"""
    rule_id: Optional[str] = Field(None, description="ID de la regla a eliminar")
    external_port: Optional[int] = Field(None, description="Puerto externo de la regla a eliminar")

    @validator('rule_id', 'external_port')
    def validate_identifier(cls, v, values):
        # Al menos uno debe estar presente
        if not v and not values.get('external_port') and not values.get('rule_id'):
            raise ValueError('Must provide either rule_id or external_port')
        return v


class GatewayStatus(BaseModel):
    """Estado del gateway"""
    service: str = Field(default="gateway", description="Nombre del servicio")
    status: str = Field(..., description="Estado del servicio")
    active_rules: int = Field(..., description="Número de reglas activas")
    total_rules: int = Field(..., description="Total de reglas configuradas")
    iptables_available: bool = Field(..., description="Si iptables está disponible")
    last_update: datetime = Field(..., description="Última actualización de estado")


class APIResponse(BaseModel):
    """Respuesta genérica de la API"""
    success: bool = Field(..., description="Indica si la operación fue exitosa")
    message: str = Field(..., description="Mensaje descriptivo")
    timestamp: datetime = Field(default_factory=datetime.now, description="Timestamp de la respuesta")
