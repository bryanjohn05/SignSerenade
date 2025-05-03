"""
Script to debug YOLO model results structure.
This helps understand how to properly access detection results.
"""

import os
import sys
import argparse
import traceback
import numpy as np
import cv2
from ultralytics import YOLO

def debug_results(model_path, verbose=True):
    """Debug the structure of YOLO model results."""
    
    if verbose:
        print(f"Loading model from: {model_path}")
    
    # Check if the model file exists
    if not os.path.exists(model_path):
        print(f"ERROR: Model file not found at {model_path}")
        return False
    
    try:
        # Load the model
        model = YOLO(model_path)
        
        if verbose:
            print("Model loaded successfully")
            print(f"Model type: {type(model)}")
            print(f"Model attributes: {dir(model)}")
            
            if hasattr(model, 'names'):
                print(f"Model has {len(model.names)} classes:")
                for idx, name in model.names.items():
                    print(f"  Class {idx}: {name}")
        
        # Create a test image
        img = np.zeros((640, 640, 3), dtype=np.uint8)
        cv2.rectangle(img, (100, 100), (300, 300), (255, 255, 255), -1)
        
        if verbose:
            print("\nRunning inference on test image...")
        
        # Run inference
        results = model(img)
        
        # Debug results structure
        print("\n=== Results Structure ===")
        print(f"Results type: {type(results)}")
        print(f"Results attributes: {dir(results)}")
        print(f"Is results iterable: {hasattr(results, '__iter__')}")
        
        if hasattr(results, '__iter__'):
            print(f"\nResults contains {len(results)} items")
            
            for i, result in enumerate(results):
                print(f"\n--- Item {i} ---")
                print(f"Type: {type(result)}")
                print(f"Attributes: {dir(result)}")
                print(f"Has boxes attribute: {hasattr(result, 'boxes')}")
                
                if hasattr(result, 'boxes'):
                    boxes = result.boxes
                    print(f"Boxes type: {type(boxes)}")
                    print(f"Boxes is None: {boxes is None}")
                    
                    if boxes is not None:
                        try:
                            print(f"Number of boxes: {len(boxes)}")
                            print(f"Boxes attributes: {dir(boxes)}")
                            
                            for j, box in enumerate(boxes):
                                print(f"\n--- Box {j} ---")
                                print(f"Type: {type(box)}")
                                print(f"Attributes: {dir(box)}")
                                
                                # Try to access common attributes
                                if hasattr(box, 'xyxy'):
                                    print(f"xyxy: {box.xyxy}")
                                if hasattr(box, 'conf'):
                                    print(f"conf: {box.conf}")
                                if hasattr(box, 'cls'):
                                    print(f"cls: {box.cls}")
                        except Exception as e:
                            print(f"Error accessing boxes: {e}")
                
                # Try to access other common attributes
                if hasattr(result, 'names'):
                    print(f"Names: {result.names}")
                if hasattr(result, 'orig_img'):
                    print(f"Has original image: {result.orig_img is not None}")
        
        print("\nResults structure debugging completed successfully")
        return True
    
    except Exception as e:
        print(f"ERROR during debugging: {e}")
        print("\nTraceback:")
        print(traceback.format_exc())
        return False

def main():
    parser = argparse.ArgumentParser(description='Debug YOLO model results structure')
    parser.add_argument('--model', default='best.pt', help='Path to the YOLO model file')
    parser.add_argument('--quiet', action='store_true', help='Suppress verbose output')
    
    args = parser.parse_args()
    
    success = debug_results(args.model, verbose=not args.quiet)
    
    if success:
        print("\nDebugging completed successfully!")
        sys.exit(0)
    else:
        print("\nDebugging failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()
