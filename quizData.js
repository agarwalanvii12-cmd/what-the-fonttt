// ============================================================
// quizData.js
// EDIT THIS FILE to change fonts, questions and scoring.
// The sketch reads everything from here.
// ============================================================

// ---------- FONT TYPES (the personality results) ----------
// key       : short id used in scoring
// name      : display name
// family    : font family name (used on the canvas)
// css       : CSS font-family value (used on the page)
// label     : the personality title
// axes      : variable font axes for the "tweak your type" sliders
// fallback  : pre-written reading shown if the AI is unavailable
const FONTS = {
  serif: {
    name: "Fraunces",
    family: "Fraunces",
    css: "'Fraunces', serif",
    label: "The Romantic",
    axes: [
      { tag: "wght", name: "Weight", min: 100, max: 900, default: 500 },
      { tag: "opsz", name: "Optical size", min: 9, max: 144, default: 72 }
    ],
    fallback: {
      headline: "All curves, no shortcuts",
      description: "You feel things with serifs on. You take the long way, reread the good parts and notice the details everyone else skims past. Like Fraunces, you are a little old-fashioned in the best way, and you get softer and warmer the bigger the moment gets.",
      tweakTip: "Push Optical size up and watch the letters get more expressive, just like you in a good conversation."
    }
  },

  sans: {
    name: "Inter",
    family: "Inter",
    css: "'Inter', sans-serif",
    label: "The Minimalist",
    axes: [
      { tag: "wght", name: "Weight", min: 100, max: 900, default: 400 }
    ],
    fallback: {
      headline: "Clean lines, clear head",
      description: "You are the friend whose room is always tidy and whose texts never need a follow-up. No decoration, no drama, just perfect spacing. Like Inter, you work everywhere, read clearly at any size and make everything around you look more organised.",
      tweakTip: "Drag Weight from thin to black to see how much quiet confidence you are hiding."
    }
  },

  mono: {
    name: "JetBrains Mono",
    family: "JetBrains Mono",
    css: "'JetBrains Mono', monospace",
    label: "The Logician",
    axes: [
      { tag: "wght", name: "Weight", min: 100, max: 800, default: 400 }
    ],
    fallback: {
      headline: "Every character gets equal space",
      description: "You like systems that make sense and you will happily debug anything, from code to group plans. Fair, precise and slightly nerdy, you give every idea the same width before judging it. Like a monospace font, you line things up so nothing gets lost.",
      tweakTip: "Try a light Weight for your calm problem-solving mode, then a heavy one for when the deadline hits."
    }
  },

  script: {
    name: "Caveat",
    family: "Caveat",
    css: "'Caveat', cursive",
    label: "The Free Spirit",
    axes: [
      { tag: "wght", name: "Weight", min: 400, max: 700, default: 500 }
    ],
    fallback: {
      headline: "Handwritten, never templated",
      description: "Your notes have doodles in the margins and your plans change mid-sentence. You are spontaneous, warm and impossible to copy exactly. Like Caveat, you look like you were written by a real hand in a hurry, and that is exactly why people remember you.",
      tweakTip: "Bump the Weight up to see your loud, confident marker-pen era."
    }
  }
};

// Tie-break order: if two fonts score the same, the earlier one wins.
// This keeps results consistent for the same answers.
const FONT_ORDER = ["serif", "sans", "mono", "script"];


// ---------- QUESTIONS ----------
// type "choice": each option adds points to one or more fonts
// type "slider": the value falls into a band, each band adds points
const QUESTIONS = [
  {
    id: "saturday",
    type: "choice",
    text: "It's a free Saturday. You...",
    options: [
      { label: "Reread a favourite book in a cafe", scores: { serif: 2 } },
      { label: "Reset your room until it's perfect", scores: { sans: 2 } },
      { label: "Finally solve that puzzle bugging you", scores: { mono: 2 } },
      { label: "Say yes to whatever plan shows up", scores: { script: 2 } }
    ]
  },
  {
    id: "notes",
    type: "choice",
    text: "Your notes app looks like...",
    options: [
      { label: "Long, thoughtful paragraphs", scores: { serif: 2, script: 1 } },
      { label: "Neat checklists, nothing extra", scores: { sans: 2, mono: 1 } },
      { label: "Numbered lists and code snippets", scores: { mono: 2 } },
      { label: "Voice notes, doodles, pure chaos", scores: { script: 2 } }
    ]
  },
  {
    id: "chaos",
    type: "slider",
    text: "How much chaos can you handle in one day?",
    min: 0,
    max: 100,
    start: 50,
    minLabel: "Zero, please",
    maxLabel: "Bring it on",
    bands: [
      { upTo: 25, scores: { sans: 2 } },
      { upTo: 50, scores: { mono: 2 } },
      { upTo: 75, scores: { serif: 2 } },
      { upTo: 100, scores: { script: 2 } }
    ]
  },
  {
    id: "texture",
    type: "choice",
    text: "Pick a texture.",
    options: [
      { label: "Old paper and ink", scores: { serif: 2 } },
      { label: "Smooth matte plastic", scores: { sans: 2 } },
      { label: "Graph paper", scores: { mono: 2, sans: 1 } },
      { label: "Crumpled sticky notes", scores: { script: 2 } }
    ]
  },
  {
    id: "friends",
    type: "choice",
    text: "Your friends would call you...",
    options: [
      { label: "The deep feeler", scores: { serif: 2 } },
      { label: "The calm one", scores: { sans: 2 } },
      { label: "The one who fixes things", scores: { mono: 2 } },
      { label: "The spontaneous one", scores: { script: 2, serif: 1 } }
    ]
  }
];
