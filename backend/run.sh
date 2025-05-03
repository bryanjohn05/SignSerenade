#!/bin/bash
# Script to run the Flask backend on Render

# Set the model path environment variable
export MODEL_PATH=best.pt

# Use PORT from Render (Render sets this automatically)
export PORT=${PORT:-8000}

# Install dependencies
pip install -r requirements.txt

# Run the Flask app using Gunicorn (better for production)
exec gunicorn -w 4 -b 0.0.0.0:$PORT app:app
