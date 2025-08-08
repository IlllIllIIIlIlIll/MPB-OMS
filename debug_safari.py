"""
Debug script to help troubleshoot Safari camera issues
Run this to check your network setup and server accessibility
"""

import socket
import requests
import subprocess
import sys

def get_local_ip():
    """Get the local IP address of this Mac"""
    try:
        # Connect to a remote server to determine local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except:
        return "Unable to determine"

def check_port_open(ip, port):
    """Check if a port is open"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(3)
        result = sock.connect_ex((ip, port))
        sock.close()
        return result == 0
    except:
        return False

def main():
    print("🔧 Safari Camera Debug Tool")
    print("="*50)
    
    # Get network info
    local_ip = get_local_ip()
    print(f"📍 Your Mac's IP Address: {local_ip}")
    
    # Check if Flask server is running
    port = 5000
    if check_port_open(local_ip, port):
        print(f"✅ Flask server is running on port {port}")
        
        # Test server response
        try:
            response = requests.get(f"http://{local_ip}:{port}/test", timeout=5)
            if response.status_code == 200:
                print("✅ Server is responding correctly")
            else:
                print(f"⚠️  Server responded with status: {response.status_code}")
        except:
            print("❌ Server is not responding to requests")
    else:
        print(f"❌ Flask server is NOT running on port {port}")
        print("   Please start the Flask server first: python flask_server.py")
    
    print("\n📱 Safari Camera Troubleshooting:")
    print("="*50)
    
    print("1. 🔒 HTTPS Requirement:")
    print("   - Safari often requires HTTPS for camera access")
    print("   - Try accessing via: https://your-ip:5000 (if you have SSL)")
    print("   - Or use localhost if testing on the same device")
    
    print("\n2. 📋 Required HTML attributes for Safari:")
    print("   - autoplay muted playsinline webkit-playsinline")
    print("   - These are included in the provided HTML")
    
    print("\n3. 🌐 Network Setup:")
    print(f"   - iPhone URL should be: http://{local_ip}:5000")
    print("   - Make sure both devices are on the same WiFi")
    print("   - Check firewall settings on Mac")
    
    print("\n4. 📱 Safari Settings:")
    print("   - Settings > Safari > Camera: Allow")
    print("   - Settings > Privacy & Security > Camera: Safari enabled")
    
    print("\n5. 🔧 Common Issues:")
    print("   - Clear Safari cache and cookies")
    print("   - Try restarting Safari")
    print("   - Check if other camera apps work on iPhone")
    print("   - Try using Chrome on iPhone as alternative")
    
    print(f"\n🌐 Test URLs:")
    print(f"   - Server status: http://{local_ip}:5000")
    print(f"   - Connection test: http://{local_ip}:5000/test")
    print(f"   - Camera client: Open camera_client.html in Safari")

if __name__ == "__main__":
    main()
