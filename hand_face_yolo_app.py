import os
import cv2
import torch
import numpy as np
import mediapipe as mp
from flask import Flask, render_template, Response, request, jsonify
from werkzeug.utils import secure_filename
import traceback
from ultralytics import YOLO
def main():
        
    # Initialize MediaPipe
    mp_holistic = mp.solutions.holistic
    holistic = mp_holistic.Holistic(static_image_mode=False)
    mp_hands = mp.solutions.hands
    hands = mp_hands.Hands(static_image_mode=True, max_num_hands=2, min_detection_confidence=0.5)
    mp_face_mesh = mp.solutions.face_mesh
    face_mesh = mp_face_mesh.FaceMesh(static_image_mode=True, min_detection_confidence=0.5)
    mp_drawing = mp.solutions.drawing_utils

    # YOLO Model Mapping
    ACTION_NAMES = {
        0: 'Are', 1: 'Can', 2: 'Come', 3: 'Dont', 4: 'Going', 
        5: 'Hello', 6: 'Help', 7: 'Here', 8: 'How', 9: 'I', 
        10: 'Name', 11: 'Need', 12: 'Please', 13: 'Thanks', 
        14: 'This', 15: 'Today', 16: 'Understand', 17: 'What', 
        18: 'Where', 19: 'You', 20: 'Your'
    }

    # ActionRecognitionApp class
    class ActionRecognitionApp:
        def __init__(self, model_path="best.pt"):
            print(f"Attempting to load model from: {model_path}")
            print(f"Current working directory: {os.getcwd()}")
            print(f"Full model path: {os.path.abspath(model_path)}")
            
            try:
                # Initialize YOLO model
                self.model = YOLO(model_path)  # Automatically loads model and weights
                print("Model loaded successfully!")
            
            except Exception as e:
                print(f"CRITICAL ERROR loading model: {e}")
                print(f"Full traceback: {traceback.format_exc()}")
                self.model = None

            # Capture setup
            self.cap = cv2.VideoCapture(0)
            self.last_capture_time = 0
            self.capture_interval = 4  # seconds
            self.detected_action = None

        def process_frame(self):
            ret, frame = self.cap.read()
            if not ret:
                return None

            # Flip frame
            frame = cv2.flip(frame, 1)
            black_frame = np.zeros(frame.shape, dtype=np.uint8)
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            # Process landmarks
            hands_result = hands.process(rgb_frame)
            face_result = face_mesh.process(rgb_frame)

            # Draw landmarks on black frame
            if hands_result.multi_hand_landmarks:
                for hand_landmarks in hands_result.multi_hand_landmarks:
                    mp_drawing.draw_landmarks(
                        black_frame, hand_landmarks, mp_hands.HAND_CONNECTIONS,
                        mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=3),
                        mp_drawing.DrawingSpec(color=(255, 0, 0), thickness=2)
                    )

            if face_result.multi_face_landmarks:
                for face_landmarks in face_result.multi_face_landmarks:
                    mp_drawing.draw_landmarks(
                        black_frame, face_landmarks, mp_face_mesh.FACEMESH_TESSELATION,
                        mp_drawing.DrawingSpec(color=(0, 255, 255), thickness=1, circle_radius=1),
                        mp_drawing.DrawingSpec(color=(255, 0, 255), thickness=1)
                    )

            return black_frame

        def classify_action(self, image):
            if self.model is None:
                print("Model is not loaded. Cannot classify.")
                return 'Model not loaded'

            try:
                # YOLO expects the image in RGB format
                image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

                # Run inference with YOLO
                results = self.model(image_rgb)

                # Check if there are classification probabilities
                if results and hasattr(results[0], 'probs') and results[0].probs is not None and len(results[0].probs.data) > 0:

                    # Extract the class with the highest probability
                    predicted_class_idx = np.argmax(results[0].probs.data).item()
                    action = ACTION_NAMES.get(predicted_class_idx, 'Unknown')
                    return action
                else:
                    return 'No classification results available'

            except Exception as e:
                print(f"Classification error: {e}")
                print(f"Full traceback: {traceback.format_exc()}")
                return 'Classification failed'

    # Flask App Configuration
    app = Flask(__name__)
    app.config['UPLOAD_FOLDER'] = 'uploads'
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Global action recognition instance
    action_recognition = ActionRecognitionApp()

    @app.route('/')
    def index():
        return render_template('index.html')

    @app.route('/video_feed')
    def video_feed():
        def generate_frames():
            while True:
                frame = action_recognition.process_frame()
                if frame is not None:
                    ret, buffer = cv2.imencode('.jpg', frame)
                    frame = buffer.tobytes()
                    yield (b'--frame\r\n'
                        b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

        return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

    @app.route('/classify_action', methods=['POST'])
    def classify_action():
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Read image and classify
        image = cv2.imread(filepath)
        action = action_recognition.classify_action(image)
        
        return jsonify({'action': action, 'confidence': 'high'})
    print("Model loaded successfully x1!")
    action_recognition = ActionRecognitionApp()
    return action_recognition

    if __name__ == '__main__':
        app.run(debug=False)
