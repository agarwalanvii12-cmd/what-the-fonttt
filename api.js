// ============================================================
// api.js
// Everything that talks to OpenAI lives here.
// The API key is NEVER written in this file. The user pastes it
// in the app, and it is stored only in their own browser.
// ============================================================

const API_CONFIG = {
  url: "https://api.openai.com/v1/chat/completions",
  model: "gpt-4o-mini",   // change to the model your prof specified
  temperature: 0.4,       // low = more consistent wording
  maxTokens: 250,         // caps cost per request
  timeoutMs: 15000        // give up after 15 seconds
};

const KEY_STORAGE = "wtf_openai_key";

// ---------- Key helpers (browser storage only) ----------
function getApiKey() {
  try { return localStorage.getItem(KEY_STORAGE) || ""; }
  catch (e) { return ""; }
}

function saveApiKey(key) {
  try { localStorage.setItem(KEY_STORAGE, key.trim()); }
  catch (e) { console.warn("Could not save key in this browser."); }
}

function clearApiKey() {
  try { localStorage.removeItem(KEY_STORAGE); }
  catch (e) { /* nothing to clear */ }
}


// ---------- The prompt ----------
// The font is already decided by the scoring code in sketch.js.
// The LLM only writes the personality reading, so results stay
// consistent for the same answers.
const SYSTEM_PROMPT = `You are "The Typesetter", a witty, warm typography nerd who reads people like letterforms.

You will receive:
- the typeface the quiz has ALREADY assigned to the user
- that typeface's personality label
- the user's quiz answers

Rules:
1. Never suggest a different typeface. The result is final.
2. Mention at least two of the user's specific answers.
3. Use typography metaphors (kerning, serifs, weight, spacing, ligatures, baseline).
4. Be playful and kind, never mean or sarcastic.
5. Do not use em dashes.
6. Keep the description under 90 words.

Respond ONLY with valid JSON in this exact shape:
{"headline": "max 8 words", "description": "the reading", "tweakTip": "one sentence suggesting which font slider to play with and why"}`;


// ---------- The API call ----------
// Always returns an object { headline, description, tweakTip, source, reason }
// source is "ai" or "fallback", so the quiz never breaks.
async function fetchFontReading(fontKey, answerSummaries) {
  const font = FONTS[fontKey];
  const fallback = (reason) => ({ ...font.fallback, source: "fallback", reason });

  const key = getApiKey();
  if (!key) return fallback("no-key");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_CONFIG.timeoutMs);

  try {
    const res = await fetch(API_CONFIG.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + key
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: API_CONFIG.model,
        temperature: API_CONFIG.temperature,
        max_tokens: API_CONFIG.maxTokens,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: JSON.stringify({
              typeface: font.name,
              label: font.label,
              answers: answerSummaries
            })
          }
        ]
      })
    });

    if (!res.ok) {
      console.warn("API error", res.status, await res.text());
      if (res.status === 401) return fallback("bad-key");
      if (res.status === 429) return fallback("limit");
      return fallback("http-" + res.status);
    }

    const data = await res.json();
    const parsed = JSON.parse(data.choices[0].message.content);

    if (!parsed.headline || !parsed.description) {
      console.warn("AI reply was missing fields", parsed);
      return fallback("bad-shape");
    }

    return {
      headline: parsed.headline,
      description: parsed.description,
      tweakTip: parsed.tweakTip || font.fallback.tweakTip,
      source: "ai"
    };
  } catch (err) {
    console.warn("API request failed", err);
    return fallback(err.name === "AbortError" ? "timeout" : "network");
  } finally {
    clearTimeout(timer);
  }
}
