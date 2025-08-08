from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
import cv2
import numpy as np
import base64
import time
import os
from ultralytics import YOLO
import supervision as sv
import threading
from datetime import datetime
import json

app = Flask(__name__)
CORS(app, origins="*")  # Allow all origins for development

class iPhoneCrowdCounter:
    def __init__(self):
        print("🚀 Initializing iPhone Crowd Counter Server...")
        print("📦 Loading YOLO model...")
        
        # Initialize YOLO model (will download if not present)
        self.model = YOLO("yolov8n.pt")
        print("✅ YOLO model loaded successfully!")
        
        # Initialize tracker and annotator (from your original script)
        self.byte_tracker = sv.ByteTrack()
        self.box_annotator = sv.BoxAnnotator(thickness=2)
        
        # Stats tracking
        self.frames_processed = 0
        self.last_people_count = 0
        self.processing_times = []
        self.start_time = time.time()
        
        # Display settings
        self.display_enabled = True
        self.current_frame = None
        self.frame_lock = threading.Lock()
        
        # Create output folder (from your original script)
        self.output_folder = 'yolo_results'
        if not os.path.exists(self.output_folder):
            os.makedirs(self.output_folder)
        
        print("✅ iPhone Crowd Counter Server initialized!")
        print("📱 Ready to receive frames from iPhone Safari...")
    
    def decode_base64_frame(self, base64_string):
        """Decode base64 image to OpenCV format"""
        try:
            # Remove data URL prefix if present
            if ',' in base64_string:
                base64_string = base64_string.split(',')[1]
            
            # Decode base64 to bytes
            img_bytes = base64.b64decode(base64_string)
            
            # Convert bytes to numpy array
            nparr = np.frombuffer(img_bytes, np.uint8)
            
            # Decode image
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if frame is None:
                raise ValueError("Failed to decode image")
            
            return frame
            
        except Exception as e:
            print(f"❌ Error decoding frame: {e}")
            return None
    
    def process_frame(self, frame):
        """Process frame with YOLO detection (adapted from your original script)"""
        start_time = time.time()
        
        try:
            # Get frame dimensions
            h_full, w_full = frame.shape[:2]
            
            # Run YOLO detection (same as your original script)
            results = self.model(frame)[0]
            detections = sv.Detections.from_ultralytics(results)
            
            # Filter for people only (class_id == 0) - same as your original script
            detections = detections[detections.class_id == 0]
            
            # Update tracker (same as your original script)
            detections = self.byte_tracker.update_with_detections(detections)
            
            # Count people (same as your original script)
            people_count = len(detections)
            
            # Annotate frame (same as your original script)
            annotated_frame = self.box_annotator.annotate(scene=frame.copy(), detections=detections)
            
            # Add text overlays (enhanced from your original script)
            cv2.putText(annotated_frame, f'Jumlah Orang: {people_count}', 
                       (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)
            
            cv2.putText(annotated_frame, f'Frame: {self.frames_processed + 1}', 
                       (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2, cv2.LINE_AA)
            
            # Add timestamp
            timestamp = datetime.now().strftime("%H:%M:%S")
            cv2.putText(annotated_frame, f'Time: {timestamp}', 
                       (10, 110), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2, cv2.LINE_AA)
            
            # Add iPhone source indicator
            cv2.putText(annotated_frame, 'Source: iPhone Safari', 
                       (10, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2, cv2.LINE_AA)
            
            # Calculate processing time
            processing_time = time.time() - start_time
            self.processing_times.append(processing_time)
            if len(self.processing_times) > 10:
                self.processing_times.pop(0)
            
            avg_processing_time = sum(self.processing_times) / len(self.processing_times)
            cv2.putText(annotated_frame, f'Proc: {avg_processing_time:.2f}s', 
                       (10, 190), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2, cv2.LINE_AA)
            
            # Store frame for display
            with self.frame_lock:
                self.current_frame = annotated_frame.copy()
            
            # Update stats
            self.last_people_count = people_count
            self.frames_processed += 1
            
            # Print results (same format as your original script)
            print(f"📱 Frame {self.frames_processed}: {people_count} orang terdeteksi (processing: {processing_time:.2f}s)")
            
            return people_count, annotated_frame
            
        except Exception as e:
            print(f"❌ Error processing frame: {e}")
            return 0, frame
    
    def display_loop(self):
        """Display processed frames in OpenCV window"""
        print("🖥️  Starting display window...")
        
        while self.display_enabled:
            with self.frame_lock:
                if self.current_frame is not None:
                    # Display the frame (same as your original script)
                    cv2.imshow("iPhone YOLO Crowd Counter", self.current_frame)
            
            # Check for 'q' key to quit (same as your original script)
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                print("🛑 Display window closed by user")
                self.display_enabled = False
                break
            
            time.sleep(0.03)  # ~30 FPS display rate
        
        cv2.destroyAllWindows()
        print("🖥️  Display window closed")

# Initialize the crowd counter
print("🔧 Creating iPhone Crowd Counter instance...")
crowd_counter = iPhoneCrowdCounter()

# Start display thread
print("🖥️  Starting display thread...")
display_thread = threading.Thread(target=crowd_counter.display_loop, daemon=True)
display_thread.start()

@app.route('/')
def index():
    """Server status page"""
    uptime = time.time() - crowd_counter.start_time
    avg_processing_time = 0
    if crowd_counter.processing_times:
        avg_processing_time = sum(crowd_counter.processing_times) / len(crowd_counter.processing_times)
    
    return f"""
    <html>
    <head>
        <title>iPhone Crowd Counter Server</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }}
            .container {{ max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }}
            .status {{ background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0; }}
            .stats {{ display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }}
            .stat-box {{ background: #f0f0f0; padding: 15px; border-radius: 5px; text-align: center; }}
            .stat-number {{ font-size: 24px; font-weight: bold; color: #2196F3; }}
            h1 {{ color: #333; text-align: center; }}
            .instructions {{ background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>📱 iPhone Crowd Counter Server</h1>
            
            <div class="status">
                <h3>✅ Server Status: Running</h3>
                <p>Ready to receive frames from iPhone Safari browser</p>
            </div>
            
            <div class="stats">
                <div class="stat-box">
                    <div class="stat-number">{crowd_counter.frames_processed}</div>
                    <div>Frames Processed</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number">{crowd_counter.last_people_count}</div>
                    <div>Last People Count</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number">{avg_processing_time:.2f}s</div>
                    <div>Avg Processing Time</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number">{uptime/60:.1f}m</div>
                    <div>Uptime</div>
                </div>
            </div>
            
            <div class="instructions">
                <h3>📋 Instructions:</h3>
                <ol>
                    <li>Open <code>camera_client.html</code> on your iPhone Safari</li>
                    <li>Update the server URL to point to this Mac's IP address</li>
                    <li>Grant camera permissions when prompted</li>
                    <li>Start the camera and begin streaming</li>
                    <li>Watch the processed video on your Mac screen!</li>
                </ol>
            </div>
            
            <p><strong>Server Time:</strong> {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</p>
        </div>
    </body>
    </html>
    """

@app.route('/test')
def test_connection():
    """Test endpoint for connection verification"""
    return jsonify({
        'status': 'success',
        'message': 'Server is running and ready to receive frames',
        'timestamp': time.time(),
        'frames_processed': crowd_counter.frames_processed
    })

@app.route('/upload', methods=['POST'])
def upload_frame():
    """Main endpoint to receive and process frames from iPhone"""
    try:
        # Get JSON data
        data = request.get_json()
        
        if not data or 'frame' not in data:
            return jsonify({'error': 'No frame data received'}), 400
        
        print(f"📥 Received frame {data.get('frame_number', '?')} from iPhone")
        
        # Decode the frame
        frame = crowd_counter.decode_base64_frame(data['frame'])
        
        if frame is None:
            return jsonify({'error': 'Failed to decode frame'}), 400
        
        print(f"✅ Frame decoded successfully: {frame.shape}")
        
        # Process the frame with YOLO detection
        people_count, processed_frame = crowd_counter.process_frame(frame)
        
        # Prepare response (same format as your original script's backend communication)
        response = {
            'success': True,
            'people_count': people_count,
            'timestamp': time.time(),
            'frames_processed': crowd_counter.frames_processed,
            'processing_time': crowd_counter.processing_times[-1] if crowd_counter.processing_times else 0
        }
        
        print(f"📤 Sending response: {people_count} people detected")
        
        return jsonify(response)
        
    except Exception as e:
        print(f"❌ Error in upload_frame: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/stats')
def get_stats():
    """Get detailed server statistics"""
    uptime = time.time() - crowd_counter.start_time
    avg_processing_time = 0
    if crowd_counter.processing_times:
        avg_processing_time = sum(crowd_counter.processing_times) / len(crowd_counter.processing_times)
    
    return jsonify({
        'frames_processed': crowd_counter.frames_processed,
        'last_people_count': crowd_counter.last_people_count,
        'avg_processing_time': avg_processing_time,
        'uptime_seconds': uptime,
        'uptime_minutes': uptime / 60,
        'server_start_time': crowd_counter.start_time,
        'current_time': time.time()
    })

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 iPhone Crowd Counter Server Starting...")
    print("="*60)
    print("📋 Setup Instructions:")
    print("1. 📶 Make sure iPhone and Mac are on the same WiFi network")
    print("2. 🔍 Find your Mac's IP address:")
    print("   - System Preferences > Network")
    print("   - Or run: ifconfig | grep 'inet ' | grep -v 127.0.0.1")
    print("3. 📱 Open camera_client.html on iPhone Safari")
    print("4. 🔧 Update server URL to your Mac's IP address")
    print("5. 📷 Grant camera permissions and start streaming")
    print("\n🌐 Server will be available at:")
    print("   - Local: http://localhost:5000")
    print("   - Network: http://[YOUR_MAC_IP]:5000")
    print("\n🎯 Detection Features:")
    print("   - ✅ YOLO v8 people detection")
    print("   - ✅ Real-time tracking with ByteTrack")
    print("   - ✅ Live OpenCV display window")
    print("   - ✅ Processing statistics")
    print("\n⌨️  Press 'q' in the display window to quit")
    print("="*60 + "\n")
    
    # Run Flask server
    try:
        app.run(host='0.0.0.0', port=5003, debug=False, threaded=True)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        crowd_counter.display_enabled = False
