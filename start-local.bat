@echo off
echo ============================================
echo   SultiAI Localhost Startup
echo ============================================
echo.
echo   Port Map:
echo   -----------------------------------------
echo   Web:        http://localhost:3000
echo   Server:     http://localhost:3001
echo   Admin:      http://localhost:3002
echo   AI Service: http://localhost:8000
echo   MySQL:      localhost:3306
echo   Expo:       http://localhost:8081
echo   -----------------------------------------
echo.
echo Starting services...
echo.

REM Check if XAMPP MySQL is running
echo [1/4] Checking MySQL (XAMPP)...
netstat -an | findstr ":3306" >nul 2>&1
if %errorlevel%==0 (
    echo   MySQL is running on port 3306
) else (
    echo   WARNING: MySQL not detected on port 3306
    echo   Please start MySQL from XAMPP Control Panel
    echo.
)

REM Start Server
echo [2/4] Starting Express API server on port 3001...
start "SultiAI Server" cmd /c "cd /d %~dp0server && npm run dev"
timeout /t 3 >nul

REM Start Admin
echo [3/4] Starting Admin Dashboard on port 3002...
start "SultiAI Admin" cmd /c "cd /d %~dp0admin && npm run dev"
timeout /t 2 >nul

REM Start Web
echo [4/4] Starting Web on port 3000...
start "SultiAI Web" cmd /c "cd /d %~dp0web && npm run dev"

echo.
echo ============================================
echo   All services started!
echo ============================================
echo.
echo   Web:        http://localhost:3000
echo   Server:     http://localhost:3001
echo   Admin:      http://localhost:3002
echo   AI Service: http://localhost:8000 (start manually if needed)
echo   Expo:       Run "npx expo start" in root directory
echo.
echo   Press any key to open Admin Dashboard...
pause >nul
start http://localhost:3002
