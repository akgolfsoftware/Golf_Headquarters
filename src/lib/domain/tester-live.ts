/**
 * Tester-live (C4/Loop 8) — ren logikk for gate-/PEI-artefaktet over «I dag».
 *
 * Fasit: designsystem/train-lock/TE-04/TE-05/TE-06. To korttyper gjenkjennes
 * fra TestDefinition.protocol (NGF-batteri-formen, se
 * prisma/scripts/seed-ngf-test-protocols.ts):
 *
 *  - GATE (korttype A, HANDOFF): scoringMode "hit-rate", ett steg, feltet
 *    «ok» (checkbox). Matcher Putt/Driver/Wedge/Nærspill Gate + VISA Express.
 *    Et valgfritt «miss_side»-select (kun Putt Gate) gir V|H-registrering.
 *  - PEI (korttype C): scoringMode "pei", ett steg med BÅDE en avstands-felt
 *    (målavstand for slaget) og et till-mål-felt. Matcher Inspill Basic.
 *
 * Alt annet → null (generisk scorekort, uendret — «ikke hele TN-batteriet»).
 *
 * Ren modul: ingen "use server", ingen Prisma, ingen I/O.
 */

import { z } from "zod";

export type LiveArtefaktKind = "gate" | "pei";

const FeltSchema = z.looseObject({
  key: z.string().min(1),
  type: z.string().optional(),
});

const StegSchema = z.looseObject({
  shots: z.number().int().min(1).max(60),
  target: z.union([z.string(), z.number()]).optional(),
  inputFields: z.array(FeltSchema).min(1),
});

const ProtokollSchema = z.looseObject({
  scoringMode: z.string(),
  steps: z.array(StegSchema).min(1).max(1),
});

const AVSTAND_FELT_NOKLER = ["shot_distance_m", "malAvstandM"] as const;
const TILL_MAL_FELT_NOKLER = ["till_hull_m", "resultatM"] as const;

/** Gjenkjenner gate/PEI-protokoller for live-artefaktet. Ukjent → null. */
export function detectLiveArtefaktKind(protocol: unknown): LiveArtefaktKind | null {
  const parsed = ProtokollSchema.safeParse(protocol);
  if (!parsed.success) return null;
  const steg = parsed.data.steps[0];
  const nokler = steg.inputFields.map((f) => f.key);

  if (parsed.data.scoringMode === "hit-rate" && nokler.includes("ok")) {
    return "gate";
  }
  if (
    parsed.data.scoringMode === "pei" &&
    nokler.some((k) => (AVSTAND_FELT_NOKLER as readonly string[]).includes(k)) &&
    nokler.some((k) => (TILL_MAL_FELT_NOKLER as readonly string[]).includes(k))
  ) {
    return "pei";
  }
  return null;
}

/** Antall slag/forsøk i en gjenkjent gate/PEI-protokoll. */
export function liveArtefaktShots(protocol: unknown): number {
  const parsed = ProtokollSchema.safeParse(protocol);
  return parsed.success ? parsed.data.steps[0].shots : 0;
}

/** Nøkkelen PEI-till-mål-feltet bruker i denne protokollen («till_hull_m» eller «resultatM»). */
export function peiTillMalNokkel(protocol: unknown): string {
  const parsed = ProtokollSchema.safeParse(protocol);
  if (!parsed.success) return "till_hull_m";
  const steg = parsed.data.steps[0];
  const funnet = steg.inputFields.find((f) =>
    (TILL_MAL_FELT_NOKLER as readonly string[]).includes(f.key),
  );
  return funnet?.key ?? "till_hull_m";
}

/** Nøkkelen målavstand-feltet bruker i denne protokollen («shot_distance_m» el. «malAvstandM»). */
export function peiMalAvstandNokkel(protocol: unknown): string {
  const parsed = ProtokollSchema.safeParse(protocol);
  if (!parsed.success) return "shot_distance_m";
  const steg = parsed.data.steps[0];
  const funnet = steg.inputFields.find((f) =>
    (AVSTAND_FELT_NOKLER as readonly string[]).includes(f.key),
  );
  return funnet?.key ?? "shot_distance_m";
}

/** Har protokollen et miss-retning-select (kun Putt Gate i dag)? Gir V|H-knappene i TE-04. */
export function harMissSideFelt(protocol: unknown): boolean {
  const parsed = ProtokollSchema.safeParse(protocol);
  if (!parsed.success) return false;
  return parsed.data.steps[0].inputFields.some((f) => f.key === "miss_side");
}

/** Målet i en gate-protokolls target-tekst — se `parseGateMaal`. Ikke en gate-protokoll → null. */
export function gateMaalFraProtokoll(protocol: unknown): number | null {
  const parsed = ProtokollSchema.safeParse(protocol);
  if (!parsed.success || parsed.data.scoringMode !== "hit-rate") return null;
  return parseGateMaal(parsed.data.steps[0].target);
}

/**
 * Startgjett for målavstand-steppern i PEI-artefaktet — første tall i
 * target-teksten («100» i «PEI 100-150m < 0.06»). Kun en startverdi, alltid
 * justerbar — ingen protokoll-tall fabrikeres, mangler tallet brukes 100 m.
 */
export function peiStartMalAvstand(protocol: unknown): number {
  const parsed = ProtokollSchema.safeParse(protocol);
  if (!parsed.success) return 100;
  const target = parsed.data.steps[0].target;
  const tekst = typeof target === "number" ? String(target) : (target ?? "");
  const m = tekst.match(/(\d+)/);
  return m ? Number(m[1]) : 100;
}

/**
 * Målet i «gate»-protokollens target-tekst («≥ 8 / 10», «≥ 4 av 6 innenfor»)
 * som et rent tall. Brukes til TE-04s «mål N OK»-linje. Ingen tall funnet → null
 * (linjen utelates da, aldri fabrikkert).
 */
export function parseGateMaal(target: string | number | undefined): number | null {
  if (typeof target === "number") return target;
  if (!target) return null;
  const m = target.match(/(\d+)/);
  return m ? Number(m[1]) : null;
}

/* ── Gate — live tilstand ────────────────────────────────────────────────── */

export type GateSide = "V" | "H";
export type GateForsok = { ok: boolean | null; side: GateSide | null };

export function tomtGateForsok(shots: number): GateForsok[] {
  return Array.from({ length: shots }, () => ({ ok: null, side: null }));
}

/** Antall OK (gjennom) blant de FØRTE forsøkene. */
export function gateOkTeller(forsok: readonly GateForsok[]): number {
  return forsok.filter((f) => f.ok === true).length;
}

/** Antall Bom blant de FØRTE forsøkene. */
export function gateBomTeller(forsok: readonly GateForsok[]): number {
  return forsok.filter((f) => f.ok === false).length;
}

/** Er DETTE ene forsøket helt ferdigsvart (Bom med krevSide må ha fått V|H)? */
function gateForsokFullfort(f: GateForsok, krevSide: boolean): boolean {
  return f.ok !== null && (!krevSide || f.ok === true || f.side !== null);
}

/**
 * 0-indeksert neste ikke-fullsvarte forsøk (sammenhengende prefiks). Et Bom
 * som venter på V|H (når protokollen krever det) regnes IKKE som fullsvart —
 * indeksen blir stående på det forsøket til siden er valgt.
 */
export function gateNesteIndeks(forsok: readonly GateForsok[], krevSide: boolean): number {
  let i = 0;
  while (i < forsok.length && gateForsokFullfort(forsok[i], krevSide)) i++;
  return i;
}

/** Er hele forsøket komplett (alle registrert, og hvert Bom har fått side når protokollen krever det)? */
export function gateErFerdig(forsok: readonly GateForsok[], krevSide: boolean): boolean {
  return forsok.every((f) => gateForsokFullfort(f, krevSide));
}

/** «7 OK av 10»-forrige-tallet, avledet fra lagret hit-rate-prosentscore (score = treff/forventet*100). */
export function gateForrigeOkFraScore(score: number, shots: number): number {
  return Math.round((score / 100) * shots);
}

/* ── PEI — live tilstand ─────────────────────────────────────────────────── */

export type PeiForsok = { malAvstandM: number | null; tillMalM: number | null };

export function tomtPeiForsok(shots: number): PeiForsok[] {
  return Array.from({ length: shots }, () => ({ malAvstandM: null, tillMalM: null }));
}

/** 0-indeksert neste uregistrerte slag (sammenhengende prefiks). */
export function peiNesteIndeks(forsok: readonly PeiForsok[]): number {
  let i = 0;
  while (i < forsok.length && forsok[i].tillMalM !== null) i++;
  return i;
}

/** PEI for ett slag = till mål ÷ målavstand. Manglende data → null (telles ikke med i snittet). */
export function peiForForsok(f: PeiForsok): number | null {
  if (f.malAvstandM === null || f.tillMalM === null || f.malAvstandM <= 0) return null;
  return f.tillMalM / f.malAvstandM;
}

/** Snitt-PEI over de forsøkene som har gyldig verdi. Ingen gyldige → null. */
export function snittPei(forsok: readonly PeiForsok[]): number | null {
  const verdier = forsok.map(peiForForsok).filter((v): v is number => v !== null);
  if (verdier.length === 0) return null;
  return verdier.reduce((a, b) => a + b, 0) / verdier.length;
}

/** «4,26 % · 0,04» — PEI vises ALLTID som to tall (Train-lock HANDOFF §TESTER). Aldri ett brøktall. */
export function formatPei(pei: number): string {
  const prosent = (pei * 100).toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const desimal = pei.toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${prosent} % · ${desimal}`;
}
