FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the model and application code
COPY . .

# Set environment variables
ENV MODEL_PATH=best(4).pt
ENV PORT=3000

# Expose the port
EXPOSE 3000

# Run the application
CMD ["python", "app.py"]
