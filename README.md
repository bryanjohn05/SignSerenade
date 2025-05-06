# SignSerenade - Sign Language Learning Platform with YOLO Integration

A comprehensive sign language learning platform built with Next.js and Python, featuring YOLO model integration for sign detection.

## Features

- Sign language recognition using YOLO model
- Interactive learning tools
- Quiz system for testing knowledge
- Validation of sign language gestures
- Translation between text and sign language
- Real-time sign detection with bounding boxes

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Docker and Docker Compose (optional)

### Option 1: Running with Docker Compose

1. Place your YOLO model file (`best(4).pt`) in the `backend` directory
2. Run the application:
   \`\`\`bash
   docker-compose up
   \`\`\`
3. Access the frontend at http://localhost:3001

### Option 2: Manual Setup

#### Frontend Setup (Next.js)

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
2. Create a `.env.local` file with the following content:
   \`\`\`
   NEXT_PUBLIC_API_URL=http://localhost:3000
   \`\`\`
3. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

#### Backend Setup (Python)

1. Navigate to the backend directory:
   \`\`\`bash
   cd backend
   \`\`\`
2. Install Python dependencies:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`
3. Place your YOLO model file (`best(4).pt`) in the backend directory
4. Start the Flask server:
   \`\`\`bash
   python app.py
   \`\`\`

## Usage

- Visit `http://localhost:3001` to access the frontend
- The backend API is available at `http://localhost:3000`
- Go to the "Detection" page to see the YOLO model in action

## API Endpoints

- `/health` - Check if the model is loaded
- `/detect` - Detect signs in an image
- `/classify_action` - Classify sign language gestures
- `/video_feed` - Stream video from the camera
- `/translate` - Translate text to sign language videos
- `/validate` - Validate sign language gestures
- `/quiz` - Get quiz data for learning

## Technologies Used

- Next.js
- React
- Tailwind CSS
- Framer Motion
- Python
- Flask
- OpenCV
- PyTorch
- YOLO (You Only Look Once)
- Ultralytics
