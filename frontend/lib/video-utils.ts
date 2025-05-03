import { SIGN_ACTIONS } from "@/config/api-config"

// Map of words to their corresponding video files
const VIDEO_MAPPING: Record<string, string> = {
  // Basic mapping where the key is the word and the value is the filename
  // This will be expanded with more words and their corresponding videos
  "1": "/signs/1.mp4",
  "2": "/signs/2.mp4",
  "3": "/signs/3.mp4",
  "0": "/signs/0.mp4",
  "4": "/signs/4.mp4",
  "5": "/signs/5.mp4",
  "6": "/signs/6.mp4",
  "7": "/signs/7.mp4",
  "8": "/signs/8.mp4",
  "9": "/signs/9.mp4",
  A: "/signs/A.mp4",
  After: "/signs/After.mp4",
  Again: "/signs/Again.mp4",
  Against: "/signs/Against.mp4",
  Age: "/signs/Age.mp4",
  All: "/signs/All.mp4",
  Alone: "/signs/ALone.mp4",
  Also: "/signs/Also.mp4",
  And: "/signs/And.mp4",
  Are: "/signs/Are.mp4",
  Ask: "/signs/Ask.mp4",
  At: "/signs/At.mp4",
  B: "/signs/B.mp4",
  Be: "/signs/Be.mp4",
  Beautiful: "/signs/Beautiful.mp4",
  Before: "/signs/Before.mp4",
  Best: "/signs/Best.mp4",
  Better: "/signs/Better.mp4",
  Busy: "/signs/Busy.mp4",
  But: "/signs/But.mp4",
  Bye: "/signs/bye.mp4",
  C: "/signs/C.mp4",
  Can: "/signs/Can.mp4",
  Cannot: "/signs/Cannot.mp4",
  Change: "/signs/Change.mp4",
  College: "/signs/College.mp4",
  Come: "/signs/Come.mp4",
  Computer: "/signs/Computer.mp4",
  D: "/signs/D.mp4",
  Day: "/signs/Day.mp4",
  Distance: "/signs/Distance.mp4",
  Do: "/signs/Do.mp4",
  "Do Not": "/signs/Do Not.mp4",
  "Does Not": "/signs/Does Not.mp4",
  E: "/signs/E.mp4",
  Eat: "/signs/Eat.mp4",
  Engineer: "/signs/Engineer.mp4",
  F: "/signs/F.mp4",
  Fight: "/signs/Fight.mp4",
  Finish: "/signs/Finish.mp4",
  From: "/signs/From.mp4",
  G: "/signs/G.mp4",
  Glitter: "/signs/Glitter.mp4",
  Go: "/signs/Go.mp4",
  Going: "/signs/Go.mp4",
  God: "/signs/God.mp4",
  Gold: "/signs/Gold.mp4",
  Good: "/signs/Good.mp4",
  Great: "/signs/Great.mp4",
  H: "/signs/H.mp4",
  Hand: "/signs/Hand.mp4",
  Hands: "/signs/Hands.mp4",
  Happy: "/signs/Happy.mp4",
  Hello: "/signs/Hello.mp4",
  Help: "/signs/Help.mp4",
  Her: "/signs/Her.mp4",
  Here: "/signs/Here.mp4",
  Hi: "/signs/Hi.mp4",
  His: "/signs/His.mp4",
  Home: "/signs/Home.mp4",
  Homepage: "/signs/Homepage.mp4",
  How: "/signs/How.mp4",
  I: "/signs/I.mp4",
  Invent: "/signs/Invent.mp4",
  It: "/signs/It.mp4",
  J: "/signs/J.mp4",
  K: "/signs/K.mp4",
  Keep: "/signs/Keep.mp4",
  L: "/signs/L.mp4",
  Language: "/signs/Language.mp4",
  Laugh: "/signs/Laugh.mp4",
  Learn: "/signs/Learn.mp4",
  M: "/signs/M.mp4",
  Me: "/signs/ME.mp4",
  More: "/signs/More.mp4",
  My: "/signs/My.mp4",
  N: "/signs/N.mp4",
  Name: "/signs/Name.mp4",
  Need: "/signs/Need.mp4",
  Next: "/signs/Next.mp4",
  No: "/signs/No.mp4",
  Not: "/signs/Not.mp4",
  Now: "/signs/Now.mp4",
  O: "/signs/O.mp4",
  Of: "/signs/Of.mp4",
  On: "/signs/On.mp4",
  Our: "/signs/Our.mp4",
  Out: "/signs/Out.mp4",
  P: "/signs/P.mp4",
  Pretty: "/signs/Pretty.mp4",
  Q: "/signs/Q.mp4",
  R: "/signs/R.mp4",
  Right: "/signs/Right.mp4",
  S: "/signs/S.mp4",
  Sad: "/signs/Sad.mp4",
  Safe: "/signs/Safe.mp4",
  See: "/signs/See.mp4",
  Self: "/signs/Self.mp4",
  Sign: "/signs/Sign.mp4",
  Sing: "/signs/Sing.mp4",
  So: "/signs/So.mp4",
  Sound: "/signs/Sound.mp4",
  Stay: "/signs/Stay.mp4",
  Study: "/signs/Study.mp4",
  T: "/signs/T.mp4",
  Talk: "/signs/Talk.mp4",
  Television: "/signs/Television.mp4",
  Thank: "/signs/Thank.mp4",
  Thanks: "/signs/Thanks.mp4",
  That: "/signs/That.mp4",
  They: "/signs/They.mp4",
  This: "/signs/This.mp4",
  Those: "/signs/Those.mp4",
  Time: "/signs/Time.mp4",
  To: "/signs/to.mp4",
  Today: "/signs/Today.mp4",
  TV: "/signs/TV.mp4",
  Type: "/signs/Type.mp4",
  U: "/signs/U.mp4",
  Us: "/signs/Us.mp4",
  V: "/signs/V.mp4",
  W: "/signs/W.mp4",
  Walk: "/signs/Walk.mp4",
  Wash: "/signs/wash.mp4",
  Way: "/signs/Way.mp4",
  We: "/signs/We.mp4",
  Welcome: "/signs/Welcome.mp4",
  What: "/signs/What.mp4",
  When: "/signs/when.mp4",
  Where: "/signs/Where.mp4",
  Which: "/signs/Which.mp4",
  Who: "/signs/Who.mp4",
  Whole: "/signs/Whole.mp4",
  Whose: "/signs/Whose.mp4",
  Why: "/signs/Why.mp4",
  Will: "/signs/Will.mp4",
  With: "/signs/With.mp4",
  Without: "/signs/Without.mp4",
  Words: "/signs/Words.mp4",
  Work: "/signs/Work.mp4",
  World: "/signs/World.mp4",
  Wrong: "/signs/Wrong.mp4",
  X: "/signs/X.mp4",
  Y: "/signs/Y.mp4",
  You: "/signs/You.mp4",
  Your: "/signs/Your.mp4",
  Yourself: "/signs/Yourself.mp4",
  Z: "/signs/Z.mp4",
}

// Initialize the video mapping from the SIGN_ACTIONS array
SIGN_ACTIONS.forEach((action) => {
  VIDEO_MAPPING[action.toLowerCase()] = `${action.toLowerCase()}.mp4`
})

// Add common synonyms and variations
const SYNONYMS: Record<string, string> = {
  hi: "hello",
  hey: "hello",
  thanks: "thank",
  ty: "thank",
  fine: "good",
  "0": "0",
  "1": "1",
  "2": "2",
  "3": "3",
  "4": "4",
  "5": "5",
  "6": "6",
  "7": "7",
  "8": "8",
  "9": "9",
  a: "a",
  after: "after",
  again: "again",
  against: "against",
  age: "age",
  all: "all",
  alone: "aLone",
  also: "also",
  and: "and",
  are: "are",
  ask: "ask",
  at: "at",
  b: "b",
  be: "be",
  beautiful: "beautiful",
  before: "before",
  best: "best",
  better: "better",
  busy: "busy",
  but: "but",
  bye: "bye",
  c: "c",
  can: "can",
  cannot: "cannot",
  change: "change",
  college: "college",
  come: "come",
  computer: "computer",
  d: "d",
  day: "day",
  distance: "distance",
  do: "do",
  "do not": "do not",
  "does not": "does not",
  e: "e",
  eat: "eat",
  engineer: "engineer",
  f: "f",
  fight: "fight",
  finish: "finish",
  from: "from",
  g: "g",
  glitter: "glitter",
  go: "go",
  going: "go",
  god: "god",
  gold: "gold",
  good: "good",
  great: "great",
  h: "h",
  hand: "hand",
  hands: "hands",
  happy: "happy",
  hello: "hello",
  help: "help",
  her: "her",
  here: "here",
  his: "his",
  home: "home",
  homepage: "homepage",
  how: "how",
  i: "i",
  invent: "invent",
  it: "it",
  j: "j",
  k: "k",
  keep: "keep",
  l: "l",
  language: "language",
  laugh: "laugh",
  learn: "learn",
  m: "m",
  me: "mE",
  more: "more",
  my: "my",
  n: "n",
  name: "name",
  need: "need",
  next: "next",
  no: "no",
  not: "not",
  now: "now",
  o: "o",
  of: "of",
  on: "on",
  our: "our",
  out: "out",
  p: "p",
  pretty: "pretty",
  q: "q",
  r: "r",
  right: "right",
  s: "s",
  sad: "sad",
  safe: "safe",
  see: "see",
  self: "self",
  sign: "sign",
  sing: "sing",
  so: "so",
  sound: "sound",
  stay: "stay",
  study: "study",
  t: "t",
  talk: "talk",
  television: "television",
  thank: "thank",
  that: "that",
  they: "they",
  this: "this",
  those: "those",
  time: "time",
  to: "to",
  today: "today",
  tV: "tv",
  type: "type",
  u: "u",
  us: "us",
  v: "v",
  w: "W",
  walk: "walk",
  wash: "wash",
  way: "way",
  we: "we",
  welcome: "welcome",
  what: "what",
  when: "when",
  where: "where",
  which: "which",
  who: "who",
  whole: "whole",
  whose: "whose",
  why: "why",
  will: "will",
  with: "with",
  without: "without",
  words: "words",
  work: "work",
  world: "world",
  wrong: "wrong",
  x: "x",
  y: "y",
  you: "you",
  your: "your",
  yourself: "yourself",
  z: "z",
}

/**
 * Get the video path for a given word
 * @param word The word to get the video for
 * @returns The path to the video file or null if not found
 */
export function getSignVideoPath(word: string): string | null {
  // Clean the word (lowercase, remove punctuation)
  const cleanWord = word.toLowerCase().replace(/[^\w\s]/g, "")

  // Check if we have a direct mapping
  if (VIDEO_MAPPING[cleanWord]) {
    return `/signs/${VIDEO_MAPPING[cleanWord]}`
  }

  // Check if we have a synonym mapping
  if (SYNONYMS[cleanWord] && VIDEO_MAPPING[SYNONYMS[cleanWord]]) {
    return `/signs/${VIDEO_MAPPING[SYNONYMS[cleanWord]]}`
  }

  // No video found
  return null
}

/**
 * Convert text to a list of sign video paths
 * @param text The text to convert to sign videos
 * @returns Array of video paths
 */
export function textToSignVideos(text: string): string[] {
  // Split the text into words
  const words = text.split(/\s+/)

  // Get the video path for each word
  const videos = words.map((word) => getSignVideoPath(word)).filter(Boolean) as string[]

  return videos
}

/**
 * Check if a video file exists in the public directory
 * @param path The path to check
 * @returns Promise that resolves to true if the file exists
 */
export async function checkVideoExists(path: string): Promise<boolean> {
  try {
    const response = await fetch(path, { method: "HEAD" })
    return response.ok
  } catch (error) {
    return false
  }
}

/**
 * Get available sign videos
 * @returns Promise that resolves to an array of available sign videos
 */
export async function getAvailableSignVideos(): Promise<string[]> {
  const availableVideos: string[] = []

  for (const action of SIGN_ACTIONS) {
    const path = `/signs/${action.toLowerCase()}.mp4`
    if (await checkVideoExists(path)) {
      availableVideos.push(action)
    }
  }

  return availableVideos
}
