"""
Script to diagnose issues with YOLO model loading.
This script checks for common problems and provides suggestions.
"""

import os
import sys
import argparse
import traceback
import platform
import shutil
import subprocess

def check_python_version():
    """Check if Python version is compatible with YOLO."""
    print(f"Python version: {platform.python_version()}")
    major, minor, _ = platform.python_version_tuple()
    
    if int(major) < 3 or (int(major) == 3 and int(minor) < 8):
        print("WARNING: Python version is below 3.8, which may cause issues with YOLO")
        print("Recommendation: Use Python 3.8 or higher")
        return False
    
    return True

def check_dependencies():
    """Check if required dependencies are installed."""
    dependencies = {
        "torch": "PyTorch",
        "ultralytics": "Ultralytics",
        "opencv-python": "OpenCV",
        "numpy": "NumPy"
    }
    
    missing = []
    versions = {}
    
    for package, name in dependencies.items():
        try:
            if package == "opencv-python":
                import cv2
                versions[name] = cv2.__version__
            elif package == "torch":
                import torch
                versions[name] = torch.__version__
            elif package == "ultralytics":
                import ultralytics
                versions[name] = getattr(ultralytics, "__version__", "Unknown")
            elif package == "numpy":
                import numpy
                versions[name] = numpy.__version__
        except ImportError:
            missing.append(package)
    
    if missing:
        print(f"ERROR: Missing dependencies: {', '.join(missing)}")
        print("Install them with:")
        print(f"pip install {' '.join(missing)}")
        return False
    
    print("Installed dependencies:")
    for name, version in versions.items():
        print(f"  {name}: {version}")
    
    return True

def check_cuda():
    """Check if CUDA is available for PyTorch."""
    try:
        import torch
        
        cuda_available = torch.cuda.is_available()
        print(f"CUDA available: {cuda_available}")
        
        if cuda_available:
            print(f"CUDA version: {torch.version.cuda}")
            print(f"Number of CUDA devices: {torch.cuda.device_count()}")
            for i in range(torch.cuda.device_count()):
                print(f"  Device {i}: {torch.cuda.get_device_name(i)}")
        else:
            print("WARNING: CUDA is not available. Model will run on CPU, which may be slow.")
            print("Recommendation: Install CUDA if you have an NVIDIA GPU")
        
        return True
    except Exception as e:
        print(f"ERROR checking CUDA: {e}")
        return False

def check_model_file(model_path):
    """Check if the model file exists and has the correct format."""
    if not os.path.exists(model_path):
        print(f"ERROR: Model file not found at {model_path}")
        return False
    
    file_size = os.path.getsize(model_path) / (1024 * 1024)  # Size in MB
    print(f"Model file size: {file_size:.2f} MB")
    
    if file_size < 1:
        print("WARNING: Model file is very small, it might be corrupted or incomplete")
        return False
    
    # Check file extension
    _, ext = os.path.splitext(model_path)
    if ext.lower() not in ['.pt', '.pth', '.weights', '.onnx']:
        print(f"WARNING: Unusual file extension '{ext}'. Expected .pt, .pth, .weights, or .onnx")
    
    return True

def try_load_model(model_path):
    """Try to load the model and catch any exceptions."""
    try:
        from ultralytics import YOLO
        
        print(f"Attempting to load model from {model_path}...")
        model = YOLO(model_path)
        
        if not hasattr(model, 'names') or not model.names:
            print("ERROR: Model loaded but has no class names")
            return False
        
        print(f"Model loaded successfully with {len(model.names)} classes:")
        for idx, name in model.names.items():
            print(f"  Class {idx}: {name}")
        
        return True
    except Exception as e:
        print(f"ERROR loading model: {e}")
        print("\nTraceback:")
        print(traceback.format_exc())
        return False

def check_permissions(model_path):
    """Check if the model file has read permissions."""
    if not os.path.exists(model_path):
        return False
    
    try:
        # Try to open the file for reading
        with open(model_path, 'rb') as f:
            # Read a small chunk to verify
            _ = f.read(1024)
        return True
    except PermissionError:
        print(f"ERROR: Permission denied when trying to read {model_path}")
        print("Recommendation: Check file permissions")
        return False
    except Exception as e:
        print(f"ERROR reading model file: {e}")
        return False

def check_disk_space():
    """Check if there's enough disk space."""
    try:
        total, used, free = shutil.disk_usage('/')
        free_gb = free / (1024 * 1024 * 1024)  # Convert to GB
        
        print(f"Free disk space: {free_gb:.2f} GB")
        
        if free_gb < 1:
            print("WARNING: Low disk space. This might cause issues when loading models")
            print("Recommendation: Free up at least 1 GB of disk space")
            return False
        
        return True
    except Exception as e:
        print(f"ERROR checking disk space: {e}")
        return True  # Continue anyway

def check_memory():
    """Check available system memory."""
    try:
        import psutil
        
        vm = psutil.virtual_memory()
        available_gb = vm.available / (1024 * 1024 * 1024)  # Convert to GB
        
        print(f"Available memory: {available_gb:.2f} GB")
        
        if available_gb < 2:
            print("WARNING: Low available memory. This might cause issues when loading large models")
            print("Recommendation: Close other applications to free up memory")
            return False
        
        return True
    except ImportError:
        print("INFO: psutil not installed, skipping memory check")
        print("Install with: pip install psutil")
        return True  # Continue anyway
    except Exception as e:
        print(f"ERROR checking memory: {e}")
        return True  # Continue anyway

def main():
    parser = argparse.ArgumentParser(description='Diagnose YOLO model loading issues')
    parser.add_argument('--model', default='best(4).pt', help='Path to the YOLO model file')
    
    args = parser.parse_args()
    
    print("=== YOLO Model Diagnostics ===\n")
    
    # System checks
    print("=== System Checks ===")
    check_python_version()
    check_dependencies()
    check_cuda()
    check_disk_space()
    check_memory()
    print()
    
    # Model file checks
    print("=== Model File Checks ===")
    if check_model_file(args.model) and check_permissions(args.model):
        # Try to load the model
        print("\n=== Model Loading Test ===")
        success = try_load_model(args.model)
        
        if success:
            print("\nDIAGNOSIS: Model loaded successfully!")
            print("If you're still having issues with your application, the problem might be elsewhere.")
        else:
            print("\nDIAGNOSIS: Failed to load the model.")
            print("Check the error messages above for more information.")
    else:
        print("\nDIAGNOSIS: Issues with the model file.")
        print("Fix the issues mentioned above before trying to load the model.")
    
    print("\n=== End of Diagnostics ===")

if __name__ == "__main__":
    main()
