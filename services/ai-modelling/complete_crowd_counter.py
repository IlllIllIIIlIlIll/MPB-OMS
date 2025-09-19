# Nama file: complete_crowd_counter.py

import numpy as np
import cv2
import time
import argparse
import datetime
import sys
from random import randint

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

# argument parsing
ap = argparse.ArgumentParser()
ap.add_argument("-v", "--video", default="video.mp4", help="path to the video file")
ap.add_argument("-a", "--min-area", type=int, default=500, help="minimum area size")
ap.add_argument("-t", "--status", type=str, help="tracking status(True/False)")
args = vars(ap.parse_args())

print("Tracking Status=", args["status"])

if args.get("video", None) is None:
    cap = cv2.VideoCapture(0)
else:
    cap = cv2.VideoCapture(args["video"])

# Dapatkan properti video
w_full = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
h_full = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
fps = cap.get(cv2.CAP_PROP_FPS)

print('Full Video Height: ', h_full)
print('Full Video Width: ', w_full)
print('Frame per Seconds: ', fps)

# ====================================================================
# MENDEFINISIKAN ROI (ZOOM)
# ====================================================================
# Tentukan koordinat ROI (zoom in di area tengah)
# Anda bisa mengubah nilai-nilai ini sesuai kebutuhan
y_start = int(h_full * 0.2)
y_end = int(h_full * 0.8)
x_start = int(w_full * 0.2)
x_end = int(w_full * 0.8)

w_roi = x_end - x_start
h_roi = y_end - y_start
# ====================================================================


# ====================================================================
# MENYIAPKAN PENULIS VIDEO (VIDEO WRITER)
# ====================================================================
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out_original = cv2.VideoWriter('output_original.mp4', fourcc, fps, (w_full, h_full))
out_masked = cv2.VideoWriter('output_masked.mp4', fourcc, fps, (w_roi, h_roi))
# ====================================================================

cnt_up = 0
cnt_down = 0
frameArea = h_roi * w_roi
areaTH = frameArea/500

line_up = int((h_roi/2)-50)
line_down = int((h_roi/2)+50)

up_limit = int(1*(h_roi/5))
down_limit = int(4*(h_roi/5))

line_down_color = (255, 0, 0)
line_up_color = (0, 0, 255)

pt1 = [0, line_down]
pt2 = [w_roi, line_down]
pts_L1 = np.array([pt1, pt2], np.int32)
pts_L1 = pts_L1.reshape((-1, 1, 2))

pt3 = [0, line_up]
pt4 = [w_roi, line_up]
pts_L2 = np.array([pt3, pt4], np.int32)
pts_L2 = pts_L2.reshape((-1, 1, 2))

pt5 = [0, up_limit]
pt6 = [w_roi, up_limit]
pts_L3 = np.array([pt5, pt6], np.int32)
pts_L3 = pts_L3.reshape((-1, 1, 2))
pt7 = [0, down_limit]
pt8 = [w_roi, down_limit]
pts_L4 = np.array([pt7, pt8], np.int32)
pts_L4 = pts_L4.reshape((-1, 1, 2))

fgbg = cv2.createBackgroundSubtractorMOG2(detectShadows = True)

kernelOp = np.ones((3, 3), np.uint8)
kernelOp2 = np.ones((5, 5), np.uint8)
kernelCl = np.ones((11, 11), np.uint8)

font = cv2.FONT_HERSHEY_SIMPLEX
persons = []
max_p_age = 5
pid = 1

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        print('EOF')
        print('UP:', cnt_up)
        print('DOWN:', cnt_down)
        break
    
    # Ambil frame yang di-zoom
    frame_roi = frame[y_start:y_end, x_start:x_end]

    for i in persons:
        i.age_one()

    fgmask2 = fgbg.apply(frame_roi)

    try:
        ret, imBin2 = cv2.threshold(fgmask2, 200, 255, cv2.THRESH_BINARY)
        mask2 = cv2.morphologyEx(imBin2, cv2.MORPH_OPEN, kernelOp)
        mask2 = cv2.morphologyEx(mask2, cv2.MORPH_CLOSE, kernelCl)
    except:
        print('EOF')
        print('UP:', cnt_up)
        print('DOWN:', cnt_down)
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
            if cy in range(up_limit, down_limit):
                for i in persons:
                    if abs(cx-i.getX()) <= w and abs(cy-i.getY()) <= h:
                        new = False
                        i.updateCoords(cx, cy)
                        if i.going_UP(line_down, line_up) == True:
                            cnt_up += 1;
                            print("ID:", i.getId(), 'crossed, going out at', time.strftime("%c"))
                        elif i.going_DOWN(line_down,line_up) == True:
                            cnt_down += 1;
                            print("ID:", i.getId(), 'crossed, coming in at', time.strftime("%c"))
                        break
                    if i.getState() == '1':
                        if i.getDir() == 'down' and i.getY() > down_limit:
                            i.setDone()
                        elif i.getDir() == 'up' and i.getY() < up_limit:
                            i.setDone()
                    if i.timedOut():
                        index = persons.index(i)
                        persons.pop(index)
                        del i
                if new == True:
                    p = MyPerson(pid, cx, cy, max_p_age)
                    persons.append(p)
                    pid += 1
            cv2.circle(frame_roi, (cx, cy), 5, (0, 0, 255), -1)
            img = cv2.rectangle(frame_roi, (x, y), (x+w, y+h), (0, 255, 0), 2)

    for i in persons:
        if args["status"] == 'True':
            if len(i.getTracks()) >= 2:
                pts = np.array(i.getTracks(), np.int32)
                pts = pts.reshape((-1, 1, 2))
                frame_roi = cv2.polylines(frame_roi, [pts], False, i.getRGB())
        if i.getId() == 9:
            print(str(i.getX()), ',', str(i.getY()))

    str_up = 'Outgoing: ' + str(cnt_up)
    cv2.line(frame_roi, (10, 10), (10, 30), (255, 0, 0), 2)
    cv2.line(frame_roi, (10, 10), (5, 20), (255, 0, 0), 2)
    cv2.line(frame_roi, (10, 10), (15, 20), (255, 0, 0), 2)

    str_down = 'Incoming: ' + str(cnt_down)
    cv2.line(frame_roi, (10, 35), (10, 55), (0, 0, 255), 2)
    cv2.line(frame_roi, (10, 55), (5, 45), (0, 0, 255), 2)
    cv2.line(frame_roi, (10, 55), (15, 45), (0, 0, 255), 2)

    str_diff = 'Difference: ' + str(int(cnt_down)-int(cnt_up))

    frame_roi = cv2.polylines(frame_roi, [pts_L1], False, line_down_color, thickness=1)
    frame_roi = cv2.polylines(frame_roi, [pts_L2], False, line_up_color, thickness=1)

    cv2.putText(frame_roi, str_up, (20, 20), font, 0.5, (255, 255, 255), 1, cv2.LINE_AA)
    cv2.putText(frame_roi, str_down, (20, 40), font, 0.5, (255, 255, 255), 1, cv2.LINE_AA)
    cv2.putText(frame_roi, datetime.datetime.now().strftime("%A %d %B %Y %I:%M:%S%p"),
                (10, frame_roi.shape[0] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (0, 255, 255), 1)

    # ====================================================================
    # MENULIS FRAME KE VIDEO OUTPUT
    # ====================================================================
    # Gabungkan frame ROI kembali ke frame penuh untuk disimpan di output original
    frame_with_roi = frame.copy()
    frame_with_roi[y_start:y_end, x_start:x_end] = frame_roi
    out_original.write(frame_with_roi)
    out_masked.write(cv2.cvtColor(mask2, cv2.COLOR_GRAY2BGR))
    # ====================================================================

    cv2.imshow('Original Video', frame_roi)
    cv2.imshow('Masked Video', mask2)
    
    k = cv2.waitKey(30) & 0xff
    if k == 27:
        break

cap.release()
cv2.destroyAllWindows()

out_original.release()
out_masked.release()