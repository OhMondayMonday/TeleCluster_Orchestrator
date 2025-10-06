"""Custom error classes."""
from fastapi import HTTPException, status


class UnauthorizedException(HTTPException):
    """401 Unauthorized."""
    def __init__(self, detail: str = "No autorizado"):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


class ForbiddenException(HTTPException):
    """403 Forbidden."""
    def __init__(self, detail: str = "Acceso prohibido"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


class NotFoundException(HTTPException):
    """404 Not Found."""
    def __init__(self, detail: str = "Recurso no encontrado"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


class ConflictException(HTTPException):
    """409 Conflict."""
    def __init__(self, detail: str = "Conflicto con recurso existente"):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)


class BadRequestException(HTTPException):
    """400 Bad Request."""
    def __init__(self, detail: str = "Solicitud inválida"):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)
