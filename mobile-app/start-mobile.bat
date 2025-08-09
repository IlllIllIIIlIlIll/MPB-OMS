@echo off
echo ========================================
echo   MPB-OMS Mobile App - SDK 52 (Windows)
echo ========================================
echo.

echo Checking environment...
if not exist .env (
    echo Error: .env file not found!
    echo Please run setup-env.bat from the root directory first.
    pause
    exit /b 1
)

echo.
echo Mobile app upgraded to Expo SDK 52!
echo React Native: 0.76.9
echo.
echo Choose your option:
echo 1. Start with Expo Go (Recommended)
echo 2. Try Android Emulator (requires Android Studio)
echo 3. Start web version
echo.
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo.
    echo Starting Expo Go mode with SDK 52...
    echo Install latest Expo Go from Google Play Store and scan the QR code
    echo Your IP: 192.168.1.21
    npm start
) else if "%choice%"=="2" (
    echo.
    echo Attempting to start Android emulator...
    echo Note: This requires Android Studio to be properly installed
    npm run android
) else if "%choice%"=="3" (
    echo.
    echo Starting web version...
    npm run web
) else (
    echo Invalid choice. Starting default Expo Go mode...
    npm start
)

pause
