What The Font? (v2)

An AI-powered personality quiz built with p5.js and the OpenAI API. It tells you which typeface you are, then lets you tweak that font's variable axes.

Files
File	What it does
index.html	Loads fonts, p5.js and the scripts
quizData.js	Fonts, questions and scoring. Edit this to change the quiz.
api.js	The OpenAI call, the system prompt and error handling
sketch.js	Screens, scoring logic and the floating-letter background
style.css	Look and feel
How it works
The user answers 5 questions (buttons + one slider).
Scoring code adds up points and picks the typeface. Same answers always give the same font.
One API call sends the chosen font and the answers to the LLM, which writes a personalised reading as JSON.
If the API fails (no key, bad key, out of credit, timeout), a pre-written reading is shown instead.
API key

The key is not in this repo. When the app opens, it asks for the key and saves it in that browser only (localStorage). To remove it, use "Change API key" then "Remove saved key" on the home screen.

Running it

Push to GitHub, then turn on GitHub Pages (Settings > Pages > Deploy from branch > main / root).
