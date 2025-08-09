"""
Configuration file for MPB-OMS Crowd Counting System
"""

# Default video capture settings
DEFAULT_FRAME_WIDTH = 1280
DEFAULT_FRAME_HEIGHT = 720
DEFAULT_FPS = 30

# Background subtraction parameters
BGS_HISTORY = 500
BGS_VAR_THRESHOLD = 25
BGS_DETECT_SHADOWS = True

# Morphological operations kernel sizes
KERNEL_OP_SIZE = (3, 3)
KERNEL_OP2_SIZE = (5, 5)
KERNEL_CL_SIZE = (11, 11)

# Person tracking parameters
MAX_PERSON_AGE = 15
TRACKING_DISTANCE_THRESHOLD = 75

# Area threshold for detection (as fraction of frame area)
AREA_THRESHOLD_FRACTION = 500

# Line positions for counting (as fraction of frame height)
LINE_UP_FRACTION = 2/5
LINE_DOWN_FRACTION = 3/5
UP_LIMIT_FRACTION = 1/5
DOWN_LIMIT_FRACTION = 4/5

# Colors (BGR format)
LINE_UP_COLOR = (0, 0, 255)  # Red
LINE_DOWN_COLOR = (255, 0, 0)  # Blue
DETECTION_COLOR = (0, 255, 0)  # Green
CENTER_COLOR = (0, 0, 255)  # Red

# YOLO settings
YOLO_MODEL_PATH = "yolov8n.pt"
YOLO_CONFIDENCE_THRESHOLD = 0.5
YOLO_IOU_THRESHOLD = 0.45

# Server settings
DEFAULT_SERVER_HOST = "0.0.0.0"
DEFAULT_SERVER_PORT = 5000

# File paths
OUTPUT_FOLDER = "results"
SCREENSHOT_FOLDER = "screenshots"

# Data generation settings
MOCK_DATA_STATIONS = [
    "Blok M", "Masjid Agung", "Bundaran Senayan", "Gelora Bung Karno",
    "Polda Metro Jaya", "Bendungan Hilir", "Karet", "Dukuh Atas 1",
    "Tosari", "Bundaran HI", "Sarinah", "Bank Indonesia", "Monas",
    "Harmoni", "Sawah Besar", "Mangga Besar", "Glodok", "Kota"
]

MAX_PASSENGERS = 50
MIN_PASSENGERS = 0
STATION_CHANGE_INTERVAL = 5  # minutes

