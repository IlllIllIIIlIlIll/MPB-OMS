@echo off
echo ========================================
echo   Android Studio Setup Helper
echo ========================================
echo.

echo Checking Android setup...
echo.

REM Check if ANDROID_HOME is set
if defined ANDROID_HOME (
    echo ✅ ANDROID_HOME is set: %ANDROID_HOME%
    if exist "%ANDROID_HOME%" (
        echo ✅ Android SDK directory exists
    ) else (
        echo ❌ Android SDK directory does not exist: %ANDROID_HOME%
        echo Please check your Android Studio SDK installation
        goto :error
    )
) else (
    echo ❌ ANDROID_HOME environment variable is not set
    echo.
    echo Please set up environment variables:
    echo 1. Open System Properties ^> Advanced ^> Environment Variables
    echo 2. Add ANDROID_HOME = C:\Users\%USERNAME%\AppData\Local\Android\Sdk
    echo 3. Add to PATH: %%ANDROID_HOME%%\platform-tools
    echo 4. Restart terminal
    goto :error
)

REM Check if ADB is available
adb version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ ADB is available in PATH
    echo.
    echo Connected devices:
    adb devices
) else (
    echo ❌ ADB is not available in PATH
    echo Please add %%ANDROID_HOME%%\platform-tools to your PATH
    goto :error
)

echo.
echo ========================================
echo   Setup Status: READY! ✅
echo ========================================
echo.
echo You can now run your mobile app on Android emulator:
echo.
echo   npm run android
echo   OR
echo   npx expo start --android
echo.
echo Make sure your Android emulator is running first!
echo.
goto :end

:error
echo.
echo ========================================
echo   Setup Status: NEEDS CONFIGURATION ❌
echo ========================================
echo.
echo Please follow the setup guide in ANDROID_STUDIO_SETUP.md
echo.

:end
pause
