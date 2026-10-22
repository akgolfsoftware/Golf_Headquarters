/**
 * Spiller A–K-kategori — snittscore-basert (kanonisk fra 2026-06-22).
 *
 * Primær kilde: brutto snitt i turnering inneværende kalenderår (Oslo), samme tall som IUP og
 * Rangliste (brutto-snitt.ts). Treningsrunder teller ikke.
 * Fallback: HCP → estimert snittscore (Broadie-tabell) når ingen turneringsrunder i år.
 *
 * Drill-filter, AI-plan og mestrings-økter bruker denne — ikke kategoriFraHcp.
 */

import type { NgfKategori } from "@/generated/prisma/client";
import { hentBruttoSnitt } from "@/lib/domain/brutto-snitt-data";
import {
  type AkKategori,
  akKategoriFraTall,
  kategoriFraSnittscore,
} from "@/lib/domain/ak-kategori";
import { avgScoreFromHcp } from "@/lib/stats/sg-estimator";

/** A (best) → K (nybegynner). */
export const AK_KATEGORI_ORDER: readonly AkKategori[] = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
] as const;

export function akKategoriIdx(k: AkKategori): number {
  return AK_KATEGORI_ORDER.indexOf(k);
}

/** Prisma enum → A–K. */
export function ngfKategoriTilAk(k: NgfKategori | null): AkKategori | null {
  if (!k) return null;
  return k as AkKategori;
}

/** A–K → Prisma enum (for lagring i ExerciseDefinition). */
export function akTilNgfKategori(k: AkKategori): NgfKategori {
  return k as NgfKategori;
}

/** Brutto snitt i turnering inneværende kalenderår (Oslo). Null uten turneringsrunder. */
export async function hentSesongSnittscore(userId: string): Promise<number | null> {
  return (await hentBruttoSnitt(userId)).turnering.snitt;
}

/**
 * Spillerens A–K-kategori for drill-filter og AI-plan.
 * WAGR ngfCategory brukes hvis satt (allerede A–K-skala), ellers sesong-snittscore,
 * ellers HCP→snittscore-estimat.
 */
export async function hentSpillerAkKategori(
  userId: string,
  opts?: { wagrNgfCategory?: string | null; hcp?: number | null },
): Promise<AkKategori | null> {
  const fraWagr = opts?.wagrNgfCategory?.trim().toUpperCase();
  if (fraWagr && /^[A-K]$/.test(fraWagr)) {
    return ngfKategoriTilAk(fraWagr as NgfKategori);
  }

  return akKategoriFraTall({ snitt: await hentSesongSnittscore(userId), hcp: opts?.hcp ?? null });
}

/**
 * Sjekker om drill min/max-kategori dekker spillerens A–K-nivå.
 * Konvensjon: minKategori = beste spiller (lavest indeks), maxKategori = svakeste.
 */
export function drillMatcherSpiller(
  minKategori: NgfKategori | null,
  maxKategori: NgfKategori | null,
  spillerKategori: AkKategori,
): boolean {
  const spillerIdx = akKategoriIdx(spillerKategori);
  const minAk = ngfKategoriTilAk(minKategori);
  const maxAk = ngfKategoriTilAk(maxKategori);

  if (minAk != null && akKategoriIdx(minAk) > spillerIdx) {
    return false;
  }
  if (maxAk != null && akKategoriIdx(maxAk) < spillerIdx) {
    return false;
  }
  return true;
}

/** Normaliser drill-tags: swap omvendt range. */
export function normaliserDrillKategoriRange(
  minKategori: NgfKategori | null,
  maxKategori: NgfKategori | null,
): { minKategori: NgfKategori | null; maxKategori: NgfKategori | null; swapped: boolean } {
  let min = minKategori;
  let max = maxKategori;
  let swapped = false;

  const minAk = ngfKategoriTilAk(min);
  const maxAk = ngfKategoriTilAk(max);
  if (minAk != null && maxAk != null && akKategoriIdx(minAk) > akKategoriIdx(maxAk)) {
    [min, max] = [max, min];
    swapped = true;
  }

  return { minKategori: min, maxKategori: max, swapped };
}

/**
 * Utled A–K drill-tags fra HCP-spenn (lavere HCP = bedre spiller = minKategori).
 * Brukes ved retag av eksisterende drill-bank.
 */
export function drillKategoriFraHcpRange(
  minHcp: number | null,
  maxHcp: number | null,
): { minKategori: NgfKategori; maxKategori: NgfKategori } {
  const loHcp = minHcp ?? -5;
  const hiHcp = maxHcp ?? 54;
  const bestHcp = Math.min(loHcp, hiHcp);
  const worstHcp = Math.max(loHcp, hiHcp);

  const minK = akTilNgfKategori(kategoriFraSnittscore(avgScoreFromHcp(bestHcp)).kategori);
  const maxK = akTilNgfKategori(kategoriFraSnittscore(avgScoreFromHcp(worstHcp)).kategori);
  const norm = normaliserDrillKategoriRange(minK, maxK);

  return {
    minKategori: norm.minKategori ?? minK,
    maxKategori: norm.maxKategori ?? maxK,
  };
}