# SignSerenade: Your Voice in Signs  
SignSerenade is a web application that bridges the communication gap between Deaf and hearing communities. It provides real-time sign language translation, speech/text-to-sign conversion, and an interactive learning module. By leveraging cutting-edge technologies like YOLOv11 and WLASL, the project aims to promote inclusivity and accessibility.  

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
1. **Speech-to-Sign Conversion**: Converts spoken words into sign language videos.  
2. **Sign-to-Text/Speech Conversion**: Recognizes signs and translates them into text or speech.  
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


##Future Scope
Expand support for regional sign languages.
Develop a mobile-friendly version.
Enhance real-time performance for faster translations.
Integrate AI for contextual translation accuracy.


Acknowledgments
We thank our mentors, peers, and everyone who supported us in building SignSerenade. Special thanks to the creators of YOLOv11, WLASL, and MediaPipe for their open-source tools.
