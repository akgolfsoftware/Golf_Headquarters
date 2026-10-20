"use server";

/**
 * Trenerens kobling av en spiller under 16 til resultatprofilen (Anders 20.10.2026).
 * Spillere fra 16 år kobler seg selv (src/app/portal/meg/resultater/actions.ts).
 *
 * Samme sikkerhet som spillerens egen flyt:
 *  - Skrivetilgang til spilleren kreves (assertCoachTilgangTilSpiller): egen AK-coach eller admin,
 *    aldri en organisasjonstrener (WANG/Team Norway).
 *  - Navn og fødselsår hentes fra spillerens profil på serveren. Klienten oppgir bare spiller og
 *    eventuelt golf-ID.
 *  - Serveren kjører oppslaget på nytt og godtar bare en person som fortsatt er en kandidat som
 *    stemmer med profilen. En POST med vilkårlig person-id kobler ingen.
 *  - Oppslagene telles mot spilleren (10 i timen), så en trener kan ikke lete opp barn i bulk.
 *  - Hver kobling og fjerning havner i revisjonsloggen med treneren som aktør.
 *
 * Koblingen bekreftes av treneren på vegne av spilleren. Foresattes samtykke til selve
 * innsynet i profilen er et eget spor (delingssamtykke), ikke noe denne handlingen erstatter.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireCoachActionUser } from "@/lib/auth/action-guards";
import { assertCoachTilgangTilSpiller } from "@/lib/auth/coached";
import { audit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import {
  AlleredeKoblet,
  ForMangeOppslag,
  angreKobling,
  beOmKobling,
  bekreftKobling,
  finnKandidater,
} from "@/lib/profil-kobling/data";
import { byggOppslagForTrener, filtrerKandidater } from "@/lib/profil-kobling/regler";
import type { Kandidat } from "@/lib/profil-kobling/typer";

type Resultat = { ok: true } | { ok: false; feil: string };
export type TrenerSokResultat = { ok: true; kandidater: Kandidat[] } | { ok: false; feil: string };

const SokSchema = z.object({ spillerId: z.string().min(1).max(120), golfId: z.string().max(24).optional() });
const KobleSchema = SokSchema.extend({ personId: z.number().int().positive() });
const SpillerSchema = z.object({ spillerId: z.string().min(1).max(120) });
const UGYLDIG = { ok: false, feil: "Ugyldig forespørsel." } as const;

async function lastSpiller(spillerId: string) {
  return prisma.user.findFirst({
    where: { id: spillerId, role: "PLAYER", deletedAt: null, anonymisertAt: null },
    select: { id: true, name: true, dateOfBirth: true },
  });
}

/** Felles inngang: tilgang, spiller og oppslag. Returnerer enten feil eller klart grunnlag. */
async function forbered(spillerId: string, golfId: string | undefined) {
  const trener = await requireCoachActionUser();
  await assertCoachTilgangTilSpiller(trener, spillerId);
  const spiller = await lastSpiller(spillerId);
  if (!spiller) return { ok: false, feil: "Fant ikke spilleren." } as const;
  const oppslag = byggOppslagForTrener({ name: spiller.name ?? "", dateOfBirth: spiller.dateOfBirth }, golfId);
  if (!oppslag.ok) return oppslag;
  return { ok: true, trener, spiller, oppslag: oppslag.oppslag } as const;
}

export async function sokKandidaterForSpiller(input: unknown): Promise<TrenerSokResultat> {
  const parsed = SokSchema.safeParse(input);
  if (!parsed.success) return UGYLDIG;
  const f = await forbered(parsed.data.spillerId, parsed.data.golfId);
  if (!f.ok) return f;
  try {
    const svar = await finnKandidater(f.spiller.id, f.oppslag);
    const profil = { name: f.spiller.name ?? "", dateOfBirth: f.spiller.dateOfBirth };
    return { ok: true, kandidater: filtrerKandidater(profil, svar.candidates) };
  } catch (feil) {
    if (feil instanceof ForMangeOppslag) return { ok: false, feil: feil.message };
    throw feil;
  }
}

export async function kobleSpillerUnder16(input: unknown): Promise<Resultat> {
  const parsed = KobleSchema.safeParse(input);
  if (!parsed.success) return UGYLDIG;
  const f = await forbered(parsed.data.spillerId, parsed.data.golfId);
  if (!f.ok) return f;
  const profil = { name: f.spiller.name ?? "", dateOfBirth: f.spiller.dateOfBirth };
  try {
    const svar = await finnKandidater(f.spiller.id, f.oppslag);
    const gyldige = filtrerKandidater(profil, svar.candidates);
    if (!svar.method || !gyldige.some((k) => k.person_id === parsed.data.personId)) {
      return { ok: false, feil: "Vi fant ikke denne spilleren blant treffene. Søk på nytt." };
    }
    const linkId = await beOmKobling(f.spiller.id, parsed.data.personId, svar.method);
    if (!(await bekreftKobling(linkId, f.spiller.id))) {
      return { ok: false, feil: "Koblingen kunne ikke bekreftes. Prøv igjen." };
    }
    await audit({
      actorId: f.trener.id,
      action: "profilkobling.bekreftet_av_trener",
      target: `person:${parsed.data.personId}`,
      metadata: { spillerId: f.spiller.id, metode: svar.method },
    });
  } catch (feil) {
    if (feil instanceof ForMangeOppslag || feil instanceof AlleredeKoblet) return { ok: false, feil: feil.message };
    throw feil;
  }
  revalidatePath(`/admin/spillere/${f.spiller.id}`);
  revalidatePath(`/admin/spillere/${f.spiller.id}/turnering-kobling`);
  return { ok: true };
}

/** Fjerner innsynet. Selve historikken i databasen er urørt. Bare for spillere under 16. */
export async function fjernKoblingForSpiller(input: unknown): Promise<Resultat> {
  const parsed = SpillerSchema.safeParse(input);
  if (!parsed.success) return UGYLDIG;
  const trener = await requireCoachActionUser();
  await assertCoachTilgangTilSpiller(trener, parsed.data.spillerId);
  const spiller = await lastSpiller(parsed.data.spillerId);
  if (!spiller) return { ok: false, feil: "Fant ikke spilleren." };
  const sjekk = byggOppslagForTrener({ name: spiller.name ?? "", dateOfBirth: spiller.dateOfBirth });
  if (!sjekk.ok) return sjekk;
  if (!(await angreKobling(spiller.id))) return { ok: false, feil: "Spilleren er ikke koblet." };
  await audit({ actorId: trener.id, action: "profilkobling.angret_av_trener", target: `bruker:${spiller.id}` });
  revalidatePath(`/admin/spillere/${spiller.id}`);
  revalidatePath(`/admin/spillere/${spiller.id}/turnering-kobling`);
  return { ok: true };
}
