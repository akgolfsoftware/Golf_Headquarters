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

/** Finn hvilken SG-hovedfane et lagret sub-område hører til (for å forhåndsvelge fanen i modalen). */
export function omraadeToTab(omraade: string): keyof typeof SG_BUCKETS {
  for (const tab of Object.keys(SG_BUCKETS) as (keyof typeof SG_BUCKETS)[]) {
    if ((SG_BUCKETS[tab] as readonly string[]).includes(omraade)) return tab;
  }
  return "Tee";
}

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

/**
 * MORAD-posisjonene P1.0–P10.0. Navn etter fasit i ak-second-brain
 * (wiki/concepts/morad-posisjonssystem.md). Rettet 22.09.2026: P5, P6, P8 og P9
 * hadde feil navn i appen.
 */
export const P_POSITIONS = [
  { num: "P1.0", name: "Adresse" },
  { num: "P2.0", name: "Takeaway (kølle parallell)" },
  { num: "P3.0", name: "Halvveis tilbake (venstre arm parallell)" },
  { num: "P4.0", name: "Topp-posisjon" },
  { num: "P5.0", name: "Halvveis ned (venstre arm parallell, maks lag)" },
  { num: "P6.0", name: "Kølle parallell ned (lag-release starter)" },
  { num: "P7.0", name: "Impact" },
  { num: "P8.0", name: "Kølle parallell på utgang" },
  { num: "P9.0", name: "Venstre arm parallell på follow-through" },
  { num: "P10.0", name: "Finish" },
] as const;

/**
 * Mellomposisjoner (avansert). Standard er P1–P10; avansert modus åpner
 * P<n>.1–P<n>.9 mellom hver hovedposisjon. Kjente MORAD-punkter har eget navn,
 * resten heter «Mellom P4 og P5». P10 har ingen mellomposisjoner etter seg.
 */
export const P_DESIMALER = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
/** Hurtigvalg i avansert modus — resten ligger bak «flere». */
export const P_DESIMALER_HURTIG = [1, 2, 3, 4] as const;

const P_MELLOM_NAVN: Record<string, string> = {
  "P1.1": "Start av takeaway",
  "P4.1": "Overgang topp til ned",
  "P6.9": "Siste øyeblikk før impact",
  "P7.5": "Kølla på vei opp igjen etter impact",
};

/** «P4.1» → 4. «P10.0» → 10. Ugyldig → null. */
export function pHovedNummer(pNummer: string): number | null {
  const m = /^P(\d{1,2})\.(\d)$/.exec(pNummer.trim());
  if (!m) return null;
  const n = Number(m[1]);
  return n >= 1 && n <= 10 ? n : null;
}

/** «P4.1» → 1. «P4.0» → 0. */
export function pDesimal(pNummer: string): number | null {
  const m = /^P(\d{1,2})\.(\d)$/.exec(pNummer.trim());
  return m ? Number(m[2]) : null;
}

export function erHovedP(pNummer: string): boolean {
  return pDesimal(pNummer) === 0 && pHovedNummer(pNummer) !== null;
}

/** «P4.1» → «P4.0». Hoved-P-en en mellomposisjon hører hjemme under. */
export function hovedP(pNummer: string): string {
  const n = pHovedNummer(pNummer);
  return n === null ? pNummer : `P${n}.0`;
}

/** Menneskelesbart navn for hoved- og mellomposisjoner. */
export function pNavn(pNummer: string): string {
  const n = pHovedNummer(pNummer);
  const d = pDesimal(pNummer);
  if (n === null || d === null) return pNummer;
  if (d === 0) return P_POSITIONS[n - 1].name;
  return P_MELLOM_NAVN[pNummer] ?? `Mellom P${n} og P${n + 1}`;
}

/** Gyldige mellomposisjoner under en hoved-P. P10 har ingen. */
export function mellomposisjonerFor(hoved: string): { num: string; name: string }[] {
  const n = pHovedNummer(hoved);
  if (n === null || n === 10) return [];
  return P_DESIMALER.map((d) => {
    const num = `P${n}.${d}`;
    return { num, name: pNavn(num) };
  });
}

/** Numerisk rekkefølge: P1.0, P1.1, …, P2.0, … P10.0. Ukjente sist. */
export function sammenlignPNummer(a: string, b: string): number {
  const na = pHovedNummer(a);
  const nb = pHovedNummer(b);
  if (na === null && nb === null) return a.localeCompare(b, "nb");
  if (na === null) return 1;
  if (nb === null) return -1;
  if (na !== nb) return na - nb;
  return (pDesimal(a) ?? 0) - (pDesimal(b) ?? 0);
}

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
