from flask import Flask, jsonify, render_template, send_from_directory
from pathlib import Path
import os

app = Flask(__name__)
PROJECT_ROOT = Path(__file__).resolve().parent
DATA_DIR = PROJECT_ROOT / "data"

# Curated list of popular images to promote to the top of the select list
POPULAR_IMAGES = [
    "bunny.jpg",
    "dog.jpg",
    "elephant.jpg",
    "fox.jpg",
    "lion.jpg",
    "meerkat.jpg",
    "orangutan.jpeg",
    "panda.jpg",
    "panda2.jpg",
    "panda3.jpg",
    "quokka.jpg",
    "tiger.jpg",
    "tiger2.jpg",
    "wolf.jpg",
    "wolf2.jpg",
    "zebra.jpg"
]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/images')
def get_images():
    original_dir = DATA_DIR / "original"
    if not original_dir.exists():
        return jsonify([])
    
    # List all files that are images
    valid_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}
    all_files = []
    for f in os.listdir(original_dir):
        if Path(f).suffix.lower() in valid_extensions:
            all_files.append(f)
            
    # Sort files: Popular ones first, followed by others sorted
    popular = []
    others = []
    for f in sorted(all_files):
        if f in POPULAR_IMAGES:
            popular.append(f)
        else:
            others.append(f)
            
    # Sort popular images by the order of POPULAR_IMAGES list
    popular.sort(key=lambda x: POPULAR_IMAGES.index(x))
    
    result = popular + others
    return jsonify(result)

@app.route('/images/original/<filename>')
def serve_original(filename):
    return send_from_directory(DATA_DIR / "original", filename)

@app.route('/images/simulated/<cvd_type>/<filename>')
def serve_simulated(cvd_type, filename):
    if cvd_type not in ('deuteranopia', 'protanopia', 'tritanopia'):
        return "Invalid CVD Type", 400
    return send_from_directory(DATA_DIR / "simulated" / cvd_type, filename)

@app.route('/images/corrected/<cvd_type>/<filename>')
def serve_corrected(cvd_type, filename):
    if cvd_type not in ('deuteranopia', 'protanopia', 'tritanopia'):
        return "Invalid CVD Type", 400
    return send_from_directory(DATA_DIR / "corrected" / cvd_type, filename)

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
