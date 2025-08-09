# MPB-OMS Crowd Counting - Modelling System

This folder contains all the crowd counting and computer vision modeling components of the MPB-OMS system.

## 📁 Folder Structure

```
modelling/
├── scripts/                    # Main executable scripts
│   ├── modeling.py            # Main crowd counting system
│   ├── test_system.py         # System testing script
│   └── run_windows.bat        # Windows launcher
├── configs/                   # Configuration files
│   └── config.py             # Main configuration
├── models/                    # AI/ML model files
│   └── yolov8n.pt            # YOLO model weights
├── results/                   # Output results
│   ├── video_outputs/         # Processed videos
│   └── yolo_outputs/          # YOLO detection results
├── docs/                      # Documentation
│   ├── README_EXPORT.md       # Export documentation
│   ├── WINDOWS_SETUP.md       # Windows setup guide
│   └── PYTHON_INSTALL_WINDOWS.md # Python installation guide
└── requirements_clean.txt     # Python dependencies
```

## 🚀 Quick Start

### Windows Users
1. Navigate to the `modelling` folder
2. Double-click `scripts/run_windows.bat`
3. Choose your preferred mode from the menu

### Command Line
```bash
cd modelling

# Install dependencies
pip install -r requirements_clean.txt

# Run webcam counting
python scripts/modeling.py --mode webcam --input 0

# Run web server
python scripts/modeling.py --mode server --port 5000

# Test system
python scripts/test_system.py
```

## 🎯 Available Modes

1. **Webcam Counting** - Real-time person detection from camera
2. **YOLO Detection** - Advanced AI-based person detection
3. **Video Processing** - Process existing video files
4. **Web Server** - Browser-based interface for mobile access
5. **Data Generation** - Create mock TransJakarta datasets

## 📋 System Requirements

### Minimum (Basic Functionality)
- Python 3.8+
- Webcam or video file
- Dependencies: `numpy`, `opencv-python`, `flask`

### Recommended (Full Features)
- Python 3.9+
- GPU with CUDA support (for YOLO)
- All dependencies from `requirements_clean.txt`

## 🔧 Configuration

Edit `configs/config.py` to customize:
- Video resolution and FPS
- Detection thresholds
- Line positions for counting
- Colors and UI settings

## 📊 Output Results

### Video Outputs (`results/video_outputs/`)
- `output_original.mp4` - Original video with annotations
- `output_masked.mp4` - Background subtraction mask
- `output_realtime.mp4` - Real-time processing results

### YOLO Outputs (`results/yolo_outputs/`)
- `output_yolo.mp4` - YOLO detection results
- Detection logs and statistics

## 🔍 Testing

Run the test system to verify everything works:
```bash
python scripts/test_system.py
```

This will check:
- ✓ Python imports
- ✓ Basic functionality
- ✓ YOLO availability (optional)
- ✓ Configuration loading

## 📱 Mobile/Web Access

Start the web server and access from any device:
```bash
python scripts/modeling.py --mode server
```

Then open browser: `http://localhost:5000`

## 🆘 Troubleshooting

See documentation in `docs/` folder:
- `WINDOWS_SETUP.md` - Windows-specific setup
- `PYTHON_INSTALL_WINDOWS.md` - Python installation guide
- `README_EXPORT.md` - Complete system documentation

## 🔗 Integration

The modelling system can be integrated with:
- Backend API (via HTTP endpoints)
- Mobile applications (via web interface)
- Real-time dashboards (via WebSocket)
- Data analytics pipelines (via CSV export)

## 📈 Performance Tips

1. **For Speed**: Use background subtraction mode
2. **For Accuracy**: Use YOLO mode with GPU
3. **For Mobile**: Use web server mode
4. **For Analysis**: Use data generation mode

## 🏗️ Development

To extend the system:
1. Add new detection methods in `scripts/modeling.py`
2. Update configuration in `configs/config.py`
3. Add tests in `scripts/test_system.py`
4. Document changes in `docs/`

The modelling system is designed to be modular and extensible for various crowd counting scenarios.
