"""User routes with RBAC."""
from fastapi import APIRouter, Depends, Query
from app.shared.schemas import ApiResponse, UserCreate, UserUpdate
from app.auth.deps import get_current_user
from app.users.service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=ApiResponse)
async def get_users(
    page: int = Query(default=1, ge=1, description="Page number"),
    size: int = Query(default=20, ge=1, le=100, description="Page size"),
    current_user: dict = Depends(get_current_user)
):
    """
    Get users list with RBAC:
    - superadmin: all users (paginated)
    - profesor: users in their courses
    - alumno: only themselves
    """
    users, pagination = UserService.get_users_list(current_user, page, size)
    
    return ApiResponse(
        ok=True,
        data={
            "users": users,
            "pagination": pagination
        }
    )


@router.get("/{user_id}", response_model=ApiResponse)
async def get_user(
    user_id: int,
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific user by ID with RBAC:
    - superadmin: can see anyone
    - profesor: can see users in their courses or themselves
    - alumno: only themselves
    """
    user = UserService.get_user_by_id(user_id, current_user)
    
    return ApiResponse(ok=True, data=user)


@router.post("", response_model=ApiResponse, status_code=201)
async def create_user(
    user_data: UserCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new user (superadmin only).
    Validates email uniqueness and valid role_id.
    """
    user = UserService.create_user(
        email=user_data.email,
        password=user_data.password,
        full_name=user_data.full_name,
        role_id=user_data.role_id,
        status=user_data.status or 'active',
        current_user=current_user
    )
    
    return ApiResponse(ok=True, data=user)


@router.put("/{user_id}", response_model=ApiResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update a user with RBAC:
    - superadmin: can update anyone
    - profesor: can only update themselves
    - alumno: can only update themselves (no role_id)
    """
    user = UserService.update_user(
        user_id=user_id,
        email=user_data.email,
        password=user_data.password,
        full_name=user_data.full_name,
        role_id=user_data.role_id,
        status=user_data.status,
        current_user=current_user
    )
    
    return ApiResponse(ok=True, data=user)


@router.delete("/{user_id}", response_model=ApiResponse)
async def delete_user(
    user_id: int,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a user (superadmin only).
    Returns 409 if user has associated courses or enrollments.
    """
    result = UserService.delete_user(user_id, current_user)
    
    return ApiResponse(ok=True, data=result)
