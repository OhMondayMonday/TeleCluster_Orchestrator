from pydantic import BaseModel, Field, validator
from typing import Optional


class VethCreateRequest(BaseModel):
    """Solicitud para crear un par veth"""
    name1: str = Field(..., description="Nombre del primer extremo del veth", min_length=1, max_length=15)
    name2: str = Field(..., description="Nombre del segundo extremo del veth", min_length=1, max_length=15)
    bridge1: Optional[str] = Field(None, description="Bridge para el primer extremo")
    bridge2: Optional[str] = Field(None, description="Bridge para el segundo extremo")
    namespace1: Optional[str] = Field(None, description="Namespace para el primer extremo")
    namespace2: Optional[str] = Field(None, description="Namespace para el segundo extremo")
    
    @validator('name1', 'name2')
    def validate_veth_names(cls, v):
        if not v.replace('-', '').replace('_', '').isalnum():
            raise ValueError('Los nombres veth solo pueden contener letras, números, guiones y guiones bajos')
        return v
    
    @validator('name2')
    def validate_different_names(cls, v, values):
        if 'name1' in values and v == values['name1']:
            raise ValueError('Los nombres de los extremos del veth deben ser diferentes')
        return v


class VethDeleteRequest(BaseModel):
    """Solicitud para eliminar un par veth"""
    name: str = Field(..., description="Nombre de cualquier extremo del par veth")


class VethMoveRequest(BaseModel):
    """Solicitud para mover un extremo veth a otro bridge/namespace"""
    veth_name: str = Field(..., description="Nombre del extremo veth a mover")
    target_bridge: Optional[str] = Field(None, description="Bridge destino")
    target_namespace: Optional[str] = Field(None, description="Namespace destino")


class VethInfo(BaseModel):
    """Información de un par veth"""
    name1: str
    name2: str
    peer1: str
    peer2: str
    bridge1: Optional[str] = None
    bridge2: Optional[str] = None
    namespace1: Optional[str] = None
    namespace2: Optional[str] = None
    status1: str
    status2: str
