from mysql.connector import connect
from mysql.connector.connection import MySQLConnection

from app.core.config import get_settings


def get_db_connection() -> MySQLConnection:
    settings = get_settings()

    return connect(
        host=settings.db_host,
        port=settings.db_port,
        user=settings.db_user,
        password=settings.db_password,
        database=settings.db_name,
    )
