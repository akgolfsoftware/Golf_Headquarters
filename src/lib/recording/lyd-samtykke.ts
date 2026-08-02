/**
 * Lydsamtykke for coaching-opptak (FØR/UNDER/ETTER-pilot).
 *
 * Hard gate: uten status GITT kan fangst ikke starte. Dette er det ene
 * unntaket fra invariant 1 («anbefalinger sperrer aldri») — se
 * docs/for-under-etter-spec.md §4. Invariant 1 gjelder trening, ikke juss.
 *
 * Rene regler er testbare uten DB. DB-oppslag ligger i `hentLydSamtykkeStatus`.
 */

import { prisma } from "@/lib/prisma";

export const LYD_SAMTYKKE_STATUS = ["GITT", "VENTER", "TRUKKET"] as const;
export type LydSamtykkeStatus = (typeof LYD_SAMTYKKE_STATUS)[number];

/** API-/UI-kode når opptak avvises. */
export const LYD_SAMTYKKE_MANGLER = "lyd-samtykke-mangler" as const;

export type LydSamtykkeSjekk =
  | { tillatt: true; status: "GITT"; gittAt: Date | null }
  | {
      tillatt: false;
      /** MANGLER = ingen rad i DB (samme praktisk sperre som VENTER). */
      status: "VENTER" | "TRUKKET" | "MANGLER";
      gittAt: Date | null;
    };

/** Ren: kan fangst starte ut fra lagret status-streng? */
export function kanStarteFangst(status: string | null | undefined): boolean {
  return status === "GITT";
}

/** Ren: bygg sjekk-resultat fra rad (eller null). */
export function byggLydSamtykkeSjekk(
  rad: { status: string; gittAt: Date | null } | null,
): LydSamtykkeSjekk {
  if (!rad) {
    return { tillatt: false, status: "MANGLER", gittAt: null };
  }
  if (rad.status === "GITT") {
    return { tillatt: true, status: "GITT", gittAt: rad.gittAt };
  }
  if (rad.status === "TRUKKET") {
    return { tillatt: false, status: "TRUKKET", gittAt: rad.gittAt };
  }
  // VENTER eller ukjent → sperre (samme som VENTER i UI)
  return { tillatt: false, status: "VENTER", gittAt: rad.gittAt };
}

/** Norsk melding til coach (API + UI). */
export function lydSamtykkeMelding(
  sjekk: Extract<LydSamtykkeSjekk, { tillatt: false }>,
): string {
  switch (sjekk.status) {
    case "TRUKKET":
      return "Lydsamtykke er trukket tilbake. Opptak er ikke tillatt.";
    case "VENTER":
      return "Venter på samtykke fra foresatt. Opptak kan ikke starte.";
    case "MANGLER":
    default:
      return "Venter på samtykke fra foresatt. Opptak kan ikke starte.";
  }
}

/**
 * Hent samtykkestatus for én spiller. Mangler rad = MANGLER (sperre).
 */
export async function hentLydSamtykkeStatus(
  playerId: string,
): Promise<LydSamtykkeSjekk> {
  const rad = await prisma.lydSamtykke.findUnique({
    where: { userId: playerId },
    select: { status: true, gittAt: true },
  });
  return byggLydSamtykkeSjekk(rad);
}

/**
 * Kart playerId → tillatt for UI (skjul Start-knapp).
 * Spillere uten rad får tillatt=false.
 */
export async function hentLydSamtykkeKart(
  playerIds: string[],
): Promise<Record<string, boolean>> {
  if (playerIds.length === 0) return {};
  const rader = await prisma.lydSamtykke.findMany({
    where: { userId: { in: playerIds } },
    select: { userId: true, status: true },
  });
  const byId = new Map(rader.map((r) => [r.userId, r.status]));
  const out: Record<string, boolean> = {};
  for (const id of playerIds) {
    out[id] = kanStarteFangst(byId.get(id));
  }
  return out;
}
