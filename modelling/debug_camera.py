from flask import Flask, render_template_string

app = Flask(__name__)

@app.route('/')
def index():
    return render_template_string("""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Camera Debug Tool</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f0f0f0; }
            .container { max-width: 900px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
            .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
            .success { background: #d4edda; border-color: #c3e6cb; color: #155724; }
            .error { background: #f8d7da; border-color: #f5c6cb; color: #721c24; }
            .warning { background: #fff3cd; border-color: #ffeaa7; color: #856404; }
            .info { background: #d1ecf1; border-color: #bee5eb; color: #0c5460; }
            button { padding: 12px 24px; font-size: 16px; margin: 5px; border: none; border-radius: 5px; cursor: pointer; }
            .btn-primary { background: #007bff; color: white; }
            .btn-success { background: #28a745; color: white; }
            .btn-danger { background: #dc3545; color: white; }
            video { width: 320px; height: 240px; border: 2px solid #000; margin: 10px; }
            .debug-info { font-family: monospace; font-size: 12px; background: #f8f9fa; padding: 10px; margin: 10px 0; }
            .step { margin: 10px 0; padding: 10px; border-left: 4px solid #007bff; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🔧 Camera Debug Tool</h1>
            
            <div class="section info">
                <h3>Browser Information</h3>
                <div id="browserInfo"></div>
            </div>
            
            <div class="section">
                <h3>Step 1: Check Camera Support</h3>
                <button class="btn-primary" onclick="checkCameraSupport()">Check Camera Support</button>
                <div id="supportResult"></div>
            </div>
            
            <div class="section">
                <h3>Step 2: List Available Cameras</h3>
                <button class="btn-primary" onclick="listCameras()">List Cameras</button>
                <div id="cameraList"></div>
            </div>
            
            <div class="section">
                <h3>Step 3: Test Basic Camera Access</h3>
                <button class="btn-success" onclick="testBasicCamera()">Test Basic Camera</button>
                <button class="btn-danger" onclick="stopCamera()">Stop Camera</button>
                <br><br>
                <video id="testVideo" autoplay muted playsinline></video>
                <div id="basicResult"></div>
            </div>
            
            <div class="section">
                <h3>Step 4: Test Different Constraints</h3>
                <button class="btn-primary" onclick="testConstraints('back')">Test Back Camera</button>
                <button class="btn-primary" onclick="testConstraints('front')">Test Front Camera</button>
                <button class="btn-primary" onclick="testConstraints('default')">Test Default</button>
                <div id="constraintResult"></div>
            </div>
            
            <div class="section">
                <h3>Step 5: Debug Console</h3>
                <div class="debug-info" id="debugConsole">Debug messages will appear here...</div>
                <button class="btn-primary" onclick="clearDebug()">Clear Debug</button>
            </div>
            
            <div class="section">
                <h3>Quick Fixes to Try</h3>
                <div class="step">
                    <strong>1. Try different URL:</strong><br>
                    - <code>http://localhost:8081</code> instead of IP address<br>
                    - <code>http://127.0.0.1:8081</code>
                </div>
                <div class="step">
                    <strong>2. Check browser settings:</strong><br>
                    - Click the camera icon in address bar<br>
                    - Make sure camera is set to "Allow"<br>
                    - Try refreshing the page
                </div>
                <div class="step">
                    <strong>3. Try different browsers:</strong><br>
                    - Chrome (recommended)<br>
                    - Firefox<br>
                    - Edge
                </div>
                <div class="step">
                    <strong>4. Check Windows camera privacy:</strong><br>
                    - Windows Settings > Privacy > Camera<br>
                    - Allow apps to access camera<br>
                    - Allow desktop apps to access camera
                </div>
            </div>
        </div>

        <script>
            let currentStream = null;
            
            function addDebug(message, type = 'info') {
                const console = document.getElementById('debugConsole');
                const timestamp = new Date().toLocaleTimeString();
                const color = type === 'error' ? 'red' : type === 'success' ? 'green' : 'blue';
                console.innerHTML += `<div style="color: ${color}">[${timestamp}] ${message}</div>`;
                console.scrollTop = console.scrollHeight;
                console.log(message);
            }
            
            function clearDebug() {
                document.getElementById('debugConsole').innerHTML = 'Debug messages will appear here...';
            }
            
            // Initialize browser info
            function showBrowserInfo() {
                const info = document.getElementById('browserInfo');
                info.innerHTML = `
                    <strong>User Agent:</strong> ${navigator.userAgent}<br>
                    <strong>Platform:</strong> ${navigator.platform}<br>
                    <strong>Language:</strong> ${navigator.language}<br>
                    <strong>Online:</strong> ${navigator.onLine}<br>
                    <strong>Protocol:</strong> ${location.protocol}<br>
                    <strong>Host:</strong> ${location.host}<br>
                    <strong>HTTPS:</strong> ${location.protocol === 'https:' ? 'Yes' : 'No'}
                `;
            }
            
            function checkCameraSupport() {
                addDebug('Checking camera support...', 'info');
                const result = document.getElementById('supportResult');
                
                let supportInfo = '<div class="debug-info">';
                
                // Check MediaDevices support
                if (!navigator.mediaDevices) {
                    supportInfo += '<div class="error">❌ navigator.mediaDevices not supported</div>';
                    addDebug('ERROR: navigator.mediaDevices not supported', 'error');
                } else {
                    supportInfo += '<div class="success">✅ navigator.mediaDevices supported</div>';
                    addDebug('navigator.mediaDevices supported', 'success');
                }
                
                // Check getUserMedia support
                if (!navigator.mediaDevices.getUserMedia) {
                    supportInfo += '<div class="error">❌ getUserMedia not supported</div>';
                    addDebug('ERROR: getUserMedia not supported', 'error');
                } else {
                    supportInfo += '<div class="success">✅ getUserMedia supported</div>';
                    addDebug('getUserMedia supported', 'success');
                }
                
                // Check secure context
                if (!window.isSecureContext && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
                    supportInfo += '<div class="warning">⚠️ Not a secure context - camera may not work</div>';
                    addDebug('WARNING: Not a secure context', 'error');
                } else {
                    supportInfo += '<div class="success">✅ Secure context</div>';
                    addDebug('Secure context confirmed', 'success');
                }
                
                supportInfo += '</div>';
                result.innerHTML = supportInfo;
            }
            
            async function listCameras() {
                addDebug('Listing available cameras...', 'info');
                const result = document.getElementById('cameraList');
                
                try {
                    const devices = await navigator.mediaDevices.enumerateDevices();
                    const videoDevices = devices.filter(device => device.kind === 'videoinput');
                    
                    let deviceInfo = '<div class="debug-info">';
                    deviceInfo += `<strong>Total devices found:</strong> ${devices.length}<br>`;
                    deviceInfo += `<strong>Video devices found:</strong> ${videoDevices.length}<br><br>`;
                    
                    if (videoDevices.length === 0) {
                        deviceInfo += '<div class="error">❌ No video devices found</div>';
                        addDebug('No video devices found', 'error');
                    } else {
                        videoDevices.forEach((device, index) => {
                            deviceInfo += `<strong>Camera ${index + 1}:</strong><br>`;
                            deviceInfo += `- Label: ${device.label || 'Unknown'}<br>`;
                            deviceInfo += `- Device ID: ${device.deviceId}<br><br>`;
                            addDebug(`Found camera: ${device.label || 'Unknown'}`, 'success');
                        });
                    }
                    
                    deviceInfo += '</div>';
                    result.innerHTML = deviceInfo;
                    
                } catch (error) {
                    result.innerHTML = `<div class="error">❌ Error listing cameras: ${error.message}</div>`;
                    addDebug(`Error listing cameras: ${error.message}`, 'error');
                }
            }
            
            async function testBasicCamera() {
                addDebug('Testing basic camera access...', 'info');
                const video = document.getElementById('testVideo');
                const result = document.getElementById('basicResult');
                
                try {
                    // Stop any existing stream
                    if (currentStream) {
                        currentStream.getTracks().forEach(track => track.stop());
                    }
                    
                    addDebug('Requesting camera access...', 'info');
                    
                    const constraints = {
                        video: {
                            width: { ideal: 640, max: 1280 },
                            height: { ideal: 480, max: 720 }
                        },
                        audio: false
                    };
                    
                    currentStream = await navigator.mediaDevices.getUserMedia(constraints);
                    video.srcObject = currentStream;
                    
                    video.onloadedmetadata = function() {
                        addDebug(`Video loaded: ${video.videoWidth}x${video.videoHeight}`, 'success');
                        result.innerHTML = `<div class="success">✅ Camera working! Resolution: ${video.videoWidth}x${video.videoHeight}</div>`;
                    };
                    
                    video.onerror = function(e) {
                        addDebug(`Video error: ${e.message}`, 'error');
                        result.innerHTML = `<div class="error">❌ Video error: ${e.message}</div>`;
                    };
                    
                    addDebug('Camera access granted!', 'success');
                    
                } catch (error) {
                    addDebug(`Camera access error: ${error.name} - ${error.message}`, 'error');
                    result.innerHTML = `<div class="error">❌ Camera error: ${error.name} - ${error.message}</div>`;
                    
                    // Provide specific error help
                    if (error.name === 'NotAllowedError') {
                        result.innerHTML += `<div class="warning">💡 Try: Click the camera icon in address bar and allow camera access</div>`;
                    } else if (error.name === 'NotFoundError') {
                        result.innerHTML += `<div class="warning">💡 Try: Check if camera is connected and not used by another app</div>`;
                    }
                }
            }
            
            async function testConstraints(cameraType) {
                addDebug(`Testing ${cameraType} camera constraints...`, 'info');
                const result = document.getElementById('constraintResult');
                
                let constraints;
                switch(cameraType) {
                    case 'back':
                        constraints = {
                            video: { facingMode: 'environment' },
                            audio: false
                        };
                        break;
                    case 'front':
                        constraints = {
                            video: { facingMode: 'user' },
                            audio: false
                        };
                        break;
                    default:
                        constraints = {
                            video: true,
                            audio: false
                        };
                }
                
                try {
                    const stream = await navigator.mediaDevices.getUserMedia(constraints);
                    result.innerHTML = `<div class="success">✅ ${cameraType} camera constraints work!</div>`;
                    addDebug(`${cameraType} camera constraints successful`, 'success');
                    stream.getTracks().forEach(track => track.stop());
                } catch (error) {
                    result.innerHTML = `<div class="error">❌ ${cameraType} camera error: ${error.message}</div>`;
                    addDebug(`${cameraType} camera error: ${error.message}`, 'error');
                }
            }
            
            function stopCamera() {
                if (currentStream) {
                    currentStream.getTracks().forEach(track => {
                        track.stop();
                        addDebug(`Stopped track: ${track.kind}`, 'info');
                    });
                    currentStream = null;
                    document.getElementById('testVideo').srcObject = null;
                    document.getElementById('basicResult').innerHTML = '<div class="info">Camera stopped</div>';
                }
            }
            
            // Initialize on page load
            window.onload = function() {
                showBrowserInfo();
                addDebug('Camera debug tool loaded', 'info');
                
                // Auto-check support
                setTimeout(checkCameraSupport, 500);
            };
        </script>
    </body>
    </html>
    """)

if __name__ == '__main__':
    print("🔧 Starting Camera Debug Tool...")
    print("📍 Access at: http://localhost:8082")
    print("🛠️  This will help diagnose camera issues")
    app.run(host='0.0.0.0', port=8082, debug=True)
