# Backend Troubleshooting Guide

## Common Issues and Solutions

### 1. Model Not Loading

If you see an error like "Error loading model" or "Model not loaded":

- Make sure the `best(4).pt` file exists in the backend directory
- Check that you have enough RAM to load the model
- Try running the `test_model.py` script to isolate model loading issues

### 2. CORS Issues

If you see CORS errors in your browser console:

- Make sure the Flask backend has CORS properly configured
- Check that the frontend is sending requests to the correct URL
- Try using a browser extension to temporarily disable CORS for testing

### 3. Connection Refused

If you see "Connection refused" errors:

- Make sure the Flask backend is running on port 8000
- Check if another process is using port 8000
- Try running `lsof -i :8000` to see if the port is in use

### 4. Model Inference Issues

If the model loads but inference fails:

- Check the input image format
- Make sure the model is compatible with the version of ultralytics you're using
- Try running inference with a simple test image

### 5. Environment Setup

If you're having issues with dependencies:

- Create a fresh virtual environment: `python -m venv venv`
- Activate it: `source venv/bin/activate` (Linux/Mac) or `venv\Scripts\activate` (Windows)
- Install dependencies: `pip install -r requirements.txt`

## Debugging Tips

1. Check the Flask logs for detailed error messages
2. Use `print()` statements or logging to track the flow of execution
3. Test API endpoints with tools like Postman or curl
4. Make sure your model file is in the correct location
5. Verify that your Python environment has all the required dependencies
