from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from enum import Enum


class ResponseStatus(str, Enum):
    """Estados posibles de respuesta"""
    ok = "ok"
    error = "error"
    warning = "warning"


class APIResponse(BaseModel):
    """Respuesta estándar de la API"""
    status: ResponseStatus
    message: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class InterfaceType(str, Enum):
    """Tipos de interfaz de red"""
    physical = "physical"
    bridge = "bridge" 
    veth = "veth"
    tun = "tun"
    tap = "tap"
    vlan = "vlan"
    bond = "bond"
    virtual = "virtual"


class InterfaceStatus(str, Enum):
    """Estados de interfaz"""
    up = "up"
    down = "down"
    unknown = "unknown"


class NetworkInterface(BaseModel):
    """Modelo para representar una interfaz de red"""
    name: str = Field(..., description="Nombre de la interfaz")
    type: InterfaceType = Field(..., description="Tipo de interfaz")
    status: InterfaceStatus = Field(..., description="Estado de la interfaz")
    mtu: Optional[int] = Field(None, description="MTU de la interfaz")
    mac_address: Optional[str] = Field(None, description="Dirección MAC")
    ip_addresses: List[str] = Field(default_factory=list, description="Direcciones IP")
    bridge: Optional[str] = Field(None, description="Bridge al que pertenece")
    vlans: List[int] = Field(default_factory=list, description="VLANs configuradas")

    @validator('name')
    def validate_interface_name(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('El nombre de la interfaz no puede estar vacío')
        if len(v) > 15:  # Límite del kernel de Linux
            raise ValueError('El nombre de la interfaz no puede exceder 15 caracteres')
        return v.strip()


class NetworkTopology(BaseModel):
    """Modelo para representar la topología de red"""
    interfaces: List[NetworkInterface] = Field(default_factory=list)
    bridges: List[str] = Field(default_factory=list)
    routes: List[Dict[str, str]] = Field(default_factory=list)
    
    
class HealthStatus(BaseModel):
    """Estado de salud del worker"""
    status: str
    timestamp: str
    uptime: float
    system_info: Dict[str, Any] = Field(default_factory=dict)
    network_info: Dict[str, Any] = Field(default_factory=dict)
