"""
FORMULIX - Cross-method results comparison script
--------------------------------------------------

PDF (Level C) requirement:
    "יש לוודא שהתוצאות בין השיטות זהות (יש לצרף לפתרון את סקריפט ההשוואה)"
    -> Verify that every calculation method produced identical results,
       and ship the comparison script together with the solution.

What this script does
---------------------
1. Reads t_results grouped by (targil_id, data_id).
2. For each formula (targil_id):
     - compares the result of every method vs. SQLDynamic (the reference).
     - reports: total rows, max absolute diff, number of mismatches
       (tolerance = 1e-9 to absorb IEEE-754 rounding between SQL / .NET /
       NumPy).
3. Prints a final PASS / FAIL summary per method and per formula.

Why a tolerance?
----------------
SQL Server's FLOAT, .NET's System.Math and NumPy may differ in the last
bit of a double. A ~1e-9 absolute tolerance is well below any meaningful
tariff precision and catches real bugs while ignoring noise.

Run (LocalDB by default; set FORMULIX_DB_ODBC to match Azure / same as python/db.py):
    python tools\\compare_results.py
"""

import os
import sys
from collections import defaultdict

import pyodbc

_DEFAULT_LOCAL = (
    "DRIVER={ODBC Driver 17 for SQL Server};"
    "SERVER=(localdb)\\MSSQLLocalDB;"
    "DATABASE=Formulix;"
    "Trusted_Connection=yes;"
)

# Same variable as python/formulix_sympy/db.py — set to Azure / remote ODBC when not using LocalDB.
CONNECTION_STRING = os.getenv("FORMULIX_DB_ODBC", _DEFAULT_LOCAL)

REFERENCE_METHOD = "SQLDynamic"
TOLERANCE = 1e-9


def fetch_available_methods(cursor) -> list[str]:
    cursor.execute("SELECT DISTINCT method FROM t_results ORDER BY method")
    return [row[0] for row in cursor.fetchall()]


def fetch_targil_ids(cursor) -> list[int]:
    cursor.execute("SELECT DISTINCT targil_id FROM t_results ORDER BY targil_id")
    return [row[0] for row in cursor.fetchall()]


def load_results(cursor, method: str, targil_id: int) -> dict[int, float]:
    """
    Load all (data_id -> result) pairs for one method + formula.
    Returns a dict keyed by data_id.
    """
    cursor.execute(
        """
        SELECT data_id, result
        FROM t_results
        WHERE method = ? AND targil_id = ?
        """,
        method,
        targil_id,
    )
    return {row[0]: (float(row[1]) if row[1] is not None else None)
            for row in cursor.fetchall()}


def compare_one_formula(cursor, targil_id: int, methods: list[str]) -> dict:
    """
    Compare all methods for a single formula against the reference method.
    Returns a dict with per-method diagnostics.
    """
    reference = load_results(cursor, REFERENCE_METHOD, targil_id)
    ref_count = len(reference)

    report = {
        "targil_id": targil_id,
        "reference_method": REFERENCE_METHOD,
        "reference_rows": ref_count,
        "methods": {},
    }

    for method in methods:
        if method == REFERENCE_METHOD:
            continue

        other = load_results(cursor, method, targil_id)

        common_keys = reference.keys() & other.keys()
        missing_in_other = reference.keys() - other.keys()
        extra_in_other = other.keys() - reference.keys()

        max_diff = 0.0
        mismatches = 0
        for data_id in common_keys:
            r = reference[data_id]
            o = other[data_id]
            if r is None or o is None:
                if r != o:
                    mismatches += 1
                continue
            diff = abs(r - o)
            if diff > max_diff:
                max_diff = diff
            if diff > TOLERANCE:
                mismatches += 1

        report["methods"][method] = {
            "rows": len(other),
            "compared": len(common_keys),
            "missing_in_method": len(missing_in_other),
            "extra_in_method": len(extra_in_other),
            "max_abs_diff": max_diff,
            "mismatches": mismatches,
            "passed": (
                mismatches == 0
                and len(missing_in_other) == 0
                and len(extra_in_other) == 0
            ),
        }

    return report


def main() -> int:
    print("Connecting to Formulix...")
    conn = pyodbc.connect(CONNECTION_STRING)
    cursor = conn.cursor()

    methods = fetch_available_methods(cursor)
    if REFERENCE_METHOD not in methods:
        print(f"ERROR: reference method '{REFERENCE_METHOD}' not found in t_results.")
        print(f"Available methods: {methods}")
        return 2

    other_methods = [m for m in methods if m != REFERENCE_METHOD]
    print(f"Reference method : {REFERENCE_METHOD}")
    print(f"Methods compared : {other_methods}")
    print(f"Tolerance        : {TOLERANCE}")
    print()

    targil_ids = fetch_targil_ids(cursor)
    overall_pass = True
    per_method_counters = defaultdict(lambda: {"pass": 0, "fail": 0})

    for targil_id in targil_ids:
        report = compare_one_formula(cursor, targil_id, methods)
        print(f"Formula #{targil_id:>2}  "
              f"(reference rows: {report['reference_rows']:,})")

        for method, data in report["methods"].items():
            status = "PASS" if data["passed"] else "FAIL"
            print(
                f"  vs {method:<14} rows={data['rows']:>8,}  "
                f"compared={data['compared']:>8,}  "
                f"missing={data['missing_in_method']:>4}  "
                f"extra={data['extra_in_method']:>4}  "
                f"max|diff|={data['max_abs_diff']:.3e}  "
                f"mismatches={data['mismatches']:>4}  "
                f"[{status}]"
            )
            if data["passed"]:
                per_method_counters[method]["pass"] += 1
            else:
                per_method_counters[method]["fail"] += 1
                overall_pass = False

    print()
    print("=" * 60)
    print("Summary")
    print("=" * 60)
    for method, counters in per_method_counters.items():
        print(f"  {method:<14} PASS={counters['pass']}  FAIL={counters['fail']}")

    print()
    if overall_pass:
        print("RESULT: all methods produced IDENTICAL results (within tolerance).")
        return 0
    else:
        print("RESULT: at least one method diverged. See details above.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
