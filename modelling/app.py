import numpy as np
import cv2
import time
import base64
from flask import Flask, render_template_string, request, jsonify
from ultralytics import YOLO
import supervision as sv
import os
import json, joblib, pandas as pd
from PIL import Image
import io, base64
import numpy as np
from flask import request, jsonify
from datetime import datetime

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 6 * 1024 * 1024  # 6MB per request


# Initialize YOLO model and tracker
print("🚀 Loading YOLO model...")
model = YOLO("yolov8n.pt")
print("✅ YOLO model loaded successfully!")

print("🚀 Loading YOLO model...")
import os
best_weight = "best_tj_crowd_model.pt"  # ganti ke path best.pt kamu kalau berbeda
model = YOLO(best_weight if os.path.exists(best_weight) else "yolov8n.pt")
print("✅ YOLO model loaded successfully!")



# ===== Forecasting artifacts (hasil forecast.ipynb) =====
FORECAST_MODEL_PATH = os.environ.get("MODEL_PATH", "model_load_after_HistGBDT.joblib")
FEATURES_PATH       = "features.json"          # daftar kolom fitur
PRIORS_PATH         = "priors_lookup.csv"      # opsional
STOPS_NB_PATH       = "stops_nb.csv"           # opsional
STOPS_SB_PATH       = "stops_sb.csv"           # opsional

forecast_model = None
forecast_features = None
priors_df = None
stops_nb = None
stops_sb = None

try:
    if os.path.exists(FORECAST_MODEL_PATH):
        forecast_model = joblib.load(FORECAST_MODEL_PATH)
    if os.path.exists(FEATURES_PATH):
        with open(FEATURES_PATH, "r") as f:
            forecast_features = json.load(f)  # list of column names
    if os.path.exists(PRIORS_PATH):
        priors_df = pd.read_csv(PRIORS_PATH)
    if os.path.exists(STOPS_NB_PATH):
        stops_nb = pd.read_csv(STOPS_NB_PATH)
    if os.path.exists(STOPS_SB_PATH):
        stops_sb = pd.read_csv(STOPS_SB_PATH)
    print("✅ Forecast artifacts loaded.")
except Exception as e:
    print(f"⚠️ cannot load artifacts: {e}")


# Line crossing counter variables
cnt_up = 0  # People going up (entering)
cnt_down = 0  # People going down (exiting)
line_position = 0.5  # Line position as fraction of frame height (0.5 = middle)
line_thickness = 3
line_color = (0, 255, 255)  # Yellow line

# Person tracking for line crossing
class PersonTracker:
    def __init__(self, person_id, x, y, max_age=30):
        self.id = person_id
        self.positions = [(x, y)]
        self.age = 0
        self.max_age = max_age
        self.crossed = False
        self.direction = None
    
    def update_position(self, x, y):
        self.positions.append((x, y))
        self.age = 0
        # Keep only recent positions
        if len(self.positions) > 10:
            self.positions.pop(0)
    
    def age_increment(self):
        self.age += 1
        return self.age <= self.max_age
    
    def check_line_crossing(self, line_y):
        if len(self.positions) >= 2 and not self.crossed:
            prev_y = self.positions[-2][1]
            curr_y = self.positions[-1][1]
            
            # Check if crossed the line
            if prev_y < line_y and curr_y >= line_y:
                self.direction = "down"  # Going down (entering)
                self.crossed = True
                return "down"
            elif prev_y > line_y and curr_y <= line_y:
                self.direction = "up"  # Going up (exiting)
                self.crossed = True
                return "up"
        return None

# Global variables for tracking
person_trackers = {}
next_person_id = 1
frames_processed = 0

# Endpoint untuk halaman web
@app.route('/')
def index():
    return render_template_string("""
    <!DOCTYPE html>
    <html>
    <head>
        <title>YOLO Crowd Counter</title>
        <style>
            body { font-family: Arial, sans-serif; text-align: center; background: #f0f0f0; margin: 0; padding: 20px; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
            h1 { color: #333; margin-bottom: 30px; }
            .video-container { position: relative; margin: 20px 0; }
            #cameraFeed { width: 640px; height: 480px; border: 2px solid #ddd; border-radius: 10px; display: block; margin: 0 auto; }
            #outputCanvas { width: 640px; height: 480px; border: 2px solid #4CAF50; border-radius: 10px; background: #000; }
            .count-display { font-size: 32px; font-weight: bold; color: #4CAF50; margin: 20px 0; padding: 15px; background: #f8f8f8; border-radius: 10px; }
            .controls { margin: 20px 0; }
            button { padding: 12px 24px; font-size: 16px; margin: 5px; border: none; border-radius: 5px; cursor: pointer; }
            .start-btn { background: #4CAF50; color: white; }
            .stop-btn { background: #f44336; color: white; }
            button:hover { opacity: 0.8; }
            .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
            .stat-box { background: #f8f8f8; padding: 15px; border-radius: 10px; }
            .stat-number { font-size: 24px; font-weight: bold; color: #2196F3; }
            .status { padding: 10px; margin: 10px 0; border-radius: 5px; font-weight: bold; }
            .status.active { background: #d4edda; color: #155724; }
            .status.stopped { background: #f8d7da; color: #721c24; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎯 YOLO Crowd Counter with Detection Boxes</h1>
            
            <div id="status" class="status stopped">📷 Camera: Stopped | 🔍 Detection: Inactive</div>
            
            <div class="controls">
                <button id="startBtn" class="start-btn" onclick="startCamera()">Start Camera & Detection</button>
                <button id="stopBtn" class="stop-btn" onclick="stopCamera()" disabled>Stop Camera</button>
            </div>
            
            <div class="video-container">
                <h3>Live Camera Feed:</h3>
                <video id="cameraFeed" autoplay muted playsinline></video>
                <br><br>
                <h3>YOLO Detection Results (Green Boxes):</h3>
                <canvas id="outputCanvas"></canvas>
            </div>
            
            <div class="count-display">
                📊 Line Crossing Counter
            </div>
            
            <div class="stats">
                <div class="stat-box">
                    <div class="stat-number" id="countUp" style="color: #4CAF50;">0</div>
                    <div>↑ People Entering</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number" id="countDown" style="color: #f44336;">0</div>
                    <div>↓ People Exiting</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number" id="totalCurrent" style="color: #2196F3;">0</div>
                    <div>🏢 Current Inside</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number" id="framesSent">0</div>
                    <div>Frames Processed</div>
                </div>
            </div>
        </div>

        <script>
            const video = document.getElementById('cameraFeed');
            const canvas = document.getElementById('outputCanvas');
            const ctx = canvas.getContext('2d');
            const countSpan = document.getElementById('peopleCount');
            const statusDiv = document.getElementById('status');
            
            let stream = null;
            let isRunning = false;
            let framesSent = 0;
            let lastFrameTime = Date.now();

            function updateStatus(message, isActive = false) {
                statusDiv.textContent = message;
                statusDiv.className = isActive ? 'status active' : 'status stopped';
            }

            async function startCamera() {
                try {
                    updateStatus('📷 Starting camera...', false);
                    
                    // Check if getUserMedia is supported
                    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                        // Try legacy API
                        return startLegacyCamera();
                    }
                    
                    const constraints = {
                        video: {
                            width: { ideal: 640 },
                            height: { ideal: 480 }
                        },
                        audio: false
                    };

                    stream = await navigator.mediaDevices.getUserMedia(constraints);
                    video.srcObject = stream;
                    
                    video.onloadedmetadata = function() {
                        canvas.width = video.videoWidth || 640;
                        canvas.height = video.videoHeight || 480;
                        
                        console.log('Video loaded:', video.videoWidth, 'x', video.videoHeight);
                        console.log('Video element:', video);
                        console.log('Stream:', stream);
                        
                        // Make sure video is visible and playing
                        video.style.display = 'block';
                        video.play().then(() => {
                            console.log('Video playing successfully');
                        }).catch(e => {
                            console.error('Video play error:', e);
                        });
                        
                        document.getElementById('startBtn').disabled = true;
                        document.getElementById('stopBtn').disabled = false;
                        
                        isRunning = true;
                        updateStatus('📷 Camera: Active | 🔍 Detection: Running', true);
                        
                        // Start sending frames for processing
                        setTimeout(processFrame, 1000); // Wait 1 second before starting processing
                    };
                    
                } catch (err) {
                    updateStatus('❌ Camera Error: ' + err.message, false);
                    
                    // Show specific error help
                    let errorMessage = 'Camera error: ' + err.message;
                    if (err.name === 'NotAllowedError') {
                        errorMessage += '\\n\\n💡 Solutions:\\n- Click camera icon in address bar and allow access\\n- Try using http://localhost:8081 instead';
                    } else if (err.name === 'NotFoundError') {
                        errorMessage += '\\n\\n💡 Solutions:\\n- Check if camera is connected\\n- Close other apps using camera (Zoom, Teams, etc.)';
                    } else if (err.name === 'NotSupportedError') {
                        errorMessage += '\\n\\n💡 Solutions:\\n- Try using Chrome browser\\n- Use http://localhost:8081\\n- Enable camera in Windows Privacy settings';
                    }
                    
                    alert(errorMessage);
                }
            }
            
            // Legacy camera API fallback
            function startLegacyCamera() {
                updateStatus('📷 Trying legacy camera API...', false);
                
                // Try the old getUserMedia API
                navigator.getUserMedia = navigator.getUserMedia || 
                                       navigator.webkitGetUserMedia || 
                                       navigator.mozGetUserMedia || 
                                       navigator.msGetUserMedia;
                
                if (!navigator.getUserMedia) {
                    const errorMsg = 'Camera not supported in this browser.\\n\\n💡 Solutions:\\n- Use Google Chrome (recommended)\\n- Use Firefox\\n- Update your browser\\n- Try http://localhost:8081';
                    updateStatus('❌ Camera not supported', false);
                    alert(errorMsg);
                    return;
                }
                
                const constraints = {
                    video: {
                        width: { ideal: 640 },
                        height: { ideal: 480 }
                    },
                    audio: false
                };
                
                navigator.getUserMedia(
                    constraints,
                    function(mediaStream) {
                        stream = mediaStream;
                        video.srcObject = stream;
                        
                        video.onloadedmetadata = function() {
                            canvas.width = video.videoWidth || 640;
                            canvas.height = video.videoHeight || 480;
                            
                            document.getElementById('startBtn').disabled = true;
                            document.getElementById('stopBtn').disabled = false;
                            
                            isRunning = true;
                            updateStatus('📷 Camera: Active (Legacy) | 🔍 Detection: Running', true);
                            
                            processFrame();
                        };
                    },
                    function(err) {
                        updateStatus('❌ Legacy Camera Error: ' + err.message, false);
                        alert('Legacy camera error: ' + err.message + '\\n\\n💡 Try:\\n- Use Chrome browser\\n- Use http://localhost:8081\\n- Check Windows camera privacy settings');
                    }
                );
            }

            function stopCamera() {
                isRunning = false;
                
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                    stream = null;
                }
                
                document.getElementById('startBtn').disabled = false;
                document.getElementById('stopBtn').disabled = true;
                
                updateStatus('📷 Camera: Stopped | 🔍 Detection: Inactive', false);
                
                // Clear canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#fff';
                ctx.font = '20px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Detection Stopped', canvas.width/2, canvas.height/2);
            }

            async function processFrame() {
                if (!isRunning || !video.videoWidth || !video.videoHeight) {
                    console.log('Waiting for video...', {isRunning, videoWidth: video.videoWidth, videoHeight: video.videoHeight});
                    setTimeout(processFrame, 500);
                    return;
                }

                try {
                    console.log('Processing frame...', video.videoWidth, 'x', video.videoHeight);
                    
                    // Draw video frame to a temporary canvas
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = video.videoWidth;
                    tempCanvas.height = video.videoHeight;
                    const tempCtx = tempCanvas.getContext('2d');
                    
                    // Make sure we can draw the video
                    if (video.readyState >= 2) {
                        tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
                        console.log('Frame captured successfully');
                    } else {
                        console.log('Video not ready, skipping frame');
                        setTimeout(processFrame, 500);
                        return;
                    }
                    
                    // Get frame data
                    const frameData = tempCanvas.toDataURL('image/jpeg', 0.8);

                    // Send to server for YOLO processing
                    const response = await fetch('/process', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ frame: frameData })
                    });

                    if (response.ok) {
                        const result = await response.json();
                        
                        // Update line crossing counts
                        document.getElementById('countUp').textContent = result.count_up || 0;
                        document.getElementById('countDown').textContent = result.count_down || 0;
                        document.getElementById('totalCurrent').textContent = result.current_inside || 0;
                        
                        // Display processed image with green boxes and yellow line
                        if (result.processed_image) {
                            const img = new Image();
                            img.onload = function() {
                                ctx.clearRect(0, 0, canvas.width, canvas.height);
                                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                            };
                            img.src = 'data:image/jpeg;base64,' + result.processed_image;
                        }
                        
                        // Update stats
                        framesSent++;
                        document.getElementById('framesSent').textContent = framesSent;
                        
                        const now = Date.now();
                        const fps = (1000 / (now - lastFrameTime)).toFixed(1);
                        lastFrameTime = now;
                        
                        const totalDetected = result.people_detected || 0;
                        const currentInside = result.current_inside || 0;
                        updateStatus(`📷 Camera: Active | 🔍 Detection: ${totalDetected} detected | 🏢 Inside: ${currentInside}`, true);
                    }
                    
                } catch (error) {
                    console.error('Processing error:', error);
                    updateStatus('❌ Processing Error: ' + error.message, false);
                }
                
                // Continue processing if still running
                if (isRunning) {
                    setTimeout(processFrame, 500); // Process ~2 FPS
                }
            }

            // Initialize canvas
            canvas.width = 640;
            canvas.height = 480;
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#fff';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Click "Start Camera & Detection"', canvas.width/2, canvas.height/2);
            
            // Check camera compatibility on page load
            function checkCompatibility() {
                const statusDiv = document.getElementById('status');
                
                // Check browser compatibility
                if (!navigator.mediaDevices && !navigator.getUserMedia && !navigator.webkitGetUserMedia) {
                    statusDiv.innerHTML = '❌ Camera not supported in this browser - Try Chrome';
                    statusDiv.className = 'status error';
                    document.getElementById('startBtn').disabled = true;
                    return;
                }
                
                // Check secure context
                if (!window.isSecureContext && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
                    statusDiv.innerHTML = '⚠️ Use http://localhost:8081 for camera access';
                    statusDiv.className = 'status warning';
                }
                
                // All good
                console.log('Camera compatibility check passed');
            }
            
            // Run compatibility check
            checkCompatibility();
        </script>
    </body>
    </html>
    """)

# Endpoint untuk menerima dan memproses gambar dengan YOLO dan line crossing
@app.route('/process', methods=['POST'])
def process_frame():
    global frames_processed, cnt_up, cnt_down, person_trackers, next_person_id
    
    try:
        frame_data = request.json['frame']
        
        # Konversi data base64 ke format gambar OpenCV
        encoded_data = frame_data.split(',')[1]
        nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None:
                return jsonify({"error": "Failed to decode frame"}), 400
            
        frame_height, frame_width = frame.shape[:2]
        line_y = int(frame_height * line_position)
            
        print(f"🔍 Processing frame {frames_processed + 1}: {frame.shape}")
        
        # Run YOLO detection
        results = model(frame)[0]
        detections = sv.Detections.from_ultralytics(results)
        
        # Filter for people only (class_id == 0 for person in COCO dataset)
        detections = detections[detections.class_id == 0]
        
        # Update tracker for better consistency
        detections = byte_tracker.update_with_detections(detections)
        
        # Create annotated frame 
        annotated_frame = frame.copy()
        
        # Manually draw green bounding boxes
        if len(detections) > 0:
            for i, bbox in enumerate(detections.xyxy):
                x1, y1, x2, y2 = map(int, bbox)
                # Draw green rectangle
                cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                
                # Draw confidence if available
                if hasattr(detections, 'confidence') and detections.confidence is not None:
                    conf = detections.confidence[i]
                    cv2.putText(annotated_frame, f'{conf:.2f}', (x1, y1-10), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
        
        # Draw the counting line (YELLOW line across the frame)
        cv2.line(annotated_frame, (0, line_y), (frame_width, line_y), line_color, line_thickness)
        
        # Add line label
        cv2.putText(annotated_frame, 'COUNTING LINE', (frame_width//2 - 80, line_y - 10), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, line_color, 2, cv2.LINE_AA)
        
        # Process each detection for line crossing
        current_detections = []
        if hasattr(detections, 'tracker_id') and detections.tracker_id is not None:
            for i, tracker_id in enumerate(detections.tracker_id):
                if tracker_id is not None:
                    # Get bounding box center
                    bbox = detections.xyxy[i]
                    center_x = int((bbox[0] + bbox[2]) / 2)
                    center_y = int((bbox[1] + bbox[3]) / 2)
                    
                    current_detections.append(tracker_id)
                    
                    # Update or create person tracker
                    if tracker_id not in person_trackers:
                        person_trackers[tracker_id] = PersonTracker(tracker_id, center_x, center_y)
                    else:
                        person_trackers[tracker_id].update_position(center_x, center_y)
                    
                    # Check for line crossing
                    crossing = person_trackers[tracker_id].check_line_crossing(line_y)
                    if crossing == "down":
                        cnt_down += 1
                        print(f"👤 Person {tracker_id} ENTERED (going down). Total entered: {cnt_down}")
                        # Draw green arrow for entering
                        cv2.arrowedLine(annotated_frame, (center_x, center_y - 20), (center_x, center_y + 20), 
                                    (0, 255, 0), 3, tipLength=0.3)
                        cv2.putText(annotated_frame, 'ENTER', (center_x - 25, center_y - 30), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
                    elif crossing == "up":
                        cnt_up += 1
                        print(f"👤 Person {tracker_id} EXITED (going up). Total exited: {cnt_up}")
                        # Draw red arrow for exiting
                        cv2.arrowedLine(annotated_frame, (center_x, center_y + 20), (center_x, center_y - 20), 
                                    (0, 0, 255), 3, tipLength=0.3)
                        cv2.putText(annotated_frame, 'EXIT', (center_x - 20, center_y + 40), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
                    
                    # Draw person ID and position
                    cv2.putText(annotated_frame, f'ID:{tracker_id}', (center_x - 20, center_y), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
        # Age and remove old trackers
        trackers_to_remove = []
        for tracker_id, tracker in person_trackers.items():
            if tracker_id not in current_detections:
                if not tracker.age_increment():
                    trackers_to_remove.append(tracker_id)
        
        for tracker_id in trackers_to_remove:
            del person_trackers[tracker_id]
        
        # Calculate current people inside
        current_inside = max(0, cnt_down - cnt_up)
        people_detected = len(detections)
        
        # Add text overlays with statistics
        cv2.putText(annotated_frame, f'Detected: {people_detected}', 
                (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2, cv2.LINE_AA)
        
        cv2.putText(annotated_frame, f'Entered: {cnt_down}', 
                (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2, cv2.LINE_AA)
        
        cv2.putText(annotated_frame, f'Exited: {cnt_up}', 
                (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2, cv2.LINE_AA)
        
        cv2.putText(annotated_frame, f'Inside: {current_inside}', 
                (10, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 0, 255), 2, cv2.LINE_AA)
        
        cv2.putText(annotated_frame, f'Frame: {frames_processed + 1}', 
                (10, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1, cv2.LINE_AA)
        
        # Add timestamp
        timestamp = time.strftime("%H:%M:%S")
        cv2.putText(annotated_frame, f'Time: {timestamp}', 
                (10, frame_height - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1, cv2.LINE_AA)
        
        # Convert processed frame back to base64 for web display
        _, buffer = cv2.imencode('.jpg', annotated_frame)
        processed_image_b64 = base64.b64encode(buffer).decode('utf-8')
        
        # Update statistics
        frames_processed += 1
        
        print(f"✅ Frame {frames_processed}: {people_detected} detected, {current_inside} inside")
        
        return jsonify({
            "people_detected": people_detected,
            "count_up": cnt_up,
            "count_down": cnt_down,
            "current_inside": current_inside,
            "processed_image": processed_image_b64,
            "frames_processed": frames_processed,
            "timestamp": time.time()
        })
        
    except Exception as e:
        print(f"❌ Error processing frame: {e}")
        return jsonify({"error": str(e)}), 500

# API endpoint to get current occupancy count for bus integration
@app.route('/api/occupancy', methods=['GET'])
def get_current_occupancy():
    """
    Get current occupancy count for bus system integration
    Returns the number of people currently inside based on YOLO detection
    """
    global cnt_up, cnt_down, frames_processed
    
    current_inside = max(0, cnt_down - cnt_up)
    
    return jsonify({
        "current_inside": current_inside,
        "total_entered": cnt_down,
        "total_exited": cnt_up,
        "frames_processed": frames_processed,
        "timestamp": time.time(),
        "status": "active" if frames_processed > 0 else "inactive"
    })

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint for the YOLO service"""
    return jsonify({
        "status": "healthy",
        "service": "YOLO Crowd Counter",
        "port": 8081,
        "timestamp": time.time()
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8081, debug=True)