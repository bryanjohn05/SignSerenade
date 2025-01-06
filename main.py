# Full Python Backend Code (paste.txt)
from flask import Flask, render_template, request, session, redirect, url_for, Response, jsonify
import base64
from io import BytesIO
from PIL import Image
import torch
import cv2
import numpy as np
import random
from ultralytics import YOLO
from flask_cors import CORS
import mediapipe as mp
import time 
from werkzeug.utils import secure_filename
# from hand_face_yolo_app import main
import traceback
import os

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
CORS(app)
mp_holistic = mp.solutions.holistic
holistic = mp_holistic.Holistic(static_image_mode=False)
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=True, max_num_hands=2, min_detection_confidence=0.5)
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(static_image_mode=True, min_detection_confidence=0.5)
mp_drawing = mp.solutions.drawing_utils
app.secret_key = 'your_secret_key'  # Needed for session management

# Sign Language Files Mapping (Extremely large dictionary, same as previous implementation)
sign_language_files = {
    "0": "static/signs/0.mp4",
    "1": "static/signs/1.mp4",
    "2": "static/signs/2.mp4",
    "3": "static/signs/3.mp4",
    "4": "static/signs/4.mp4",
    "5": "static/signs/5.mp4",
    "6": "static/signs/6.mp4",
    "7": "static/signs/7.mp4",
    "8": "static/signs/8.mp4",
    "9": "static/signs/9.mp4",
    "A": "static/signs/A.mp4",
    "After": "static/signs/After.mp4",
    "Again": "static/signs/Again.mp4",
    "Against": "static/signs/Against.mp4",
    "Age": "static/signs/Age.mp4",
    "All": "static/signs/All.mp4",
    "Alone": "static/signs/ALone.mp4",
    "Also": "static/signs/Also.mp4",
    "And": "static/signs/And.mp4",
    "Are": "static/signs/Are.mp4",
    "Ask": "static/signs/Ask.mp4",
    "At": "static/signs/At.mp4",
    "B": "static/signs/B.mp4",
    "Be": "static/signs/Be.mp4",
    "Beautiful": "static/signs/Beautiful.mp4",
    "Before": "static/signs/Before.mp4",
    "Best": "static/signs/Best.mp4",
    "Better": "static/signs/Better.mp4",
    "Busy": "static/signs/Busy.mp4",
    "But": "static/signs/But.mp4",
    "Bye": "static/signs/bye.mp4",
    "C": "static/signs/C.mp4",
    "Can": "static/signs/Can.mp4",
    "Cannot": "static/signs/Cannot.mp4",
    "Change": "static/signs/Change.mp4",
    "College": "static/signs/College.mp4",
    "Come": "static/signs/Come.mp4",
    "Computer": "static/signs/Computer.mp4",
    "D": "static/signs/D.mp4",
    "Day": "static/signs/Day.mp4",
    "Distance": "static/signs/Distance.mp4",
    "Do": "static/signs/Do.mp4",
    "Do Not": "static/signs/Do Not.mp4",
    "Does Not": "static/signs/Does Not.mp4",
    "E": "static/signs/E.mp4",
    "Eat": "static/signs/Eat.mp4",
    "Engineer": "static/signs/Engineer.mp4",
    "F": "static/signs/F.mp4",
    "Fight": "static/signs/Fight.mp4",
    "Finish": "static/signs/Finish.mp4",
    "From": "static/signs/From.mp4",
    "G": "static/signs/G.mp4",
    "Glitter": "static/signs/Glitter.mp4",
    "Go": "static/signs/Go.mp4",
    "Going": "static/signs/Go.mp4",
    "God": "static/signs/God.mp4",
    "Gold": "static/signs/Gold.mp4",
    "Good": "static/signs/Good.mp4",
    "Great": "static/signs/Great.mp4",
    "H": "static/signs/H.mp4",
    "Hand": "static/signs/Hand.mp4",
    "Hands": "static/signs/Hands.mp4",
    "Happy": "static/signs/Happy.mp4",
    "Hello": "static/signs/Hello.mp4",
    "Help": "static/signs/Help.mp4",
    "Her": "static/signs/Her.mp4",
    "Here": "static/signs/Here.mp4",
    "Hi":"static/signs/Hi.mp4",
    "His": "static/signs/His.mp4",
    "Home": "static/signs/Home.mp4",
    "Homepage": "static/signs/Homepage.mp4",
    "How": "static/signs/How.mp4",
    "I": "static/signs/I.mp4",
    "Invent": "static/signs/Invent.mp4",
    "It": "static/signs/It.mp4",
    "J": "static/signs/J.mp4",
    "K": "static/signs/K.mp4",
    "Keep": "static/signs/Keep.mp4",
    "L": "static/signs/L.mp4",
    "Language": "static/signs/Language.mp4",
    "Laugh": "static/signs/Laugh.mp4",
    "Learn": "static/signs/Learn.mp4",
    "M": "static/signs/M.mp4",
    "Me": "static/signs/ME.mp4",
    "More": "static/signs/More.mp4",
    "My": "static/signs/My.mp4",
    "N": "static/signs/N.mp4",
    "Name": "static/signs/Name.mp4",
    "Need": "static/signs/Need.mp4",
    "Next": "static/signs/Next.mp4",
    "No": "static/signs/No.mp4",
    "Not": "static/signs/Not.mp4",
    "Now": "static/signs/Now.mp4",
    "O": "static/signs/O.mp4",
    "Of": "static/signs/Of.mp4",
    "On": "static/signs/On.mp4",
    "Our": "static/signs/Our.mp4",
    "Out": "static/signs/Out.mp4",
    "P": "static/signs/P.mp4",
    "Pretty": "static/signs/Pretty.mp4",
    "Q": "static/signs/Q.mp4",
    "R": "static/signs/R.mp4",
    "Right": "static/signs/Right.mp4",
    "S": "static/signs/S.mp4",
    "Sad": "static/signs/Sad.mp4",
    "Safe": "static/signs/Safe.mp4",
    "See": "static/signs/See.mp4",
    "Self": "static/signs/Self.mp4",
    "Sign": "static/signs/Sign.mp4",
    "Sing": "static/signs/Sing.mp4",
    "So": "static/signs/So.mp4",
    "Sound": "static/signs/Sound.mp4",
    "Stay": "static/signs/Stay.mp4",
    "Study": "static/signs/Study.mp4",
    "T": "static/signs/T.mp4",
    "Talk": "static/signs/Talk.mp4",
    "Television": "static/signs/Television.mp4",
    "Thank": "static/signs/Thank.mp4",
    "Thanks": "static/signs/Thanks.mp4",
    "That": "static/signs/That.mp4",
    "They": "static/signs/They.mp4",
    "This": "static/signs/This.mp4",
    "Those": "static/signs/Those.mp4",
    "Time": "static/signs/Time.mp4",
    "To": "static/signs/to.mp4",
    "Today": "static/signs/Today.mp4",
    "TV": "static/signs/TV.mp4",
    "Type": "static/signs/Type.mp4",
    "U": "static/signs/U.mp4",
    "Us": "static/signs/Us.mp4",
    "V": "static/signs/V.mp4",
    "W": "static/signs/W.mp4",
    "Walk": "static/signs/Walk.mp4",
    "Wash": "static/signs/wash.mp4",
    "Way": "static/signs/Way.mp4",
    "We": "static/signs/We.mp4",
    "Welcome": "static/signs/Welcome.mp4",
    "What": "static/signs/What.mp4",
    "When": "static/signs/when.mp4",
    "Where": "static/signs/Where.mp4",
    "Which": "static/signs/Which.mp4",
    "Who": "static/signs/Who.mp4",
    "Whole": "static/signs/Whole.mp4",
    "Whose": "static/signs/Whose.mp4",
    "Why": "static/signs/Why.mp4",
    "Will": "static/signs/Will.mp4",
    "With": "static/signs/With.mp4",
    "Without": "static/signs/Without.mp4",
    "Words": "static/signs/Words.mp4",
    "Work": "static/signs/Work.mp4",
    "World": "static/signs/World.mp4",
    "Wrong": "static/signs/Wrong.mp4",
    "X": "static/signs/X.mp4",
    "Y": "static/signs/Y.mp4",
    "You": "static/signs/You.mp4",
    "Your": "static/signs/Your.mp4",
    "Yourself": "static/signs/Yourself.mp4",
    "Z": "static/signs/Z.mp4"
}


# YOLO Model Mapping
ACTION_NAMES = {
    0: 'Are', 1: 'Can', 2: 'Come', 3: 'Dont', 4: 'Going', 
    5: 'Hello', 6: 'Help', 7: 'Here', 8: 'How', 9: 'I', 
    10: 'Name', 11: 'Need', 12: 'Please', 13: 'Thanks', 
    14: 'This', 15: 'Today', 16: 'Understand', 17: 'What', 
    18: 'Where', 19: 'You', 20: 'Your'
}

# ActionRecognitionApp class (same as previous implementation)
class ActionRecognitionApp:
    # initialized = False
    
    def __init__(self, model_path = r"C:\Users\Bryan\Desktop\Project\runs\classify\train4\weights\best.pt"):
        # if ActionRecognitionApp.initialized:
        #     print("Warning: ActionRecognitionApp is being initialized again!")
        # else:
        #     ActionRecognitionApp.initialized = True
        #     print("Initializing ActionRecognitionApp...")
        print(f"Attempting to load model from: {model_path}")
        print(f"Current working directory: {os.getcwd()}")
        print(f"Full model path: {os.path.abspath(model_path)}")
        
        try:
            # Initialize YOLO model
            self.model = YOLO(model_path)  # Automatically loads model and weights
            print("Model loaded successfully! x2")
        
        except Exception as e:
            print(f"CRITICAL ERROR loading model: {e}")
            print(f"Full traceback: {traceback.format_exc()}")
            self.model = None
        
        # # Defer camera initialization
        # self.cap = None
        # self.last_capture_time = 0
        # self.capture_interval = 4  # seconds
        # self.detected_action = None

        # Capture setup
        self.cap = cv2.VideoCapture(0)
        self.last_capture_time = 0
        self.capture_interval = 4  # seconds
        self.detected_action = None
    
    # def initialize_camera(self):
    #     """Lazy initialization of the camera."""
    #     if self.cap is None:
    #         print("Initializing the camera...")
    #         self.cap = cv2.VideoCapture(0)
    #         if not self.cap.isOpened():
    #             print("Failed to open the camera.")
    #             self.cap = None
    #         else:
    #             print("Camera initialized successfully.")

    def process_frame(self):
        """Process a frame from the camera."""
        # Ensure the camera is initialized
        # self.initialize_camera()

        if self.cap is None:
            print("Camera is not available.")
            return None
        ret, frame = self.cap.read()
        if not ret:
            print("Camera NOT initialized successfully.")
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

# Global action recognition instance
action_recognition = ActionRecognitionApp()

@app.route('/video_feed',  methods=['POST', 'GET'])
def video_feed():
    def generate_frames():
        while True:
            frame = action_recognition.process_frame()
            # if frame is None:
            #     print("No frame captured.")
            # else:
            #     print(f"Frame captured with shape: {frame.shape}")
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

@app.route('/translate', methods=['GET', 'POST'])
def translate():
    videos = []
    if request.method == 'POST':
        input_text = request.form.get('input_text', '').strip()
        words = input_text.split()

        # For each word, get the corresponding sign video
        for word in words:
            video_path = sign_language_files.get(word.capitalize())
            if video_path:
                videos.append(video_path)

        # Check if the user uploaded an image for sign classification
        if 'file' in request.files:
            file = request.files['file']
            if file.filename != '':
                filename = secure_filename(file.filename)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)

                # Read the image
                image = cv2.imread(filepath)
                
                # Classify the action based on the uploaded image
                action = action_recognition.classify_action(image)

                # Optionally, you can display the classified action on the page
                return render_template('translate.html', videos=videos, action=action)

    return render_template('translate.html', videos=videos)

@app.route('/learn',methods=['GET', 'POST'])
def learn():
    videos = []
    if request.method == 'POST':
        input_text = request.form.get('input_text', '').strip()
        words = input_text.split()

        # For each word, get the corresponding sign video
        for word in words:
            video_path = sign_language_files.get(word.capitalize())
            if video_path:
                videos.append(video_path)

        # Check if the user uploaded an image for sign classification
        if 'file' in request.files:
            file = request.files['file']
            if file.filename != '':
                filename = secure_filename(file.filename)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)

                # Read the image
                image = cv2.imread(filepath)
                
                # Classify the action based on the uploaded image
                action = action_recognition.classify_action(image)

                # Optionally, you can display the classified action on the page
                return render_template('learn.html', videos=videos, action=action)

    return render_template('learn.html', videos=videos)

@app.route('/quiz', methods=['GET', 'POST'])
def lesson():
    words = list(sign_language_files.keys())
    sign = random.choice(words)
    video_path = sign_language_files.get(sign,'')
    sign_message = f"This is how you sign '{sign}'"

    message = ""
    
    is_quiz = True
    quiz_options = random.sample(words, 4)
    if sign not in quiz_options:
        quiz_options[random.randint(0, 3)] = sign
    if request.method == 'POST':
        answer = request.form['answer']
        if answer.strip().lower() == sign.lower():
            message = "Correct!"
            is_quiz = False
        else:
            message = f"Oh no! The correct answer is '{sign}'. Try again."

    return render_template(
        'quiz.html', 
        is_quiz=is_quiz, 
        sign_message=sign_message if not is_quiz else "", 
        video_path=video_path if not is_quiz else None, 
        message=message, 
        quiz_options=quiz_options
    )

@app.route('/validate', methods=['GET','POST'])
def validate():
    videos = []
    sign_message = ""

    if request.method == 'POST':
        input_text = request.form.get('input_text', '').strip()
        
        # Get the sign video for the input text
        video_path = sign_language_files.get(input_text)
        if video_path:
            videos.append(video_path)
            sign_message = f"This is how you sign '{input_text}'"

        # Check if the user uploaded an image for sign classification
        if 'file' in request.files:
            file = request.files['file']
            if file.filename != '':
                filename = secure_filename(file.filename)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)

                # Read the image
                image = cv2.imread(filepath)
                
                # Classify the action based on the uploaded image
                action = action_recognition.classify_action(image)

                # Optionally, you can display the classified action on the page
                return render_template('validate.html', videos=videos, action=action, sign_message=sign_message)

    return render_template('validate.html', videos=videos, sign_message=sign_message)

@app.route('/next_lesson')
def next_lesson():
    return redirect(url_for('lesson'))

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/team')
def visit():
    return render_template('visit.html')

@app.route('/')
def home():
    return render_template('index.html')

if __name__ == "__main__":
    app.run(debug=True, port=3000)
