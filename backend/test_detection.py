import requests
import base64
import cv2
import numpy as np
import argparse
import json
import os

def test_health(url):
    """Test the health endpoint."""
    try:
        response = requests.get(f"{url}/health", timeout=5)
        print(f"Health check status code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.json()
    except Exception as e:
        print(f"Error checking health: {e}")
        return None

def test_model_info(url):
    """Test the model_info endpoint."""
    try:
        response = requests.get(f"{url}/model_info", timeout=5)
        print(f"Model info status code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.json()
    except Exception as e:
        print(f"Error getting model info: {e}")
        return None

def test_detection_with_file(url, image_path):
    """Test the detect endpoint with a file."""
    try:
        with open(image_path, 'rb') as f:
            files = {'image': (os.path.basename(image_path), f, 'image/jpeg')}
            response = requests.post(f"{url}/detect", files=files, timeout=30)
        
        print(f"Detection status code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.json()
    except Exception as e:
        print(f"Error testing detection with file: {e}")
        return None

def test_detection_with_base64(url, image_path):
    """Test the detect endpoint with base64 encoded image."""
    try:
        with open(image_path, 'rb') as f:
            image_data = f.read()
        
        base64_data = base64.b64encode(image_data).decode('utf-8')
        payload = {'image': f"data:image/jpeg;base64,{base64_data}"}
        
        response = requests.post(
            f"{url}/detect", 
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        print(f"Detection status code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.json()
    except Exception as e:
        print(f"Error testing detection with base64: {e}")
        return None

def create_test_image(output_path="test_image.jpg"):
    """Create a simple test image."""
    # Create a black image with a white rectangle
    img = np.zeros((640, 640, 3), dtype=np.uint8)
    cv2.rectangle(img, (100, 100), (300, 300), (255, 255, 255), -1)
    
    # Save the image
    cv2.imwrite(output_path, img)
    print(f"Created test image at {output_path}")
    return output_path

def main():
    parser = argparse.ArgumentParser(description='Test YOLO detection backend')
    parser.add_argument('--url', default='http://localhost:8000', help='Backend URL')
    parser.add_argument('--image', help='Path to test image')
    parser.add_argument('--create-image', action='store_true', help='Create a test image')
    parser.add_argument('--method', choices=['file', 'base64'], default='file', help='Method to send image')
    
    args = parser.parse_args()
    
    # Test health endpoint
    print("\n=== Testing Health Endpoint ===")
    test_health(args.url)
    
    # Test model info endpoint
    print("\n=== Testing Model Info Endpoint ===")
    test_model_info(args.url)
    
    # Create or use test image
    image_path = args.image
    if args.create_image or not image_path:
        image_path = create_test_image()
    
    # Test detection endpoint
    print(f"\n=== Testing Detection Endpoint with {args.method} method ===")
    if args.method == 'file':
        test_detection_with_file(args.url, image_path)
    else:
        test_detection_with_base64(args.url, image_path)
    
    # Test the test_detect endpoint
    print("\n=== Testing Test Detection Endpoint ===")
    try:
        response = requests.get(f"{args.url}/test_detect", timeout=30)
        print(f"Test detection status code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error testing test_detect endpoint: {e}")

if __name__ == "__main__":
    main()
