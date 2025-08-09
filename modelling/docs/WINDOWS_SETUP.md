# MPB-OMS Crowd Counting - Windows Setup Guide

## 🪟 Windows Environment Setup

### Prerequisites
- Windows 10/11
- Python 3.8 or higher
- Webcam (built-in or USB)
- Command Prompt or PowerShell

## 📋 Step-by-Step Installation

### 1. Check Python Installation
Open Command Prompt (Win + R, type `cmd`, press Enter) and check:

```cmd
python --version
```

If Python is not installed, download from: https://python.org/downloads/

**Important:** During installation, check "Add Python to PATH"

### 2. Install Dependencies

#### Option A: Minimal Setup (Basic functionality)
```cmd
pip install numpy opencv-python flask flask-cors
```

#### Option B: Full Setup (All features)
```cmd
pip install -r requirements_clean.txt
```

If you get permission errors, try:
```cmd
pip install --user numpy opencv-python flask flask-cors
```

### 3. Test the Installation
```cmd
python test_system.py
```

You should see:
```
✓ modeling.py imported successfully
✓ config.py imported successfully
✓ BackgroundSubtractionCounter created
✓ Frame processing works
```

## 🚀 Running the System

### Method 1: Webcam Counting (Recommended for Windows)

#### Basic Background Subtraction Method:
```cmd
python modeling.py --mode webcam --input 0
```

**Controls:**
- Press `Q` to quit
- Press `S` to save screenshot
- The window should show your webcam feed with person detection

#### Advanced YOLO Method (if dependencies installed):
```cmd
python modeling.py --mode yolo --input 0
```

### Method 2: Web Server (Access from Browser)

Start the server:
```cmd
python modeling.py --mode server --port 5000
```

Then open your browser and go to:
```
http://localhost:5000
```

You can also access from your phone if connected to the same WiFi:
```
http://[YOUR_PC_IP]:5000
```

To find your PC's IP address:
```cmd
ipconfig
```
Look for "IPv4 Address" under your network adapter.

### Method 3: Process Video Files

If you have a video file to analyze:
```cmd
python modeling.py --mode video --input "C:\path\to\your\video.mp4"
```

Save processed video:
```cmd
python modeling.py --mode video --input "video.mp4" --output "result.mp4"
```

### Method 4: Generate Mock Data

Create sample TransJakarta data:
```cmd
python modeling.py --mode data --output "crowd_data.csv" --records 1000
```

## 🔧 Windows-Specific Troubleshooting

### Camera Issues

**Problem: Camera not detected**
```cmd
# Try different camera indices
python modeling.py --mode webcam --input 1
python modeling.py --mode webcam --input 2
```

**Problem: Camera permission denied**
1. Go to Settings > Privacy > Camera
2. Enable "Allow apps to access your camera"
3. Enable "Allow desktop apps to access your camera"

### Installation Issues

**Problem: pip not recognized**
```cmd
# Try using py launcher
py -m pip install numpy opencv-python flask flask-cors
```

**Problem: Permission denied**
```cmd
# Install for current user only
pip install --user numpy opencv-python flask flask-cors
```

**Problem: Visual C++ errors**
1. Install Visual Studio Build Tools
2. Or install pre-compiled packages:
```cmd
pip install --only-binary=all numpy opencv-python
```

### Path Issues

**Problem: Python not found**
1. Add Python to PATH:
   - Search "Environment Variables" in Start Menu
   - Click "Environment Variables"
   - Under "System Variables", find "Path"
   - Add Python installation directory (usually `C:\Python39\` or `C:\Users\[username]\AppData\Local\Programs\Python\Python39\`)

### Firewall Issues (Web Server Mode)

**Problem: Can't access web server from other devices**
1. Windows Defender Firewall might be blocking
2. When you start the server, Windows may ask for permission - click "Allow"
3. Or manually add firewall rule:
   - Search "Windows Defender Firewall" in Start Menu
   - Click "Allow an app through firewall"
   - Find Python or add it manually

## 💡 Quick Start Commands for Windows

### 1. Basic Webcam Test
```cmd
cd C:\path\to\your\files
python modeling.py --mode webcam --input 0
```

### 2. Web Interface
```cmd
python modeling.py --mode server
start http://localhost:5000
```

### 3. Process Video from Desktop
```cmd
python modeling.py --mode video --input "C:\Users\%USERNAME%\Desktop\video.mp4"
```

## 📁 File Organization for Windows

Recommended folder structure:
```
C:\MPB-OMS\
├── modeling.py
├── config.py
├── requirements_clean.txt
├── test_system.py
├── README_EXPORT.md
└── results\
    ├── screenshots\
    └── videos\
```

## 🎥 Camera Configuration

### Built-in Webcam
```cmd
python modeling.py --mode webcam --input 0
```

### USB Camera
```cmd
python modeling.py --mode webcam --input 1
```

### External Camera (IP Camera)
```cmd
python modeling.py --mode webcam --input "http://192.168.1.100:8080/video"
```

## 🔍 Performance Tips for Windows

### For Better Performance:
1. **Close unnecessary programs** before running
2. **Use integrated graphics** for basic mode, dedicated GPU for YOLO
3. **Lower resolution** if slow:
   - Edit `config.py`
   - Change `DEFAULT_FRAME_WIDTH = 640` and `DEFAULT_FRAME_HEIGHT = 480`

### For YOLO Mode:
1. **Install CUDA** if you have NVIDIA GPU:
   ```cmd
   pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
   ```

## 📱 Mobile Access from Windows

1. Start web server:
   ```cmd
   python modeling.py --mode server --port 5000
   ```

2. Find your PC's IP:
   ```cmd
   ipconfig
   ```

3. On your phone, open browser and go to:
   ```
   http://[YOUR_PC_IP]:5000
   ```

## ⚡ Common Windows Commands

### Quick Test Run:
```cmd
# Open Command Prompt in the folder (Shift + Right-click > "Open PowerShell window here")
python test_system.py
python modeling.py --mode webcam --input 0
```

### Batch File for Easy Launch:
Create `start_crowd_counter.bat`:
```batch
@echo off
cd /d "%~dp0"
python modeling.py --mode webcam --input 0
pause
```

Double-click the .bat file to run!

## 🆘 Getting Help

If you encounter issues:

1. **Check Python version:**
   ```cmd
   python --version
   ```

2. **Check installed packages:**
   ```cmd
   pip list
   ```

3. **Test basic functionality:**
   ```cmd
   python test_system.py
   ```

4. **Run with verbose output:**
   ```cmd
   python -v modeling.py --mode webcam --input 0
   ```

The system should work out-of-the-box on most Windows systems with Python installed!

