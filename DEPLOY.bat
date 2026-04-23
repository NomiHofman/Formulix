@echo off
chcp 65001 > nul
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║            FORMULIX - Deploy to Cloud                         ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Initialize Git if needed
if not exist ".git" (
    echo [1/4] Initializing Git repository...
    git init
    git branch -M main
) else (
    echo [1/4] Git repository already exists
)

REM Create .gitignore if needed
if not exist ".gitignore" (
    echo Creating .gitignore...
    (
        echo # Dependencies
        echo node_modules/
        echo .venv/
        echo __pycache__/
        echo *.pyc
        echo.
        echo # Build outputs
        echo dist/
        echo bin/
        echo obj/
        echo *.exe
        echo *.dll
        echo.
        echo # IDE
        echo .vs/
        echo .idea/
        echo *.suo
        echo *.user
        echo.
        echo # Environment
        echo .env
        echo .env.local
        echo launchSettings.json
        echo.
        echo # Logs
        echo *.log
    ) > .gitignore
)

REM Add all files
echo.
echo [2/4] Adding files to Git...
git add .

REM Commit
echo.
echo [3/4] Creating commit...
git commit -m "FORMULIX - Dynamic Formula Calculation Engine Benchmark"

echo.
echo [4/4] Ready to push!
echo.
echo ══════════════════════════════════════════════════════════════
echo.
echo Next steps:
echo.
echo 1. Create a new repository on GitHub:
echo    https://github.com/new
echo    Name: Formulix
echo.
echo 2. Run these commands:
echo    git remote add origin https://github.com/YOUR_USERNAME/Formulix.git
echo    git push -u origin main
echo.
echo 3. Deploy Dashboard to Vercel:
echo    cd dashboard
echo    npx vercel --prod
echo.
echo ══════════════════════════════════════════════════════════════
echo.
pause
