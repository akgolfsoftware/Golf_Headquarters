"use server";

/**
 * Serverhandlinger for WANG-44/45/46: nytt forslag til elev og nytt samtalereferat.
 *
 * Tilgang: innlogget (getCurrentUser) OG WANG-trenerporten (krevWangTrener) —
 * Sportssjef eller Trener, aldri elev eller foresatt. Eleven må være aktiv
 * spiller i trenerens egen gruppe (kontrolleres i datalaget). Hver skriving
 * havner i revisjonsloggen.
 */

import { revalidatePath } from "next/cache";

import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { opprettForslag, opprettSamtale } from "@/lib/oppfolging/data";
import { lesForslagSkjema, lesSamtaleSkjema, type SkjemaTilstand } from "@/lib/oppfolging/regler";
import { wangHref } from "@/lib/wang/wang-ruter";

const IKKE_INNLOGGET: SkjemaTilstand = { ok: false, melding: "Du må logge inn på nytt før du kan lagre." };

function oppdater(elevId: string) {
  revalidatePath(wangHref("WANG-45"));
  revalidatePath(wangHref("WANG-46"));
  revalidatePath(wangHref("WANG-43"));
  revalidatePath(wangHref("WANG-44", { elevId }));
}

export async function opprettWangForslag(_forrige: SkjemaTilstand, formData: FormData): Promise<SkjemaTilstand> {
  if (!(await getCurrentUser())) return IKKE_INNLOGGET;
  const { bruker, gruppe } = await krevWangTrener();
  const input = lesForslagSkjema(formData);
  const r = await opprettForslag({ flate: "WANG", groupId: gruppe.id, trenerId: bruker.id }, input);
  if (!r.ok) return { ok: false, melding: r.feil };
  oppdater(input.elevId);
  return { ok: true, melding: "Forslaget er sendt. Det står som Venter til eleven svarer." };
}

export async function opprettWangSamtale(_forrige: SkjemaTilstand, formData: FormData): Promise<SkjemaTilstand> {
  if (!(await getCurrentUser())) return IKKE_INNLOGGET;
  const { bruker, gruppe } = await krevWangTrener();
  const input = lesSamtaleSkjema(formData);
  const r = await opprettSamtale({ flate: "WANG", groupId: gruppe.id, trenerId: bruker.id }, input);
  if (!r.ok) return { ok: false, melding: r.feil };
  oppdater(input.elevId);
  return { ok: true, melding: "Samtalen er logget." };
}
