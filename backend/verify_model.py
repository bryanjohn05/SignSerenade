"""
Script to verify that a YOLO model can be loaded and used for inference.
This helps diagnose issues with model loading and compatibility.
"""

import os
import sys
import argparse
import traceback
import numpy as np
import cv2
import time

def verify_model(model_path, verbose=True):
    """Verify that a YOLO model can be loaded and used for inference."""
    
    if verbose:
        print(f"Verifying model at: {model_path}")
    
    # Check if the model file exists
    if not os.path.exists(model_path):
        print(f"ERROR: Model file not found at {model_path}")
        return False
    
    # Check file size
    file_size_mb = os.path.getsize(model_path) / (1024 * 1024)
    if verbose:
        print(f"Model file size: {file_size_mb:.2f} MB")
    
    if file_size_mb < 1:
        print(f"WARNING: Model file is very small ({file_size_mb:.2f} MB), it might be corrupted or incomplete")
    
    # Try to import torch and check version
    try:
        import torch
        if verbose:
            print(f"PyTorch version: {torch.__version__}")
    except ImportError:
        print("ERROR: PyTorch is not installed. Install it with: pip install torch")
        return False
    
    # Try to import ultralytics and check version
    try:
        from ultralytics import YOLO
        import ultralytics
        if verbose:
            if hasattr(ultralytics, '__version__'):
                print(f"Ultralytics version: {ultralytics.__version__}")
            else:
                print("Ultralytics version: Unknown")
    except ImportError:
        print("ERROR: Ultralytics is not installed. Install it with: pip install ultralytics")
        return False
    
    # Try to load the model
    try:
        if verbose:
            print(f"Loading model...")
        
        start_time = time.time()
        model = YOLO(model_path)
        load_time = time.time() - start_time
        
        if verbose:
            print(f"Model loaded successfully in {load_time:.2f} seconds")
        
        # Check if the model has the expected attributes
        if not hasattr(model, 'names'):
            print("ERROR: Model loaded but has no 'names' attribute")
            return False
        
        if not model.names:
            print("ERROR: Model loaded but 'names' dictionary is empty")
            return False
        
        if verbose:
            print(f"Model has {len(model.names)} classes:")
            for idx, name in model.names.items():
                print(f"  Class {idx}: {name}")
        
        # Create a test image
        if verbose:
            print("Creating test image...")
        
        test_img = np.zeros((640, 640, 3), dtype=np.uint8)
        cv2.rectangle(test_img, (100, 100), (300, 300), (255, 255, 255), -1)
        
        # Run inference
        if verbose:
            print("Running inference on test image...")
        
        start_time = time.time()
        results = model(test_img)
        inference_time = time.time() - start_time
        
        if results is None:
            print("ERROR: Model returned None results")
            return False
        
        if not hasattr(results, '__iter__'):
            print(f"ERROR: Results is not iterable: {type(results)}")
            return False
        
        if verbose:
            print(f"Inference completed in {inference_time:.2f} seconds")
            print(f"Results type: {type(results)}")
        
        # Process results
        detections = []
        for result in results:
            if not hasattr(result, 'boxes'):
                print("ERROR: Result has no 'boxes' attribute")
                continue
            
            boxes = result.boxes
            for box in boxes:
                try:
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    confidence = float(box.conf[0])
                    class_id = int(box.cls[0])
                    class_name = result.names[class_id]
                    
                    detections.append({
                        "class_id": class_id,
                        "class_name": class_name,
                        "confidence": confidence,
                        "bbox": [x1, y1, x2, y2]
                    })
                except Exception as e:
                    print(f"ERROR processing box: {e}")
        
        if verbose:
            print(f"Detected {len(detections)} objects in test image")
            for i, det in enumerate(detections):
                print(f"  Detection {i+1}: {det['class_name']} ({det['confidence']:.2f})")
        
        print("\nVERIFICATION SUCCESSFUL: Model loaded and ran inference correctly")
        return True
    
    except Exception as e:
        print(f"ERROR during verification: {e}")
        print("\nTraceback:")
        print(traceback.format_exc())
        return False

def main():
    parser = argparse.ArgumentParser(description='Verify YOLO model loading and inference')
    parser.add_argument('--model', default='best(4).pt', help='Path to the YOLO model file')
    parser.add_argument('--quiet', action='store_true', help='Suppress verbose output')
    
    args = parser.parse_args()
    
    success = verify_model(args.model, verbose=not args.quiet)
    
    if success:
        print("\nModel verification passed!")
        sys.exit(0)
    else:
        print("\nModel verification failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()
