# MPB-OMS Crowd Counting System - Export Version

This is a consolidated version of the MPB-OMS (Mass Public Bus - Operations Management System) crowd counting repository. All functionality has been combined into two main files for easy deployment and export.

## Files Included

- `modeling.py` - Main consolidated system with all crowd counting functionality
- `config.py` - Configuration parameters for the system
- `requirements_clean.txt` - Clean list of required Python packages

## System Features

### 1. Background Subtraction Counting
- Real-time person detection using OpenCV background subtraction
- Person tracking with line crossing detection
- Bidirectional counting (incoming/outgoing)

### 2. YOLO-based Detection
- YOLOv8 person detection with ByteTrack tracking
- Higher accuracy for complex scenes
- Real-time processing capability

### 3. Web Server Interface
- Flask-based web server for browser access
- Real-time camera feed processing
- Mobile-friendly interface

### 4. Data Generation
- Mock TransJakarta bus passenger data generation
- Configurable time ranges and station routes
- CSV export functionality

### 5. CSRNet Deep Learning (Optional)
- Crowd density estimation using CSRNet
- PyTorch-based implementation
- Suitable for very dense crowds

## Installation & Setup

### 1. Install Python Dependencies

```bash
# Install all dependencies
pip install -r requirements_clean.txt

# Or install minimal dependencies only
pip install numpy opencv-python flask flask-cors
```

### 2. Optional Dependencies

For full functionality, install these optional packages:

```bash
# For YOLO detection
pip install ultralytics supervision

# For deep learning (CSRNet)
pip install torch torchvision

# For data generation
pip install pandas matplotlib
```

## Usage Examples

### 1. Real-time Webcam Counting

```bash
# Using background subtraction
python modeling.py --mode webcam --input 0

# Using YOLO detection (more accurate)
python modeling.py --mode yolo --input 0
```

### 2. Process Video File

```bash
# Process existing video
python modeling.py --mode video --input video.mp4

# Process and save output
python modeling.py --mode video --input video.mp4 --output result.mp4
```

### 3. Start Web Server

```bash
# Start web server on port 5000
python modeling.py --mode server

# Custom port
python modeling.py --mode server --port 8080
```

Access the web interface at: `http://localhost:5000`

### 4. Generate Mock Data

```bash
# Generate 1000 minutes of data
python modeling.py --mode data --output crowd_data.csv

# Generate custom amount
python modeling.py --mode data --records 2000 --output my_data.csv
```

## System Requirements

### Minimum Requirements
- Python 3.8+
- 4GB RAM
- Webcam or video file
- CPU: Any modern processor

### Recommended for YOLO
- Python 3.9+
- 8GB RAM
- GPU with CUDA support (optional, but faster)
- Modern multi-core CPU

### For Real-time Processing
- Webcam: 720p or higher
- Stable lighting conditions
- Network connection (for web server mode)

## Configuration

Edit `config.py` to customize:

- Video resolution and FPS
- Detection sensitivity
- Tracking parameters
- Line positions for counting
- Colors and display settings

## Troubleshooting

### Common Issues

1. **Camera not detected**
   ```bash
   # Try different camera indices
   python modeling.py --mode webcam --input 1
   python modeling.py --mode webcam --input 2
   ```

2. **YOLO model download**
   - First run will download YOLOv8 model (~50MB)
   - Ensure internet connection for initial setup

3. **Performance issues**
   - Reduce video resolution
   - Lower FPS in configuration
   - Use background subtraction instead of YOLO

4. **Web server not accessible**
   - Check firewall settings
   - Try different port: `--port 8080`
   - Access via localhost: `http://127.0.0.1:5000`

### Error Messages

- `ImportError`: Install missing dependencies from requirements
- `Camera access denied`: Grant camera permissions
- `Model not found`: Check internet for YOLO model download

## Performance Tips

1. **For Best Accuracy**: Use YOLO mode
2. **For Speed**: Use background subtraction mode
3. **For Web Access**: Use server mode with mobile devices
4. **For Analysis**: Generate data and process offline

## Output Formats

### Real-time Display
- Live video feed with bounding boxes
- Person count overlay
- Tracking trajectories (optional)
- Line crossing indicators

### Data Export
- CSV files with timestamps
- Screenshot capture (press 's')
- Processed video files
- JSON data via web API

## Integration Examples

### Mobile App Integration
```javascript
// Send frame to server
fetch('http://localhost:5000/process', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({frame: base64_image})
})
.then(response => response.json())
.then(data => console.log('People count:', data.people_count));
```

### Batch Processing
```python
import cv2
from modeling import BackgroundSubtractionCounter

counter = BackgroundSubtractionCounter()
cap = cv2.VideoCapture('video.mp4')

while True:
    ret, frame = cap.read()
    if not ret: break
    
    count, annotated = counter.process_frame(frame)
    print(f"People count: {count}")
```

## License & Credits

This system consolidates code from the MPB-OMS repository and includes:
- OpenCV for computer vision
- YOLOv8 for object detection
- Flask for web serving
- CSRNet for crowd density estimation

## Support

For issues with this export version:
1. Check the troubleshooting section above
2. Verify all dependencies are installed
3. Test with different input sources
4. Review configuration settings

The system is designed to work out-of-the-box with minimal setup for most use cases.

