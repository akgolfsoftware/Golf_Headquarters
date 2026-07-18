/**
 * AK-formel visningsmodell (Vei B · 2026-07-19).
 *
 * Appen VISER og SETTER 3 læringsfase-steg + 4 press-nivåer overalt (PlayerHQ +
 * AgencyOS). Databasen og AI-coach-motoren beholder de finkornede 5 L-fasene
 * (L_KROPP … L_AUTO) og PR1–PR5 — denne modulen er den ENE broen mellom dem.
 *
 *  - LES:   enum-verdi fra DB/motor → visnings-steg (gruppe-label).
 *  - SKRIV: brukerens steg-valg → representativ enum-verdi. Bevarer en eksisterende
 *           finkornet verdi hvis den alt ligger i valgt gruppe, så AI-coachens
 *           presisjon ikke går tapt når en coach bare åpner og lagrer en økt.
 *
 * Rør ALDRI denne broen for å «forenkle» motoren — motoren skal bli finkornet.
 * Nye visnings-flater importerer herfra, aldri egne inline enum→label-mappinger.
 */
import type { LFase } from "@/generated/prisma/client";

// ─────────────────────────────────────────────────────────────
// Læringsfase — 3 steg over de 5 L-fasene
// ─────────────────────────────────────────────────────────────
export type FaseSteg = "UTEN_BALL" | "LAV_HASTIGHET" | "AUTO";

export const FASE_STEG: {
  key: FaseSteg;
  label: string;
  kort: string;
  beskrivelse: string;
  lFaser: LFase[];
  /** Representativ enum-verdi ved skriving fra UI. */
  skriv: LFase;
}[] = [
  {
    key: "UTEN_BALL",
    label: "Uten ball",
    kort: "uten ball",
    beskrivelse: "Grunnbevegelsen bygges. Tørrsving, speil, ingen ball.",
    lFaser: ["L_KROPP", "L_ARM"],
    skriv: "L_ARM",
  },
  {
    key: "LAV_HASTIGHET",
    label: "Lav hastighet",
    kort: "lav fart",
    beskrivelse: "Bevegelsen bygges opp med ball i redusert tempo.",
    lFaser: ["L_KOLLE", "L_BALL"],
    skriv: "L_BALL",
  },
  {
    key: "AUTO",
    label: "Auto",
    kort: "auto",
    beskrivelse: "Automatisert, full fart under press.",
    lFaser: ["L_AUTO"],
    skriv: "L_AUTO",
  },
];

/** Steg-keys i rekkefølge — praktisk for sykle-chips og velgere. */
export const FASE_STEG_KEYS: FaseSteg[] = FASE_STEG.map((s) => s.key);

/** Enum-verdi (DB/motor) → visnings-steg. Null når ikke satt / ukjent. */
export function lFaseTilSteg(l: LFase | null | undefined): FaseSteg | null {
  if (!l) return null;
  return FASE_STEG.find((s) => s.lFaser.includes(l))?.key ?? null;
}

/**
 * Steg-valg fra UI → representativ enum-verdi. Bevarer `eksisterende` når den
 * alt ligger i valgt gruppe, så en motor-satt finkornet verdi ikke overskrives.
 */
export function stegTilLFase(
  steg: FaseSteg | null,
  eksisterende?: LFase | null,
): LFase | null {
  if (!steg) return null;
  const s = FASE_STEG.find((x) => x.key === steg);
  if (!s) return null;
  if (eksisterende && s.lFaser.includes(eksisterende)) return eksisterende;
  return s.skriv;
}

/** Enum-verdi → klarspråk-label ("Uten ball" osv.). */
export function faseLabel(l: LFase | null | undefined): string {
  const steg = lFaseTilSteg(l);
  return FASE_STEG.find((s) => s.key === steg)?.label ?? "Ikke satt";
}

/** Steg-key → klarspråk-label. */
export function stegLabel(steg: FaseSteg | null | undefined): string {
  return FASE_STEG.find((s) => s.key === steg)?.label ?? "Ikke satt";
}

// ─────────────────────────────────────────────────────────────
// Press — 4 nivåer over PR1–PR5 (konsekvens-trapp)
// ─────────────────────────────────────────────────────────────
export type PressNivaa = "FRI" | "KRAV" | "UTFORDRING" | "KONKURRANSE";
type PrKode = "PR1" | "PR2" | "PR3" | "PR4" | "PR5";

export const PRESS_NIVAER: {
  key: PressNivaa;
  label: string;
  beskrivelse: string;
  pr: PrKode[];
  /** Representativ enum-verdi ved skriving fra UI. */
  skriv: PrKode;
}[] = [
  {
    key: "FRI",
    label: "Fri",
    beskrivelse: "Bygge, feil er gratis. Ingen scoring, gjenta fritt.",
    pr: ["PR1"],
    skriv: "PR1",
  },
  {
    key: "KRAV",
    label: "Krav",
    beskrivelse: "Teste mot deg selv. Konkret mål, du scorer, må nå kravet.",
    pr: ["PR2"],
    skriv: "PR2",
  },
  {
    key: "UTFORDRING",
    label: "Utfordring",
    beskrivelse: "Konsekvens inn. Én sjanse per slag, straff/belønning, men alene.",
    pr: ["PR3"],
    skriv: "PR3",
  },
  {
    key: "KONKURRANSE",
    label: "Konkurranse",
    beskrivelse: "Prestere som i turnering. Mot andre / observert, poeng teller.",
    pr: ["PR4", "PR5"],
    skriv: "PR4",
  },
];

/** Press-nivå-keys i rekkefølge. */
export const PRESS_NIVAA_KEYS: PressNivaa[] = PRESS_NIVAER.map((n) => n.key);

/** PR-enum-verdi (DB/motor) → visnings-nivå. Null når ikke satt / ukjent. */
export function pressTilNivaa(p: string | null | undefined): PressNivaa | null {
  if (!p) return null;
  return PRESS_NIVAER.find((n) => n.pr.includes(p as PrKode))?.key ?? null;
}

/**
 * Press-nivå fra UI → representativ PR-enum. Bevarer `eksisterende` når den alt
 * ligger i valgt gruppe (f.eks. motor-satt PR5 beholdes under "Konkurranse").
 */
export function nivaaTilPress(
  nivaa: PressNivaa | null,
  eksisterende?: string | null,
): PrKode | null {
  if (!nivaa) return null;
  const n = PRESS_NIVAER.find((x) => x.key === nivaa);
  if (!n) return null;
  if (eksisterende && n.pr.includes(eksisterende as PrKode)) {
    return eksisterende as PrKode;
  }
  return n.skriv;
}

/** PR-enum-verdi → klarspråk-label ("Fri" osv.). */
export function pressLabel(p: string | null | undefined): string {
  const nivaa = pressTilNivaa(p);
  return PRESS_NIVAER.find((n) => n.key === nivaa)?.label ?? "Ikke satt";
}

/** Nivå-key → klarspråk-label. */
export function pressNivaaLabel(nivaa: PressNivaa | null | undefined): string {
  return PRESS_NIVAER.find((n) => n.key === nivaa)?.label ?? "Ikke satt";
}
