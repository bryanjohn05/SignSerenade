import cv2
import mediapipe as mp
import numpy as np
import os
import time

# Initialize MediaPipe Hands and Face Mesh
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=True, max_num_hands=2, min_detection_confidence=0.5)
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(static_image_mode=True, min_detection_confidence=0.5)
mp_drawing = mp.solutions.drawing_utils

# Function to create the common folder if it doesn't exist
def create_common_folder(folder_path="captured_images"):
    os.makedirs(folder_path, exist_ok=True)
    return folder_path

# Webcam setup
cap = cv2.VideoCapture(0)
print("Press 'c' to start capturing 20 images. Press 'q' to quit early.")

# Constants
MAX_IMAGES = 100  # Number of images to capture
SAVE_FOLDER = create_common_folder()

# Check existing files in the folder to avoid overwriting
def get_next_filename(folder, max_images):
    existing_files = [int(f.split('.')[0]) for f in os.listdir(folder) if f.endswith('.png') and f.split('.')[0].isdigit()]
    existing_files.sort()
    next_start = existing_files[-1] + 1 if existing_files else 1
    return range(next_start, next_start + max_images)

try:
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            print("Error: Couldn't access the camera.")
            break

        # Flip and display current camera feed
        frame = cv2.flip(frame, 1)
        black_frame = np.zeros(frame.shape, dtype=np.uint8)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Process landmarks
        hands_result = hands.process(rgb_frame)
        face_result = face_mesh.process(rgb_frame)

        # Draw landmarks on black background
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

        # Show black background with landmarks
        cv2.putText(black_frame, "Press 'c' to capture 20 images. 'q' to quit.",
                    (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.imshow("Landmarks on Black Background", black_frame)

        # Key press actions
        key = cv2.waitKey(1) & 0xFF
        if key == ord('c'):  # Start capturing 20 images
            print("Starting image capture...")
            file_numbers = get_next_filename(SAVE_FOLDER, MAX_IMAGES)
            for idx in file_numbers:
                ret, frame = cap.read()
                if not ret:
                    print("Error: Couldn't capture the frame.")
                    break

                # Process landmarks
                frame = cv2.flip(frame, 1)
                black_frame = np.zeros(frame.shape, dtype=np.uint8)
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

                hands_result = hands.process(rgb_frame)
                face_result = face_mesh.process(rgb_frame)

                # Draw landmarks
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

                # Save image with current index
                image_name = f"{idx}.png"
                image_path = os.path.join(SAVE_FOLDER, image_name)
                cv2.imwrite(image_path, black_frame)
                print(f"Saved {image_path}")

                time.sleep(1)  # 1-second delay between captures

            print("Image capture complete!")
            break

        elif key == ord('q'):  # Quit early
            print("Exiting...")
            break

finally:
    cap.release()
    cv2.destroyAllWindows()
    print("All resources released.")
