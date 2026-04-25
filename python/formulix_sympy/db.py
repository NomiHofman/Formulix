"""
FORMULIX - Python DB layer (Azure SQL optimized).

Performance notes:
  * One persistent connection per run (`_get_persistent_connection`) — avoids
    opening / tearing down a TLS connection per batch, which is the single
    biggest cost against Azure SQL.
  * `cursor.fast_executemany = True` + parameter tuning — pyodbc's equivalent
    of SqlBulkCopy. Sends every batch as a single TDS RPC, instead of one
    round-trip per row.
  * Result inserts run inside an explicit transaction commit per batch
    (commit cost is amortized across 100K rows).
"""

from __future__ import annotations

import os
from typing import Any, Dict, Iterable, List, Optional, Tuple

import pyodbc


# Set FORMULIX_DB_ODBC for Azure / remote SQL (full ODBC string with UID/PWD) — do not commit secrets.
_DEFAULT_LOCAL = (
    "DRIVER={ODBC Driver 17 for SQL Server};"
    "SERVER=(localdb)\\MSSQLLocalDB;"
    "DATABASE=Formulix;"
    "Trusted_Connection=yes;"
)
CONNECTION_STRING = os.getenv("FORMULIX_DB_ODBC", _DEFAULT_LOCAL)


# Module-level persistent connection, lazily created.
# Reused for every bulk insert of t_results so we don't pay TCP+TLS+auth cost per batch.
_persistent_conn: Optional[pyodbc.Connection] = None


def _tune_connection(conn: pyodbc.Connection) -> None:
    """Standard pyodbc tuning for high-throughput inserts to SQL Server."""
    # Force UTF-8 to match SQL Server's expected wide-string encoding;
    # without this pyodbc can fall back to slow per-character conversions.
    conn.setencoding(encoding="utf-8")
    conn.setdecoding(pyodbc.SQL_CHAR, encoding="utf-8")
    conn.setdecoding(pyodbc.SQL_WCHAR, encoding="utf-8")
    # Manual transactions: commit() is cheap, autocommit per row is murder.
    conn.autocommit = False


def get_connection() -> pyodbc.Connection:
    """Open a fresh connection (used for SELECTs that we want to close after)."""
    conn = pyodbc.connect(CONNECTION_STRING, timeout=300)
    _tune_connection(conn)
    return conn


def _get_persistent_connection() -> pyodbc.Connection:
    """Open (once) and return the singleton bulk-insert connection."""
    global _persistent_conn
    if _persistent_conn is None:
        _persistent_conn = pyodbc.connect(CONNECTION_STRING, timeout=300)
        _tune_connection(_persistent_conn)
    return _persistent_conn


def close_persistent_connection() -> None:
    """Call once at the end of the run (runner.py does this)."""
    global _persistent_conn
    if _persistent_conn is not None:
        try:
            _persistent_conn.close()
        finally:
            _persistent_conn = None


# ─── Reads ────────────────────────────────────────────────────────────────────

def get_formulas() -> List[Dict[str, Any]]:
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT targil_id, targil, tnai, targil_false
            FROM t_targil
            ORDER BY targil_id
            """
        )

        rows = []
        for row in cursor.fetchall():
            rows.append(
                {
                    "targil_id": row[0],
                    "targil": row[1],
                    "tnai": row[2],
                    "targil_false": row[3],
                }
            )
        return rows
    finally:
        conn.close()


def stream_data(batch_size: int = 100_000) -> Iterable[List[Dict[str, Any]]]:
    """
    Stream t_data in batches. Uses a dedicated connection (separate from the
    bulk-insert one) so reads and writes don't compete for the same TDS stream.
    """
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT data_id, a, b, c, d
            FROM t_data
            ORDER BY data_id
            """
        )

        while True:
            rows = cursor.fetchmany(batch_size)
            if not rows:
                break

            yield [
                {
                    "data_id": row[0],
                    "a": float(row[1]),
                    "b": float(row[2]),
                    "c": float(row[3]),
                    "d": float(row[4]),
                }
                for row in rows
            ]
    finally:
        conn.close()


# ─── Writes ───────────────────────────────────────────────────────────────────

def clear_previous_results(method: str) -> None:
    """
    Delete previous rows for this method.
    Relies on IX_t_results_method_targil (created by AzureOptimizeFast.sql)
    to be fast even on millions of rows.
    """
    conn = _get_persistent_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM t_results WHERE method = ?", method)
    cursor.execute("DELETE FROM t_log WHERE method = ?", method)
    conn.commit()


def bulk_insert_results(results: List[Tuple[int, int, str, float]]) -> None:
    """
    Bulk-insert a batch of (data_id, targil_id, method, result) tuples.

    Uses cursor.fast_executemany = True which packs every batch into a single
    TDS RPC — pyodbc's closest equivalent to SqlBulkCopy. With Azure SQL on
    Standard tier and a 100K-row batch this gets you tens of thousands of
    rows/sec sustained.
    """
    if not results:
        return

    conn = _get_persistent_connection()
    cursor = conn.cursor()

    # Critical: must be set BEFORE executemany. Stays on for the cursor lifetime.
    cursor.fast_executemany = True
    cursor.executemany(
        """
        INSERT INTO t_results (data_id, targil_id, method, result)
        VALUES (?, ?, ?, ?)
        """,
        results,
    )
    conn.commit()


def insert_log(targil_id: int, method: str, run_time: float) -> None:
    conn = _get_persistent_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO t_log (targil_id, method, run_time)
        VALUES (?, ?, ?)
        """,
        targil_id,
        method,
        run_time,
    )
    conn.commit()
