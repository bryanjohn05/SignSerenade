from ultralytics import YOLO
import cv2
import numpy as np
import os

def test_model():
    model_path = os.environ.get('MODEL_PATH', 'best.pt')
    print(f"Testing model loading from {model_path}")
    
    try:
        # Try to load the model
        model = YOLO(model_path)
        print(f"Successfully loaded model from {model_path}")
        
        # Create a simple test image (black image)
        test_img = np.zeros((640, 640, 3), dtype=np.uint8)
        
        # Run inference to make sure it works
        results = model(test_img)
        print("Successfully ran inference on test image")
        print(f"Model classes: {model.names}")
        
        return True
    except Exception as e:
        print(f"Error testing model: {e}")
        return False

if __name__ == "__main__":
    success = test_model()
    if success:
        print("Model test passed!")
    else:
        print("Model test failed!")
