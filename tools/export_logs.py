"""
FORMULIX - Export benchmark results to JSON for the React dashboard
-------------------------------------------------------------------

After all three (or four) runners have finished, run this script once:

    python tools\\export_logs.py

It writes  dashboard/public/run-log.json  so the React dashboard can
render real run-time data instead of the built-in mock data.

JSON schema
-----------
{
  "exportedAt"   : "ISO-8601 UTC string",
  "dataCount"    : 1000000,
  "formulas"     : [ { "targil_id", "targil", "tnai", "targil_false" } ],
  "logs"         : [ { "log_id", "targil_id", "method", "run_time"   } ],
  "summary"      : {
      "<method>": { "avg": ..., "min": ..., "max": ..., "total_ops": ... }
  }
}
"""

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

import pyodbc

_DEFAULT_LOCAL = (
    "DRIVER={ODBC Driver 17 for SQL Server};"
    "SERVER=(localdb)\\MSSQLLocalDB;"
    "DATABASE=Formulix;"
    "Trusted_Connection=yes;"
)
CONNECTION_STRING = os.getenv("FORMULIX_DB_ODBC", _DEFAULT_LOCAL)

SCRIPT_DIR = Path(__file__).resolve().parent
OUTPUT_FILE = SCRIPT_DIR.parent / "dashboard" / "public" / "run-log.json"


def load_data_count(cursor) -> int:
    cursor.execute("SELECT COUNT(*) FROM t_data")
    return cursor.fetchone()[0]


def load_formulas(cursor) -> list:
    cursor.execute("""
        SELECT targil_id, targil, tnai, targil_false
        FROM t_targil
        ORDER BY targil_id
    """)
    return [
        {
            "targil_id": row[0],
            "targil": row[1],
            "tnai": row[2],
            "targil_false": row[3],
        }
        for row in cursor.fetchall()
    ]


def load_logs(cursor) -> list:
    cursor.execute("""
        SELECT log_id, targil_id, method, run_time
        FROM t_log
        ORDER BY method, targil_id
    """)
    return [
        {
            "log_id": row[0],
            "targil_id": row[1],
            "method": row[2],
            "run_time": row[3],
        }
        for row in cursor.fetchall()
    ]


def build_summary(logs: list, formula_count: int, data_count: int) -> dict:
    """
    Per-method aggregate: avg / min / max run-time and total formula-rows
    evaluated (formula_count × data_count).
    """
    from collections import defaultdict

    buckets = defaultdict(list)
    for entry in logs:
        buckets[entry["method"]].append(entry["run_time"])

    summary = {}
    for method, times in buckets.items():
        summary[method] = {
            "avg": round(sum(times) / len(times), 4),
            "min": round(min(times), 4),
            "max": round(max(times), 4),
            "runs": len(times),
            "total_ops": data_count * formula_count,
        }
    return summary


def main() -> int:
    print("Connecting to Formulix...")
    conn = pyodbc.connect(CONNECTION_STRING)
    cursor = conn.cursor()

    print("Reading data count...")
    data_count = load_data_count(cursor)

    print("Reading formulas...")
    formulas = load_formulas(cursor)

    print("Reading logs...")
    logs = load_logs(cursor)

    if not logs:
        print("WARNING: t_log is empty — have you run the calculation engines yet?")

    summary = build_summary(logs, len(formulas), data_count)

    payload = {
        "exportedAt": datetime.now(timezone.utc).isoformat(),
        "dataCount": data_count,
        "formulaCount": len(formulas),
        "formulas": formulas,
        "logs": logs,
        "summary": summary,
    }

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(json.dumps(payload, indent=2, ensure_ascii=False))

    print(f"Wrote {OUTPUT_FILE}")
    print(f"  data rows : {data_count:,}")
    print(f"  formulas  : {len(formulas)}")
    print(f"  log entries: {len(logs)}")
    for method, s in summary.items():
        print(f"  {method:<14} avg={s['avg']:.3f}s  "
              f"min={s['min']:.3f}s  max={s['max']:.3f}s")

    return 0


if __name__ == "__main__":
    sys.exit(main())
