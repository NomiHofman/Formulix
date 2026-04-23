"""
FORMULIX - Database Status Checker
Quick check of database tables before running benchmarks.
"""

import sys

try:
    import pyodbc
except ImportError:
    print("ERROR: pyodbc not installed. Run: pip install pyodbc")
    sys.exit(1)

CONNECTION_STRING = (
    "DRIVER={ODBC Driver 17 for SQL Server};"
    "SERVER=(localdb)\\MSSQLLocalDB;"
    "DATABASE=Formulix;"
    "Trusted_Connection=yes;"
)

def main():
    try:
        conn = pyodbc.connect(CONNECTION_STRING)
        cursor = conn.cursor()
        
        print("\n" + "=" * 50)
        print("FORMULIX Database Status")
        print("=" * 50)
        
        # Check t_data
        cursor.execute("SELECT COUNT(*) FROM t_data")
        data_count = cursor.fetchone()[0]
        status = "✓" if data_count >= 1000000 else "⚠"
        print(f"{status} t_data:    {data_count:,} rows")
        
        # Check t_targil
        cursor.execute("SELECT COUNT(*) FROM t_targil")
        formula_count = cursor.fetchone()[0]
        status = "✓" if formula_count >= 12 else "⚠"
        print(f"{status} t_targil:  {formula_count} formulas")
        
        # Check t_results
        cursor.execute("SELECT COUNT(*) FROM t_results")
        results_count = cursor.fetchone()[0]
        print(f"  t_results: {results_count:,} rows")
        
        # Check t_log
        cursor.execute("SELECT COUNT(*) FROM t_log")
        log_count = cursor.fetchone()[0]
        print(f"  t_log:     {log_count} entries")
        
        # Check methods
        cursor.execute("SELECT DISTINCT method FROM t_results")
        methods = [row[0] for row in cursor.fetchall()]
        if methods:
            print(f"\n  Methods with results: {', '.join(methods)}")
        
        # Check log details
        cursor.execute("""
            SELECT method, COUNT(*) as runs, 
                   ROUND(AVG(run_time), 2) as avg_time
            FROM t_log
            GROUP BY method
        """)
        logs = cursor.fetchall()
        if logs:
            print("\n  Performance Summary:")
            for method, runs, avg_time in logs:
                print(f"    {method}: {runs} runs, avg {avg_time}s")
        
        print("=" * 50 + "\n")
        
        conn.close()
        
        if data_count < 1000000:
            print("WARNING: Less than 1M rows in t_data!")
            print("Run DB\\FormulixCreate.sql first.\n")
            return 1
            
        return 0
        
    except pyodbc.Error as e:
        print(f"\nERROR connecting to database: {e}")
        print("\nMake sure:")
        print("1. SQL Server LocalDB is running")
        print("2. Database 'Formulix' exists")
        print("3. Run DB\\FormulixCreate.sql if needed\n")
        return 1

if __name__ == "__main__":
    sys.exit(main())
