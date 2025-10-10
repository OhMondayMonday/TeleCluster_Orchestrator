from pydantic import BaseModel, Field, validator
from typing import Optional
from enum import Enum


class VLANProtocol(str, Enum):
    """Protocolos VLAN soportados"""
    ieee8021q = "802.1Q"
    ieee8021ad = "802.1ad"  # QinQ


class VLANCreateRequest(BaseModel):
    """Solicitud para crear una VLAN"""
    parent_interface: str = Field(..., description="Interfaz padre para la VLAN")
    vlan_id: int = Field(..., description="ID de la VLAN", ge=1, le=4094)
    name: Optional[str] = Field(None, description="Nombre personalizado para la interfaz VLAN")
    protocol: VLANProtocol = Field(default=VLANProtocol.ieee8021q, description="Protocolo VLAN")
    
    @validator('vlan_id')
    def validate_vlan_id(cls, v):
        if v < 1 or v > 4094:
            raise ValueError('El VLAN ID debe estar entre 1 y 4094')
        return v


class VLANDeleteRequest(BaseModel):
    """Solicitud para eliminar una VLAN"""
    parent_interface: str = Field(..., description="Interfaz padre")
    vlan_id: int = Field(..., description="ID de la VLAN a eliminar")


class VLANAddToBridgeRequest(BaseModel):
    """Solicitud para añadir VLAN a un bridge"""
    bridge_name: str = Field(..., description="Nombre del bridge")
    port_name: str = Field(..., description="Puerto del bridge")
    vlan_id: int = Field(..., description="ID de la VLAN", ge=1, le=4094)
    tagged: bool = Field(default=True, description="VLAN tagged (true) o untagged (false)")


class VLANRemoveFromBridgeRequest(BaseModel):
    """Solicitud para remover VLAN de un bridge"""
    bridge_name: str = Field(..., description="Nombre del bridge")
    port_name: str = Field(..., description="Puerto del bridge")
    vlan_id: int = Field(..., description="ID de la VLAN", ge=1, le=4094)


class VLANInfo(BaseModel):
    """Información de una VLAN"""
    parent_interface: str
    vlan_id: int
    interface_name: str
    protocol: VLANProtocol
    status: str
    mtu: Optional[int] = None


class BridgeVLANInfo(BaseModel):
    """Información de VLAN en bridge"""
    bridge_name: str
    port_name: str
    vlan_id: int
    tagged: bool
