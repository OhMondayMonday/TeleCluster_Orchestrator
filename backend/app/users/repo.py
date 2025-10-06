"""User repository - database access layer."""
from typing import List, Optional, Tuple
from app.db import get_db_connection


class UserRepository:
    """Handle all database operations for users."""
    
    @staticmethod
    def get_all_users(page: int, size: int) -> Tuple[List[dict], int]:
        """
        Get all users with pagination (superadmin only).
        Returns: (users_list, total_count)
        """
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        try:
            offset = (page - 1) * size
            
            # Get paginated users
            query = """
                SELECT u.id, u.email, u.full_name, u.status, u.role_id,
                       r.name as role, u.created_at, u.updated_at
                FROM users u
                JOIN roles r ON u.role_id = r.id
                ORDER BY u.created_at DESC
                LIMIT %s OFFSET %s
            """
            cursor.execute(query, (size, offset))
            users = cursor.fetchall()
            
            # Get total count
            cursor.execute("SELECT COUNT(*) as total FROM users")
            total = cursor.fetchone()['total']
            
            return users, total
            
        finally:
            cursor.close()
            conn.close()
    
    @staticmethod
    def get_users_from_profesor_courses(profesor_id: int, page: int, size: int) -> Tuple[List[dict], int]:
        """
        Get users enrolled in courses owned by profesor.
        Returns: (users_list, total_count)
        """
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        try:
            offset = (page - 1) * size
            
            # Get users enrolled in profesor's courses
            query = """
                SELECT DISTINCT u.id, u.email, u.full_name, u.status, u.role_id,
                       r.name as role, u.created_at, u.updated_at
                FROM users u
                JOIN roles r ON u.role_id = r.id
                JOIN enrollments e ON e.user_id = u.id
                JOIN courses c ON c.id = e.course_id
                WHERE c.owner_id = %s
                ORDER BY u.created_at DESC
                LIMIT %s OFFSET %s
            """
            cursor.execute(query, (profesor_id, size, offset))
            users = cursor.fetchall()
            
            # Get total count
            count_query = """
                SELECT COUNT(DISTINCT u.id) as total
                FROM users u
                JOIN enrollments e ON e.user_id = u.id
                JOIN courses c ON c.id = e.course_id
                WHERE c.owner_id = %s
            """
            cursor.execute(count_query, (profesor_id,))
            total = cursor.fetchone()['total']
            
            return users, total
            
        finally:
            cursor.close()
            conn.close()
    
    @staticmethod
    def get_user_by_id(user_id: int) -> Optional[dict]:
        """Get a single user by ID."""
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        try:
            query = """
                SELECT u.id, u.email, u.full_name, u.status, u.role_id,
                       r.name as role, u.created_at, u.updated_at
                FROM users u
                JOIN roles r ON u.role_id = r.id
                WHERE u.id = %s
            """
            cursor.execute(query, (user_id,))
            return cursor.fetchone()
            
        finally:
            cursor.close()
            conn.close()
    
    @staticmethod
    def is_user_in_profesor_courses(user_id: int, profesor_id: int) -> bool:
        """Check if a user is enrolled in any of profesor's courses."""
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        try:
            query = """
                SELECT COUNT(*) as count
                FROM enrollments e
                JOIN courses c ON c.id = e.course_id
                WHERE e.user_id = %s AND c.owner_id = %s
            """
            cursor.execute(query, (user_id, profesor_id))
            result = cursor.fetchone()
            return result['count'] > 0
            
        finally:
            cursor.close()
            conn.close()
    
    @staticmethod
    def create_user(email: str, password_hash: str, full_name: str, role_id: int, status: str = 'active') -> Optional[dict]:
        """Create a new user."""
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        try:
            # Check if email exists
            cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
            if cursor.fetchone():
                return None  # Email already exists
            
            # Insert user
            insert_query = """
                INSERT INTO users (email, password_hash, full_name, role_id, status)
                VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(insert_query, (email, password_hash, full_name, role_id, status))
            user_id = cursor.lastrowid
            
            # Get created user
            return UserRepository.get_user_by_id(user_id)
            
        finally:
            cursor.close()
            conn.close()
    
    @staticmethod
    def update_user(user_id: int, email: Optional[str] = None, password_hash: Optional[str] = None,
                   full_name: Optional[str] = None, role_id: Optional[int] = None, 
                   status: Optional[str] = None) -> Optional[dict]:
        """Update a user."""
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        try:
            # Build dynamic update query
            fields = []
            values = []
            
            if email is not None:
                fields.append("email = %s")
                values.append(email)
            if password_hash is not None:
                fields.append("password_hash = %s")
                values.append(password_hash)
            if full_name is not None:
                fields.append("full_name = %s")
                values.append(full_name)
            if role_id is not None:
                fields.append("role_id = %s")
                values.append(role_id)
            if status is not None:
                fields.append("status = %s")
                values.append(status)
            
            if not fields:
                return UserRepository.get_user_by_id(user_id)
            
            values.append(user_id)
            query = f"UPDATE users SET {', '.join(fields)} WHERE id = %s"
            
            cursor.execute(query, values)
            
            # Get updated user
            return UserRepository.get_user_by_id(user_id)
            
        finally:
            cursor.close()
            conn.close()
    
    @staticmethod
    def delete_user(user_id: int) -> bool:
        """Delete a user."""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
            return cursor.rowcount > 0
            
        finally:
            cursor.close()
            conn.close()
