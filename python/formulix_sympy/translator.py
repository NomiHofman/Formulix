"""
Dynamic formula translator powered by SymPy.

The tester (PDF, Level C) explicitly mentions SymPy / eval / ast.literal_eval
as valid Python approaches. We go with SymPy for two reasons:

1. SymPy parses the business-style formula into a symbolic expression tree,
   which we can inspect, validate and later render back to any language.
2. `sympy.lambdify` compiles the tree into a *native* NumPy callable, which
   evaluates a whole column of 1,000,000 values in a single vectorized call
   instead of looping row-by-row (the naive `subs` approach is unusable on
   1M records).

The returned callable takes four NumPy arrays (a, b, c, d) and returns a
NumPy array of results.
"""

from typing import Callable, Optional

import numpy as np
from sympy import symbols, sympify, lambdify, Piecewise, Eq, Ne, Lt, Le, Gt, Ge
from sympy import sqrt, log, Abs, Pow

a, b, c, d = symbols("a b c d")
_SYMBOL_NS = {
    "a": a, "b": b, "c": c, "d": d,
    "SQRT": sqrt, "sqrt": sqrt,
    "LOG": log, "log": log,
    "ABS": Abs, "abs": Abs,
    "POWER": Pow, "pow": Pow,
}


def _parse_condition(tnai: str):
    """
    Parse a simple textual condition like `a > 5` or `a == c` into a SymPy
    relational expression. SymPy rejects Python's `==` / `!=` operators, so
    we translate them into the explicit relational constructors.
    """
    text = tnai.strip()

    operators = [
        ("==", Eq),
        ("!=", Ne),
        ("<=", Le),
        (">=", Ge),
        ("<",  Lt),
        (">",  Gt),
    ]

    for op, ctor in operators:
        if op in text:
            left, right = text.split(op, 1)
            return ctor(sympify(left, locals=_SYMBOL_NS),
                        sympify(right, locals=_SYMBOL_NS))

    raise ValueError(f"Unsupported condition: {tnai!r}")


def build_sympy_expression(targil: str,
                           tnai: Optional[str],
                           targil_false: Optional[str]):
    """
    Turn a row of t_targil into a single SymPy expression.

    - No condition        -> just `targil`
    - With condition      -> Piecewise((targil, cond), (targil_false, True))
    """
    true_expr = sympify(targil.strip(), locals=_SYMBOL_NS)

    if tnai is None or str(tnai).strip() == "":
        return true_expr

    false_expr = sympify((targil_false or "0").strip(), locals=_SYMBOL_NS)
    cond = _parse_condition(tnai)
    return Piecewise((true_expr, cond), (false_expr, True))


def compile_formula(targil: str,
                    tnai: Optional[str],
                    targil_false: Optional[str]) -> Callable[..., np.ndarray]:
    """
    Compile a formula once and return a fast vectorized evaluator.

    The returned function accepts four NumPy arrays and returns a NumPy
    array of the same length, evaluated in native C speed via NumPy.
    """
    expr = build_sympy_expression(targil, tnai, targil_false)
    return lambdify((a, b, c, d), expr, modules=["numpy"])
