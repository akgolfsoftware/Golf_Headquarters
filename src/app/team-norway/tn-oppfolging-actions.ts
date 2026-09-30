"use server";

/**
 * Serverhandlinger for TN-01/TN-02: nytt forslag til spiller og nytt samtalereferat.
 *
 * Tilgang: innlogget (getCurrentUser) OG Team Norway-trenerporten
 * (krevTnTrenerflate) — TN-trener eller admin, aldri spiller eller foresatt.
 * Spilleren må være aktiv spiller i trenerens egen gruppe (kontrolleres i
 * datalaget). Hver skriving havner i revisjonsloggen.
 */

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { krevTnTrenerflate } from "@/lib/domain/tn-flate-tilgang";
import { opprettForslag, opprettSamtale } from "@/lib/oppfolging/data";
import { lesForslagSkjema, lesSamtaleSkjema, type SkjemaTilstand } from "@/lib/oppfolging/regler";

const IKKE_INNLOGGET: SkjemaTilstand = { ok: false, melding: "Du må logge inn på nytt før du kan lagre." };

function oppdater(spillerId: string) {
  revalidatePath("/team-norway");
  revalidatePath(`/team-norway/spiller/${encodeURIComponent(spillerId)}`);
}

export async function opprettTnForslag(_forrige: SkjemaTilstand, formData: FormData): Promise<SkjemaTilstand> {
  if (!(await getCurrentUser())) return IKKE_INNLOGGET;
  const { bruker, kontekst } = await krevTnTrenerflate();
  if (kontekst.erSpiller) return { ok: false, melding: "Bare trenere kan sende forslag." };
  const input = lesForslagSkjema(formData);
  const r = await opprettForslag({ flate: "TEAM_NORWAY", groupId: kontekst.gruppe.id, trenerId: bruker.id }, input);
  if (!r.ok) return { ok: false, melding: r.feil };
  oppdater(input.elevId);
  return { ok: true, melding: "Forslaget er sendt. Det står som Venter til spilleren svarer." };
}

export async function opprettTnSamtale(_forrige: SkjemaTilstand, formData: FormData): Promise<SkjemaTilstand> {
  if (!(await getCurrentUser())) return IKKE_INNLOGGET;
  const { bruker, kontekst } = await krevTnTrenerflate();
  if (kontekst.erSpiller) return { ok: false, melding: "Bare trenere kan logge samtaler." };
  const input = lesSamtaleSkjema(formData);
  const r = await opprettSamtale({ flate: "TEAM_NORWAY", groupId: kontekst.gruppe.id, trenerId: bruker.id }, input);
  if (!r.ok) return { ok: false, melding: r.feil };
  oppdater(input.elevId);
  return { ok: true, melding: "Samtalen er logget." };
}
