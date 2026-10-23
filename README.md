WHAT THE FONT?! v2 · scrapbook edition

An AI-powered personality quiz that designs a custom variable font for you. Built with p5.js for ID2116 Computing for Design (Project 02).

v2 keeps every v1 feature and adds a whacky scrapbook look: graph paper, washi tape, sticky notes, handwritten margin doodles and letters that rain down while the AI thinks.

How it works
8 questions, no font words. Each answer sets one font parameter (classification, width, weight, casual, slant, roundness, contrast, spacing).
The code builds the font. Same answers always give the same font specs.
The Foundry (AI) gets the answers + specs through the OpenAI API and launches the font: name, character, best/never used for, pairings, and a line the font says.
No key or API error? The offline Foundry writes a rule-based result, so the quiz never breaks.
Tweak your font with 7 sliders and 5 families. The font talks back as you drag.
Files
File	What it does
index.html	Loads the variable fonts, p5.js and the scripts
quiz-data.js	Questions, default specs, sliders, slider reactions
fonts.js	Turns specs into real CSS variable-font settings
foundry.js	The AI prompt, the API call and the offline fallback
sketch.js	Screens (landing, quiz, loading, result) and the p5 background
style.css	Scrapbook styling
Fonts
Type	Font	Real axes
serif	Fraunces	weight, roundness, contrast, casual
sans	Roboto Flex	weight, width, slant, contrast
slab	Roboto Slab	weight
script	Dancing Script	weight
mono	Recursive	weight, slant, casual
API key

The key is never in the code. Open the "Add OpenAI API key" box on the landing page and paste it there. It stays in that browser only.
