/**
 * Teknisk plan — domenekonstanter (golf-spesifikke).
 *
 * Dette er IKKE designtokens. Pyramide-farger ligger i globals.css
 * (--pyr-fys/tek/slag/spill/turn) og brukes via Tailwind-klasser
 * (bg-pyr-fys etc.) — aldri hardkodet her.
 */

/** De fem pyramide-aksene. Farger hentes fra --pyr-* i globals.css. */
export type PyramidArea = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";

import { OMRAADER, erOmraadeKode, type OmraadeKode } from "@/lib/domain/ak-formel-v2";

export type { OmraadeKode };

/**
 * Områdefanene i oppgaveskjemaet (master: treningsplanlegging-og-sprak-gjennomgang.md §7).
 * Én typet liste — den samme som databasen (`Omraade`) og Workbench bruker.
 * Putting måles i fot (Strokes Gained); meter vises i parentes.
 */
export const OMRAADE_FANER = {
  Utslag: ["TEE_TOTAL"],
  Innspill: ["INNSPILL_200", "INNSPILL_150", "INNSPILL_100", "INNSPILL_50"],
  "Nærspill": ["CHIP", "PITCH", "LOB", "BUNKER"],
  Putting: ["PUTT_0_3", "PUTT_3_5", "PUTT_5_10", "PUTT_10_25", "PUTT_25_40", "PUTT_40_PLUSS"],
} as const satisfies Record<string, readonly OmraadeKode[]>;

export type OmraadeFane = keyof typeof OMRAADE_FANER;

const FOT_TIL_M = 0.3048;
function m(fot: number): string {
  return (fot * FOT_TIL_M).toLocaleString("nb-NO", { maximumFractionDigits: 1 });
}

/** Visningsnavn. Putting: fot først, meter i parentes (Anders 22.09). */
export function omraadeVisning(kode: OmraadeKode): string {
  switch (kode) {
    case "TEE_TOTAL": return "Tee Total";
    case "INNSPILL_200": return "Innspill 200 m +";
    case "INNSPILL_150": return "Innspill 150–200 m";
    case "INNSPILL_100": return "Innspill 100–150 m";
    case "INNSPILL_50": return "Innspill 50–100 m";
    case "PUTT_0_3": return `Putt 0–3 fot (0–${m(3)} m)`;
    case "PUTT_3_5": return `Putt 3–5 fot (${m(3)}–${m(5)} m)`;
    case "PUTT_5_10": return `Putt 5–10 fot (${m(5)}–${m(10)} m)`;
    case "PUTT_10_25": return `Putt 10–25 fot (${m(10)}–${m(25)} m)`;
    case "PUTT_25_40": return `Putt 25–40 fot (${m(25)}–${m(40)} m)`;
    case "PUTT_40_PLUSS": return `Putt 40+ fot (${m(40)} m +)`;
    default: {
      const def = OMRAADER.find((o) => o.kode === kode);
      return def ? def.label : kode;
    }
  }
}

/** Fanen et område hører til. Områder utenfor fanene (FYS, BANE) → Utslag som nøytral start. */
export function omraadeToTab(kode: OmraadeKode | string): OmraadeFane {
  for (const fane of Object.keys(OMRAADE_FANER) as OmraadeFane[]) {
    if ((OMRAADE_FANER[fane] as readonly string[]).includes(kode)) return fane;
  }
  return "Utslag";
}

/**
 * Gamle fritekst-områder (før 22.09.2026) → typet kode. Brukes av
 * migreringsskriptet og som fallback for rader som ennå ikke har kode.
 * «Putt 10-15» og «Putt 15-25» slås sammen til PUTT_10_25 (fasitens inndeling).
 */
const GAMMELT_OMRAADE: Record<string, OmraadeKode> = {
  "Tee Total": "TEE_TOTAL",
  "App 200+": "INNSPILL_200",
  "App 150-200": "INNSPILL_150",
  "App 100-150": "INNSPILL_100",
  "App 50-100": "INNSPILL_50",
  Chip: "CHIP",
  Pitch: "PITCH",
  Lob: "LOB",
  Bunker: "BUNKER",
  "Putt 0-3": "PUTT_0_3",
  "Putt 3-5": "PUTT_3_5",
  "Putt 5-10": "PUTT_5_10",
  "Putt 10-15": "PUTT_10_25",
  "Putt 15-25": "PUTT_10_25",
  "Putt 10-25": "PUTT_10_25",
  "Putt 25-40": "PUTT_25_40",
  "Putt 40+": "PUTT_40_PLUSS",
};

export function omraadeTilKode(verdi: string | null | undefined): OmraadeKode | null {
  if (!verdi) return null;
  const v = verdi.trim();
  if (erOmraadeKode(v)) return v;
  if (GAMMELT_OMRAADE[v]) return GAMMELT_OMRAADE[v];
  // Nye visningsnavn (lagret som `omraade`-etikett) skal også kunne leses tilbake.
  const treff = OMRAADER.find((o) => omraadeVisning(o.kode) === v || o.label === v);
  return treff ? treff.kode : null;
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
