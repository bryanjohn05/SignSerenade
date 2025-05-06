import { SIGN_ACTIONS } from "@/config/api-config"
 
// 1) Map of words to their corresponding video filenames (exact case)
const VIDEO_MAPPING: Record<string, string> = {
  // digits
  "0": "0.mp4",
  "1": "1.mp4",
  "2": "2.mp4",
  "3": "3.mp4",
  "4": "4.mp4",
  "5": "5.mp4",
  "6": "6.mp4",
  "7": "7.mp4",
  "8": "8.mp4",
  "9": "9.mp4",
  A: "A.mp4",
  After: "After.mp4",
  Again: "Again.mp4",
  Against: "Against.mp4",
  Age: "Age.mp4",
  All: "All.mp4",
  Alone: "ALone.mp4",
  Also: "Also.mp4",
  And: "And.mp4",
  Are: "Are.mp4",
  Ask: "Ask.mp4",
  At: "At.mp4",
  B: "B.mp4",
  Be: "Be.mp4",
  Beautiful: "Beautiful.mp4",
  Before: "Before.mp4",
  Best: "Best.mp4",
  Better: "Better.mp4",
  Busy: "Busy.mp4",
  But: "But.mp4",
  Bye: "bye.mp4",
  C: "C.mp4",
  Can: "Can.mp4",
  Cannot: "Cannot.mp4",
  Change: "Change.mp4",
  College: "College.mp4",
  Come: "Come.mp4",
  Computer: "Computer.mp4",
  D: "D.mp4",
  Day: "Day.mp4",
  Distance: "Distance.mp4",
  Do: "Do.mp4",
  "Do Not": "DoesNot.mp4",
  "Does Not": "DoesNot.mp4",
  E: "E.mp4",
  Eat: "Eat.mp4",
  Engineer: "Engineer.mp4",
  F: "F.mp4",
  Fight: "Fight.mp4",
  Finish: "Finish.mp4",
  From: "From.mp4",
  G: "G.mp4",
  Glitter: "Glitter.mp4",
  Go: "Go.mp4",
  Going: "Go.mp4",
  God: "God.mp4",
  Gold: "Gold.mp4",
  Good: "Good.mp4",
  Great: "Great.mp4",
  H: "H.mp4",
  Hand: "Hand.mp4",
  Hands: "Hands.mp4",
  Happy: "Happy.mp4",
  Hello: "Hello.mp4",
  Help: "Help.mp4",
  Her: "Her.mp4",
  Here: "Here.mp4",
  Hi: "Hi.mp4",
  His: "His.mp4",
  Home: "Home.mp4",
  Homepage: "Homepage.mp4",
  How: "How.mp4",
  I: "I.mp4",
  Invent: "Invent.mp4",
  It: "It.mp4",
  J: "J.mp4",
  K: "K.mp4",
  Keep: "Keep.mp4",
  L: "L.mp4",
  Language: "Language.mp4",
  Laugh: "Laugh.mp4",
  Learn: "Learn.mp4",
  M: "M.mp4",
  Me: "ME.mp4",
  More: "More.mp4",
  My: "My.mp4",
  N: "N.mp4",
  Name: "Name.mp4",
  Need: "Need.mp4",
  Next: "Next.mp4",
  No: "No.mp4",
  Not: "Not.mp4",
  Now: "Now.mp4",
  O: "O.mp4",
  Of: "Of.mp4",
  On: "On.mp4",
  Our: "Our.mp4",
  Out: "Out.mp4",
  P: "P.mp4",
  Please: "Please.mp4",
  Pretty: "Pretty.mp4",
  Q: "Q.mp4",
  R: "R.mp4",
  Right: "Right.mp4",
  S: "S.mp4",
  Sad: "Sad.mp4",
  Safe: "Safe.mp4",
  See: "See.mp4",
  Self: "Self.mp4",
  Sign: "Sign.mp4",
  Sing: "Sing.mp4",
  So: "So.mp4",
  Sound: "Sound.mp4",
  Stay: "Stay.mp4",
  Study: "Study.mp4",
  T: "T.mp4",
  Talk: "Talk.mp4",
  Television: "Television.mp4",
  Thank: "Thank.mp4",
  Thanks: "Thanks.mp4",
  That: "That.mp4",
  They: "They.mp4",
  This: "This.mp4",
  Those: "Those.mp4",
  Time: "Time.mp4",
  To: "To.mp4",
  Today: "Today.mp4",
  TV: "TV.mp4",
  Type: "Type.mp4",
  U: "U.mp4",
  Understand: "Understand.mp4",
  Us: "Us.mp4",
  V: "V.mp4",
  W: "W.mp4",
  Walk: "Walk.mp4",
  Wash: "wash.mp4",
  Way: "Way.mp4",
  We: "We.mp4",
  Welcome: "Welcome.mp4",
  What: "What.mp4",
  When: "When.mp4",
  Where: "Where.mp4",
  Which: "Which.mp4",
  Who: "Who.mp4",
  Whole: "Whole.mp4",
  Whose: "Whose.mp4",
  Why: "Why.mp4",
  Will: "Will.mp4",
  With: "With.mp4",
  Without: "Without.mp4",
  Words: "Words.mp4",
  Work: "Work.mp4",
  World: "World.mp4",
  Wrong: "Wrong.mp4",
  X: "X.mp4",
  Y: "Y.mp4",
  You: "You.mp4",
  Your: "Your.mp4",
  Yourself: "Yourself.mp4",
  Z: "Z.mp4",
}
 
// 2) Build a normalized lookup that maps *all* keys → correct filename
const NORMALIZED: Record<string, string> = {}
Object.entries(VIDEO_MAPPING).forEach(([key, filename]) => {
  NORMALIZED[key] = filename                // preserve original casing
  NORMALIZED[key.toLowerCase()] = filename // allow lowercase lookup
})
 
// 3) Common synonyms pointing to normalized keys
const SYNONYMS: Record<string, string> = {
  hi: "hello",
  hey: "hello",
  thanks: "thank",
  ty: "thank",
  fine: "good",
  // add more if needed
}
 
/**
 * Return the video path for a given word
 */
export function getSignVideoPath(word: string): string | null {
  const clean = word.toLowerCase().replace(/[^\w\s]/g, "")
  let filename = NORMALIZED[clean]
  if (!filename && SYNONYMS[clean]) {
    filename = NORMALIZED[SYNONYMS[clean].toLowerCase()]
  }
  return filename ? `/signs/${filename}` : null
}
 
/**
 * Convert text to a list of sign video paths
 */
export function textToSignVideos(text: string): string[] {
  return text
    .split(/\s+/)
    .map((w) => getSignVideoPath(w))
    .filter((x): x is string => Boolean(x))
}
/**
 * Check if a video file exists in the public directory
 */
export async function checkVideoExists(path: string): Promise<boolean> {
  try {
    const res = await fetch(path, { method: "HEAD" })
    return res.ok
  } catch {
    return false
  }
}
 
/**
 * Get available sign videos based on SIGN_ACTIONS
 */
export async function getAvailableSignVideos(): Promise<string[]> {
  const list: string[] = []
  for (const action of SIGN_ACTIONS) {
    const path = getSignVideoPath(action)
    if (path && (await checkVideoExists(path))) {
      list.push(action)
    }
  }
  return list
}
 