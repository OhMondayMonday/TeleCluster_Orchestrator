"""User service - business logic layer."""
from typing import List, Tuple, Optional
from app.users.repo import UserRepository
from app.auth.deps import hash_password
from app.shared.errors import (
    NotFoundException, ForbiddenException, ConflictException, BadRequestException
)


class UserService:
    """Business logic for user operations."""
    
    @staticmethod
    def format_user(user: dict) -> dict:
        """Format user data for API response."""
        return {
            "id": str(user['id']),
            "email": user['email'],
            "full_name": user['full_name'],
            "role": user['role'],
            "role_id": user['role_id'],
            "status": user['status'],
            "created_at": user['created_at'].isoformat(),
            "updated_at": user['updated_at'].isoformat() if user['updated_at'] else None
        }
    
    @staticmethod
    def get_users_list(current_user: dict, page: int, size: int) -> Tuple[List[dict], dict]:
        """
        Get users list based on current user role.
        - superadmin: all users
        - profesor: users in their courses
        - alumno: only themselves
        
        Returns: (users_list, pagination_info)
        """
        role = current_user['role']
        user_id = int(current_user['id'])
        
        if role == 'superadmin':
            # Get all users
            users, total = UserRepository.get_all_users(page, size)
            
        elif role == 'profesor':
            # Get users from profesor's courses
            users, total = UserRepository.get_users_from_profesor_courses(user_id, page, size)
            
        elif role == 'alumno':
            # Alumno only sees themselves
            user = UserRepository.get_user_by_id(user_id)
            if not user:
                raise NotFoundException(detail="Usuario no encontrado")
            users = [user]
            total = 1
            
        else:
            raise ForbiddenException(detail="Rol no válido")
        
        # Format users
        formatted_users = [UserService.format_user(u) for u in users]
        
        # Pagination info
        total_pages = (total + size - 1) // size
        pagination = {
            "page": page,
            "size": size,
            "total": total,
            "totalPages": total_pages
        }
        
        return formatted_users, pagination
    
    @staticmethod
    def get_user_by_id(user_id: int, current_user: dict) -> dict:
        """
        Get a specific user by ID with RBAC.
        - superadmin: can see anyone
        - profesor: can see if user is in their courses or themselves
        - alumno: only themselves
        """
        role = current_user['role']
        current_user_id = int(current_user['id'])
        
        # Get the target user
        user = UserRepository.get_user_by_id(user_id)
        if not user:
            raise NotFoundException(detail="Usuario no encontrado")
        
        # RBAC checks
        if role == 'superadmin':
            # Superadmin can see anyone
            pass
            
        elif role == 'profesor':
            # Profesor can see themselves or users in their courses
            if user_id != current_user_id:
                if not UserRepository.is_user_in_profesor_courses(user_id, current_user_id):
                    raise ForbiddenException(detail="No tienes permisos para ver este usuario")
                    
        elif role == 'alumno':
            # Alumno can only see themselves
            if user_id != current_user_id:
                raise ForbiddenException(detail="Solo puedes ver tu propio perfil")
                
        else:
            raise ForbiddenException(detail="Rol no válido")
        
        return UserService.format_user(user)
    
    @staticmethod
    def create_user(email: str, password: str, full_name: str, role_id: int, 
                   status: str, current_user: dict) -> dict:
        """
        Create a new user (superadmin only).
        """
        # Only superadmin can create users
        if current_user['role'] != 'superadmin':
            raise ForbiddenException(detail="Solo superadmin puede crear usuarios")
        
        # Hash password
        password_hash = hash_password(password)
        
        # Create user
        user = UserRepository.create_user(email, password_hash, full_name, role_id, status)
        
        if not user:
            raise ConflictException(detail="El email ya está registrado")
        
        return UserService.format_user(user)
    
    @staticmethod
    def update_user(user_id: int, email: Optional[str], password: Optional[str],
                   full_name: Optional[str], role_id: Optional[int], status: Optional[str],
                   current_user: dict) -> dict:
        """
        Update a user with RBAC.
        - superadmin: can update anyone
        - profesor: can only update themselves
        - alumno: can only update themselves (no role_id)
        """
        role = current_user['role']
        current_user_id = int(current_user['id'])
        
        # Get target user
        user = UserRepository.get_user_by_id(user_id)
        if not user:
            raise NotFoundException(detail="Usuario no encontrado")
        
        # RBAC checks
        if role == 'superadmin':
            # Superadmin can update anyone
            pass
            
        elif role == 'profesor':
            # Profesor can only update themselves
            if user_id != current_user_id:
                raise ForbiddenException(detail="Solo puedes actualizar tu propio perfil")
                
        elif role == 'alumno':
            # Alumno can only update themselves and cannot change role_id
            if user_id != current_user_id:
                raise ForbiddenException(detail="Solo puedes actualizar tu propio perfil")
            if role_id is not None:
                raise ForbiddenException(detail="No puedes cambiar tu rol")
                
        else:
            raise ForbiddenException(detail="Rol no válido")
        
        # Hash password if provided
        password_hash = hash_password(password) if password else None
        
        # Update user
        updated_user = UserRepository.update_user(
            user_id, email, password_hash, full_name, role_id, status
        )
        
        if not updated_user:
            raise BadRequestException(detail="Error al actualizar usuario")
        
        return UserService.format_user(updated_user)
    
    @staticmethod
    def delete_user(user_id: int, current_user: dict) -> dict:
        """
        Delete a user (superadmin only).
        """
        # Only superadmin can delete users
        if current_user['role'] != 'superadmin':
            raise ForbiddenException(detail="Solo superadmin puede eliminar usuarios")
        
        # Check if user exists
        user = UserRepository.get_user_by_id(user_id)
        if not user:
            raise NotFoundException(detail="Usuario no encontrado")
        
        # Try to delete
        try:
            success = UserRepository.delete_user(user_id)
            if not success:
                raise BadRequestException(detail="Error al eliminar usuario")
            
            return {"message": "Usuario eliminado correctamente"}
            
        except Exception as e:
            # Handle FK constraint errors
            if "foreign key constraint" in str(e).lower():
                raise ConflictException(
                    detail="No se puede eliminar el usuario porque tiene cursos o inscripciones asociadas"
                )
            raise BadRequestException(detail=f"Error al eliminar usuario: {str(e)}")
