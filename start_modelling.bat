@echo off
echo MPB-OMS Crowd Counting System Launcher
echo ======================================
echo.

REM Check if modelling folder exists
if not exist "modelling" (
    echo ERROR: modelling folder not found
    echo Please make sure you're in the correct directory
    pause
    exit /b 1
)

echo Starting modelling system...
echo.

REM Change to modelling/scripts directory and run
cd modelling\scripts
call run_windows.bat

REM Return to original directory
cd ..\..

pause
