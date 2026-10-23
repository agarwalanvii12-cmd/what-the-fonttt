// ============================================================
// QUIZ DATA (the Model)
// Each question controls ONE font parameter ("param").
// Each option sets a fixed value for that parameter.
// Same answers = same font, every time.
// ============================================================

const QUESTIONS = [
  {
    q: "Your friends would describe you as...",
    param: "classification",
    options: [
      { label: "the reliable one",      value: "serif" },
      { label: "low-maintenance",       value: "sans" },
      { label: "the chaotic one",       value: "slab" },
      { label: "the dramatic one",      value: "script" },
      { label: "the quiet observer",    value: "mono" },
    ],
  },
  {
    q: "You walk into a party where you know nobody.",
    param: "width",
    options: [
      { label: "guard the snack table",           value: 75 },
      { label: "find one person",                 value: 100 },
      { label: "introduce yourself to everyone",  value: 125 },
    ],
  },
  {
    q: "Your texting style:",
    param: "weight",
    options: [
      { label: '"ok."',                  value: 200 },
      { label: '"okkk 😭"',              value: 500 },
      { label: "six messages in a row",  value: 900 },
    ],
  },
  {
    q: "Your notes app is...",
    param: "casual",
    options: [
      { label: "colour-coded folders",  value: 0 },
      { label: "400 untitled notes",    value: 0.5 },
      { label: "voice memos only",      value: 1 },
    ],
  },
  {
    q: "You're running late. You...",
    param: "slant",
    options: [
      { label: "arrive when you arrive",     value: 0 },
      { label: "walk fast but dignified",    value: -6 },
      { label: "sprint",                     value: -15 },
    ],
  },
  {
    q: "A friend shows you a bad haircut.",
    param: "roundness",
    options: [
      { label: "brutal honesty",          value: 0 },
      { label: "change the topic",        value: 50 },
      { label: '"you look amazing!!"',    value: 100 },
    ],
  },
  {
    q: "Your mood swings are...",
    param: "contrast",
    options: [
      { label: "a flat line",       value: 0 },
      { label: "gentle waves",      value: 50 },
      { label: "a rollercoaster",   value: 100 },
    ],
  },
  {
    q: "After a full day out, you need...",
    param: "spacing",
    options: [
      { label: "more plans",              value: 0 },
      { label: "one chill call",          value: 0.1 },
      { label: "zero humans for 48h",     value: 0.2 },
    ],
  },
];

// Neutral starting point (used for the ghost letter before you answer)
const DEFAULT_SPECS = {
  classification: "sans",
  width: 100,
  weight: 400,
  casual: 0,
  slant: 0,
  roundness: 0,
  contrast: 50,
  spacing: 0.05,
};

// Slider settings for the final tweak screen
const SLIDERS = [
  { param: "weight",    label: "Weight",    min: 100, max: 1000, step: 10,   trait: "how loud you are" },
  { param: "width",     label: "Width",     min: 60,  max: 140,  step: 1,    trait: "introvert ↔ extrovert" },
  { param: "slant",     label: "Slant",     min: -15, max: 0,    step: 0.5,  trait: "always rushing ↔ composed", reverse: true },
  { param: "casual",    label: "Casual",    min: 0,   max: 1,    step: 0.01, trait: "planner ↔ spontaneous" },
  { param: "roundness", label: "Roundness", min: 0,   max: 100,  step: 1,    trait: "blunt ↔ soft-hearted" },
  { param: "contrast",  label: "Contrast",  min: 0,   max: 100,  step: 1,    trait: "emotional range" },
  { param: "spacing",   label: "Spacing",   min: 0,   max: 0.3,  step: 0.005, trait: "social battery" },
];

// What the font says when you drag a slider (free, no API call)
const REACTIONS = {
  weight:    { up: "LOUDER. finally.",            down: "less bold?? rude." },
  width:     { up: "making room for myself.",     down: "squeezing in, don't mind me." },
  slant:     { up: "composed. ish.",              down: "running late, brb." },
  casual:    { up: "hehe ok.",                    down: "per my last email." },
  roundness: { up: "aww. softie era.",            down: "sharp. like my comebacks." },
  contrast:  { up: "DRAMA. thank you.",           down: "emotionally stable today." },
  spacing:   { up: "need.  my.  space.",          down: "squad up." },
  classification: { up: "a whole new me??",       down: "a whole new me??" },
};
