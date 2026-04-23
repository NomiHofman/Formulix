@echo off
chcp 65001 > nul
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║            FORMULIX - Full Benchmark Runner                   ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Check DB Status
echo [1/6] Checking database status...
python tools\check_db.py
if %errorlevel% neq 0 (
    echo ERROR: Database check failed. Make sure to run DB\FormulixCreate.sql first!
    pause
    exit /b 1
)

REM Run SQL Dynamic
echo.
echo [2/6] Running SQL Dynamic method...
cd src\Formulix
dotnet run --project Formulix.SqlDynamic --configuration Release
cd ..\..

REM Run Roslyn
echo.
echo [3/6] Running Roslyn method...
cd src\Formulix
dotnet run --project Formulix.RoslynRunner --configuration Release
cd ..\..

REM Run Python SymPy
echo.
echo [4/6] Running Python SymPy method...
cd python\formulix_sympy
python main.py
cd ..\..

REM Compare Results
echo.
echo [5/6] Comparing results across all methods...
python tools\compare_results.py

REM Export to Dashboard
echo.
echo [6/6] Exporting data to dashboard...
python tools\export_logs.py

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    ALL DONE!                                  ║
echo ║  Dashboard data exported to: dashboard\public\run-log.json   ║
echo ║  Run 'cd dashboard && npm run dev' to see results            ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
pause
