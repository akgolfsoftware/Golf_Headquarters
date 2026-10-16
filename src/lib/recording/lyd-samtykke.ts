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
import { harForelderGodkjent, maaHaForesattSamtykke } from "@/lib/auth/minor";

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

/**
 * Spilleren opptaket gjelder (D-63). `kreverForesatt`: under 16 eller ukjent
 * alder. `forelderGodkjent`: forelder har godkjent kontoen.
 */
export type LydSamtykkeSpiller = {
  kreverForesatt: boolean;
  forelderGodkjent: boolean;
};

/**
 * Ren: bygg sjekk-resultat fra rad (eller null).
 *
 * Under 16 (D-63, TA-04): opptak er sperret til forelder har godkjent kontoen,
 * og bare samtykke gitt av FORESATT teller. Et «SELV»-samtykke for et barn,
 * også eldre rader, gir aldri opptak.
 */
export function byggLydSamtykkeSjekk(
  rad: { status: string; gittAt: Date | null; gittAv?: string } | null,
  spiller: LydSamtykkeSpiller,
): LydSamtykkeSjekk {
  if (!rad) {
    return { tillatt: false, status: "MANGLER", gittAt: null };
  }
  if (
    rad.status === "GITT" &&
    spiller.kreverForesatt &&
    (!spiller.forelderGodkjent || rad.gittAv !== "FORESATT")
  ) {
    return { tillatt: false, status: "VENTER", gittAt: rad.gittAt };
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
  const [rad, spillere] = await Promise.all([
    prisma.lydSamtykke.findUnique({
      where: { userId: playerId },
      select: { status: true, gittAt: true, gittAv: true },
    }),
    hentLydSamtykkeSpillere([playerId]),
  ]);
  return byggLydSamtykkeSjekk(rad, spillere.get(playerId) ?? UKJENT_SPILLER);
}

/** Finnes ikke spilleren, behandles den strengest mulig. */
const UKJENT_SPILLER: LydSamtykkeSpiller = { kreverForesatt: true, forelderGodkjent: false };

async function hentLydSamtykkeSpillere(
  playerIds: string[],
): Promise<Map<string, LydSamtykkeSpiller>> {
  const [brukere, relasjoner] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: playerIds } },
      select: {
        id: true,
        role: true,
        dateOfBirth: true,
        requiresGuardianConsent: true,
        guardianConsentGivenAt: true,
      },
    }),
    prisma.parentRelation.findMany({
      where: { childId: { in: playerIds }, approved: true },
      select: { childId: true },
    }),
  ]);
  const medForelder = new Set(relasjoner.map((r) => r.childId));
  return new Map(
    brukere.map((b) => [
      b.id,
      {
        kreverForesatt: maaHaForesattSamtykke(b),
        forelderGodkjent: harForelderGodkjent({
          ...b,
          harGodkjentForelder: medForelder.has(b.id),
        }),
      },
    ]),
  );
}

/**
 * Kart playerId → tillatt for UI (skjul Start-knapp).
 * Spillere uten rad får tillatt=false. Samme regel som opptaksstart.
 */
export async function hentLydSamtykkeKart(
  playerIds: string[],
): Promise<Record<string, boolean>> {
  if (playerIds.length === 0) return {};
  const [rader, spillere] = await Promise.all([
    prisma.lydSamtykke.findMany({
      where: { userId: { in: playerIds } },
      select: { userId: true, status: true, gittAt: true, gittAv: true },
    }),
    hentLydSamtykkeSpillere(playerIds),
  ]);
  const byId = new Map(rader.map((r) => [r.userId, r]));
  const out: Record<string, boolean> = {};
  for (const id of playerIds) {
    out[id] = byggLydSamtykkeSjekk(byId.get(id) ?? null, spillere.get(id) ?? UKJENT_SPILLER).tillatt;
  }
  return out;
}
