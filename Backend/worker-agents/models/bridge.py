from pydantic import BaseModel, Field, validator
from typing import Optional, List
from enum import Enum


class BridgeType(str, Enum):
    """Tipos de bridge soportados"""
    linux = "linux"
    ovs = "ovs"


class BridgeCreateRequest(BaseModel):
    """Solicitud para crear un bridge"""
    name: str = Field(..., description="Nombre del bridge", min_length=1, max_length=15)
    type: BridgeType = Field(default=BridgeType.linux, description="Tipo de bridge")
    stp: bool = Field(default=False, description="Habilitar Spanning Tree Protocol")
    
    @validator('name')
    def validate_bridge_name(cls, v):
        if not v.replace('-', '').replace('_', '').isalnum():
            raise ValueError('El nombre del bridge solo puede contener letras, números, guiones y guiones bajos')
        return v


class BridgeDeleteRequest(BaseModel):
    """Solicitud para eliminar un bridge"""
    name: str = Field(..., description="Nombre del bridge a eliminar")
    force: bool = Field(default=False, description="Forzar eliminación aunque tenga interfaces")


class BridgeAddPortRequest(BaseModel):
    """Solicitud para añadir puerto a bridge"""
    bridge_name: str = Field(..., description="Nombre del bridge")
    port_name: str = Field(..., description="Nombre del puerto/interfaz")
    vlan: Optional[int] = Field(None, description="VLAN ID (si aplica)", ge=1, le=4094)


class BridgeRemovePortRequest(BaseModel):
    """Solicitud para remover puerto de bridge"""
    bridge_name: str = Field(..., description="Nombre del bridge")
    port_name: str = Field(..., description="Nombre del puerto/interfaz")


class BridgeInfo(BaseModel):
    """Información de un bridge"""
    name: str
    type: BridgeType
    stp: bool
    ports: List[str] = Field(default_factory=list)
    vlans: List[int] = Field(default_factory=list)
    status: str


class BridgeListResponse(BaseModel):
    """Respuesta con lista de bridges"""
    bridges: List[BridgeInfo] = Field(default_factory=list)
