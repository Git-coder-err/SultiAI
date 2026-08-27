@echo off
REM SultiAI Pronunciation Service — Windows startup script
cd /d "%~dp0"

echo ============================================
echo  SultiAI Pronunciation Service
echo  Acoustic Analysis for Philippine Languages
echo ============================================
echo.

REM Use venv Python
if not exist ".venv\Scripts\python.exe" (
    echo ERROR: Virtual environment not found.
    echo Run: python -m venv .venv ^&^& .venv\Scripts\pip install -r requirements.txt
    pause
    exit /b 1
)

echo Starting server on http://0.0.0.0:8000
echo Press Ctrl+C to stop.
echo.

.venv\Scripts\uvicorn.exe main:app --host 0.0.0.0 --port 8000 --reload
