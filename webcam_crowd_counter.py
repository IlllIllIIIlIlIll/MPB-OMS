# Nama file: accurate_webcam_crowd_counter.py

import numpy as np
import cv2
import time
import datetime
import sys
from random import randint
import os
import math

# ====================================================================
# KONTEN DARI Utility.py
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

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Tidak dapat membuka kamera.")
    exit()

w_full = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
h_full = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
fps = cap.get(cv2.CAP_PROP_FPS)

print('Full Video Height: ', h_full)
print('Full Video Width: ', w_full)
print('Frame per Seconds: ', fps)

w_roi = w_full
h_roi = h_full

output_folder = 'result'
if not os.path.exists(output_folder):
    os.makedirs(output_folder)

fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out_original = cv2.VideoWriter(os.path.join(output_folder, 'output_realtime.mp4'), fourcc, fps, (w_full, h_full))

# Total orang di frame, dihitung dari jumlah obyek aktif
total_people = 0
frameArea = h_roi * w_roi
areaTH = frameArea/500

fgbg = cv2.createBackgroundSubtractorMOG2(detectShadows = True)

kernelOp = np.ones((3, 3), np.uint8)
kernelOp2 = np.ones((5, 5), np.uint8)
kernelCl = np.ones((11, 11), np.uint8)

font = cv2.FONT_HERSHEY_SIMPLEX
persons = []
max_p_age = 15
pid = 1
tracking_distance_threshold = 75

while True:
    ret, frame = cap.read()
    if not ret:
        print('EOF')
        break
    
    frame_roi = frame.copy()
    
    # === Logika untuk menghapus obyek yang hilang dan mengurangi hitungan ===
    persons_to_remove = []
    for i in persons:
        i.age_one()
        if i.timedOut():
            persons_to_remove.append(i)

    for i in persons_to_remove:
        persons.remove(i)
    # total_people = len(persons)
    # ========================================================================
    

    fgmask2 = fgbg.apply(frame_roi)

    try:
        ret, imBin2 = cv2.threshold(fgmask2, 200, 255, cv2.THRESH_BINARY)
        mask2 = cv2.morphologyEx(imBin2, cv2.MORPH_OPEN, kernelOp)
        mask2 = cv2.morphologyEx(mask2, cv2.MORPH_CLOSE, kernelCl)
    except:
        print('EOF')
        break

    contours0, hierarchy = cv2.findContours(mask2, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    for cnt in contours0:
        area = cv2.contourArea(cnt)
        if area > areaTH:
            M = cv2.moments(cnt)
            cx = int(M['m10']/M['m00'])
            cy = int(M['m01']/M['m00'])
            x, y, w, h = cv2.boundingRect(cnt)
            new = True
            
            if len(persons) > 0:
                for i in persons:
                    dist_to_person = math.sqrt((cx - i.getX())**2 + (cy - i.getY())**2)
                    if dist_to_person < tracking_distance_threshold:
                        new = False
                        i.updateCoords(cx, cy)
                        break
                    
            if new == True:
                p = MyPerson(pid, cx, cy, max_p_age)
                persons.append(p)
                pid += 1
            
            # --- Perbaikan: Mendeteksi obyek yang sudah di-track ---
            found_person = None
            for p in persons:
                dist_to_person = math.sqrt((cx - p.getX())**2 + (cy - p.getY())**2)
                if dist_to_person < tracking_distance_threshold:
                    found_person = p
                    break
            
            if found_person is not None:
                cv2.circle(frame_roi, (cx, cy), 5, (0, 0, 255), -1)
                cv2.putText(frame_roi, f'ID: {found_person.getId()}', (x, y - 10), font, 0.5, (255, 255, 255), 1, cv2.LINE_AA)
                cv2.rectangle(frame_roi, (x, y), (x+w, y+h), (0, 255, 0), 2)
            # ==========================================================

    # --- Perbaikan: Menggunakan len(persons) untuk hitungan total yang akurat ---
    total_people = len(persons)
    # ============================================================================
    
    str_total = 'Total Orang: ' + str(total_people)

    cv2.putText(frame_roi, str_total, (20, 20), font, 0.5, (255, 255, 255), 1, cv2.LINE_AA)
    cv2.putText(frame_roi, datetime.datetime.now().strftime("%A %d %B %Y %I:%M:%S%p"),
                (10, frame_roi.shape[0] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (0, 255, 255), 1)

    out_original.write(frame_roi)

    cv2.imshow('Deteksi Real-time', frame_roi)
    
    k = cv2.waitKey(1) & 0xff
    if k == 27:
        break

cap.release()
cv2.destroyAllWindows()
out_original.release()