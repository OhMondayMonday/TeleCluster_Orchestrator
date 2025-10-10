"""Authentication dependencies and utilities."""
import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

from app.shared.errors import UnauthorizedException

load_dotenv()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT configuration
JWT_SECRET = os.getenv("JWT_SECRET", "super-secreto")
JWT_MINUTES = int(os.getenv("JWT_MINUTES", "120"))
ALGORITHM = "HS256"

security = HTTPBearer()


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=JWT_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> dict:
    """Decode and verify a JWT token."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise UnauthorizedException(detail="Token inválido o expirado")


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Dependency to extract and verify the current user from JWT token.
    Returns a dict with: sub (user_id as string), email, role
    """
    token = credentials.credentials
    payload = decode_token(token)
    
    user_id = payload.get("sub")
    email = payload.get("email")
    role = payload.get("role")
    
    if not user_id or not email or not role:
        raise UnauthorizedException(detail="Token inválido")
    
    return {
        "id": user_id,
        "email": email,
        "role": role
    }


def require_role(allowed_roles: list):
    """
    Dependency factory to require specific roles.
    Usage: Depends(require_role(['superadmin', 'profesor']))
    """
    def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in allowed_roles:
            from app.shared.errors import ForbiddenException
            raise ForbiddenException(detail="No tienes permisos para esta acción")
        return current_user
    return role_checker
