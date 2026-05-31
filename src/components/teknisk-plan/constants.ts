/**
 * Teknisk plan — domenekonstanter (golf-spesifikke).
 *
 * Dette er IKKE designtokens. Pyramide-farger ligger i globals.css
 * (--pyr-fys/tek/slag/spill/turn) og brukes via Tailwind-klasser
 * (bg-pyr-fys etc.) — aldri hardkodet her.
 */

/** De fem pyramide-aksene. Farger hentes fra --pyr-* i globals.css. */
export type PyramidArea = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";

export const SG_BUCKETS = {
  Tee: ["Tee Total"],
  "Approach (m)": ["App 200+", "App 150-200", "App 100-150", "App 50-100"],
  "Around Green": ["Chip", "Pitch", "Lob", "Bunker"],
  "Putt (m)": ["Putt 0-3", "Putt 3-5", "Putt 5-10", "Putt 10-15", "Putt 15-25", "Putt 25-40", "Putt 40+"],
} as const;

export const KOLLER = [
  "Alle køller",
  "Driver",
  "3-tre",
  "Hybrid",
  "5-jern",
  "6-jern",
  "7-jern",
  "8-jern",
  "9-jern",
  "PW",
  "SW/LW",
  "Putter",
] as const;

export const L_PHASES = ["L_KROPP", "L_ARM", "L_KOLLE", "L_BALL", "L_AUTO"] as const;
export const CS_LEVELS = ["CS50", "CS60", "CS70", "CS80", "CS90", "CS100"] as const;
export const M_LEVELS = ["M0", "M1", "M2", "M3", "M4", "M5"] as const;
export const PR_LEVELS = ["PR1", "PR2", "PR3", "PR4", "PR5"] as const;

export const P_POSITIONS = [
  { num: "P1.0", name: "Adresse" },
  { num: "P2.0", name: "Takeaway (kølle parallell)" },
  { num: "P3.0", name: "Halvveis tilbake (venstre arm parallell)" },
  { num: "P4.0", name: "Topp-posisjon" },
  { num: "P5.0", name: "Transisjon" },
  { num: "P6.0", name: "Halvveis ned (kølle parallell)" },
  { num: "P7.0", name: "Impact" },
  { num: "P8.0", name: "Tidlig oppfølging" },
  { num: "P9.0", name: "Kølle parallell etter impact" },
  { num: "P10.0", name: "Finish" },
] as const;

/**
 * Hit-rate-protokoller (Mekanisme 7).
 */
export const HIT_RATE_PROTOCOLS = {
  ROLLING_WINDOW: "Rullende vindu",
  BEST_OF_N: "Beste i én økt",
  STREAK: "Streak",
  SESSION_GATE: "Økt-gate",
} as const;

export type HitRateProtocol = keyof typeof HIT_RATE_PROTOCOLS;
