@echo off
echo MPB-OMS Crowd Counting System - Windows Launcher
echo ================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
)

echo Python detected successfully!
echo.

REM Check if required files exist
if not exist "modeling.py" (
    echo ERROR: modeling.py not found in current directory
    echo Please make sure you're running this from the modelling/scripts folder
    pause
    exit /b 1
)

if not exist "..\configs\config.py" (
    echo ERROR: config.py not found in configs directory
    pause
    exit /b 1
)

echo Required files found!
echo.

REM Test system first
echo Testing system functionality...
python test_system.py
if errorlevel 1 (
    echo.
    echo WARNING: Some tests failed. You may need to install dependencies.
    echo Run: pip install numpy opencv-python flask flask-cors
    echo.
)

echo.
echo Choose an option:
echo 1. Webcam Counting (Basic - Background Subtraction)
echo 2. Webcam Counting (YOLO - More Accurate)
echo 3. Web Server (Browser Access)
echo 4. Process Video File
echo 5. Generate Mock Data
echo 6. Install Dependencies
echo 7. Exit
echo.

set /p choice="Enter your choice (1-7): "

if "%choice%"=="1" (
    echo Starting webcam counting with background subtraction...
    python modeling.py --mode webcam --input 0
) else if "%choice%"=="2" (
    echo Starting webcam counting with YOLO...
    python modeling.py --mode yolo --input 0
) else if "%choice%"=="3" (
    echo Starting web server...
    echo Open your browser and go to: http://localhost:5000
    echo Press Ctrl+C to stop the server
    python modeling.py --mode server --port 5000
) else if "%choice%"=="4" (
    set /p video_path="Enter video file path: "
    echo Processing video...
    python modeling.py --mode video --input "%video_path%"
) else if "%choice%"=="5" (
    set /p records="Enter number of minutes to generate (default 1000): "
    if "%records%"=="" set records=1000
    echo Generating mock data...
    python modeling.py --mode data --records %records% --output crowd_data.csv
    echo Data saved to crowd_data.csv
) else if "%choice%"=="6" (
    echo Installing basic dependencies...
    pip install numpy opencv-python flask flask-cors
    echo.
    echo For full features, install from requirements:
    echo pip install -r ..\requirements_clean.txt
) else if "%choice%"=="7" (
    echo Goodbye!
    exit /b 0
) else (
    echo Invalid choice. Please run the script again.
)

echo.
pause

