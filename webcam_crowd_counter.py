import cv2
import numpy as np
import os
import argparse
from ultralytics import YOLO
import supervision as sv

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

    # Definisi zona dan garis penghitungan (satu garis di tengah)
    LINE_START = sv.Point(0, h_full // 2)
    LINE_END = sv.Point(w_full, h_full // 2)

    # Inisialisasi pelacakan (ByteTrack lebih canggih)
    byte_tracker = sv.ByteTrack()
    
    # PERBAIKAN: Cara memanggil LineZone yang benar
    line_zone = sv.LineZone(start=LINE_START, end=LINE_END)
    line_zone_annotator = sv.LineZoneAnnotator(thickness=2, text_thickness=1, text_scale=0.5)
    box_annotator = sv.BoxAnnotator(thickness=2)

    # 2. PROSES - Loop Utama
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        results = model(frame)[0]
        detections = sv.Detections.from_ultralytics(results)
        detections = detections[detections.class_id == 0]
        detections = byte_tracker.update_with_detections(detections)
        line_zone.trigger(detections)

        frame = box_annotator.annotate(scene=frame, detections=detections)
        frame = line_zone_annotator.annotate(frame, line_zone)

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