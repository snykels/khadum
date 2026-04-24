import os
from pathlib import Path
import psycopg2


def get_connection():
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL is not set")
    return psycopg2.connect(database_url, sslmode="require")


def run_schema():
    schema_path = Path("schema.sql")
    if not schema_path.exists():
        raise FileNotFoundError("schema.sql not found")

    sql_text = schema_path.read_text(encoding="utf-8")
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql_text)
        conn.commit()


if __name__ == "__main__":
    run_schema()
