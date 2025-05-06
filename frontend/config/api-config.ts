export const SIGN_ACTIONS = [
  "0", "1", "2", "3",
  "4", "5", "6", "7", "8", "9", "a",
  "after", "again", "against", "age",
  "all", "alone", "aLone", "also",
  "and", "are", "ask", "at", "b",
  "be", "beautiful", "before", "best",
  "better", "busy", "but", "bye", "c",
  "can", "cannot", "change", "college",
  "come", "computer", "d", "day", "distance",
  "do", "do not", "does not", "e", "eat", "engineer",
  "f", "fight", "finish", "from", "g", "glitter",
  "go", "going", "god", "gold", "good", "great",
  "h", "hand", "hands", "happy", "hello",
  "help", "her", "here", "his", "home",
  "homepage", "how", "i", "invent", "it",
  "j", "k", "keep", "l", "language", "laugh",
  "learn", "m", "me", "more", "my", "n", "name",
  "need", "next", "no", "not", "now", "o",
  "of", "on", "our", "out", "p", "please", "pretty",
  "q", "r", "right", "s", "sad", "safe",
  "see", "self", "sign", "sing", "so", "sound",
  "stay", "study", "t", "talk", "television",
  "thank", "that", "they", "this", "those", "time",
  "to", "today", "tV", "tv", "type", "u","understand", "us", "v",
  "w", "walk", "wash", "way", "we", "welcome", "what",
  "when", "where", "which", "who", "whole", "whose",
  "why", "why", "will", "with", "without", "words",
  "work", "world", "wrong", "x", "y", "you", "your",
  "yourself", "z"
]

export const MODEL_SIGN_ACTIONS = [
  'Are','Can','Come','Dont','Going','Hello','Help','Here','How','I','Name',
  'Need','Please','Thanks','This','Today','Understand','What','Where','You','Your'
]

// Configuration for connecting to the Python backend
const getApiBaseUrl = () => {
  // First check localStorage for a custom URL (allows user configuration)
  if (typeof window !== "undefined") {
    const storedUrl = localStorage.getItem("backend_url")
    if (storedUrl) {
      return storedUrl
    }

    // If we're in the browser and no env var is set, use localhost:8000
    return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
  }

  // Server-side fallback
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
}

export const API_CONFIG = {
  // Use a function to get the base URL to ensure it's evaluated at runtime
  get baseUrl() {
    return getApiBaseUrl()
  },
  endpoints: {
    videoFeed: "/video_feed",
    classifyAction: "/classify_action",
    translate: "/translate",
    validate: "/validate",
    quiz: "/quiz",
    learn: "/learn",
    detect: "/detect",
    health: "/health", // Add explicit health endpoint
  },
  modelPath: "best.pt", // Path to the YOLO model
  modelVersion: "YOLOv11m", // Update to match your model version
}