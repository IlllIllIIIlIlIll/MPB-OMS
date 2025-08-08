import numpy as np
import cv2
import time
import base64
from flask import Flask, render_template_string, request, jsonify

app = Flask(__name__)

# ====================================================================
# DEFINISI KELAS MyPerson (LENGKAP)
# ====================================================================
class MyPerson:
    tracks = []
    def __init__(self, i, xi, yi, max_age):
        self.i = i
        self.x = xi
        self.y = yi
        self.tracks = []
        self.R = np.random.randint(0,255)
        self.G = np.random.randint(0,255)
        self.B = np.random.randint(0,255)
        self.done = False
        self.state = '0'
        self.age = 0
        self.max_age = max_age
        self.dir = None
    # ... (fungsi lainnya)
    def getRGB(self): return (self.R,self.G,self.B)
    def getTracks(self): return self.tracks
    def getId(self): return self.i
    def getX(self): return self.x
    def getY(self): return self.y
    def updateCoords(self, xn, yn):
        self.age = 0
        self.tracks.append([self.x,self.y])
        self.x = xn
        self.y = yn
    def age_one(self):
        self.age += 1
        if self.age > self.max_age:
            self.done = True
        return True

# Konfigurasi OpenCV (disesuaikan)
fgbg = cv2.createBackgroundSubtractorMOG2(history=500, varThreshold=25, detectShadows=True)
kernelOp = np.ones((3, 3), np.uint8)
kernelOp2 = np.ones((5, 5), np.uint8)
kernelCl = np.ones((11, 11), np.uint8)
font = cv2.FONT_HERSHEY_SIMPLEX
areaTH = 1280*720/500
persons = []
max_p_age = 15
pid = 1
tracking_distance_threshold = 75
cnt_up = 0
cnt_down = 0
w, h = 1280, 720
line_down = int(3*(h/5))
line_up = int(2*(h/5))
up_limit = int(1*(h/5))
down_limit = int(4*(h/5))

# Endpoint untuk halaman web
@app.route('/')
def index():
    return render_template_string("""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Crowd Counter</title>
        <style>body{font-family: sans-serif; text-align: center;}</style>
    </head>
    <body>
        <h1>Live Crowd Counter</h1>
        <video id="cameraFeed" width="640" height="480" autoplay playsinline></video>
        <canvas id="outputCanvas" width="640" height="480"></canvas>
        <p>Jumlah Orang: <span id="peopleCount">0</span></p>
        <script>
            const video = document.getElementById('cameraFeed');
            const canvas = document.getElementById('outputCanvas');
            const context = canvas.getContext('2d');
            const countSpan = document.getElementById('peopleCount');

            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
                .then(stream => {
                    video.srcObject = stream;
                    video.play();
                    setInterval(sendFrame, 1000 / 30); // Kirim 30 frame per detik
                });
            }

            function sendFrame() {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const frameData = canvas.toDataURL('image/jpeg');

                fetch('/process', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ frame: frameData })
                })
                .then(response => response.json())
                .then(data => {
                    countSpan.textContent = data.people_count;
                });
            }
        </script>
    </body>
    </html>
    """)

# Endpoint untuk menerima dan memproses gambar
@app.route('/process', methods=['POST'])
def process_frame():
    global persons, pid, cnt_up, cnt_down
    frame_data = request.json['frame']
    
    # Konversi data base64 ke format gambar OpenCV
    encoded_data = frame_data.split(',')[1]
    nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Logika penghitungan (hanya jumlah total)
    fgmask2 = fgbg.apply(frame)
    ret, imBin2 = cv2.threshold(fgmask2, 200, 255, cv2.THRESH_BINARY)
    mask2 = cv2.morphologyEx(imBin2, cv2.MORPH_OPEN, kernelOp)
    mask2 = cv2.morphologyEx(mask2, cv2.MORPH_CLOSE, kernelCl)
    contours0, hierarchy = cv2.findContours(mask2, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    people_count = 0
    for cnt in contours0:
        area = cv2.contourArea(cnt)
        if area > areaTH:
            people_count += 1

    return jsonify({"people_count": people_count})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8081, debug=True)