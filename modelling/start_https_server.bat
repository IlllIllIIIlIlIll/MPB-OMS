@echo off
echo Starting MPB-OMS Crowd Counter with HTTPS...
echo.

:: Change to the modelling directory
cd /d "%~dp0"

:: Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    pause
    exit /b 1
)

:: Generate SSL certificate if it doesn't exist
if not exist "certs\cert.pem" (
    echo Generating SSL certificate...
    python scripts\generate_ssl_cert.py
    echo.
)

:: Start the HTTPS server
echo Starting HTTPS server on port 5000...
echo Access the app at: https://192.168.1.113:5000/
echo.
echo Note: Your browser will show a security warning for the self-signed certificate.
echo Click "Advanced" and "Proceed to 192.168.1.113 (unsafe)" to continue.
echo.

python scripts\modeling.py --mode server --port 5000 --ssl

pause
