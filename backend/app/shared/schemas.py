"""Pydantic schemas for the API."""
from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
import re


class ApiResponse(BaseModel):
    """Standard API response format."""
    ok: bool
    data: Optional[dict] = None
    error: Optional[str] = None


class UserRegister(BaseModel):
    """Schema for user registration."""
    email: str
    password: str
    full_name: str
    role: str  # 'alumno' | 'profesor' | 'superadmin'
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        if not v or not isinstance(v, str):
            raise ValueError('Email es requerido')
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(pattern, v.strip()):
            raise ValueError('Formato de email inválido')
        return v.strip().lower()
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if not v or len(v) < 6:
            raise ValueError('La contraseña debe tener al menos 6 caracteres')
        return v
    
    @field_validator('role')
    @classmethod
    def validate_role(cls, v):
        if v not in ['alumno', 'profesor', 'superadmin']:
            raise ValueError("El rol debe ser 'alumno', 'profesor' o 'superadmin'")
        return v


class UserLogin(BaseModel):
    """Schema for user login."""
    email: str
    password: str


class TokenResponse(BaseModel):
    """Schema for token response."""
    access_token: str
    token_type: str = "bearer"


class UserCreate(BaseModel):
    """Schema for creating a user (admin endpoint)."""
    email: str
    password: str
    full_name: str
    role_id: int
    status: Optional[str] = "active"
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        if not v or not isinstance(v, str):
            raise ValueError('Email es requerido')
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(pattern, v.strip()):
            raise ValueError('Formato de email inválido')
        return v.strip().lower()
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if not v or len(v) < 6:
            raise ValueError('La contraseña debe tener al menos 6 caracteres')
        return v
    
    @field_validator('role_id')
    @classmethod
    def validate_role_id(cls, v):
        if v not in [1, 2, 3]:
            raise ValueError('role_id debe ser 1, 2 o 3')
        return v
    
    @field_validator('status')
    @classmethod
    def validate_status(cls, v):
        if v and v not in ['active', 'disabled']:
            raise ValueError("status debe ser 'active' o 'disabled'")
        return v


class UserUpdate(BaseModel):
    """Schema for updating a user."""
    email: Optional[str] = None
    password: Optional[str] = None
    full_name: Optional[str] = None
    role_id: Optional[int] = None
    status: Optional[str] = None
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        if v is not None:
            pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(pattern, v.strip()):
                raise ValueError('Formato de email inválido')
            return v.strip().lower()
        return v
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if v is not None and len(v) < 6:
            raise ValueError('La contraseña debe tener al menos 6 caracteres')
        return v
    
    @field_validator('role_id')
    @classmethod
    def validate_role_id(cls, v):
        if v is not None and v not in [1, 2, 3]:
            raise ValueError('role_id debe ser 1, 2 o 3')
        return v
    
    @field_validator('status')
    @classmethod
    def validate_status(cls, v):
        if v is not None and v not in ['active', 'disabled']:
            raise ValueError("status debe ser 'active' o 'disabled'")
        return v


class UserOut(BaseModel):
    """Schema for user output."""
    id: str  # BIGINT as string
    email: str
    full_name: str
    role: str
    role_id: int
    status: str
    created_at: str
    updated_at: Optional[str] = None
    
    model_config = {"from_attributes": True}
