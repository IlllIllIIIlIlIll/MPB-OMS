# 📡 Edge Device Integration Service

This service handles integration with edge devices (webcams, sensors) for real-time occupancy detection.

## 🎯 **Purpose**

- **Camera Integration**: Connect to webcams and cameras
- **Real-time Detection**: Process video streams for people counting
- **MQTT Communication**: Send data to backend via MQTT
- **Local Processing**: Run AI models on edge devices

## 🏗️ **Architecture**

```
Edge Device (Raspberry Pi/Jetson)
├── Camera Input (USB/CSI)
├── AI Processing (YOLO)
├── MQTT Client
└── Local Storage
```

## 🚀 **Quick Start**

```bash
# Install dependencies
pip install -r requirements.txt

# Configure device
cp .env.example .env
# Edit .env with your settings

# Start edge device service
python main.py
```

## 📋 **Configuration**

### Environment Variables

```env
# MQTT Configuration
MQTT_BROKER=mqtt://localhost:1883
MQTT_USERNAME=your_username
MQTT_PASSWORD=your_password

# Camera Configuration
CAMERA_INDEX=0
CAMERA_WIDTH=640
CAMERA_HEIGHT=480
FPS=30

# AI Configuration
MODEL_PATH=./models/yolov8n.pt
CONFIDENCE_THRESHOLD=0.5
MAX_DETECTIONS=100

# Device Configuration
DEVICE_ID=edge_device_001
BUS_ID=DMR-727
LOCATION=Platform A
```

## 🔧 **Features**

- **Multi-camera Support**: Handle multiple camera inputs
- **Real-time Processing**: Process video streams in real-time
- **MQTT Integration**: Send data to backend
- **Local Storage**: Store detection results locally
- **Health Monitoring**: Monitor device health and connectivity
- **Auto-reconnection**: Automatically reconnect on connection loss

## 📊 **Data Flow**

```
Camera → AI Detection → MQTT → Backend API → Web/Mobile Apps
```

## 🛠️ **Development**

### **Local Testing**

```bash
# Test camera connection
python test_camera.py

# Test MQTT connection
python test_mqtt.py

# Test AI detection
python test_detection.py
```

### **Production Deployment**

```bash
# Build Docker image
docker build -t tj-edge-device .

# Run on edge device
docker run -d --name tj-edge-device \
  --device=/dev/video0 \
  -e MQTT_BROKER=mqtt://your-broker:1883 \
  tj-edge-device
```

## 📱 **Integration**

The edge device service integrates with:

- **Backend API**: Sends occupancy data via MQTT
- **Web Dashboard**: Real-time occupancy display
- **Mobile App**: Live occupancy updates
- **Admin Panel**: Device monitoring and management

## 🔍 **Monitoring**

- **Device Status**: Online/offline status
- **Detection Rate**: FPS and processing speed
- **Error Logs**: Detailed error logging
- **Health Checks**: Regular health monitoring

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Camera Not Found**
   ```bash
   # Check camera devices
   ls /dev/video*
   # Test camera
   python test_camera.py
   ```

2. **MQTT Connection Failed**
   ```bash
   # Check MQTT broker
   mosquitto_pub -h localhost -p 1883 -t "test" -m "hello"
   # Check credentials
   python test_mqtt.py
   ```

3. **AI Model Not Loading**
   ```bash
   # Check model file
   ls -la models/
   # Test model loading
   python test_detection.py
   ```

## 📚 **API Reference**

### **MQTT Topics**

- `oms/v1/occupancy` - Occupancy data
- `oms/v1/device/{device_id}/status` - Device status
- `oms/v1/device/{device_id}/heartbeat` - Heartbeat

### **Message Format**

```json
{
  "bus_id": "DMR-727",
  "device_id": "edge_device_001",
  "occupancy": 25,
  "capacity": 40,
  "in_count": 3,
  "out_count": 1,
  "confidence": 0.95,
  "timestamp": "2025-01-15T12:34:56Z"
}
```

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License.
