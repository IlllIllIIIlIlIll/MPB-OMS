@echo off
echo ========================================
echo   MPB-OMS Environment Setup (Windows)
echo ========================================
echo.

echo Creating centralized .env file...
copy env.example .env

echo.
echo Setting up backend environment...
copy .env backend\.env

echo.
echo Setting up frontend environment...
copy .env frontend\.env

echo.
echo Setting up mobile app environment...
copy .env mobile-app\.env

echo.
echo Environment setup complete!
echo.
echo All services are now configured with:
echo - Host IP: 192.168.1.21
echo - Backend Port: 3001
echo - Frontend Port: 3002
echo - Mobile Dev Port: 8081
echo.
echo You can modify the root .env file and re-run this script to update all services.
echo.
pause
