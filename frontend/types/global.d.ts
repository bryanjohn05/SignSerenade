interface Window {
    holistic: {
      Holistic: any
      FACEMESH_TESSELATION: any
      FACEMESH_FACE_OVAL: any
      FACEMESH_LIPS: any
      HAND_CONNECTIONS: any
    }
    drawingUtils: {
      drawConnectors: (ctx: CanvasRenderingContext2D, landmarks: any, connections: any, options: any) => void
      drawLandmarks: (ctx: CanvasRenderingContext2D, landmarks: any, options: any) => void
    }
    cameraUtils: {
      Camera: any
    }
  }
  