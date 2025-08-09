#!/usr/bin/env python3
"""
MPB-OMS Crowd Counting System - Consolidated Model
==================================================

This file consolidates all the crowd counting functionality from the MPB-OMS repository:
- Background subtraction based crowd counting
- YOLO-based person detection with tracking
- CSRNet deep learning model for crowd density estimation
- Flask web server for real-time processing
- Data generation and utilities

Usage:
    python scripts/modeling.py --mode webcam                 # Real-time webcam counting
    python scripts/modeling.py --mode video --input video.mp4  # Process video file
    python scripts/modeling.py --mode yolo --input 0          # YOLO-based webcam detection
    python scripts/modeling.py --mode server                  # Start Flask web server
    python scripts/modeling.py --mode data --output data.csv  # Generate mock data

Configuration:
    Edit configs/config.py to customize detection parameters, colors, and thresholds.
"""

import numpy as np
import cv2
import time
import argparse
import datetime
import sys
import math
import os
import base64
import json
from random import randint
from pathlib import Path
import threading
import urllib.request

# Flask imports (optional, only needed for server mode)
try:
    from flask import Flask, render_template_string, request, jsonify, Response
    from flask_cors import CORS
    FLASK_AVAILABLE = True
except ImportError:
    FLASK_AVAILABLE = False
    print("Warning: Flask not available. Server mode disabled.")

# YOLO imports (optional, only needed for YOLO mode)
try:
    from ultralytics import YOLO
    import supervision as sv
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False
    print("Warning: YOLO/Supervision not available. YOLO mode disabled.")

# PyTorch imports (optional, only needed for CSRNet)
try:
    import torch
    import torch.nn as nn
    from torchvision import models
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    print("Warning: PyTorch not available. CSRNet mode disabled.")

# Pandas for data generation
try:
    import pandas as pd
    PANDAS_AVAILABLE = True
except ImportError:
    PANDAS_AVAILABLE = False
    print("Warning: Pandas not available. Data generation disabled.")


# ====================================================================
# UTILITY CLASSES FOR PERSON TRACKING
# ====================================================================

class MyPerson:
    """Person tracking class for background subtraction and YOLO methods"""
    
    def __init__(self, i, xi, yi, max_age):
        self.i = i
        self.x = xi
        self.y = yi
        self.tracks = []
        self.R = randint(0, 255)
        self.G = randint(0, 255)
        self.B = randint(0, 255)
        self.done = False
        self.state = '0'
        self.age = 0
        self.max_age = max_age
        self.dir = None
    
    def getRGB(self):
        return (self.R, self.G, self.B)
    
    def getTracks(self):
        return self.tracks
    
    def getId(self):
        return self.i
    
    def getState(self):
        return self.state
    
    def getDir(self):
        return self.dir
    
    def getX(self):
        return self.x
    
    def getY(self):
        return self.y
    
    def updateCoords(self, xn, yn):
        self.age = 0
        self.tracks.append([self.x, self.y])
        self.x = xn
        self.y = yn
    
    def setDone(self):
        self.done = True
    
    def timedOut(self):
        return self.done
    
    def going_UP(self, mid_start, mid_end):
        if len(self.tracks) >= 2:
            if self.state == '0':
                if self.tracks[-1][1] < mid_end and self.tracks[-2][1] >= mid_end:
                    self.state = '1'
                    self.dir = 'up'
                    return True
        return False
    
    def going_DOWN(self, mid_start, mid_end):
        if len(self.tracks) >= 2:
            if self.state == '0':
                if self.tracks[-1][1] > mid_start and self.tracks[-2][1] <= mid_start:
                    self.state = '1'
                    self.dir = 'down'
                    return True
        return False
    
    def age_one(self):
        self.age += 1
        if self.age > self.max_age:
            self.done = True
        return True


class MultiPerson:
    """Multi-person tracking class for handling groups"""
    
    def __init__(self, persons, xi, yi):
        self.persons = persons
        self.x = xi
        self.y = yi
        self.tracks = []
        self.R = randint(0, 255)
        self.G = randint(0, 255)
        self.B = randint(0, 255)
        self.done = False


# ====================================================================
# CSRNET DEEP LEARNING MODEL (Optional - requires PyTorch)
# ====================================================================

if TORCH_AVAILABLE:
    class CSRNet(nn.Module):
        """CSRNet model for crowd density estimation"""
        
        def __init__(self, load_weights=False):
            super(CSRNet, self).__init__()
            self.seen = 0
            self.frontend_feat = [64, 64, 'M', 128, 128, 'M', 256, 256, 256, 'M', 512, 512, 512]
            self.backend_feat = [512, 512, 512, 256, 128, 64]
            self.frontend = self._make_layers(self.frontend_feat)
            self.backend = self._make_layers(self.backend_feat, in_channels=512, dilation=True)
            self.output_layer = nn.Conv2d(64, 1, kernel_size=1)
            
            if not load_weights:
                mod = models.vgg16(pretrained=False)
                self._initialize_weights()
                # Copy weights from VGG16 frontend
                for i in range(len(self.frontend.state_dict().items())):
                    list(self.frontend.state_dict().items())[i][1].data[:] = \
                        list(mod.state_dict().items())[i][1].data[:]
        
        def forward(self, x):
            x = self.frontend(x)
            x = self.backend(x)
            x = self.output_layer(x)
            return x
        
        def _initialize_weights(self):
            for m in self.modules():
                if isinstance(m, nn.Conv2d):
                    nn.init.normal_(m.weight, std=0.01)
                    if m.bias is not None:
                        nn.init.constant_(m.bias, 0)
                elif isinstance(m, nn.BatchNorm2d):
                    nn.init.constant_(m.weight, 1)
                    nn.init.constant_(m.bias, 0)
        
        def _make_layers(self, cfg, in_channels=3, batch_norm=False, dilation=False):
            if dilation:
                d_rates = [2, 2, 2, 2, 2, 4, 4, 4, 4, 4]
                d_index = 0
                layers = []
                for v in cfg:
                    if v == 'M':
                        layers += [nn.MaxPool2d(kernel_size=2, stride=2)]
                    else:
                        conv2d = nn.Conv2d(in_channels, v, kernel_size=3, 
                                         padding=d_rates[d_index], dilation=d_rates[d_index])
                        d_index += 1
                        if batch_norm:
                            layers += [conv2d, nn.BatchNorm2d(v), nn.ReLU(inplace=True)]
                        else:
                            layers += [conv2d, nn.ReLU(inplace=True)]
                        in_channels = v
            else:
                layers = []
                for v in cfg:
                    if v == 'M':
                        layers += [nn.MaxPool2d(kernel_size=2, stride=2)]
                    else:
                        conv2d = nn.Conv2d(in_channels, v, kernel_size=3, padding=1)
                        if batch_norm:
                            layers += [conv2d, nn.BatchNorm2d(v), nn.ReLU(inplace=True)]
                        else:
                            layers += [conv2d, nn.ReLU(inplace=True)]
                        in_channels = v
            return nn.Sequential(*layers)


# ====================================================================
# CROWD COUNTING ENGINES
# ====================================================================

class BackgroundSubtractionCounter:
    """Background subtraction based crowd counting"""
    
    def __init__(self, frame_width=1280, frame_height=720):
        self.w = frame_width
        self.h = frame_height
        self.frameArea = self.h * self.w
        self.areaTH = self.frameArea / 500
        
        # Lines for counting
        self.line_up = int(2 * (self.h / 5))
        self.line_down = int(3 * (self.h / 5))
        self.up_limit = int(1 * (self.h / 5))
        self.down_limit = int(4 * (self.h / 5))
        
        # Colors
        self.line_down_color = (255, 0, 0)
        self.line_up_color = (0, 0, 255)
        
        # OpenCV setup
        self.fgbg = cv2.createBackgroundSubtractorMOG2(
            history=500, varThreshold=25, detectShadows=True
        )
        self.kernelOp = np.ones((3, 3), np.uint8)
        self.kernelOp2 = np.ones((5, 5), np.uint8)
        self.kernelCl = np.ones((11, 11), np.uint8)
        self.font = cv2.FONT_HERSHEY_SIMPLEX
        
        # Tracking
        self.persons = []
        self.max_p_age = 15
        self.pid = 1
        self.cnt_up = 0
        self.cnt_down = 0
    
    def process_frame(self, frame):
        """Process a single frame and return people count and annotated frame"""
        # Age all persons
        for person in self.persons:
            person.age_one()
        
        # Background subtraction
        fgmask = self.fgbg.apply(frame)
        ret, imBin = cv2.threshold(fgmask, 200, 255, cv2.THRESH_BINARY)
        mask = cv2.morphologyEx(imBin, cv2.MORPH_OPEN, self.kernelOp)
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, self.kernelCl)
        
        # Find contours
        contours, hierarchy = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        annotated_frame = frame.copy()
        
        for cnt in contours:
            area = cv2.contourArea(cnt)
            if area > self.areaTH:
                # Get centroid
                M = cv2.moments(cnt)
                if M['m00'] != 0:
                    cx = int(M['m10'] / M['m00'])
                    cy = int(M['m01'] / M['m00'])
                    x, y, w, h = cv2.boundingRect(cnt)
                    
                    new = True
                    if cy in range(self.up_limit, self.down_limit):
                        # Check existing persons
                        for person in self.persons[:]:
                            if abs(cx - person.getX()) <= w and abs(cy - person.getY()) <= h:
                                new = False
                                person.updateCoords(cx, cy)
                                
                                # Check line crossing
                                if person.going_UP(self.line_down, self.line_up):
                                    self.cnt_up += 1
                                    print(f"Person {person.getId()} going UP at {time.strftime('%c')}")
                                elif person.going_DOWN(self.line_down, self.line_up):
                                    self.cnt_down += 1
                                    print(f"Person {person.getId()} going DOWN at {time.strftime('%c')}")
                                break
                            
                            # Clean up finished persons
                            if person.timedOut():
                                self.persons.remove(person)
                        
                        # Add new person
                        if new:
                            p = MyPerson(self.pid, cx, cy, self.max_p_age)
                            self.persons.append(p)
                            self.pid += 1
                    
                    # Draw detection
                    cv2.circle(annotated_frame, (cx, cy), 5, (0, 0, 255), -1)
                    cv2.rectangle(annotated_frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
        
        # Draw lines
        cv2.line(annotated_frame, (0, self.line_up), (self.w, self.line_up), 
                self.line_up_color, 2)
        cv2.line(annotated_frame, (0, self.line_down), (self.w, self.line_down), 
                self.line_down_color, 2)
        
        # Draw text
        cv2.putText(annotated_frame, f'Outgoing: {self.cnt_up}', 
                   (20, 30), self.font, 0.7, (255, 255, 255), 2)
        cv2.putText(annotated_frame, f'Incoming: {self.cnt_down}', 
                   (20, 60), self.font, 0.7, (255, 255, 255), 2)
        cv2.putText(annotated_frame, f'Total: {len(self.persons)}', 
                   (20, 90), self.font, 0.7, (255, 255, 255), 2)
        
        timestamp = datetime.datetime.now().strftime("%A %d %B %Y %I:%M:%S%p")
        cv2.putText(annotated_frame, timestamp, 
                   (10, annotated_frame.shape[0] - 10), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.35, (0, 255, 255), 1)
        
        return len(self.persons), annotated_frame


class YOLOCounter:
    """YOLO-based person detection and counting"""
    
    def __init__(self):
        if not YOLO_AVAILABLE:
            raise ImportError("YOLO dependencies not available")
        
        print("Loading YOLO model...")
        self.model = YOLO("yolov8n.pt")
        self.byte_tracker = sv.ByteTrack()
        self.box_annotator = sv.BoxAnnotator(thickness=2)
        print("YOLO model loaded successfully!")
    
    def process_frame(self, frame):
        """Process frame with YOLO detection"""
        # Run YOLO detection
        results = self.model(frame)[0]
        detections = sv.Detections.from_ultralytics(results)
        
        # Filter for people only (class_id == 0)
        detections = detections[detections.class_id == 0]
        
        # Update tracker
        detections = self.byte_tracker.update_with_detections(detections)
        
        # Count people
        people_count = len(detections)
        
        # Annotate frame
        annotated_frame = self.box_annotator.annotate(scene=frame.copy(), detections=detections)
        
        # Add text
        cv2.putText(annotated_frame, f'People Count: {people_count}', 
                   (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        
        timestamp = datetime.datetime.now().strftime("%H:%M:%S")
        cv2.putText(annotated_frame, f'Time: {timestamp}', 
                   (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        return people_count, annotated_frame


# ====================================================================
# FLASK WEB SERVER (Optional - requires Flask)
# ====================================================================

if FLASK_AVAILABLE:
    class CrowdCountingServer:
        """Flask web server for real-time crowd counting"""
        
        def __init__(self):
            self.app = Flask(__name__)
            CORS(self.app, origins="*")
            self.counter = BackgroundSubtractionCounter()
            self.setup_routes()
        
        def setup_routes(self):
            @self.app.route('/')
            def index():
                return render_template_string("""
                <!DOCTYPE html>
                <html>
                <head>
                    <title>MPB-OMS Crowd Counter</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; margin: 40px; }
                        .container { max-width: 800px; margin: 0 auto; }
                        video, canvas { border: 2px solid #333; margin: 10px; }
                        .count { font-size: 24px; font-weight: bold; color: #007bff; }
                        button { padding: 10px 20px; margin: 10px; font-size: 16px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>MPB-OMS Live Crowd Counter</h1>
                        <video id="video" width="640" height="480" autoplay playsinline></video>
                        <canvas id="canvas" width="640" height="480"></canvas>
                        <div class="count">People Count: <span id="count">0</span></div>
                        <button onclick="startCamera()">Start Camera</button>
                        <button onclick="stopCamera()">Stop Camera</button>
                    </div>
                    
                    <script>
                        const video = document.getElementById('video');
                        const canvas = document.getElementById('canvas');
                        const context = canvas.getContext('2d');
                        const countSpan = document.getElementById('count');
                        let stream = null;
                        let isProcessing = false;
                        
                        async function startCamera() {
                            try {
                                stream = await navigator.mediaDevices.getUserMedia({
                                    video: { facingMode: 'environment' }
                                });
                                video.srcObject = stream;
                                video.play();
                                setInterval(processFrame, 500); // Process every 500ms
                            } catch (err) {
                                console.error('Error accessing camera:', err);
                                alert('Error accessing camera. Please check permissions.');
                            }
                        }
                        
                        function stopCamera() {
                            if (stream) {
                                stream.getTracks().forEach(track => track.stop());
                                video.srcObject = null;
                            }
                        }
                        
                        async function processFrame() {
                            if (isProcessing) return;
                            isProcessing = true;
                            
                            try {
                                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                                const frameData = canvas.toDataURL('image/jpeg', 0.8);
                                
                                const response = await fetch('/process', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ frame: frameData })
                                });
                                
                                const data = await response.json();
                                countSpan.textContent = data.people_count || 0;
                            } catch (error) {
                                console.error('Error processing frame:', error);
                            } finally {
                                isProcessing = false;
                            }
                        }
                        
                        // Auto-start camera
                        startCamera();
                    </script>
                </body>
                </html>
                """)
            
            @self.app.route('/process', methods=['POST'])
            def process_frame():
                try:
                    data = request.get_json()
                    if not data or 'frame' not in data:
                        return jsonify({'error': 'No frame data'}), 400
                    
                    # Decode base64 image
                    frame_data = data['frame']
                    if ',' in frame_data:
                        frame_data = frame_data.split(',')[1]
                    
                    img_bytes = base64.b64decode(frame_data)
                    nparr = np.frombuffer(img_bytes, np.uint8)
                    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                    
                    if frame is None:
                        return jsonify({'error': 'Failed to decode frame'}), 400
                    
                    # Process frame
                    people_count, _ = self.counter.process_frame(frame)
                    
                    return jsonify({
                        'people_count': people_count,
                        'timestamp': time.time()
                    })
                
                except Exception as e:
                    return jsonify({'error': str(e)}), 500
        
        def run(self, host='0.0.0.0', port=5000, debug=False):
            self.app.run(host=host, port=port, debug=debug, threaded=True)


# ====================================================================
# DATA GENERATION (Optional - requires Pandas)
# ====================================================================

if PANDAS_AVAILABLE:
    def generate_mock_data(num_minutes=1000, output_file="crowd_data.csv"):
        """Generate mock crowd counting data"""
        
        halte_list = [
            "Blok M", "Masjid Agung", "Bundaran Senayan", "Gelora Bung Karno",
            "Polda Metro Jaya", "Bendungan Hilir", "Karet", "Dukuh Atas 1",
            "Tosari", "Bundaran HI", "Sarinah", "Bank Indonesia", "Monas",
            "Harmoni", "Sawah Besar", "Mangga Besar", "Glodok", "Kota"
        ]
        
        data = []
        start_time = datetime.datetime(2025, 1, 1, 6, 0, 0)
        current_passengers = 15
        max_passengers = 50
        current_halte_index = 0
        
        for i in range(num_minutes):
            current_timestamp = start_time + datetime.timedelta(minutes=i)
            
            # Change station every 5 minutes
            if i % 5 == 0 and i != 0:
                current_halte_index = (current_halte_index + 1) % len(halte_list)
                
                # Passenger changes at station
                passengers_on = randint(0, 10)
                passengers_off = randint(0, 10)
                current_passengers += (passengers_on - passengers_off)
                current_passengers = max(0, min(max_passengers, current_passengers))
            
            halte = halte_list[current_halte_index]
            
            # Generate data for each second in the minute
            for second in range(60):
                data_timestamp = current_timestamp + datetime.timedelta(seconds=second)
                
                # Add random fluctuation
                final_count = current_passengers + randint(-1, 1)
                final_count = max(0, min(max_passengers, final_count))
                
                # Determine density status
                if final_count < 10:
                    status = 'Kosong'
                elif final_count < 20:
                    status = 'Sedang'
                else:
                    status = 'Hampir Penuh'
                
                data.append([
                    data_timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                    halte,
                    final_count,
                    status
                ])
        
        df = pd.DataFrame(data, columns=['Timestamp', 'Halte', 'Jumlah Penumpang', 'Status Kepadatan'])
        df.to_csv(output_file, index=False)
        print(f"Mock data generated: {len(data)} records saved to {output_file}")
        return df


# ====================================================================
# MAIN INTERFACE
# ====================================================================

def main():
    parser = argparse.ArgumentParser(description="MPB-OMS Crowd Counting System")
    parser.add_argument('--mode', choices=['webcam', 'video', 'yolo', 'server', 'data'], 
                       required=True, help='Operating mode')
    parser.add_argument('--input', default=0, help='Input source (0 for webcam, path for video)')
    parser.add_argument('--output', help='Output file path')
    parser.add_argument('--tracking', action='store_true', help='Enable tracking visualization')
    parser.add_argument('--port', type=int, default=5000, help='Server port (server mode)')
    parser.add_argument('--records', type=int, default=1000, help='Number of records (data mode)')
    
    args = parser.parse_args()
    
    if args.mode == 'webcam':
        print("Starting webcam crowd counting...")
        counter = BackgroundSubtractionCounter()
        
        # Setup video capture
        cap = cv2.VideoCapture(int(args.input) if args.input.isdigit() else args.input)
        if not cap.isOpened():
            print("Error: Cannot open video source")
            return
        
        print("Press 'q' to quit, 's' to save screenshot")
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            people_count, annotated_frame = counter.process_frame(frame)
            
            cv2.imshow('MPB-OMS Crowd Counter', annotated_frame)
            
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord('s'):
                timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"crowd_screenshot_{timestamp}.jpg"
                cv2.imwrite(filename, annotated_frame)
                print(f"Screenshot saved: {filename}")
        
        cap.release()
        cv2.destroyAllWindows()
        print(f"Final counts - Up: {counter.cnt_up}, Down: {counter.cnt_down}")
    
    elif args.mode == 'video':
        print(f"Processing video: {args.input}")
        counter = BackgroundSubtractionCounter()
        
        cap = cv2.VideoCapture(args.input)
        if not cap.isOpened():
            print("Error: Cannot open video file")
            return
        
        # Setup video writer if output specified
        writer = None
        if args.output:
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            fps = int(cap.get(cv2.CAP_PROP_FPS))
            w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            writer = cv2.VideoWriter(args.output, fourcc, fps, (w, h))
        
        frame_count = 0
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            people_count, annotated_frame = counter.process_frame(frame)
            frame_count += 1
            
            print(f"Frame {frame_count}/{total_frames}: {people_count} people")
            
            if writer:
                writer.write(annotated_frame)
            
            cv2.imshow('Video Processing', annotated_frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        
        cap.release()
        if writer:
            writer.release()
        cv2.destroyAllWindows()
        print(f"Video processing complete. Final counts - Up: {counter.cnt_up}, Down: {counter.cnt_down}")
    
    elif args.mode == 'yolo':
        if not YOLO_AVAILABLE:
            print("Error: YOLO dependencies not available")
            return
        
        print("Starting YOLO-based crowd counting...")
        counter = YOLOCounter()
        
        cap = cv2.VideoCapture(int(args.input) if args.input.isdigit() else args.input)
        if not cap.isOpened():
            print("Error: Cannot open video source")
            return
        
        print("Press 'q' to quit")
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            people_count, annotated_frame = counter.process_frame(frame)
            
            cv2.imshow('YOLO Crowd Counter', annotated_frame)
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        
        cap.release()
        cv2.destroyAllWindows()
    
    elif args.mode == 'server':
        if not FLASK_AVAILABLE:
            print("Error: Flask dependencies not available")
            return
        
        print(f"Starting web server on port {args.port}...")
        server = CrowdCountingServer()
        server.run(port=args.port)
    
    elif args.mode == 'data':
        if not PANDAS_AVAILABLE:
            print("Error: Pandas not available for data generation")
            return
        
        output_file = args.output or "crowd_data.csv"
        print(f"Generating {args.records} minutes of mock data...")
        generate_mock_data(args.records, output_file)
    
    else:
        print("Invalid mode specified")


if __name__ == "__main__":
    main()
