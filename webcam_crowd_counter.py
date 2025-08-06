import cv2
import numpy as np
import os
import argparse
from ultralytics import YOLO
import supervision as sv

def main(source_video_path):    
    model = YOLO("yolov8n.pt") 
    
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
    
    output_folder = 'yolo_results'
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    fps = int(cap.get(cv2.CAP_PROP_FPS)) or 30
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out_video = cv2.VideoWriter(os.path.join(output_folder, 'output_yolo.mp4'), fourcc, fps, (w_full, h_full))

    byte_tracker = sv.ByteTrack()
    box_annotator = sv.BoxAnnotator(thickness=2)

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        results = model(frame)[0]
        detections = sv.Detections.from_ultralytics(results)
        detections = detections[detections.class_id == 0]
        detections = byte_tracker.update_with_detections(detections)
        
        # Hitung jumlah orang secara langsung
        people_count = len(detections)

        # Visualisasi
        frame = box_annotator.annotate(scene=frame, detections=detections)
        cv2.putText(frame, f'Jumlah Orang: {people_count}', (10, 30), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)

        cv2.imshow("YOLO Crowd Counter", frame)
        out_video.write(frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    out_video.release()
    cv2.destroyAllWindows()
    print("Selesai. Video hasil tersimpan di folder 'yolo_results'.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="YOLOv8 Live Crowd Counter")
    parser.add_argument("-v", "--video", type=str, default=None, help="Path to video file or leave empty for webcam")
    args = parser.parse_args()
    
    main(args.video)