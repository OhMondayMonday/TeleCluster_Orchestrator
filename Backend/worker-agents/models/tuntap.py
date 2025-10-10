from pydantic import BaseModel, Field, validator
from typing import Optional
from enum import Enum


class TunTapType(str, Enum):
    """Tipos de interfaz TUN/TAP"""
    tun = "tun"
    tap = "tap"


class TunTapMode(str, Enum):
    """Modos de operación"""
    user = "user"
    group = "group"
    root = "root"


class TunTapCreateRequest(BaseModel):
    """Solicitud para crear interfaz TUN/TAP"""
    name: str = Field(..., description="Nombre de la interfaz", min_length=1, max_length=15)
    type: TunTapType = Field(..., description="Tipo: tun o tap")
    mode: TunTapMode = Field(default=TunTapMode.root, description="Modo de operación")
    owner: Optional[str] = Field(None, description="Usuario propietario")
    group: Optional[str] = Field(None, description="Grupo propietario")
    bridge: Optional[str] = Field(None, description="Bridge al que conectar (solo para TAP)")
    persistent: bool = Field(default=False, description="Interfaz persistente")
    
    @validator('name')
    def validate_tuntap_name(cls, v):
        if not v.replace('-', '').replace('_', '').isalnum():
            raise ValueError('El nombre solo puede contener letras, números, guiones y guiones bajos')
        return v
    
    @validator('bridge')
    def validate_bridge_for_tap(cls, v, values):
        if v and 'type' in values and values['type'] == TunTapType.tun:
            raise ValueError('Las interfaces TUN no pueden conectarse directamente a bridges')
        return v


class TunTapDeleteRequest(BaseModel):
    """Solicitud para eliminar interfaz TUN/TAP"""
    name: str = Field(..., description="Nombre de la interfaz a eliminar")


class TunTapAttachRequest(BaseModel):
    """Solicitud para conectar TAP a bridge"""
    tap_name: str = Field(..., description="Nombre de la interfaz TAP")
    bridge_name: str = Field(..., description="Nombre del bridge")


class TunTapDetachRequest(BaseModel):
    """Solicitud para desconectar TAP de bridge"""
    tap_name: str = Field(..., description="Nombre de la interfaz TAP")


class TunTapInfo(BaseModel):
    """Información de interfaz TUN/TAP"""
    name: str
    type: TunTapType
    owner: Optional[str] = None
    group: Optional[str] = None
    bridge: Optional[str] = None
    persistent: bool
    status: str
    mtu: Optional[int] = None
