/**
 * translate-taxonomy — gjør AK-taksonomi spillervennlig i PlayerHQ Standard-modus.
 *
 * I CoachHQ vises koder som M0, L_AUTO, CS80, PR3 — disse er kompakte og presise
 * for trenere som er fortrolige med taksonomien. For spillere er de uleselige.
 *
 * Disse helperne oversetter koder til hverdagsspråk (norsk bokmål). Bruk dem
 * der `viewMode === "standard"`. I Avansert-modus skal koden vises som den er.
 */

import type {
  MMiljo,
  LFase,
  CSNivaa,
  PRPress,
  PracticeType,
  PyramidArea,
} from "@/generated/prisma/client";

const MILJO: Record<MMiljo, string> = {
  M0: "Statisk (innendørs)",
  M1: "Slow-motion",
  M2: "Simulator",
  M3: "Bane-simulering",
  M4: "Bane",
  M5: "Turnering",
};

const L_FASE: Record<LFase, string> = {
  L_KROPP: "Kropp",
  L_ARM: "Arm",
  L_KOLLE: "Kølle",
  L_BALL: "Ball",
  L_AUTO: "Automatisert",
};

const CS_NIVAA: Record<CSNivaa, string> = {
  CS50: "50 % intensitet",
  CS60: "60 % intensitet",
  CS70: "70 % intensitet",
  CS80: "80 % intensitet",
  CS90: "90 % intensitet",
  CS100: "Full intensitet",
};

const PR_PRESS: Record<PRPress, string> = {
  PR1: "Veldig lavt press",
  PR2: "Lavt press",
  PR3: "Moderat press",
  PR4: "Høyt press",
  PR5: "Konkurransepress",
};

const PRAKSISTYPE: Record<PracticeType, string> = {
  BLOKK: "Repetisjon",
  RANDOM: "Variasjon",
  KONKURRANSE: "Konkurranse",
  SPILL_TEST: "Spilltest",
};

const PYRAMIDE: Record<PyramidArea, string> = {
  FYS: "Fysisk",
  TEK: "Teknikk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

export function translateMiljo(m: MMiljo): string {
  return MILJO[m];
}

export function translateLFase(l: LFase): string {
  return L_FASE[l];
}

export function translateCSNivaa(c: CSNivaa): string {
  return CS_NIVAA[c];
}

export function translatePRPress(p: PRPress): string {
  return PR_PRESS[p];
}

export function translatePraksistype(p: PracticeType): string {
  return PRAKSISTYPE[p];
}

export function translatePyramide(p: PyramidArea): string {
  return PYRAMIDE[p];
}

/**
 * Generisk oversetter — prøver alle taksonomi-namespacene. Returnerer original
 * verdi hvis koden ikke gjenkjennes (f.eks. fri-tekst-omraade).
 */
export function translateTaxonomyCode(kode: string): string {
  if (kode in MILJO) return MILJO[kode as MMiljo];
  if (kode in L_FASE) return L_FASE[kode as LFase];
  if (kode in CS_NIVAA) return CS_NIVAA[kode as CSNivaa];
  if (kode in PR_PRESS) return PR_PRESS[kode as PRPress];
  if (kode in PRAKSISTYPE) return PRAKSISTYPE[kode as PracticeType];
  if (kode in PYRAMIDE) return PYRAMIDE[kode as PyramidArea];
  return kode;
}
