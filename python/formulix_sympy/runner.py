"""
Entry point for the Python / SymPy calculation method.

Flow (mirrors the .NET runners for a fair benchmark):
  1. Load formulas from t_targil
  2. Clear previous PythonSymPy rows in t_results / t_log
  3. Compile every formula once (SymPy -> lambdify -> NumPy)
  4. For each formula, stream t_data in batches, evaluate vectorized,
     bulk-insert into t_results, then log total run-time to t_log.
"""

import time

import numpy as np

from db import (
    get_formulas,
    stream_data,
    clear_previous_results,
    bulk_insert_results,
    insert_log,
)
from translator import compile_formula

METHOD_NAME = "PythonSymPy"
BATCH_SIZE = 10_000


def _evaluate_batch(evaluator, batch):
    """
    Turn a Python list-of-dicts batch into 4 NumPy columns, evaluate the
    compiled formula once on the entire batch, and return the rows ready
    for bulk-insert into t_results.
    """
    a_col = np.fromiter((r["a"] for r in batch), dtype=np.float64, count=len(batch))
    b_col = np.fromiter((r["b"] for r in batch), dtype=np.float64, count=len(batch))
    c_col = np.fromiter((r["c"] for r in batch), dtype=np.float64, count=len(batch))
    d_col = np.fromiter((r["d"] for r in batch), dtype=np.float64, count=len(batch))

    results = evaluator(a_col, b_col, c_col, d_col)

    # `lambdify` can return a scalar for constant expressions (e.g. "1").
    # Broadcast to full column length so zip() below lines up correctly.
    if np.ndim(results) == 0:
        results = np.full(len(batch), float(results), dtype=np.float64)

    return results


def run() -> None:
    print("Loading formulas...")
    formulas = get_formulas()

    print(f"Cleaning previous {METHOD_NAME} results...")
    clear_previous_results(METHOD_NAME)

    print("Compiling formulas with SymPy lambdify (NumPy backend)...")
    compiled = {}
    for formula in formulas:
        compiled[formula["targil_id"]] = compile_formula(
            formula["targil"],
            formula["tnai"],
            formula["targil_false"],
        )
        print(f"  - compiled #{formula['targil_id']:>2}: {formula['targil']}")

    for formula in formulas:
        targil_id = formula["targil_id"]
        evaluator = compiled[targil_id]

        print(f"Running formula {targil_id}: {formula['targil']}")
        start = time.perf_counter()

        for batch in stream_data(BATCH_SIZE):
            results = _evaluate_batch(evaluator, batch)

            rows = [
                (row["data_id"], targil_id, METHOD_NAME, float(value))
                for row, value in zip(batch, results)
            ]
            bulk_insert_results(rows)

        elapsed = time.perf_counter() - start
        insert_log(targil_id, METHOD_NAME, elapsed)
        print(f"  -> finished in {elapsed:.3f} sec")

    print(f"{METHOD_NAME} completed successfully.")
