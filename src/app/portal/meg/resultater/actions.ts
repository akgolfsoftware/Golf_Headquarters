"use server";

/**
 * Server actions for å koble spillerens profil til resultathistorikken.
 *
 * Alle actions henter brukeren fra sesjonen (`requireSpillerActionUser`). Ingen
 * tar en bruker-id som parameter, så det finnes ingen å manipulere. Personen som
 * kobles velges av klienten, men serveren KJØRER OPPSLAGET PÅ NYTT og godtar bare
 * en person som fortsatt er en kandidat som stemmer med brukerens egen profil.
 * Ellers kunne en POST med vilkårlig person-id koblet hvem som helst.
 *
 * Regler og begrunnelse: src/lib/profil-kobling/regler.ts.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSpillerActionUser } from "@/lib/auth/action-guards";
import { audit } from "@/lib/audit";
import {
  AlleredeKoblet,
  ForMangeOppslag,
  angreKobling as dbAngre,
  avvisKobling,
  beOmKobling,
  bekreftKobling,
  finnKandidater,
} from "@/lib/profil-kobling/data";
import { byggOppslag, filtrerKandidater } from "@/lib/profil-kobling/regler";
import type { Kandidat } from "@/lib/profil-kobling/typer";

type Resultat = { ok: true } | { ok: false; feil: string };
export type SokResultat = { ok: true; kandidater: Kandidat[] } | { ok: false; feil: string };

const SokSchema = z.object({ golfId: z.string().max(24).optional() });
const BekreftSchema = z.object({
  golfId: z.string().max(24).optional(),
  personId: z.number().int().positive(),
});
const LinkSchema = z.object({ linkId: z.number().int().positive() });

const SIDE = "/portal/meg/resultater";
const UGYLDIG = { ok: false, feil: "Ugyldig forespørsel." } as const;

/** Finn kandidater som stemmer med profilen din. Viser ingenting om andre. */
export async function sokKandidater(input: unknown): Promise<SokResultat> {
  const user = await requireSpillerActionUser();
  const parsed = SokSchema.safeParse(input);
  if (!parsed.success) return UGYLDIG;

  const oppslag = byggOppslag(user, parsed.data.golfId);
  if (!oppslag.ok) return oppslag;

  try {
    const svar = await finnKandidater(user.id, oppslag.oppslag);
    return { ok: true, kandidater: filtrerKandidater(user, svar.candidates) };
  } catch (feil) {
    if (feil instanceof ForMangeOppslag) return { ok: false, feil: feil.message };
    throw feil;
  }
}

/** «Ja, dette er meg»: koble og bekreft i ett steg, etter ny kontroll på serveren. */
export async function bekreftKandidat(input: unknown): Promise<Resultat> {
  const user = await requireSpillerActionUser();
  const parsed = BekreftSchema.safeParse(input);
  if (!parsed.success) return UGYLDIG;

  const oppslag = byggOppslag(user, parsed.data.golfId);
  if (!oppslag.ok) return oppslag;

  try {
    const svar = await finnKandidater(user.id, oppslag.oppslag);
    const gyldige = filtrerKandidater(user, svar.candidates);
    if (!svar.method || !gyldige.some((k) => k.person_id === parsed.data.personId)) {
      return { ok: false, feil: "Vi fant ikke denne spilleren blant treffene dine. Søk på nytt." };
    }
    const linkId = await beOmKobling(user.id, parsed.data.personId, svar.method);
    if (!(await bekreftKobling(linkId, user.id))) {
      return { ok: false, feil: "Koblingen kunne ikke bekreftes. Prøv igjen." };
    }
    await audit({
      actorId: user.id,
      action: "profilkobling.bekreftet",
      target: `person:${parsed.data.personId}`,
      metadata: { metode: svar.method },
    });
  } catch (feil) {
    if (feil instanceof ForMangeOppslag || feil instanceof AlleredeKoblet) {
      return { ok: false, feil: feil.message };
    }
    throw feil;
  }
  revalidatePath(SIDE);
  return { ok: true };
}

/** En kobling som ble stående ventende (avbrutt flyt). Bare eieren kan bekrefte. */
export async function bekreftVentende(input: unknown): Promise<Resultat> {
  const user = await requireSpillerActionUser();
  const parsed = LinkSchema.safeParse(input);
  if (!parsed.success) return UGYLDIG;
  if (!(await bekreftKobling(parsed.data.linkId, user.id))) {
    return { ok: false, feil: "Fant ingen ventende kobling å bekrefte." };
  }
  await audit({ actorId: user.id, action: "profilkobling.bekreftet", target: `kobling:${parsed.data.linkId}` });
  revalidatePath(SIDE);
  return { ok: true };
}

export async function avvisVentende(input: unknown): Promise<Resultat> {
  const user = await requireSpillerActionUser();
  const parsed = LinkSchema.safeParse(input);
  if (!parsed.success) return UGYLDIG;
  if (!(await avvisKobling(parsed.data.linkId, user.id))) {
    return { ok: false, feil: "Fant ingen ventende kobling å avvise." };
  }
  revalidatePath(SIDE);
  return { ok: true };
}

/** Angre koblingen. Innsynet forsvinner; historikken i databasen er urørt. */
export async function angreKobling(): Promise<Resultat> {
  const user = await requireSpillerActionUser();
  if (!(await dbAngre(user.id))) return { ok: false, feil: "Profilen din er ikke koblet." };
  await audit({ actorId: user.id, action: "profilkobling.angret" });
  revalidatePath(SIDE);
  return { ok: true };
}
