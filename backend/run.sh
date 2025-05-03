#!/bin/bash
# Script to run the Flask backend on port 8000

# Set the model path environment variable
export MODEL_PATH=best.pt
# Set the port
export PORT=8000

# Install dependencies if needed
pip install -r requirements.txt

# Run the Flask app
python app.py
