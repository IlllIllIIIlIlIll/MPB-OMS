# 🐍 Python Installation Guide for Windows

## The Problem
Your Windows system cannot find Python. This means either:
1. Python is not installed, OR
2. Python is installed but not added to PATH

## 🚀 Solution: Install Python Properly

### Step 1: Download Python
1. Go to: **https://python.org/downloads/**
2. Click the big yellow **"Download Python 3.x.x"** button
3. This downloads the official Python installer

### Step 2: Install Python (IMPORTANT SETTINGS)
1. **Run the downloaded installer** (python-3.x.x-amd64.exe)
2. **❗ CRITICAL:** Check the box **"Add Python to PATH"** at the bottom
3. Click **"Install Now"**
4. Wait for installation to complete
5. Click **"Close"**

### Step 3: Verify Installation
1. **Close all Command Prompt/PowerShell windows**
2. Open a **new** Command Prompt (Win + R, type `cmd`, press Enter)
3. Test Python:
   ```cmd
   python --version
   ```
   You should see: `Python 3.x.x`

4. Test pip:
   ```cmd
   pip --version
   ```
   You should see: `pip 23.x.x from...`

## 🔧 Alternative Methods

### Method 1: Use Python Launcher (if Python is installed)
Sometimes Python is installed but not in PATH. Try:
```cmd
py --version
py -m pip --version
```

If this works, use `py` instead of `python`:
```cmd
py -m pip install numpy opencv-python flask flask-cors
py modeling.py --mode webcam --input 0
```

### Method 2: Install from Microsoft Store
1. Open **Microsoft Store**
2. Search for **"Python 3.11"** or **"Python 3.12"**
3. Click **"Get"** or **"Install"**
4. This automatically adds Python to PATH

### Method 3: Check if Python is Already Installed
Look in these locations:
- `C:\Python39\` or `C:\Python310\` or `C:\Python311\`
- `C:\Users\[your-username]\AppData\Local\Programs\Python\`
- `C:\Program Files\Python39\`

If you find Python there, you need to add it to PATH manually.

## 🛠️ Manual PATH Setup (if needed)

### If Python is installed but not in PATH:

1. **Find Python location** (usually one of these):
   - `C:\Python39\`
   - `C:\Users\FAVIAN\AppData\Local\Programs\Python\Python39\`
   - `C:\Program Files\Python39\`

2. **Add to PATH:**
   - Press `Win + R`, type `sysdm.cpl`, press Enter
   - Click **"Environment Variables"**
   - Under **"System Variables"**, find **"Path"** and click **"Edit"**
   - Click **"New"** and add your Python path (e.g., `C:\Python39\`)
   - Click **"New"** again and add Scripts path (e.g., `C:\Python39\Scripts\`)
   - Click **"OK"** on all dialogs

3. **Restart Command Prompt** and test again

## ✅ Quick Test After Installation

After installing Python, test with these commands:

```cmd
# Test Python
python --version

# Test pip
pip --version

# Install basic packages
pip install numpy opencv-python

# Test our system
python test_system.py
```

## 🎯 Once Python is Working

After Python is properly installed, you can run:

```cmd
# Install dependencies
pip install numpy opencv-python flask flask-cors

# Test the system
python test_system.py

# Start webcam counting
python modeling.py --mode webcam --input 0
```

## 🆘 Still Having Issues?

### Option 1: Use Anaconda
1. Download **Anaconda** from: https://anaconda.com/download
2. Install with default settings
3. Open **"Anaconda Prompt"** from Start Menu
4. Run commands there instead of regular Command Prompt

### Option 2: Use Chocolatey (Package Manager)
1. Open **PowerShell as Administrator**
2. Install Chocolatey:
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
   ```
3. Install Python:
   ```powershell
   choco install python
   ```

### Option 3: Try Different Python Commands
Some systems use different commands:
```cmd
python3 --version
py --version
python.exe --version
```

## 🔍 Debugging Commands

To diagnose what's happening:

```cmd
# Check if Python is in PATH
where python

# Check if pip is in PATH  
where pip

# List installed programs
dir "C:\Program Files" | findstr Python
dir "C:\Users\FAVIAN\AppData\Local\Programs" | findstr Python
```

The most important thing is to **reinstall Python with "Add to PATH" checked**!

