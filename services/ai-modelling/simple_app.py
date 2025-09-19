#!/usr/bin/env python3
"""
Simple YOLO Service for TransJakarta OMS
Provides mock occupancy data for testing without heavy AI model loading
"""

from flask import Flask, jsonify
import time
import random
import os

app = Flask(__name__)

# Store start time for uptime calculation
app.start_time = time.time()

# Mock bus data
MOCK_BUSES = [
    {"busId": "DMR-727", "capacity": 40, "routeId": "2", "routeName": "2", "direction": "Pulo Gadung", "platform": "A"},
    {"busId": "MYS-19222", "capacity": 40, "routeId": "7F", "routeName": "7F", "direction": "Jakarta Kota", "platform": "A"},
    {"busId": "DMR-710", "capacity": 40, "routeId": "2", "routeName": "2", "direction": "Pulo Gadung", "platform": "C"},
    {"busId": "DMR-240133", "capacity": 40, "routeId": "2A", "routeName": "2A", "direction": "Senayan", "platform": "B"},
    {"busId": "MYS-17168", "capacity": 40, "routeId": "7F", "routeName": "7F", "direction": "Jakarta Kota", "platform": "A"},
]

@app.route('/')
def index():
    """Main page with service information"""
    return jsonify({
        "service": "TransJakarta YOLO Service",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "/": "Service information",
            "/api/health": "Health check",
            "/api/occupancy": "Get occupancy data"
        }
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "YOLO Crowd Counter",
        "port": 8081,
        "timestamp": time.time(),
        "uptime": time.time() - app.start_time
    })

@app.route('/api/occupancy', methods=['GET'])
def get_current_occupancy():
    """Get current occupancy data for all buses"""
    occupancy_data = []
    
    for bus in MOCK_BUSES:
        # Generate realistic occupancy data
        occupancy = random.randint(1, bus["capacity"])
        in_count = random.randint(0, occupancy)
        out_count = random.randint(0, in_count)
        
        # Generate realistic estimasi (arrival time)
        estimasi_minutes = random.randint(1, 10)
        
        occupancy_data.append({
            "busId": bus["busId"],
            "busCode": bus["busId"],
            "routeId": bus["routeId"],
            "routeName": bus["routeName"],
            "direction": bus["direction"],
            "platform": bus["platform"],
            "capacity": bus["capacity"],
            "occupancy": occupancy,
            "inCount": in_count,
            "outCount": out_count,
            "estimasi": f"{estimasi_minutes} mnt",
            "timestamp": time.time(),
            "deviceId": f"device_{bus['busId'].lower().replace('-', '_')}",
            "providerName": "TransJakarta",
            "category": "Regular"
        })
    
    return jsonify(occupancy_data)

@app.route('/api/start', methods=['POST'])
def start_detection():
    """Start camera detection (mock)"""
    return jsonify({
        "status": "started",
        "message": "Camera detection started (mock mode)",
        "timestamp": time.time()
    })

@app.route('/api/stop', methods=['POST'])
def stop_detection():
    """Stop camera detection (mock)"""
    return jsonify({
        "status": "stopped",
        "message": "Camera detection stopped (mock mode)",
        "timestamp": time.time()
    })

if __name__ == '__main__':
    print("Starting TransJakarta YOLO Service...")
    print("Service will be available at: http://localhost:8081")
    print("Health check: http://localhost:8081/api/health")
    print("Occupancy data: http://localhost:8081/api/occupancy")
    print("Mock mode: Generating realistic occupancy data")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=8081, debug=False)