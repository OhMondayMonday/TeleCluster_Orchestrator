"""Database connection module."""
import os
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASS", "root"),
    "database": os.getenv("DB_NAME", "orchestrator"),
    "charset": "utf8mb4",
    "collation": "utf8mb4_unicode_ci",
    "autocommit": True
}


def get_db_connection():
    """Create and return a MySQL database connection."""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        raise
    return None


def test_connection():
    """Test database connection."""
    try:
        conn = get_db_connection()
        if conn and conn.is_connected():
            conn.close()
            return True
    except Exception as e:
        print(f"Connection test failed: {e}")
        return False
    return False
