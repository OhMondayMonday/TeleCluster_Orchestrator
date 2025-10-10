"""Authentication routes."""
from fastapi import APIRouter, Depends
from app.shared.schemas import (
    ApiResponse, UserRegister, UserLogin, TokenResponse, UserOut
)
from app.auth.deps import (
    hash_password, verify_password, create_access_token, get_current_user
)
from app.db import get_db_connection
from app.shared.errors import BadRequestException, UnauthorizedException, ConflictException

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=ApiResponse, status_code=201)
async def register(user_data: UserRegister):
    """
    Register a new user.
    Accepts roles: 'alumno', 'profesor', 'superadmin'
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Check if email already exists
        cursor.execute("SELECT id FROM users WHERE email = %s", (user_data.email,))
        if cursor.fetchone():
            raise ConflictException(detail="El email ya está registrado")
        
        # Map role name to role_id
        role_map = {'superadmin': 1, 'profesor': 2, 'alumno': 3}
        role_id = role_map.get(user_data.role)
        
        if not role_id:
            raise BadRequestException(detail="Rol inválido")
        
        # Hash password
        password_hash = hash_password(user_data.password)
        
        # Insert user
        insert_query = """
            INSERT INTO users (email, password_hash, full_name, role_id, status)
            VALUES (%s, %s, %s, %s, 'active')
        """
        cursor.execute(insert_query, (
            user_data.email,
            password_hash,
            user_data.full_name,
            role_id
        ))
        
        user_id = cursor.lastrowid
        
        # Get created user with role name
        select_query = """
            SELECT u.id, u.email, u.full_name, u.status, u.role_id,
                   r.name as role, u.created_at, u.updated_at
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = %s
        """
        cursor.execute(select_query, (user_id,))
        user = cursor.fetchone()
        
        # Format response
        user_out = {
            "id": str(user['id']),
            "email": user['email'],
            "full_name": user['full_name'],
            "role": user['role'],
            "role_id": user['role_id'],
            "status": user['status'],
            "created_at": user['created_at'].isoformat(),
            "updated_at": user['updated_at'].isoformat() if user['updated_at'] else None
        }
        
        return ApiResponse(ok=True, data=user_out)
        
    except (ConflictException, BadRequestException):
        raise
    except Exception as e:
        raise BadRequestException(detail=f"Error al registrar usuario: {str(e)}")
    finally:
        cursor.close()
        conn.close()


@router.post("/login", response_model=ApiResponse)
async def login(credentials: UserLogin):
    """
    Login and get JWT token.
    Returns: {access_token, token_type}
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Find user by email
        query = """
            SELECT u.id, u.email, u.password_hash, u.full_name, u.status, u.role_id,
                   r.name as role
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.email = %s
        """
        cursor.execute(query, (credentials.email,))
        user = cursor.fetchone()
        
        if not user:
            raise UnauthorizedException(detail="Credenciales inválidas")
        
        # Verify password
        if not verify_password(credentials.password, user['password_hash']):
            raise UnauthorizedException(detail="Credenciales inválidas")
        
        # Check if user is active
        if user['status'] != 'active':
            raise UnauthorizedException(detail="Usuario deshabilitado")
        
        # Create JWT token
        token_data = {
            "sub": str(user['id']),  # user_id as string
            "email": user['email'],
            "role": user['role']
        }
        access_token = create_access_token(token_data)
        
        return ApiResponse(
            ok=True,
            data={
                "access_token": access_token,
                "token_type": "bearer"
            }
        )
        
    except UnauthorizedException:
        raise
    except Exception as e:
        raise BadRequestException(detail=f"Error al iniciar sesión: {str(e)}")
    finally:
        cursor.close()
        conn.close()


@router.get("/me", response_model=ApiResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """
    Get current user information from JWT token.
    Requires: Bearer token
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get full user info
        query = """
            SELECT u.id, u.email, u.full_name, u.status, u.role_id,
                   r.name as role, u.created_at, u.updated_at
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = %s
        """
        cursor.execute(query, (int(current_user['id']),))
        user = cursor.fetchone()
        
        if not user:
            raise UnauthorizedException(detail="Usuario no encontrado")
        
        user_out = {
            "id": str(user['id']),
            "email": user['email'],
            "full_name": user['full_name'],
            "role": user['role'],
            "role_id": user['role_id'],
            "status": user['status'],
            "created_at": user['created_at'].isoformat(),
            "updated_at": user['updated_at'].isoformat() if user['updated_at'] else None
        }
        
        return ApiResponse(ok=True, data=user_out)
        
    except UnauthorizedException:
        raise
    except Exception as e:
        raise BadRequestException(detail=f"Error al obtener usuario: {str(e)}")
    finally:
        cursor.close()
        conn.close()
