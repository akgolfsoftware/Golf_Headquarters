/**
 * Spiller A–K-kategori — snittscore-basert (kanonisk fra 2026-06-22).
 *
 * Primær kilde: snitt brutto score inneværende kalenderår.
 * Fallback: HCP → estimert snittscore (Broadie-tabell) når ingen runder i år.
 *
 * Drill-filter, AI-plan og mestrings-økter bruker denne — ikke kategoriFraHcp.
 */

import type { NgfKategori } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  type AkKategori,
  kategoriFraSnittscore,
} from "@/lib/domain/ak-kategori";
import { avgScoreFromHcp } from "@/lib/stats/sg-estimator";

/** A (best) → K (nybegynner). L finnes ikke i A–K — mappes til K. */
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

/** Prisma enum → A–K (L dødt → K). */
export function ngfKategoriTilAk(k: NgfKategori | null): AkKategori | null {
  if (!k) return null;
  if (k === "L") return "K";
  return k as AkKategori;
}

/** A–K → Prisma enum (for lagring i ExerciseDefinition). */
export function akTilNgfKategori(k: AkKategori): NgfKategori {
  return k as NgfKategori;
}

/** Snitt brutto score for runder spilt inneværende kalenderår. */
export async function hentSesongSnittscore(userId: string): Promise<number | null> {
  const aar = new Date().getFullYear();
  const sesongStart = new Date(aar, 0, 1);
  const runder = await prisma.round.findMany({
    where: { userId, playedAt: { gte: sesongStart } },
    select: { score: true },
  });
  if (runder.length === 0) return null;
  return runder.reduce((s, r) => s + r.score, 0) / runder.length;
}

/**
 * Spillerens A–K-kategori for drill-filter og AI-plan.
 * WAGR ngfCategory brukes hvis satt (allerede A–K/L skala), ellers sesong-snittscore,
 * ellers HCP→snittscore-estimat.
 */
export async function hentSpillerAkKategori(
  userId: string,
  opts?: { wagrNgfCategory?: string | null; hcp?: number | null },
): Promise<AkKategori | null> {
  const fraWagr = opts?.wagrNgfCategory?.trim().toUpperCase();
  if (fraWagr && /^[A-KL]$/.test(fraWagr)) {
    return ngfKategoriTilAk(fraWagr as NgfKategori);
  }

  const snitt = await hentSesongSnittscore(userId);
  if (snitt != null) {
    return kategoriFraSnittscore(snitt).kategori;
  }

  const hcp = opts?.hcp ?? null;
  if (hcp != null) {
    return kategoriFraSnittscore(avgScoreFromHcp(hcp)).kategori;
  }

  return null;
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

/** Normaliser drill-tags: swap omvendt range, map L→K. */
export function normaliserDrillKategoriRange(
  minKategori: NgfKategori | null,
  maxKategori: NgfKategori | null,
): { minKategori: NgfKategori | null; maxKategori: NgfKategori | null; swapped: boolean } {
  let min = minKategori === "L" ? ("K" as NgfKategori) : minKategori;
  let max = maxKategori === "L" ? ("K" as NgfKategori) : maxKategori;
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