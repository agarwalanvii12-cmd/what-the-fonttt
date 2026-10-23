// ============================================================
// WHAT THE FONT?!  v2 · scrapbook edition
// Which font does your personality scream?
// ID2116 Computing for Design · Project 02
//
// States: "landing" → "quiz" → "loading" → "result"
// View   = p5 DOM elements (createDiv, createButton, createSlider)
// Model  = QUESTIONS + specs (quiz-data.js)
// AI     = The Foundry (foundry.js)
// ============================================================

let state = "landing";
let app;                  // the <main> element everything goes into
let userName = "";
let userAnswers = [];     // index of the option picked for each question
let current = 0;          // which question we're on
let specs = { ...DEFAULT_SPECS };
let quizSpecs = null;     // the specs the quiz produced (for "reset")
let foundry = null;       // The Foundry's reply
let confetti = [];        // letters that rain down while The Foundry thinks

const TILTS = [-1.4, 1.1, -0.7, 1.6, -1.1, 0.8];

// ---------- p5 ----------
function setup() {
  const c = createCanvas(windowWidth, windowHeight);
  c.parent(document.body); // p5 puts the canvas inside <main> by default, which app.html("") would wipe
  c.position(0, 0);
  c.style("position", "fixed");
  c.style("z-index", "-1");
  app = select("#app");
  showLanding();
}

// graph-paper background; letters rain while The Foundry thinks
function draw() {
  background(246, 238, 220);

  // graph paper grid
  stroke(90, 130, 190, 34);
  strokeWeight(1);
  const g = 24;
  for (let x = 0; x < width; x += g) line(x, 0, x, height);
  for (let y = 0; y < height; y += g) line(0, y, width, y);

  // red notebook margin
  if (width > 760) {
    stroke(232, 51, 31, 80);
    strokeWeight(2);
    line(52, 0, 52, height);
  }
  noStroke();

  if (state === "loading") drawConfetti();
  else noLoop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw();
}

function setState(s) {
  state = s;
  app.html("");
  if (s === "loading") { makeConfetti(); loop(); } else redraw();
  window.scrollTo(0, 0);
}

// ---------- loading confetti: letters in every family ----------
function makeConfetti() {
  confetti = [];
  const fams = ["Fraunces", "Recursive", "Roboto Flex", "Roboto Slab", "Dancing Script", "Caveat"];
  const cols = ["#1d1a16", "#E8331F", "#2E6FD8", "#E0A100"];
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ?!&@*".split("");
  for (let i = 0; i < 42; i++) {
    const c = color(random(cols));
    c.setAlpha(150);
    confetti.push({
      x: random(width), y: random(-height, 0),
      ch: random(chars), f: random(fams),
      s: random(22, 76), v: random(1, 3.2),
      r: random(TWO_PI), vr: random(-0.03, 0.03),
      c,
    });
  }
}

function drawConfetti() {
  textAlign(CENTER, CENTER);
  for (const p of confetti) {
    p.y += p.v;
    p.r += p.vr;
    if (p.y > height + 60) { p.y = -60; p.x = random(width); }
    push();
    translate(p.x, p.y);
    rotate(p.r);
    fill(p.c);
    textFont(p.f);
    textSize(p.s);
    text(p.ch, 0, 0);
    pop();
  }
}

// ---------- helpers ----------
function el(tag, cls, html, parent) {
  const e = createElement(tag, html || "");
  if (cls) e.addClass(cls);
  e.parent(parent || app);
  return e;
}

// a strip of washi tape stuck on a card
function tape(parent, where, colour) {
  return el("span", `tape ${where} ${colour || ""}`, "", parent);
}

// a handwritten note in the margins
function doodle(text, parent, cls) {
  return el("div", "doodle " + (cls || ""), text, parent);
}

// AI text goes in as HTML, so escape it first
function esc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// each letter in a different font, like a ransom note
const RANSOM = [
  { s: { classification: "sans",   weight: 1000, width: 140, slant: 0,   casual: 0, roundness: 0,   contrast: 0,   spacing: 0 }, bg: "ink" },
  { s: { classification: "script", weight: 700,  width: 100, slant: 0,   casual: 0, roundness: 0,   contrast: 0,   spacing: 0 }, bg: "paper" },
  { s: { classification: "serif",  weight: 900,  width: 100, slant: 0,   casual: 1, roundness: 100, contrast: 100, spacing: 0 }, bg: "red" },
  { s: { classification: "mono",   weight: 300,  width: 100, slant: -15, casual: 1, roundness: 0,   contrast: 0,   spacing: 0 }, bg: "dots" },
  { s: { classification: "slab",   weight: 900,  width: 100, slant: 0,   casual: 0, roundness: 0,   contrast: 0,   spacing: 0 }, bg: "yellow" },
  { s: { classification: "serif",  weight: 200,  width: 100, slant: 0,   casual: 0, roundness: 0,   contrast: 100, spacing: 0 }, bg: "ink" },
  { s: { classification: "sans",   weight: 300,  width: 60,  slant: -15, casual: 0, roundness: 0,   contrast: 0,   spacing: 0 }, bg: "blue" },
];

function ransom(text, parent) {
  const wrap = el("div", "ransom", "", parent);
  let i = 0;
  let word = el("span", "word", "", wrap); // letters of one word never split across lines
  for (const ch of text) {
    if (ch === " ") { el("span", "gap", "", wrap); word = el("span", "word", "", wrap); continue; }
    const r = RANSOM[i % RANSOM.length];
    const t = el("span", "tile " + r.bg, ch, word);
    applyFont(t, r.s);
    t.style("transform", `rotate(${[-5, 3, -2, 4, -3, 2, -4][i % 7]}deg)`);
    i++;
  }
  return wrap;
}

// =========================================================
// 1. LANDING
// =========================================================
function showLanding() {
  setState("landing");
  const page = el("section", "landing");

  el("div", "sticker", "v2!<br>now with<br>glue", page);

  ransom("WHAT THE", page);
  ransom("FONT?!", page);
  el("p", "tagline", 'which font does your personality <span class="scream">scream?</span>', page);

  const note = el("div", "intro sticky", "", page);
  tape(note, "tc");
  el("p", "", "8 questions. No font words. An AI type designer turns you into a custom typeface.", note);

  doodle("write your name here ↓", page, "name-hint");

  const row = el("div", "start-row", "", page);
  const nameInput = createInput(userName);
  nameInput.attribute("placeholder", "your name");
  nameInput.attribute("maxlength", "20");
  nameInput.addClass("name-input");
  nameInput.parent(row);

  const go = createButton("Start →");
  go.addClass("btn red");
  go.parent(row);
  go.mousePressed(() => {
    userName = nameInput.value().trim();
    userAnswers = [];
    current = 0;
    specs = { ...DEFAULT_SPECS };
    showQuestion();
  });

  // API key box (stored in this browser only, never in the code)
  const keyBox = el("details", "keybox", "", page);
  el("summary", "", getKey() ? "API key saved ✓" : "Add OpenAI API key (optional, works offline without it)", keyBox);
  const keyRow = el("div", "key-row", "", keyBox);
  const keyInput = createInput("", "password");
  keyInput.attribute("placeholder", "sk-...");
  keyInput.attribute("autocomplete", "off");
  keyInput.parent(keyRow);
  const save = createButton("Save");
  save.addClass("btn small");
  save.parent(keyRow);
  save.mousePressed(() => { saveKey(keyInput.value()); showLanding(); });
  const clear = createButton("Clear");
  clear.addClass("btn small light");
  clear.parent(keyRow);
  clear.mousePressed(() => { clearKey(); showLanding(); });
  el("p", "fine", "Your key stays in this browser's storage. It is never sent anywhere except OpenAI.", keyBox);
}

// =========================================================
// 2. QUIZ (one question at a time)
// =========================================================
function showQuestion() {
  setState("quiz");
  const item = QUESTIONS[current];
  const page = el("section", "quiz");

  // ghost letter: morphs as your answers come in
  const ghost = el("div", "ghost", "Aa", page);
  applyFont(ghost, specs);

  const top = el("div", "quiz-top", "", page);
  el("span", "progress-label", `Q${current + 1} / ${QUESTIONS.length}`, top);
  const bar = el("div", "bar", "", top);
  const fill = el("div", "bar-fill", "", bar);
  fill.style("width", `${(current / QUESTIONS.length) * 100}%`);

  const card = el("div", "question-card", "", page);
  tape(card, "tl", current % 2 ? "pink" : "");
  tape(card, "tr", current % 2 ? "" : "blue");
  el("h2", "question", item.q, card);

  const opts = el("div", "options", "", page);
  item.options.forEach((opt, i) => {
    const b = createButton(opt.label);
    b.addClass("option");
    b.elt.style.setProperty("--tilt", `${TILTS[(i + current) % TILTS.length]}deg`);
    if (userAnswers[current] === i) b.addClass("picked");
    b.parent(opts);
    // preview: hovering an option morphs the ghost letter
    b.mouseOver(() => applyFont(ghost, { ...specs, [item.param]: opt.value }));
    b.mouseOut(() => applyFont(ghost, specs));
    b.mousePressed(() => pickAnswer(i));
  });

  if (current === 0) doodle("psst, hover an answer and watch the big letter →", page, "hover-hint");

  if (current > 0) {
    const back = createButton("← back");
    back.addClass("btn small light back");
    back.parent(page);
    back.mousePressed(() => { current--; showQuestion(); });
  }
}

function pickAnswer(i) {
  userAnswers[current] = i;
  specs = specsFromAnswers();
  current++;
  if (current < QUESTIONS.length) showQuestion();
  else showLoading();
}

// THE KEY STEP: each answer sets one font parameter
function specsFromAnswers() {
  const s = { ...DEFAULT_SPECS };
  QUESTIONS.forEach((item, i) => {
    if (userAnswers[i] !== undefined) s[item.param] = item.options[userAnswers[i]].value;
  });
  return s;
}

// =========================================================
// 3. LOADING
// =========================================================
async function showLoading() {
  setState("loading");
  const page = el("section", "loading");
  const card = el("div", "loading-card", "", page);
  tape(card, "tc", "pink");
  el("div", "loading-word", esc(userName) || "Aa", card);
  el("p", "loading-text", "The Foundry is cutting and gluing you together...", card);

  quizSpecs = { ...specs };
  const wait = new Promise((r) => setTimeout(r, 2200)); // a little drama
  const [result] = await Promise.all([askFoundry(userAnswers, specs), wait]);
  foundry = result;
  showResult();
}

// =========================================================
// 4. RESULT + SLIDERS
// =========================================================
let fontEls = [];       // every element drawn in the user's font
let saysEl, chipsEl;
let sliderRows = {};
let familyBtns = {};

function showResult() {
  setState("result");
  fontEls = [];
  const page = el("section", "result");

  // --- the scream ---
  const hero = el("div", "hero", "", page);
  el("div", "you-are", "YOU ARE", hero);
  const label = el("div", "name-label", "", hero);
  const nameEl = el("h1", "font-name", esc(foundry.fontName), label);
  fontEls.push(nameEl);
  doodle("↑ that's you, apparently", hero, "hero-note");

  const grid = el("div", "result-grid", "", page);

  // --- left: specimen ---
  const spec = el("div", "specimen card", "", grid);
  tape(spec, "tl");
  tape(spec, "tr", "pink");
  el("div", "label", "SPECIMEN", spec);
  const big = el("div", "spec-name", esc(userName) || "Hello, you", spec);
  const abc = el("div", "spec-abc", "Aa Bb Cc Dd Ee Ff Gg Hh 0123 ?!&", spec);
  const pangram = el("div", "spec-pangram", "Sphinx of black quartz, judge my vow.", spec);
  fontEls.push(big, abc, pangram);

  chipsEl = el("div", "chips", "", spec);
  const info = [
    ["Character", foundry.character],
    ["Best used for", foundry.bestUsedFor],
    ["Never use for", foundry.neverUseFor],
    ["Pairs well with", foundry.pairsWellWith],
  ];
  info.forEach(([k, v]) => {
    const row = el("div", "info-row", "", spec);
    el("span", "info-k", k, row);
    el("span", "info-v", esc(v), row);
  });
  saysEl = el("div", "says", `“${esc(foundry.fontSays)}”`, spec);
  if (foundry.source === "offline") el("p", "fine", foundry.note, spec);

  // --- right: tweak panel ---
  const panel = el("div", "panel card", "", grid);
  tape(panel, "tc", "blue");
  el("div", "label", "TWEAK YOUR FONT", panel);
  doodle("drag me! the font talks back", panel, "panel-note");

  const famRow = el("div", "families", "", panel);
  familyBtns = {};
  Object.keys(FAMILIES).forEach((key) => {
    const b = createButton(key);
    b.addClass("fam");
    b.parent(famRow);
    b.mousePressed(() => {
      specs.classification = key;
      react("classification", 1);
      updateResult();
    });
    familyBtns[key] = b;
  });

  sliderRows = {};
  SLIDERS.forEach((cfg) => {
    const row = el("div", "slider-row", "", panel);
    const head = el("div", "slider-head", "", row);
    el("span", "slider-label", cfg.label, head);
    const val = el("span", "slider-val", "", head);
    const s = createSlider(cfg.min, cfg.max, specs[cfg.param], cfg.step);
    s.parent(row);
    const note = el("div", "slider-note", cfg.trait, row);
    let prev = specs[cfg.param];
    s.input(() => {
      const v = Number(s.value());
      react(cfg.param, v - prev);
      prev = v;
      specs[cfg.param] = v;
      updateResult();
    });
    sliderRows[cfg.param] = { row, s, val, note, cfg };
  });

  el("p", "legend", "● real font axis &nbsp; ◐ simulated &nbsp; ○ not on this typeface", panel);

  const actions = el("div", "actions", "", panel);
  const reset = createButton("Reset to my answers");
  reset.addClass("btn small light");
  reset.parent(actions);
  reset.mousePressed(() => { specs = { ...quizSpecs }; showResult(); });

  const copy = createButton("Copy my font CSS");
  copy.addClass("btn small");
  copy.parent(actions);
  copy.mousePressed(() => {
    navigator.clipboard?.writeText(fontCSS(specs));
    copy.html("Copied ✓");
  });

  const again = createButton("Retake quiz");
  again.addClass("btn small red");
  again.parent(actions);
  again.mousePressed(showLanding);

  updateResult();
}

// redraw every font element + slider labels from the current specs
function updateResult() {
  fontEls.forEach((e) => applyFont(e, specs));

  Object.entries(familyBtns).forEach(([k, b]) => {
    if (k === specs.classification) b.addClass("on"); else b.removeClass("on");
  });

  Object.values(sliderRows).forEach(({ row, s, val, cfg }) => {
    const support = axisSupport(specs.classification, cfg.param);
    const mark = { real: "●", simulated: "◐", none: "○" }[support];
    val.html(`${mark} ${formatVal(cfg.param, specs[cfg.param])}`);
    if (support === "none") {
      s.attribute("disabled", "");
      row.addClass("off");
    } else {
      s.removeAttribute("disabled");
      row.removeClass("off");
    }
  });

  chipsEl.html("");
  [
    FAMILIES[specs.classification].name,
    `weight ${Math.round(specs.weight)}`,
    `width ${Math.round(specs.width)}`,
    `slant ${specs.slant}`,
    `spacing ${specs.spacing.toFixed(2)}`,
  ].forEach((t) => el("span", "chip", t, chipsEl));
}

function formatVal(param, v) {
  if (param === "casual") return v.toFixed(2);
  if (param === "spacing") return v.toFixed(3) + "em";
  return Math.round(v * 10) / 10;
}

// the font talks back when you change it
function react(param, delta) {
  if (delta === 0) return;
  const line = REACTIONS[param][delta > 0 ? "up" : "down"];
  saysEl.html(`“${line}”`);
  saysEl.removeClass("pop");
  void saysEl.elt.offsetWidth; // restart the animation
  saysEl.addClass("pop");
}
