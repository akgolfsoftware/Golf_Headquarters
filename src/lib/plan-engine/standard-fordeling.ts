// Standard-fordeling — kanoniske tall for standardplaner per (NgfKategori × LPhase).
// Løftet fra scripts/seed-plan-templates.ts slik at både generator-scriptet og
// tilpasningsmotoren (plan-engine) bruker samme kilde. Ren TypeScript, ingen
// prisma — deterministisk og testbar.

import type { NgfKategori, LPhase, PyramidArea } from "@/generated/prisma/client";

export type PyramideFordeling = Record<PyramidArea, number>;

// Pyramid % per NgfKategori (FYS/TEK/SLAG/SPILL/TURN, sum = 100).
// A-C = elite, mer spill/turnering, lite teknisk grunnarbeid.
// D-F = sterk amateur, balansert teknisk + spill.
// G-I = god klubbspiller, mer teknikk og nærspill.
// J-L = begynner/junior, mye teknikk og grunnlag.
export const STANDARD_PYRAMIDE: Record<NgfKategori, PyramideFordeling> = {
  A: { FYS: 10, TEK: 15, SLAG: 25, SPILL: 30, TURN: 20 },
  B: { FYS: 10, TEK: 18, SLAG: 27, SPILL: 28, TURN: 17 },
  C: { FYS: 12, TEK: 20, SLAG: 28, SPILL: 25, TURN: 15 },
  D: { FYS: 13, TEK: 22, SLAG: 30, SPILL: 25, TURN: 10 },
  E: { FYS: 14, TEK: 24, SLAG: 30, SPILL: 22, TURN: 10 },
  F: { FYS: 15, TEK: 25, SLAG: 30, SPILL: 22, TURN: 8 },
  G: { FYS: 15, TEK: 27, SLAG: 30, SPILL: 20, TURN: 8 },
  H: { FYS: 15, TEK: 28, SLAG: 32, SPILL: 18, TURN: 7 },
  I: { FYS: 15, TEK: 30, SLAG: 33, SPILL: 15, TURN: 7 },
  J: { FYS: 15, TEK: 32, SLAG: 35, SPILL: 13, TURN: 5 },
  K: { FYS: 15, TEK: 33, SLAG: 37, SPILL: 10, TURN: 5 },
  L: { FYS: 15, TEK: 35, SLAG: 38, SPILL: 7, TURN: 5 },
};

// Typiske antall økter per uke per kategori × LPhase.
export const STANDARD_OKT_ANTALL: Record<NgfKategori, Record<LPhase, number>> = {
  A: { GRUNN: 6, SPESIAL: 6, TURNERING: 5 },
  B: { GRUNN: 6, SPESIAL: 6, TURNERING: 5 },
  C: { GRUNN: 5, SPESIAL: 6, TURNERING: 5 },
  D: { GRUNN: 5, SPESIAL: 5, TURNERING: 4 },
  E: { GRUNN: 5, SPESIAL: 5, TURNERING: 4 },
  F: { GRUNN: 4, SPESIAL: 5, TURNERING: 4 },
  G: { GRUNN: 4, SPESIAL: 4, TURNERING: 3 },
  H: { GRUNN: 4, SPESIAL: 4, TURNERING: 3 },
  I: { GRUNN: 3, SPESIAL: 4, TURNERING: 3 },
  J: { GRUNN: 3, SPESIAL: 3, TURNERING: 2 },
  K: { GRUNN: 3, SPESIAL: 3, TURNERING: 2 },
  L: { GRUNN: 2, SPESIAL: 3, TURNERING: 2 },
};

// Typisk øktlengde (minutter) per kategori — elite trener lengre økter.
export const STANDARD_VARIGHET_MIN: Record<NgfKategori, number> = {
  A: 90, B: 90, C: 90,
  D: 75, E: 75, F: 75, G: 75,
  H: 60, I: 60, J: 60,
  K: 60, L: 45,
};

export const FASE_BESKRIVELSE: Record<LPhase, string> = {
  GRUNN: "Grunnperiode: fysisk og teknisk fundament, høyt volum, lav intensitet.",
  SPESIAL: "Spesialiseringsperiode: rettet mot spillerens svakeste SG-område, stigende intensitet.",
  TURNERING: "Turneringsperiode: redusert volum, skarp prestasjonsfokus, spill og strategitrening.",
};

export type UkeType = "BYGG" | "TOPP" | "DELOAD";

export interface SkjelettOkt {
  ukeNr: number; // 1–4
  dagNr: number; // 1–7 (mandag=1)
  pyramidArea: PyramidArea;
  varighetMin: number;
  ukeType: UkeType;
}

// Dag-spredning per antall økter i uka (mandag=1 … søndag=7).
const DAG_MONSTER: Record<number, number[]> = {
  1: [3],
  2: [2, 5],
  3: [1, 3, 5],
  4: [1, 2, 4, 5],
  5: [1, 2, 4, 5, 6],
  6: [1, 2, 3, 4, 5, 6],
};

// 4-ukers blokk: build → build → peak → deload (jf. AI_COACH_SYSTEM_PROMPT).
const UKE_TYPER: UkeType[] = ["BYGG", "BYGG", "TOPP", "DELOAD"];

const AREA_REKKEFOLGE: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

/** Fordel n økter på pyramideområder etter %-fordeling (largest remainder). */
export function fordelOkterPaaOmrader(
  fordeling: PyramideFordeling,
  antall: number,
): PyramidArea[] {
  const raa = AREA_REKKEFOLGE.map((area) => ({
    area,
    eksakt: (fordeling[area] / 100) * antall,
  }));
  const basis = raa.map((r) => ({ ...r, n: Math.floor(r.eksakt), rest: r.eksakt - Math.floor(r.eksakt) }));
  let tildelt = basis.reduce((s, r) => s + r.n, 0);
  const etterRest = [...basis].sort((a, b) => b.rest - a.rest);
  for (const r of etterRest) {
    if (tildelt >= antall) break;
    r.n++;
    tildelt++;
  }
  const ut: PyramidArea[] = [];
  for (const r of basis) for (let i = 0; i < r.n; i++) ut.push(r.area);
  return ut.slice(0, antall);
}

/**
 * Deterministisk 4-ukers skjelett for en (kategori × fase)-kombinasjon.
 * Struktur og tall kommer herfra — AI fyller kun inn titler/fokus/drill-valg.
 * Deload-uke: maks 4 økter (systemprompt-regelen) og 25 % kortere økter.
 */
export function byggStandardSkjelett(
  kategori: NgfKategori,
  fase: LPhase,
): SkjelettOkt[] {
  const basisAntall = STANDARD_OKT_ANTALL[kategori][fase];
  const varighet = STANDARD_VARIGHET_MIN[kategori];
  const fordeling = STANDARD_PYRAMIDE[kategori];
  const okter: SkjelettOkt[] = [];

  UKE_TYPER.forEach((ukeType, ukeIdx) => {
    const ukeNr = ukeIdx + 1;
    const antall =
      ukeType === "DELOAD" ? Math.min(4, Math.max(1, basisAntall - 1)) : basisAntall;
    const dager = DAG_MONSTER[antall] ?? DAG_MONSTER[6];
    const omrader = fordelOkterPaaOmrader(fordeling, antall);
    const ukeVarighet =
      ukeType === "DELOAD" ? Math.round((varighet * 0.75) / 15) * 15 : varighet;

    omrader.forEach((pyramidArea, i) => {
      okter.push({
        ukeNr,
        dagNr: dager[i],
        pyramidArea,
        varighetMin: ukeVarighet,
        ukeType,
      });
    });
  });

  return okter;
}
