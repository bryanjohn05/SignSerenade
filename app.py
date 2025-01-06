import cv2
import numpy as np
from ultralytics import YOLO
import cvzone
import mediapipe as mp

# Initialize MediaPipe Hands and Face Mesh
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=2, min_detection_confidence=0.5)
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(static_image_mode=False, min_detection_confidence=0.5)
mp_drawing = mp.solutions.drawing_utils

# Load the YOLOv8 model (Ensure the model is trained for sign language detection)
try:
    model = YOLO("best.pt")  # Use your custom-trained model
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
    exit(1)  # Exit if model is not loaded

names = model.model.names  # Class names (gesture labels)
cap = cv2.VideoCapture(0)  # Capture video from webcam

if not cap.isOpened():
    print("Error: Couldn't access the camera.")
    exit(1)

count = 0

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        print("Error: Couldn't read the frame.")
        break

    count += 1

    # Skip frames to reduce computational load
    if count % 3 != 0:
        continue

    frame = cv2.resize(frame, (640, 480))  # Resize the frame to match model training dimensions

    # Flip the frame for a mirror-like effect
    frame = cv2.flip(frame, 1)

    # Convert the frame to RGB for MediaPipe
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # Process hand and face landmarks (optional, can be skipped)
    hands_result = hands.process(rgb_frame)
    face_result = face_mesh.process(rgb_frame)

    # Create a blank black frame for landmarks (optional visualization)
    black_frame = np.zeros(frame.shape, dtype=np.uint8)

    # Draw hand landmarks (if detected)
    if hands_result.multi_hand_landmarks:
        for hand_landmarks in hands_result.multi_hand_landmarks:
            mp_drawing.draw_landmarks(
                black_frame, hand_landmarks, mp_hands.HAND_CONNECTIONS,
                mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=3),
                mp_drawing.DrawingSpec(color=(255, 0, 0), thickness=2)
            )

    # Draw face landmarks (if detected)
    if face_result.multi_face_landmarks:
        for face_landmarks in face_result.multi_face_landmarks:
            mp_drawing.draw_landmarks(
                black_frame, face_landmarks, mp_face_mesh.FACEMESH_TESSELATION,
                mp_drawing.DrawingSpec(color=(0, 255, 255), thickness=1, circle_radius=1),
                mp_drawing.DrawingSpec(color=(255, 0, 255), thickness=1)
            )

    # Run YOLOv8 detection on the frame (for sign language gesture recognition)
    try:
        results = model.predict(frame, conf=0.5, iou=0.5)  # Set appropriate thresholds

        if results and results[0].boxes is not None:
            boxes = results[0].boxes.xyxy.int().tolist()  # Bounding boxes
            class_ids = results[0].boxes.cls.int().tolist()  # Class IDs
            confidences = results[0].boxes.conf.tolist()  # Confidence scores

            # Loop through detected boxes
            for box, class_id, conf in zip(boxes, class_ids, confidences):
                gesture_name = names[class_id]  # Get the gesture label
                x1, y1, x2, y2 = box
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)  # Draw bounding box
                cvzone.putTextRect(frame, f'{gesture_name} ({conf:.2f})', (x1, y1 - 10), 1, 1)  # Display gesture name and confidence

                print(f"Detected {gesture_name} with confidence {conf:.2f} at {box}")
        else:
            print("No detections in this frame.")

    except Exception as e:
        print(f"Error during model detection: {e}")

    # Show the frames with landmarks and gesture recognition results
    cv2.putText(black_frame, "Press 'q' to quit.",
                (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
    cv2.imshow("Hand and Face Landmarks", black_frame)
    cv2.imshow("Gesture Recognition", frame)

    # Exit on pressing 'q'
    key = cv2.waitKey(1) & 0xFF
    if key == ord('q'):
        print("Exiting...")
        break

# Release resources and close windows
cap.release()
hands.close()
face_mesh.close()
cv2.destroyAllWindows()
print("All resources released.")