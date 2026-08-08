// Palette: Off White (background) · Coral Red (primary CTA) · Deep Charcoal
// (headlines/key text) · Saffron (accent highlights) · Ivory (secondary
// sections). Beyond those five requested colors, three muted supporting
// tones are kept so status semantics (pass/warn/fail/info) stay
// distinguishable at a glance rather than collapsing onto two hues — a sage
// green for success, a deep teal for informational/security tags, and a
// muted plum for AI-generated content tags. All are desaturated to sit
// quietly in the same warm, paper-like family as the five named colors.
export const T = {
  bg: "#FAF7F2",        // Off White
  panel: "#F5EFE1",     // Ivory — secondary sections / cards
  panelAlt: "#EDE4CE",  // deeper ivory — nested rows, inputs, alt stripes
  border: "#E1D6C0",
  borderLight: "#CBBB9B",
  text: "#262422",       // Deep Charcoal — headlines / key text
  muted: "#6B6255",
  mutedDim: "#978C79",

  amber: "#F2A93B",       // Saffron — accent highlights
  amberDim: "#FBE7C2",

  coral: "#E8543F",       // Coral Red — primary CTA
  coralDim: "#FBDCD5",

  cyan: "#3E6B64",         // supporting: informational / security tone
  cyanDim: "#DEEAE7",

  red: "#C63D2F",          // supporting: danger / critical status
  redDim: "#F6DED9",

  green: "#5E8C57",        // supporting: success / passing status
  greenDim: "#E2ECDD",

  indigo: "#7C5C93",       // supporting: AI-generated content tag
  indigoDim: "#EDE3F1",
};

export const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');`;
