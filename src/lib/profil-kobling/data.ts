/**
 * Data-tilgang for profilkobling. Alt går gjennom databasefunksjonene i schema
 * `dashboard` (repoet ak-golf-pipelines, migrasjon 0012 og 0014). De eier
 * logikken; her kalles de og svaret valideres.
 *
 * Ingen av funksjonene tar en person-id fra klienten som grunnlag for å vise
 * data. `profile_results` tar bare bruker-id og slår selv opp den BEKREFTEDE
 * koblingen, så det finnes ingen parameter å manipulere for å se en annen
 * spillers resultater.
 */

import "server-only";

import { prisma } from "@/lib/prisma";
import {
  KandidaterSchema,
  KoblingsstatusSchema,
  ProfilResultaterSchema,
  type Kandidater,
  type KoblingsMetode,
  type Koblingsstatus,
  type ProfilResultater,
} from "./typer";
import type { Oppslag } from "./regler";

export class ForMangeOppslag extends Error {
  constructor() {
    super("For mange oppslag. Prøv igjen om en time.");
  }
}

export class AlleredeKoblet extends Error {
  constructor(melding: string) {
    super(melding);
  }
}

function erRateLimit(feil: unknown): boolean {
  return feil instanceof Error && feil.message.includes("for mange oppslag");
}

function erAlleredeKoblet(feil: unknown): string | null {
  if (!(feil instanceof Error)) return null;
  if (feil.message.includes("allerede koblet")) {
    return feil.message.includes("annen profil")
      ? "Denne spilleren er allerede koblet til en annen profil."
      : "Profilen din er allerede koblet.";
  }
  return null;
}

/** Oppslag på golf-ID, ellers navn + fødselsår. Rate-begrenset i databasen. */
export async function finnKandidater(userId: string, oppslag: Oppslag): Promise<Kandidater> {
  try {
    const rader = await prisma.$queryRaw<{ r: unknown }[]>`
      SELECT dashboard.find_profile_candidates(
        ${userId}::text, ${oppslag.golfId}::text, ${oppslag.navn}::text, ${oppslag.fodselsaar}::integer
      ) AS r`;
    return KandidaterSchema.parse(rader[0]?.r);
  } catch (feil) {
    if (erRateLimit(feil)) throw new ForMangeOppslag();
    throw feil;
  }
}

/** Oppretter en ventende kobling. Returnerer kobling-id. */
export async function beOmKobling(
  userId: string,
  personId: number,
  metode: KoblingsMetode,
): Promise<number> {
  try {
    const rader = await prisma.$queryRaw<{ id: bigint | number }[]>`
      SELECT dashboard.request_profile_link(${userId}::text, ${personId}::bigint, ${metode}::text) AS id`;
    return Number(rader[0]?.id);
  } catch (feil) {
    const melding = erAlleredeKoblet(feil);
    if (melding) throw new AlleredeKoblet(melding);
    throw feil;
  }
}

export async function bekreftKobling(linkId: number, userId: string): Promise<boolean> {
  const rader = await prisma.$queryRaw<{ ok: boolean }[]>`
    SELECT dashboard.confirm_profile_link(${linkId}::bigint, ${userId}::text) AS ok`;
  return rader[0]?.ok === true;
}

export async function avvisKobling(linkId: number, userId: string): Promise<boolean> {
  const rader = await prisma.$queryRaw<{ ok: boolean }[]>`
    SELECT dashboard.reject_profile_link(${linkId}::bigint, ${userId}::text) AS ok`;
  return rader[0]?.ok === true;
}

/** Angre: fjerner innsynet. Selve historikken i databasen er urørt. */
export async function angreKobling(userId: string): Promise<boolean> {
  const rader = await prisma.$queryRaw<{ ok: boolean }[]>`
    SELECT dashboard.revoke_profile_link(${userId}::text) AS ok`;
  return rader[0]?.ok === true;
}

export async function hentKoblingsstatus(userId: string): Promise<Koblingsstatus> {
  const rader = await prisma.$queryRaw<{ r: unknown }[]>`
    SELECT dashboard.profile_link_status(${userId}::text) AS r`;
  return KoblingsstatusSchema.parse(rader[0]?.r);
}

/** null uten bekreftet kobling. Bare brukerens EGNE resultater. */
export async function hentProfilResultater(userId: string): Promise<ProfilResultater | null> {
  const rader = await prisma.$queryRaw<{ r: unknown }[]>`
    SELECT dashboard.profile_results(${userId}::text) AS r`;
  const r = rader[0]?.r;
  return r == null ? null : ProfilResultaterSchema.parse(r);
}
