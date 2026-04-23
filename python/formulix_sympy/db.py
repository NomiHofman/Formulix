import os
import pyodbc
from typing import List, Dict, Any


# Azure SQL Connection (default) or override via environment variable
CONNECTION_STRING = os.getenv(
    "FORMULIX_DB_ODBC",
    "DRIVER={ODBC Driver 17 for SQL Server};"
    "SERVER=tcp:formulix-srv-22042026.database.windows.net,1433;"
    "DATABASE=FormulixDB;"
    "UID=formulixadmin;"
    "PWD=Nh0583262051;"
    "Encrypt=yes;"
    "TrustServerCertificate=no;"
    "Connection Timeout=300;"
)


def get_connection() -> pyodbc.Connection:
    return pyodbc.connect(CONNECTION_STRING)


def get_formulas() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT targil_id, targil, tnai, targil_false
        FROM t_targil
        ORDER BY targil_id
    """)

    rows = []
    for row in cursor.fetchall():
        rows.append({
            "targil_id": row[0],
            "targil": row[1],
            "tnai": row[2],
            "targil_false": row[3]
        })

    conn.close()
    return rows


def stream_data(batch_size: int = 5000):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT data_id, a, b, c, d
        FROM t_data
        ORDER BY data_id
    """)

    while True:
        rows = cursor.fetchmany(batch_size)
        if not rows:
            break

        batch = []
        for row in rows:
            batch.append({
                "data_id": row[0],
                "a": float(row[1]),
                "b": float(row[2]),
                "c": float(row[3]),
                "d": float(row[4]),
            })

        yield batch

    conn.close()


def clear_previous_results(method: str) -> None:
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM t_results WHERE method = ?", method)
    cursor.execute("DELETE FROM t_log WHERE method = ?", method)

    conn.commit()
    conn.close()


def bulk_insert_results(results: List[tuple]) -> None:
    if not results:
        return

    conn = get_connection()
    cursor = conn.cursor()

    cursor.fast_executemany = True
    cursor.executemany("""
        INSERT INTO t_results (data_id, targil_id, method, result)
        VALUES (?, ?, ?, ?)
    """, results)

    conn.commit()
    conn.close()


def insert_log(targil_id: int, method: str, run_time: float) -> None:
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO t_log (targil_id, method, run_time)
        VALUES (?, ?, ?)
    """, targil_id, method, run_time)

    conn.commit()
    conn.close()