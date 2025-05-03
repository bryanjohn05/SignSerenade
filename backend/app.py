from flask import Flask, request, Response, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import torch
from ultralytics import YOLO
import base64
import os
import time
import logging
import io
import sys
import traceback
import threading

# Configure logging
logging.basicConfig(level=logging.DEBUG, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# YOLO Model Mapping
ACTION_NAMES = {
    0: 'Are', 1: 'Can', 2: 'Come', 3: 'Dont', 4: 'Going', 
    5: 'Hello', 6: 'Help', 7: 'Here', 8: 'How', 9: 'I', 
    10: 'Name', 11: 'Need', 12: 'Please', 13: 'Thanks', 
    14: 'This', 15: 'Today', 16: 'Understand', 17: 'What', 
    18: 'Where', 19: 'You', 20: 'Your'
}

app = Flask(__name__)
# Enable CORS for all routes and all origins
CORS(app, resources={r"/*": {"origins": "*"}})

# Global variables
model = None
model_path = os.environ.get('MODEL_PATH', 'best.pt')
model_loading = False
model_error = None

def load_model():
    """Load the YOLO model in a separate function for better error handling."""
    global model, model_loading, model_error
    
    if model_loading:
        return False, "Model is already loading"
    
    model_loading = True
    model_error = None
    
    try:
        logger.info(f"Loading model from {model_path}")
        
        if not os.path.exists(model_path):
            model_error = f"Model file not found at {model_path}"
            logger.error(model_error)
            model_loading = False
            return False, model_error
        
        # Load the model
        model = YOLO(model_path)
        
        # Verify the model is loaded correctly
        if model is None:
            model_error = "Model failed to initialize"
            logger.error(model_error)
            model_loading = False
            return False, model_error
        
        # Check if the model has names attribute
        if not hasattr(model, 'names') or not model.names:
            model_error = "Model loaded but has no class names"
            logger.error(model_error)
            model_loading = False
            return False, model_error
        
        logger.info(f"Successfully loaded model from {model_path}")
        logger.info(f"Model classes: {model.names}")
        
        # Run a simple inference to verify the model works
        test_img = np.zeros((640, 640, 3), dtype=np.uint8)
        try:
            _ = model(test_img)
            logger.info("Model successfully ran inference on test image")
        except Exception as e:
            model_error = f"Model loaded but failed on test inference: {str(e)}"
            logger.error(model_error)
            logger.error(traceback.format_exc())
            model_loading = False
            return False, model_error
        
        model_loading = False
        return True, "Model loaded successfully"
    
    except Exception as e:
        model_error = f"Error loading model: {str(e)}"
        logger.error(model_error)
        logger.error(traceback.format_exc())
        model_loading = False
        return False, model_error

# Try to load the model on startup
success, message = load_model()

@app.route('/', methods=['GET'])
def index():
    """Root endpoint to check if server is running."""
    global model, model_path, model_error
    
    return jsonify({
        "status": "Server is running", 
        "model_loaded": model is not None,
        "model_path": model_path,
        "model_exists": os.path.exists(model_path),
        "model_classes": model.names if model and hasattr(model, 'names') else None,
        "model_error": model_error
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint to check if the server is running and model is loaded."""
    global model, model_path, model_error, model_loading
    
    if model_loading:
        return jsonify({
            "status": "loading", 
            "model_loaded": False,
            "model_path": model_path,
            "message": "Model is currently loading"
        })
    
    if model is not None and hasattr(model, 'names'):
        return jsonify({
            "status": "healthy", 
            "model_loaded": True,
            "model_path": model_path,
            "model_classes": list(model.names.values()) if model.names else []
        })
    else:
        return jsonify({
            "status": "unhealthy", 
            "model_loaded": False,
            "model_path": model_path,
            "model_exists": os.path.exists(model_path),
            "error": model_error or "Model failed to load"
        }), 503

@app.route('/reload_model', methods=['POST'])
def reload_model():
    """Endpoint to reload the model."""
    global model_path
    
    # Check if a new model path is provided
    if request.json and 'model_path' in request.json:
        new_path = request.json['model_path']
        if os.path.exists(new_path):
            model_path = new_path
            logger.info(f"Updated model path to {model_path}")
        else:
            return jsonify({
                "success": False,
                "error": f"Model file not found at {new_path}"
            }), 400
    
    # Load the model in a separate thread to avoid blocking
    def load_model_thread():
        success, message = load_model()
        logger.info(f"Model reload {'succeeded' if success else 'failed'}: {message}")
    
    thread = threading.Thread(target=load_model_thread)
    thread.daemon = True
    thread.start()
    
    return jsonify({
        "success": True,
        "message": "Model reload initiated",
        "model_path": model_path
    })

@app.route('/detect', methods=['POST'])
def detect_signs():
    """Endpoint to detect signs from an image."""
    global model
    
    logger.info("Received detect request")
    
    if model is None:
        logger.error("Model not loaded")
        return jsonify({
            "error": "Model not loaded", 
            "model_path": model_path,
            "model_error": model_error
        }), 500
    
    try:
        # Log request details
        logger.debug(f"Request content type: {request.content_type}")
        logger.debug(f"Request has files: {len(request.files) > 0}")
        logger.debug(f"Request has JSON: {request.is_json}")
        
        # Get image from request
        img = None
        
        if 'image' in request.files:
            logger.debug("Processing image from files")
            file = request.files['image']
            logger.debug(f"Received file: {file.filename}, content type: {file.content_type}")
            
            # Read file data
            file_data = file.read()
            logger.debug(f"File data length: {len(file_data)} bytes")
            
            # Convert to numpy array
            nparr = np.frombuffer(file_data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                logger.error("Failed to decode image")
                return jsonify({"error": "Failed to decode image"}), 400
                
            logger.debug(f"Image shape: {img.shape}")
            
        elif request.is_json and 'image' in request.json:
            logger.debug("Processing image from JSON")
            image_data = request.json['image']
            
            # Check if it's a base64 string
            if isinstance(image_data, str):
                if ',' in image_data:
                    image_data = image_data.split(',')[1]
                try:
                    image_data = base64.b64decode(image_data)
                    nparr = np.frombuffer(image_data, np.uint8)
                    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                    logger.debug(f"Decoded base64 image, shape: {img.shape if img is not None else 'None'}")
                except Exception as e:
                    logger.error(f"Error decoding base64 image: {e}")
                    return jsonify({"error": f"Invalid base64 image: {str(e)}"}), 400
            else:
                logger.error("JSON image data is not a string")
                return jsonify({"error": "Invalid image format in JSON"}), 400
        else:
            logger.error("No image provided in request")
            return jsonify({"error": "No image provided"}), 400
        
        if img is None:
            logger.error("Failed to process image")
            return jsonify({"error": "Failed to process image"}), 400
            
        # Save the image for debugging (optional)
        debug_path = "debug_image.jpg"
        cv2.imwrite(debug_path, img)
        logger.debug(f"Saved debug image to {debug_path}")
        
        logger.info(f"Running inference on image with shape {img.shape}")
        
        # Run inference with explicit error handling
        try:
            # Convert to RGB for YOLO
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            results = model(img_rgb)
            
            if results is None:
                logger.error("Model returned None results")
                return jsonify({
                    "error": "Model returned None results",
                    "success": False
                }), 500
                
        except Exception as e:
            logger.error(f"Error during model inference: {e}")
            logger.error(traceback.format_exc())
            return jsonify({
                "error": f"Model inference failed: {str(e)}",
                "traceback": traceback.format_exc(),
                "success": False
            }), 500
        
        # Process results
        detections = []
        
        # Check if we have classification results
        if hasattr(results[0], 'probs') and results[0].probs is not None:
            # This is a classification model
            probs = results[0].probs.data.cpu().numpy()
            
            # Get top 5 predictions
            top_indices = probs.argsort()[-5:][::-1]
            
            for idx in top_indices:
                confidence = float(probs[idx])
                if confidence > 0.01:  # Only include predictions with >1% confidence
                    class_name = ACTION_NAMES.get(idx, f"unknown_{idx}")
                    detections.append({
                        "class_id": int(idx),
                        "class_name": class_name,
                        "confidence": confidence
                    })
            
            logger.info(f"Classification detected {len(detections)} classes")
            return jsonify({
                "success": True,
                "detections": detections,
                "timestamp": time.time()
            })
        
        # If not classification, try object detection results
        # Verify results structure
        if not hasattr(results, '__iter__'):
            logger.error(f"Results is not iterable: {type(results)}")
            return jsonify({
                "error": f"Invalid results format: {type(results)}",
                "success": False
            }), 500
            
        for i, result in enumerate(results):
            if not hasattr(result, 'boxes'):
                logger.error(f"Result {i+1} has no boxes attribute")
                continue
                
            boxes = result.boxes
            
            # Check if boxes is None or empty
            if boxes is None:
                logger.warning(f"Boxes is None for result {i+1}")
                continue
                
            # Try to get the length to verify it's iterable
            try:
                num_boxes = len(boxes)
                logger.debug(f"Found {num_boxes} boxes in result {i+1}")
            except TypeError:
                logger.error(f"Boxes is not iterable in result {i+1}")
                continue
                
            if num_boxes == 0:
                logger.debug(f"No detections in result {i+1}")
                continue
                
            for j, box in enumerate(boxes):
                try:
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    confidence = float(box.conf[0])
                    class_id = int(box.cls[0])
                    
                    # Safely get class name
                    if class_id in result.names:
                        class_name = result.names[class_id]
                    else:
                        logger.warning(f"Class ID {class_id} not found in names dictionary")
                        class_name = f"unknown_{class_id}"
                    
                    logger.debug(f"Detection {j+1}: {class_name} ({confidence:.2f}) at [{x1:.1f}, {y1:.1f}, {x2:.1f}, {y2:.1f}]")
                    
                    detections.append({
                        "class_id": class_id,
                        "class_name": class_name,
                        "confidence": confidence,
                        "bbox": [x1, y1, x2, y2]
                    })
                except Exception as e:
                    logger.error(f"Error processing box {j+1}: {e}")
                    continue
        
        logger.info(f"Detected {len(detections)} objects")
        return jsonify({
            "success": True,
            "detections": detections,
            "timestamp": time.time()
        })
    
    except Exception as e:
        logger.error(f"Error during detection: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "error": str(e),
            "traceback": traceback.format_exc(),
            "success": False
        }), 500

@app.route('/model_info', methods=['GET'])
def model_info():
    """Endpoint to get information about the loaded model."""
    global model, model_path, model_error, model_loading
    
    if model_loading:
        return jsonify({
            "loaded": False,
            "loading": True,
            "model_path": model_path,
            "message": "Model is currently loading"
        })
    
    if model is None:
        return jsonify({
            "loaded": False,
            "model_path": model_path,
            "model_exists": os.path.exists(model_path),
            "error": model_error or "Model not loaded"
        })
    
    try:
        # Check if model has necessary attributes
        has_names = hasattr(model, 'names') and model.names
        
        return jsonify({
            "loaded": True,
            "model_path": model_path,
            "model_type": type(model).__name__,
            "model_classes": model.names if has_names else {},
            "num_classes": len(model.names) if has_names else 0,
            "class_names": list(model.names.values()) if has_names else [],
            "pytorch_version": torch.__version__,
            "ultralytics_available": True
        })
    except Exception as e:
        logger.error(f"Error getting model info: {e}")
        return jsonify({
            "loaded": True,
            "model_path": model_path,
            "error": str(e)
        })

@app.route('/test_detect', methods=['GET'])
def test_detect():
    """Endpoint to test detection with a simple image."""
    global model
    
    if model is None:
        return jsonify({
            "error": "Model not loaded",
            "model_path": model_path,
            "model_error": model_error
        }), 500
    
    try:
        # Create a simple test image (black image with a white square)
        img = np.zeros((640, 640, 3), dtype=np.uint8)
        cv2.rectangle(img, (100, 100), (300, 300), (255, 255, 255), -1)
        
        # Save the test image for debugging
        cv2.imwrite("test_detect_image.jpg", img)
        
        logger.info("Running inference on test image")
        
        # Run inference with explicit error handling
        try:
            results = model(img)
            
            if results is None:
                logger.error("Model returned None results")
                return jsonify({
                    "error": "Model returned None results",
                    "success": False
                }), 500
                
        except Exception as e:
            logger.error(f"Error during model inference: {e}")
            logger.error(traceback.format_exc())
            return jsonify({
                "error": f"Model inference failed: {str(e)}",
                "traceback": traceback.format_exc(),
                "success": False
            }), 500
        
        # Process results
        detections = []
        
        # Verify results structure
        if not hasattr(results, '__iter__'):
            logger.error(f"Results is not iterable: {type(results)}")
            return jsonify({
                "error": f"Invalid results format: {type(results)}",
                "success": False
            }), 500
            
        for result in results:
            if not hasattr(result, 'boxes'):
                logger.error("Result has no boxes attribute")
                continue
                
            boxes = result.boxes
            
            # Check if boxes is None or empty
            if boxes is None:
                logger.warning("Boxes is None for this result")
                continue
                
            # Try to get the length to verify it's iterable
            try:
                num_boxes = len(boxes)
                logger.debug(f"Found {num_boxes} boxes")
            except TypeError:
                logger.error("Boxes is not iterable")
                continue
                
            if num_boxes == 0:
                logger.debug("No detections in this result")
                continue
                
            for box in boxes:
                try:
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    confidence = float(box.conf[0])
                    class_id = int(box.cls[0])
                    
                    # Safely get class name
                    if class_id in result.names:
                        class_name = result.names[class_id]
                    else:
                        logger.warning(f"Class ID {class_id} not found in names dictionary")
                        class_name = f"unknown_{class_id}"
                    
                    detections.append({
                        "class_id": class_id,
                        "class_name": class_name,
                        "confidence": confidence,
                        "bbox": [x1, y1, x2, y2]
                    })
                except Exception as e:
                    logger.error(f"Error processing box: {e}")
                    continue
        
        # Even if no detections, return success
        return jsonify({
            "success": True,
            "detections": detections,
            "message": "Test detection completed successfully",
            "model_info": {
                "type": type(model).__name__,
                "has_names": hasattr(model, 'names'),
                "num_classes": len(model.names) if hasattr(model, 'names') else 0
            }
        })
    
    except Exception as e:
        logger.error(f"Error during test detection: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "error": str(e),
            "traceback": traceback.format_exc(),
            "success": False
        }), 500

@app.route('/model_version', methods=['GET'])
def model_version():
    """Endpoint to get version information."""
    return jsonify({
        "pytorch_version": torch.__version__,
        "opencv_version": cv2.__version__,
        "ultralytics_available": True,
        "python_version": sys.version,
        "server_time": time.strftime("%Y-%m-%d %H:%M:%S")
    })

@app.route('/debug_model', methods=['POST'])
def debug_model():
    """Endpoint to debug model results structure."""
    global model
    
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500
    
    try:
        # Create a simple test image
        img = np.zeros((640, 640, 3), dtype=np.uint8)
        cv2.rectangle(img, (100, 100), (300, 300), (255, 255, 255), -1)
        
        # Run inference
        results = model(img)
        
        # Collect debug info
        debug_info = {
            "results_type": str(type(results)),
            "results_dir": str(dir(results)),
            "is_iterable": hasattr(results, '__iter__'),
            "items": []
        }
        
        if hasattr(results, '__iter__'):
            for i, result in enumerate(results):
                item_info = {
                    "index": i,
                    "type": str(type(result)),
                    "dir": str(dir(result)),
                    "has_boxes": hasattr(result, 'boxes'),
                }
                
                if hasattr(result, 'boxes'):
                    boxes = result.boxes
                    item_info["boxes_type"] = str(type(boxes))
                    item_info["boxes_is_none"] = boxes is None
                    
                    if boxes is not None:
                        try:
                            item_info["boxes_len"] = len(boxes)
                            item_info["boxes_dir"] = str(dir(boxes))
                        except Exception as e:
                            item_info["boxes_error"] = str(e)
                
                debug_info["items"].append(item_info)
        
        return jsonify({
            "success": True,
            "debug_info": debug_info
        })
    
    except Exception as e:
        logger.error(f"Error during model debugging: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "error": str(e),
            "traceback": traceback.format_exc(),
            "success": False
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    logger.info(f"Starting server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
