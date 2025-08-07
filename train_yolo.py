import os
from ultralytics import YOLO

# Muat model YOLOv8n yang sudah dilatih (transfer learning)
model = YOLO('yolov8n.pt')

# Latih model dengan dataset kustom Anda
# Pastikan 'data.yaml' berada di lokasi yang benar
model.train(data='tj_crowd_dataset/data.yaml', epochs=50, imgsz=640)

# Simpan model yang sudah dilatih
model.save('best_tj_crowd_model.pt')