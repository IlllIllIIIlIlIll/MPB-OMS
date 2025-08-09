from flask import Flask, render_template_string

app = Flask(__name__)

@app.route('/')
def index():
    return render_template_string("""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Simple Camera Test</title>
        <style>
            body { font-family: Arial, sans-serif; text-align: center; margin: 20px; }
            video { width: 640px; height: 480px; border: 3px solid #4CAF50; border-radius: 10px; }
            button { padding: 15px 30px; font-size: 18px; margin: 10px; border: none; border-radius: 5px; cursor: pointer; }
            .start { background: #4CAF50; color: white; }
            .stop { background: #f44336; color: white; }
            .status { margin: 20px; padding: 15px; border-radius: 5px; font-weight: bold; }
            .success { background: #d4edda; color: #155724; }
            .error { background: #f8d7da; color: #721c24; }
        </style>
    </head>
    <body>
        <h1>🎥 Simple Camera Test</h1>
        <p>This will test if your camera displays properly before adding YOLO detection.</p>
        
        <div>
            <button class="start" onclick="startCamera()">Start Camera</button>
            <button class="stop" onclick="stopCamera()">Stop Camera</button>
        </div>
        
        <div id="status" class="status">Click "Start Camera" to begin</div>
        
        <br>
        
        <video id="video" autoplay muted playsinline></video>
        
        <div id="info" style="margin-top: 20px; font-family: monospace; background: #f0f0f0; padding: 10px;"></div>

        <script>
            let video = document.getElementById('video');
            let stream = null;
            let statusDiv = document.getElementById('status');
            let infoDiv = document.getElementById('info');
            
            function updateStatus(message, isSuccess = true) {
                statusDiv.textContent = message;
                statusDiv.className = isSuccess ? 'status success' : 'status error';
                console.log(message);
            }
            
            function updateInfo(message) {
                infoDiv.innerHTML += message + '<br>';
                console.log(message);
            }
            
            async function startCamera() {
                updateInfo('Starting camera...');
                
                try {
                    // Check browser support
                    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                        throw new Error('Camera not supported in this browser');
                    }
                    
                    updateInfo('Browser supports camera API');
                    
                    // Request camera access
                    const constraints = {
                        video: {
                            width: { ideal: 640, max: 1280 },
                            height: { ideal: 480, max: 720 }
                        },
                        audio: false
                    };
                    
                    updateInfo('Requesting camera access...');
                    
                    stream = await navigator.mediaDevices.getUserMedia(constraints);
                    
                    updateInfo('Camera access granted!');
                    
                    // Set video source
                    video.srcObject = stream;
                    
                    video.onloadedmetadata = function() {
                        updateInfo(`Video dimensions: ${video.videoWidth}x${video.videoHeight}`);
                        updateStatus('✅ Camera working! You should see yourself in the video.');
                    };
                    
                    video.onplay = function() {
                        updateInfo('Video started playing');
                    };
                    
                    video.onerror = function(e) {
                        updateInfo('Video error: ' + e.message);
                        updateStatus('❌ Video display error', false);
                    };
                    
                } catch (error) {
                    updateInfo('Camera error: ' + error.message);
                    updateStatus('❌ Camera error: ' + error.message, false);
                    
                    if (error.name === 'NotAllowedError') {
                        updateInfo('Solution: Click camera icon in address bar and allow access');
                    }
                }
            }
            
            function stopCamera() {
                if (stream) {
                    stream.getTracks().forEach(track => {
                        track.stop();
                        updateInfo('Stopped camera track');
                    });
                    stream = null;
                    video.srcObject = null;
                    updateStatus('Camera stopped');
                } else {
                    updateInfo('No camera to stop');
                }
            }
            
            // Initialize
            updateInfo('Page loaded - Click Start Camera to test');
        </script>
    </body>
    </html>
    """)

if __name__ == '__main__':
    print("🎥 Starting Simple Camera Test...")
    print("📍 Access at: http://localhost:8083")
    print("🧪 This will test basic camera functionality")
    app.run(host='0.0.0.0', port=8083, debug=True)
