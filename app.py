from flask import Flask, request, jsonify
import time

app = Flask(__name__)

camera_data = {}

@app.route("/update_count", methods=["POST"])
def update_count():
    data = request.json
    if not data or "camera_id" not in data or "people_count" not in data or "timestamp" not in data:
        return jsonify({"status": "error", "message": "Invalid payload"}), 400
    
    camera_id = data["camera_id"]
    people_count = data["people_count"]
    timestamp = data["timestamp"]

    camera_data[camera_id] = {
        "people_count": people_count,
        "timestamp": timestamp
    }
    
    print(f"[{datetime.datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S')}] Menerima data dari kamera '{camera_id}': {people_count} orang")
    return jsonify({"status": "success"}), 200

@app.route("/get_all_counts", methods=["GET"])
def get_all_counts():
    return jsonify(camera_data), 200

@app.route("/get_count/<camera_id>", methods=["GET"])
def get_single_count(camera_id):
    if camera_id in camera_data:
        return jsonify(camera_data[camera_id]), 200
    else:
        return jsonify({"status": "error", "message": "Camera ID not found"}), 404

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5021, debug=True)