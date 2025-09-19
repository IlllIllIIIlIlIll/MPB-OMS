import numpy as np
import cv2
import time
import argparse
import datetime
import sys
import math
from random import randint
import os
import urllib.request
from flask import Flask, Response

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
        self.R = randint(0,255)
        self.G = randint(0,255)
        self.B = randint(0,255)
        self.done = False
        self.state = '0'
        self.age = 0
        self.max_age = max_age
        self.dir = None
    def getRGB(self):
        return (self.R,self.G,self.B)
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
        self.tracks.append([self.x,self.y])
        self.x = xn
        self.y = yn
    def setDone(self):
        self.done = True
    def timedOut(self):
        return self.done
    def going_UP(self,mid_start,mid_end):
        if len(self.tracks) >= 2:
            if self.state == '0':
                if self.tracks[-1][1] < mid_end and self.tracks[-2][1] >= mid_end:
                    self.state = '1'
                    self.dir = 'up'
                    return True
            else:
                return False
        else:
            return False
    def going_DOWN(self,mid_start,mid_end):
        if len(self.tracks) >= 2:
            if self.state == '0':
                if self.tracks[-1][1] > mid_start and self.tracks[-2][1] <= mid_start:
                    self.state = '1'
                    self.dir = 'down'
                    return True
            else:
                return False
        else:
            return False
    def age_one(self):
        self.age += 1
        if self.age > self.max_age:
            self.done = True
        return True
class MultiPerson:
    def __init__(self, persons, xi, yi):
        self.persons = persons
        self.x = xi
        self.y = yi
        self.tracks = []
        self.R = randint(0,255)
        self.G = randint(0,255)
        self.B = randint(0,255)
        self.done = False
# ====================================================================

# Konfigurasi Flask
app = Flask(__name__)

# URL IP Camera dari HP Anda
# Ganti dengan URL yang diberikan oleh aplikasi di HP Anda
ip_camera_url = 'http://192.168.1.100:8080/video' 
if 'http://' not in ip_camera_url:
    print("Error: Pastikan URL IP Camera dimulai dengan 'http://'")
    sys.exit()

# Variabel global untuk menahan frame dan status
frame_for_display = None
global_people_count = 0
global_lock = False

# Konfigurasi OpenCV
cnt_up = 0
cnt_down = 0
frameArea = 1280 * 720
areaTH = frameArea/500
line_up = int(2*(720/5))
line_down = int(3*(720/5))
up_limit = int(1*(720/5))
down_limit = int(4*(720/5))
line_down_color = (255, 0, 0)
line_up_color = (0, 0, 255)
fgbg = cv2.createBackgroundSubtractorMOG2(history=500, varThreshold=25, detectShadows=True)
kernelOp = np.ones((3, 3), np.uint8)
kernelOp2 = np.ones((5, 5), np.uint8)
kernelCl = np.ones((11, 11), np.uint8)
font = cv2.FONT_HERSHEY_SIMPLEX
persons = []
max_p_age = 15
pid = 1
tracking_distance_threshold = 75

# Fungsi untuk memproses frame
def process_frames():
    global frame_for_display
    global global_people_count
    
    while True:
        try:
            imgResp = urllib.request.urlopen(ip_camera_url)
            imgNp = np.array(bytearray(imgResp.read()), dtype=np.uint8)
            frame = cv2.imdecode(imgNp, -1)
            
            h, w, _ = frame.shape
            frame_with_count = frame.copy()

            # Proses deteksi dan penghitungan
            fgmask2 = fgbg.apply(frame)
            ret, imBin2 = cv2.threshold(fgmask2, 200, 255, cv2.THRESH_BINARY)
            mask2 = cv2.morphologyEx(imBin2, cv2.MORPH_OPEN, kernelOp)
            mask2 = cv2.morphologyEx(mask2, cv2.MORPH_CLOSE, kernelCl)
            
            contours0, hierarchy = cv2.findContours(mask2, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            people_count_in_frame = 0
            for cnt in contours0:
                area = cv2.contourArea(cnt)
                if area > areaTH:
                    people_count_in_frame += 1
                    M = cv2.moments(cnt)
                    cx = int(M['m10']/M['m00'])
                    cy = int(M['m01']/M['m00'])
                    x, y, w_cnt, h_cnt = cv2.boundingRect(cnt)
                    
                    cv2.circle(frame_with_count, (cx, cy), 5, (0, 0, 255), -1)
                    cv2.rectangle(frame_with_count, (x, y), (x+w_cnt, y+h_cnt), (0, 255, 0), 2)
            
            global_people_count = people_count_in_frame

            str_count = 'Jumlah Orang: ' + str(global_people_count)
            cv2.putText(frame_with_count, str_count, (20, 20), font, 0.5, (255, 255, 255), 1, cv2.LINE_AA)
            
            ret, jpeg = cv2.imencode('.jpg', frame_with_count)
            frame_for_display = jpeg.tobytes()

        except urllib.error.URLError as e:
            print(f"Error: Tidak dapat terhubung ke URL. Pastikan HP dan laptop terhubung ke jaringan yang sama. Error: {e}")
            break
        except Exception as e:
            print(f"Error saat memproses frame: {e}")
            break
            
# Fungsi generator untuk streaming video
def generate_frames():
    while True:
        if frame_for_display is not None:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_for_display + b'\r\n')
            
@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    import threading
    # Jalankan pemrosesan frame di thread terpisah
    video_thread = threading.Thread(target=process_frames, daemon=True)
    video_thread.start()
    
    # Jalankan server Flask
    # Ganti 'localhost' dengan IP laptop Anda jika ingin diakses dari perangkat lain
    app.run(host='0.0.0.0', port=8090, threaded=True)