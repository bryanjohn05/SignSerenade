# SignSerenade: Your Voice in Signs  (In Development)
SignSerenade is a web application designed to bridge communication barriers between Deaf and hearing communities. It features text-to-sign conversion using ASL videos and an interactive learning module that provides real-time feedback on sign language practice. The project utilizes a custom dataset and WLASL, combined with advanced models like YOLOv11m, to deliver accurate and efficient results. SignSerenade promotes inclusivity by enabling seamless sign language translation and personalized learning experiences. 

---
Team Members:

Member 1
Bryan Sohan John

Member 2
Manasa Shereen Dcosta

Member 3
Maxon Fernandes

Member 4
Sanchia Lara Dsouza

---

## Features  
1. **Text-to-Sign Conversion**: Converts words into sign language videos.  
2. **Sign-to-Text Conversion**: Recognizes signs and translates them into text.  
3. **Interactive Learning Module**: Teaches sign language using engaging activities and real-time feedback.  
4. **Custom Dataset**: Utilizes MediaPipe Holistic for capturing hand and face landmarks for training YOLOv11.  

---

## Technology Stack  
- **Frontend**: HTML, CSS, JavaScript  
- **Backend**: Flask, Python  
- **Machine Learning**: YOLOv11m, WLASL Dataset  
- **Other Tools**: MediaPipe Holistic, OpenCV  

---

## Dataset  
1. **Custom Dataset**: Contains images of face and hand landmarks captured on a black background for YOLOv11m training.  
2. **WLASL Dataset**: Used for mapping text input to corresponding ASL videos.  

---

## How to Run the Project  
1. Clone the repository:  
   ```bash
   git clone https://github.com/YourUsername/SignSerenade.git
   cd SignSerenade
2. Install dependencies:
  pip install -r requirements.txt
3. Run the Flask app:
  python app.py


## Future Scope
Expand support for regional sign languages.
Develop a mobile-friendly version.
Enhance real-time performance for faster translations.
Integrate AI for contextual translation accuracy.


Acknowledgments
We thank our mentors, peers, and everyone who supported us in building SignSerenade. Special thanks to the creators of YOLOv11, WLASL, and MediaPipe for their open-source tools.
