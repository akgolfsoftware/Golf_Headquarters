/**
 * Jarvis-merge eval-gate (C6 / Loop 10).
 *
 * Fasit: JV-01–03. Jarvis merger ALDRI selv — denne fila evaluerer bare.
 * Rød eval = STENGT. Fire sjekker: ACWR 0,8–1,3 · ingen kollisjon ·
 * motorer adskilt · drills komplette.
 *
 * Anti-scope: `src/lib/jarvis/` er Anders' personlige assistent. Denne
 * motoren bor i `domain/jarvis-merge/`.
 *
 * Rene funksjoner, ingen Prisma. ACWR-tallet kommer inn ferdig regnet
 * (gjenbruk `beregnBelastning` fra `src/lib/health/belastning.ts` i kalleren).
 */

import { JV_SJEKK_TITTEL, JV_SJEKK_TITTEL_FEIL } from "./labels";

export const ACWR_MIN = 0.8;
export const ACWR_MAX = 1.3;

export type JarvisMotorikk = "UTEN_BALL" | "LAV_HAST" | "AUTO";

export type JarvisDrill = {
  id: string;
  tittel: string;
  varighetMin: number | null;
};

export type JarvisOktForslag = {
  id: string;
  /** YYYY-MM-DD. */
  dato: string;
  startMin: number;
  sluttMin: number;
  motorikk: readonly JarvisMotorikk[];
  drills: readonly JarvisDrill[];
};

export type JarvisOpptattBlokk = {
  id: string;
  dato: string;
  startMin: number;
  sluttMin: number;
};

export type JarvisEvalInput = {
  acwr: number | null;
  forslag: readonly JarvisOktForslag[];
  eksisterende: readonly JarvisOpptattBlokk[];
};

export type JarvisSjekkId = "ACWR" | "KOLLISJON" | "MOTOR" | "DRILLS";

export type JarvisSjekk = {
  id: JarvisSjekkId;
  ok: boolean;
  tittel: string;
  detalj: string;
};

export type JarvisEval = {
  status: "AAPEN" | "STENGT";
  sjekker: JarvisSjekk[];
};

function overlapper(a: { dato: string; startMin: number; sluttMin: number }, b: { dato: string; startMin: number; sluttMin: number }): boolean {
  if (a.dato !== b.dato) return false;
  return a.startMin < b.sluttMin && b.startMin < a.sluttMin;
}

function acwrOk(acwr: number | null): boolean {
  if (acwr == null || !Number.isFinite(acwr)) return false;
  return acwr >= ACWR_MIN && acwr <= ACWR_MAX;
}

function fmtAcwr(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "mangler";
  return n.toFixed(2).replace(".", ",");
}

function sjekkAcwr(acwr: number | null): JarvisSjekk {
  const ok = acwrOk(acwr);
  return {
    id: "ACWR",
    ok,
    tittel: ok ? JV_SJEKK_TITTEL.ACWR : JV_SJEKK_TITTEL_FEIL.ACWR,
    detalj: `ACWR ${fmtAcwr(acwr)} · vindu ${fmtAcwr(ACWR_MIN)}–${fmtAcwr(ACWR_MAX)}`,
  };
}

function sjekkKollisjon(input: JarvisEvalInput): JarvisSjekk {
  const blokker: JarvisOpptattBlokk[] = [
    ...input.eksisterende,
    ...input.forslag.map((f) => ({ id: f.id, dato: f.dato, startMin: f.startMin, sluttMin: f.sluttMin })),
  ];
  let treff = 0;
  for (let i = 0; i < blokker.length; i++) {
    for (let j = i + 1; j < blokker.length; j++) {
      const a = blokker[i];
      const b = blokker[j];
      if (a && b && overlapper(a, b)) treff += 1;
    }
  }
  const ok = treff === 0;
  return {
    id: "KOLLISJON",
    ok,
    tittel: ok ? JV_SJEKK_TITTEL.KOLLISJON : JV_SJEKK_TITTEL_FEIL.KOLLISJON,
    detalj: ok ? "Ingen overlapp i uka" : `${treff} overlapp`,
  };
}

function sjekkMotor(forslag: readonly JarvisOktForslag[]): JarvisSjekk {
  const blandet = forslag.filter((f) => new Set(f.motorikk).size > 1);
  const ok = blandet.length === 0;
  return {
    id: "MOTOR",
    ok,
    tittel: ok ? JV_SJEKK_TITTEL.MOTOR : JV_SJEKK_TITTEL_FEIL.MOTOR,
    detalj: ok ? "Én motorikk per økt" : `${blandet.length} økter blander motorikk`,
  };
}

export function drillErKomplett(d: JarvisDrill): boolean {
  return d.tittel.trim().length > 0 && d.varighetMin != null && d.varighetMin > 0;
}

function sjekkDrills(forslag: readonly JarvisOktForslag[]): JarvisSjekk {
  const alle = forslag.flatMap((f) => f.drills);
  const mangler = alle.filter((d) => !drillErKomplett(d));
  const tomOkt = forslag.filter((f) => f.drills.length === 0);
  const ok = mangler.length === 0 && tomOkt.length === 0;
  return {
    id: "DRILLS",
    ok,
    tittel: ok ? JV_SJEKK_TITTEL.DRILLS : JV_SJEKK_TITTEL_FEIL.DRILLS,
    detalj: ok ? `${alle.length} drills komplette` : `${mangler.length + tomOkt.length} mangler`,
  };
}

/** Evaluer et merge-forslag. STENGT hvis minst én sjekk er rød. */
export function evaluerMerge(input: JarvisEvalInput): JarvisEval {
  const sjekker = [
    sjekkAcwr(input.acwr),
    sjekkKollisjon(input),
    sjekkMotor(input.forslag),
    sjekkDrills(input.forslag),
  ];
  return {
    status: sjekker.every((s) => s.ok) ? "AAPEN" : "STENGT",
    sjekker,
  };
}
