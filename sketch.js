// ============================================================
// sketch.js : What The Font v2
// State machine: intro -> key (if needed) -> quiz -> loading -> result
// ============================================================

let state = "intro";
let afterKeyState = "quiz"; // where to go after the key screen
let qIndex = 0;
let answers = [];
let result = null;          // { fontKey, totals, reading }
let requestInFlight = false;
let ui;
let floaters = [];

const FLOAT_CHARS = "AaGgQqRr&?!@%WTF";
const PALETTE = ["#e4572e", "#2e86ab", "#f3a712", "#6a4c93", "#29335c"];


// ---------- p5 ----------
function setup() {
  const cnv = createCanvas(windowWidth, windowHeight);
  cnv.style("position", "fixed");
  cnv.style("top", "0");
  cnv.style("left", "0");
  cnv.style("z-index", "-1");

  ui = select("#app");
  for (let i = 0; i < 22; i++) floaters.push(makeFloater(true));
  render();
}

function draw() {
  background(247, 240, 226);
  noStroke();
  textAlign(CENTER, CENTER);

  for (const f of floaters) {
    f.y -= f.speed;
    f.rot += f.spin;
    if (f.y < -100) Object.assign(f, makeFloater(false));

    push();
    translate(f.x, f.y);
    rotate(f.rot);
    fill(f.col);
    textFont(f.font);
    textSize(f.size);
    text(f.ch, 0, 0);
    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function makeFloater(anywhere) {
  const c = color(random(PALETTE));
  c.setAlpha(45);
  const keys = Object.keys(FONTS);
  return {
    x: random(width),
    y: anywhere ? random(height) : height + random(40, 200),
    ch: random(FLOAT_CHARS.split("")),
    font: FONTS[random(keys)].family,
    size: random(28, 96),
    speed: random(0.15, 0.6),
    rot: random(TWO_PI),
    spin: random(-0.004, 0.004),
    col: c
  };
}


// ---------- Screen router ----------
function render() {
  ui.html("");
  if (state === "intro") renderIntro();
  else if (state === "key") renderKey();
  else if (state === "quiz") renderQuestion();
  else if (state === "loading") renderLoading();
  else if (state === "result") renderResult();
}

function makeCard(extraClass) {
  const c = createDiv().parent(ui).addClass("card");
  if (extraClass) c.addClass(extraClass);
  return c;
}


// ---------- Intro ----------
function renderIntro() {
  const c = makeCard("intro");
  createElement("h1", "What The Font?").parent(c);
  createP("Answer five quick questions and find out which typeface you secretly are.").parent(c);

  createButton("Start the quiz").parent(c).addClass("primary").mousePressed(() => {
    resetQuiz();
    afterKeyState = "quiz";
    state = getApiKey() ? "quiz" : "key";
    render();
  });

  const hasKey = !!getApiKey();
  createP(hasKey ? "AI reading: on" : "AI reading: no key set").parent(c).addClass("small");
  createButton(hasKey ? "Change API key" : "Add API key").parent(c).addClass("link").mousePressed(() => {
    afterKeyState = "intro";
    state = "key";
    render();
  });
}


// ---------- Key screen ----------
function renderKey() {
  const c = makeCard();
  createElement("h2", "Paste the class API key").parent(c);
  createP("It stays in this browser only. It is never saved in the code or the repo.").parent(c).addClass("small");

  const input = createInput("", "password").parent(c).addClass("key-input");
  input.attribute("placeholder", "sk-proj-...");
  input.attribute("autocomplete", "off");

  const msg = createP("").parent(c).addClass("error");
  const row = createDiv().parent(c).addClass("row");

  createButton("Save key").parent(row).addClass("primary").mousePressed(() => {
    const val = input.value().trim();
    if (!val.startsWith("sk-")) {
      msg.html("That doesn't look like an OpenAI key. It should start with sk-");
      return;
    }
    saveApiKey(val);
    state = afterKeyState;
    render();
  });

  createButton("Skip (offline readings)").parent(row).mousePressed(() => {
    state = afterKeyState;
    render();
  });

  if (getApiKey()) {
    createButton("Remove saved key").parent(c).addClass("link").mousePressed(() => {
      clearApiKey();
      state = "intro";
      render();
    });
  }
}


// ---------- Quiz ----------
function renderQuestion() {
  const q = QUESTIONS[qIndex];
  const c = makeCard("question");

  createP(`Question ${qIndex + 1} of ${QUESTIONS.length}`).parent(c).addClass("small");
  createElement("h2", q.text).parent(c);

  if (q.type === "choice") {
    const list = createDiv().parent(c).addClass("options");
    q.options.forEach((opt, i) => {
      const b = createButton(opt.label).parent(list).addClass("option");
      if (answers[qIndex] && answers[qIndex].value === i) b.addClass("selected");
      b.mousePressed(() => {
        answers[qIndex] = { value: i };
        goNext();
      });
    });
  } else if (q.type === "slider") {
    const startVal = answers[qIndex] ? answers[qIndex].value : q.start;
    const s = createSlider(q.min, q.max, startVal, 1).parent(c).addClass("slider");
    const labels = createDiv().parent(c).addClass("slider-labels");
    createSpan(q.minLabel).parent(labels);
    createSpan(q.maxLabel).parent(labels);

    createButton("Next").parent(c).addClass("primary").mousePressed(() => {
      answers[qIndex] = { value: Number(s.value()) };
      goNext();
    });
  }

  const nav = createDiv().parent(c).addClass("row");
  if (qIndex > 0) {
    createButton("Back").parent(nav).addClass("link").mousePressed(() => {
      qIndex--;
      render();
    });
  }
  createButton("Restart").parent(nav).addClass("link").mousePressed(() => {
    state = "intro";
    render();
  });
}

function goNext() {
  if (qIndex < QUESTIONS.length - 1) {
    qIndex++;
    render();
  } else {
    finishQuiz();
  }
}

function resetQuiz() {
  qIndex = 0;
  answers = [];
  result = null;
}


// ---------- Scoring (deterministic, no AI) ----------
function scoreAnswers() {
  const totals = {};
  FONT_ORDER.forEach(k => (totals[k] = 0));

  QUESTIONS.forEach((q, i) => {
    const a = answers[i];
    if (!a) return;
    let scores = {};
    if (q.type === "choice") {
      scores = q.options[a.value].scores;
    } else if (q.type === "slider") {
      const band = q.bands.find(b => a.value <= b.upTo) || q.bands[q.bands.length - 1];
      scores = band.scores;
    }
    for (const k in scores) totals[k] += scores[k];
  });

  let fontKey = FONT_ORDER[0];
  for (const k of FONT_ORDER) {
    if (totals[k] > totals[fontKey]) fontKey = k;
  }
  return { fontKey, totals };
}

function summariseAnswers() {
  return QUESTIONS.map((q, i) => {
    const a = answers[i];
    if (q.type === "choice") return q.text + " : " + q.options[a.value].label;
    return q.text + " : " + a.value + " out of " + q.max + " (" + q.minLabel + " to " + q.maxLabel + ")";
  });
}


// ---------- Finish: score, then ONE API call ----------
async function finishQuiz() {
  if (requestInFlight) return; // stops double requests
  requestInFlight = true;

  const { fontKey, totals } = scoreAnswers();
  result = { fontKey, totals, reading: null };
  state = "loading";
  render();

  result.reading = await fetchFontReading(fontKey, summariseAnswers());

  requestInFlight = false;
  state = "result";
  render();
}


// ---------- Loading ----------
function renderLoading() {
  const c = makeCard("loading");
  createElement("h2", "Setting your type").parent(c);
  createDiv("<span>.</span><span>.</span><span>.</span>").parent(c).addClass("dots");
}


// ---------- Result ----------
function renderResult() {
  const font = FONTS[result.fontKey];
  const r = result.reading;
  const c = makeCard("result");

  createP("You are...").parent(c).addClass("small");
  const title = createElement("h1", font.name).parent(c).addClass("specimen-title");
  createP(font.label).parent(c).addClass("label");

  const head = createElement("h2", escapeHTML(r.headline)).parent(c);
  const desc = createP(escapeHTML(r.description)).parent(c).addClass("reading");

  if (r.source === "fallback") {
    createP(fallbackNote(r.reason)).parent(c).addClass("small note");
  }

  // Score breakdown (shows the result is rule-based and repeatable)
  const scoreLine = FONT_ORDER.map(k => FONTS[k].name + " " + result.totals[k]).join("  ·  ");
  createP("Scores: " + scoreLine).parent(c).addClass("small scores");

  // ----- Tweak your type -----
  const tweak = createDiv().parent(c).addClass("tweak");
  createElement("h3", "Tweak your type").parent(tweak);
  if (r.tweakTip) createP(escapeHTML(r.tweakTip)).parent(tweak).addClass("small");

  const specimen = createDiv("The quick brown fox jumps over the lazy dog").parent(tweak).addClass("specimen");
  specimen.attribute("contenteditable", "true");

  const styled = [title, head, desc, specimen];
  styled.forEach(el => el.style("font-family", font.css));

  const values = {};
  font.axes.forEach(ax => {
    values[ax.tag] = ax.default;
    const row = createDiv().parent(tweak).addClass("axis");
    createSpan(ax.name).parent(row);
    const s = createSlider(ax.min, ax.max, ax.default, 1).parent(row);
    const out = createSpan(String(ax.default)).parent(row).addClass("axis-value");
    s.input(() => {
      values[ax.tag] = Number(s.value());
      out.html(s.value());
      applyAxes();
    });
  });

  function applyAxes() {
    const settings = Object.entries(values).map(([t, v]) => `'${t}' ${v}`).join(", ");
    styled.forEach(el => el.style("font-variation-settings", settings));
  }
  applyAxes();

  const row = createDiv().parent(c).addClass("row");
  createButton("Retake quiz").parent(row).addClass("primary").mousePressed(() => {
    resetQuiz();
    state = "quiz";
    render();
  });
  createButton("Home").parent(row).addClass("link").mousePressed(() => {
    state = "intro";
    render();
  });
}

function fallbackNote(reason) {
  const notes = {
    "no-key": "Offline reading: no API key set. Add one from Home for an AI reading.",
    "bad-key": "The API key was rejected, so this is a pre-written reading. Re-enter the key from Home.",
    "limit": "The class API is busy or out of credit, so this is a pre-written reading.",
    "timeout": "The AI took too long, so this is a pre-written reading.",
    "bad-shape": "The AI reply came back garbled, so this is a pre-written reading."
  };
  return notes[reason] || "Couldn't reach the AI, so this is a pre-written reading.";
}

// AI text is shown with innerHTML, so escape it first
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
