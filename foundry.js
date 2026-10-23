// ============================================================
// THE FOUNDRY: the AI type designer (OpenAI Responses API)
// The code decides the numbers. The AI only names the font and
// writes its personality. If there's no API key or the call
// fails, an offline fallback writes a simpler result instead.
// ============================================================

const GPT_MODEL = "gpt-6-luna";

const SYSTEM_PROMPT = `You are The Foundry, a dramatic and slightly pretentious type designer.
A custom typeface has already been built from someone's personality quiz.
You will receive their quiz answers and the font's final specs.
Do NOT change the specs. Your job is to launch the font like a luxury
product: name it and give it a personality. Affectionate roasting,
typography puns, never mean.

Respond ONLY with JSON in this format, no extra text:
{
  "fontName": "max 3 words",
  "character": "max 20 words",
  "bestUsedFor": "max 8 words",
  "neverUseFor": "max 8 words",
  "pairsWellWith": "max 8 words",
  "fontSays": "one first-person line from the font, max 15 words"
}

Rules:
- Invent an original fontName that sounds like a real font release.
  Never use the words Serif, Sans, Script, Mono, Pro or Display.
  Never reuse names or phrases from these instructions.
- Let the specs shape the writing: heavy weight = loud, condensed = shy,
  italic = rushing, rounded = soft-hearted, high contrast = dramatic,
  wide spacing = needs alone time.
- Keep it playful and kind. Never comment on appearance, body, gender,
  race or anything sensitive.`;

// answers + specs → user prompt (the step your prof asked about)
function buildUserPrompt(userAnswers, specs) {
  const answerLines = QUESTIONS
    .map((item, i) => `- ${item.q} ${item.options[userAnswers[i]].label}`)
    .join("\n");

  return `Quiz answers:
${answerLines}

Font specs (fixed, do not change):
${JSON.stringify(specs)}`;
}

// --- API key (never written in the code, never pushed to GitHub) ---
function getKey()    { try { return localStorage.getItem("wtf_openai_key") || ""; } catch (e) { return ""; } }
function saveKey(k)  { try { localStorage.setItem("wtf_openai_key", k.trim()); } catch (e) {} }
function clearKey()  { try { localStorage.removeItem("wtf_openai_key"); } catch (e) {} }

// pull the text out of a Responses API reply
function getOutputText(data) {
  return data.output
    .filter((item) => item.type === "message")
    .flatMap((item) => item.content)
    .filter((c) => c.type === "output_text")
    .map((c) => c.text)
    .join("");
}

// ask The Foundry. Always resolves with a result object.
async function askFoundry(userAnswers, specs) {
  const apiKey = getKey();
  if (!apiKey) return offlineFoundry(specs, "No API key, so the offline Foundry wrote this.");

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GPT_MODEL,
        instructions: SYSTEM_PROMPT,
        input: buildUserPrompt(userAnswers, specs),
        max_output_tokens: 300,
        reasoning: { effort: "none" },
        temperature: 0.9,
      }),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    // the AI sometimes wraps JSON in ```json fences, so strip them
    let text = getOutputText(data).replace(/```json|```/g, "").trim();
    const result = JSON.parse(text);
    if (!result.fontName) throw new Error("No fontName in reply");
    result.source = "ai";
    return result;
  } catch (err) {
    console.error("Foundry error:", err);
    return offlineFoundry(specs, "The Foundry is on a coffee break, so here's the offline version.");
  }
}

// ---------- offline fallback: simple rules, no AI ----------
function offlineFoundry(specs, note) {
  const loud  = specs.weight >= 700, quiet = specs.weight <= 300;
  const wide  = specs.width >= 115,  narrow = specs.width <= 85;
  const rush  = specs.slant <= -10;
  const soft  = specs.roundness >= 70;
  const drama = specs.contrast >= 70;
  const alone = specs.spacing >= 0.15;

  const first = loud ? "Unhinged" : quiet ? "Whispered" : rush ? "Overdue" : soft ? "Marshmallow" : "Unread";
  const second = { serif: "Roman", sans: "Grotesk", slab: "Block", script: "Flourish", mono: "Terminal" }[specs.classification];

  const traits = [];
  traits.push(loud ? "Loud" : quiet ? "Quiet" : "Steady");
  traits.push(wide ? "takes up the whole group chat" : narrow ? "hugs the wall at parties" : "fits in anywhere");
  traits.push(drama ? "with main-character contrast." : "with suspiciously stable strokes.");

  return {
    fontName: `${first} ${second}`,
    character: `${traits[0]}, ${traits[1]}, ${traits[2]}`,
    bestUsedFor: rush ? "Last-minute submissions" : "Notes nobody else will read",
    neverUseFor: loud ? "Library signage" : "Party invitations",
    pairsWellWith: soft ? "Anything sharp enough to protect it" : "One soft, round friend",
    fontSays: alone ? "I love you. Please leave." : loud ? "I HAVE THOUGHTS." : "I read your message. Still thinking.",
    source: "offline",
    note,
  };
}
