import cv2
import numpy as np
import os
import argparse
from ultralytics import YOLO
import supervision as sv
import requests # <<< BARIS BARU: Impor pustaka requests
import time     # <<< BARIS BARU: Impor pustaka time

def main(source_video_path):    
    # 1. SETUP - Inisialisasi Model, Video, dan Tracker
    
    # Inisialisasi model YOLOv8 (akan mengunduh jika belum ada)
    model = YOLO("yolov8n.pt") 
    
    # Menggunakan kamera real-time jika tidak ada path video yang diberikan
    if source_video_path:
        cap = cv2.VideoCapture(source_video_path)
    else:
        # 0 adalah indeks untuk webcam utama
        cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("Error: Tidak bisa membuka sumber video.")
        return

    w_full = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h_full = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    # Menyiapkan video writer untuk menyimpan output
    output_folder = 'yolo_results'
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    fps = int(cap.get(cv2.CAP_PROP_FPS)) or 30
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out_video = cv2.VideoWriter(os.path.join(output_folder, 'output_yolo.mp4'), fourcc, fps, (w_full, h_full))

    # Inisialisasi pelacakan (ByteTrack lebih canggih)
    byte_tracker = sv.ByteTrack()
    box_annotator = sv.BoxAnnotator(thickness=2)

    # <<< BARIS BARU: Konfigurasi Backend
    BACKEND_URL = "http://localhost:5000/update_count" # Ganti jika backend Anda di URL lain
    CAMERA_ID = "tj_halte_a" # ID unik untuk kamera ini (misal: nama halte)
    # >>>

    # 2. PROSES - Loop Utama
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        results = model(frame)[0]
        detections = sv.Detections.from_ultralytics(results)
        detections = detections[detections.class_id == 0] # Filter hanya untuk 'person'
        detections = byte_tracker.update_with_detections(detections)
        
        # Hitung jumlah orang secara langsung
        people_count = len(detections)

        # <<< BARIS BARU: Mengirim data ke backend
        payload = {
            "camera_id": CAMERA_ID,
            "people_count": people_count,
            "timestamp": time.time() # Waktu saat data dikirim
        }
        try:
            # Menggunakan POST request untuk mengirim data JSON
            # Timeout 1 detik agar tidak memblokir video terlalu lama jika backend lambat
            requests.post(BACKEND_URL, json=payload, timeout=1)
        except requests.exceptions.RequestException as e:
            # Cetak error jika pengiriman gagal (misal: backend belum jalan)
            print(f"Error mengirim data ke backend: {e}")
        # >>>

        # Visualisasi
        frame = box_annotator.annotate(scene=frame, detections=detections)
        cv2.putText(frame, f'Jumlah Orang: {people_count}', (10, 30), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)

        cv2.imshow("YOLO Crowd Counter", frame)
        out_video.write(frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # 3. CLEANUP - Akhir Program
    cap.release()
    out_video.release()
    cv2.destroyAllWindows()
    print("Selesai. Video hasil tersimpan di folder 'yolo_results'.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="YOLOv8 Live Crowd Counter")
    parser.add_argument("-v", "--video", type=str, default=None, help="Path to video file or leave empty for webcam")
    args = parser.parse_args()
    
    main(args.video)