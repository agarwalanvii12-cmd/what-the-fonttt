// ============================================================
// FONTS: turns personality specs into real variable-font CSS
//
// Each classification uses a real variable font from Google Fonts.
// "axes" lists which of our parameters that font can REALLY change.
// Width and slant can be faked on any font (scaleX / skewX), so we
// mark those as "simulated". Others are simply not available.
// ============================================================

const FAMILIES = {
  serif:  { name: "Fraunces",       css: "'Fraunces', serif",           real: ["weight", "roundness", "contrast", "casual"] },
  sans:   { name: "Roboto Flex",    css: "'Roboto Flex', sans-serif",   real: ["weight", "width", "slant", "contrast"] },
  slab:   { name: "Roboto Slab",    css: "'Roboto Slab', serif",        real: ["weight"] },
  script: { name: "Dancing Script", css: "'Dancing Script', cursive",   real: ["weight"] },
  mono:   { name: "Recursive Mono", css: "'Recursive', monospace",      real: ["weight", "slant", "casual"] },
};

const CAN_SIMULATE = ["width", "slant"];
const ALWAYS_REAL = ["spacing"]; // letter-spacing works on every font

// "real" | "simulated" | "none"
function axisSupport(classification, param) {
  const fam = FAMILIES[classification];
  if (ALWAYS_REAL.includes(param) || fam.real.includes(param)) return "real";
  if (CAN_SIMULATE.includes(param)) return "simulated";
  return "none";
}

// map a value from one range to another, clamped
function remap(v, a1, a2, b1, b2) {
  const t = Math.min(1, Math.max(0, (v - a1) / (a2 - a1)));
  return b1 + t * (b2 - b1);
}

// specs → { fontFamily, fontVariationSettings, letterSpacing, transform }
function fontStyle(specs) {
  const c = specs.classification;
  const fam = FAMILIES[c];
  const axes = [];
  let scaleX = 1;
  let skew = 0;

  if (c === "serif") {
    axes.push(`'wght' ${remap(specs.weight, 100, 1000, 100, 900)}`);
    axes.push(`'SOFT' ${specs.roundness}`);                         // roundness
    axes.push(`'opsz' ${remap(specs.contrast, 0, 100, 9, 144)}`);   // higher optical size = more contrast
    axes.push(`'WONK' ${specs.casual >= 0.5 ? 1 : 0}`);              // casual = wonky letters
  } else if (c === "sans") {
    axes.push(`'wght' ${specs.weight}`);
    axes.push(`'wdth' ${remap(specs.width, 60, 140, 25, 151)}`);
    axes.push(`'slnt' ${remap(specs.slant, -15, 0, -10, 0)}`);
    axes.push(`'opsz' ${remap(specs.contrast, 0, 100, 8, 144)}`);
  } else if (c === "slab") {
    axes.push(`'wght' ${remap(specs.weight, 100, 1000, 100, 900)}`);
  } else if (c === "script") {
    axes.push(`'wght' ${remap(specs.weight, 100, 1000, 400, 700)}`);
  } else if (c === "mono") {
    axes.push(`'wght' ${remap(specs.weight, 100, 1000, 300, 1000)}`);
    axes.push(`'slnt' ${specs.slant}`);
    axes.push(`'CASL' ${specs.casual}`);
    axes.push(`'MONO' 1`);
  }

  if (axisSupport(c, "width") === "simulated") scaleX = specs.width / 100;
  if (axisSupport(c, "slant") === "simulated") skew = specs.slant;

  return {
    fontFamily: fam.css,
    fontVariationSettings: axes.join(", "),
    letterSpacing: `${specs.spacing}em`,
    transform: `scaleX(${scaleX.toFixed(3)}) skewX(${skew}deg)`,
  };
}

// apply the style to a p5 element (createDiv etc.)
function applyFont(el, specs) {
  const s = fontStyle(specs);
  el.style("font-family", s.fontFamily);
  el.style("font-variation-settings", s.fontVariationSettings);
  el.style("letter-spacing", s.letterSpacing);
  el.style("transform", s.transform);
}

// CSS text the user can copy ("take your font with you")
function fontCSS(specs) {
  const s = fontStyle(specs);
  return `font-family: ${s.fontFamily};
font-variation-settings: ${s.fontVariationSettings};
letter-spacing: ${s.letterSpacing};
transform: ${s.transform};`;
}
