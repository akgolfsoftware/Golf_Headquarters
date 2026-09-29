"use server";

/**
 * Server actions for Team Norway-poster (TN-09/TN-10/TN-11, Claw batch 3).
 * Mønster: src/app/admin/(legacy)/team/ekstern-leser-actions.ts.
 *
 * Layout-guards kjører ikke for actions, så hver action slår opp brukeren selv.
 * Gruppeposter og påminnelser krever bare innlogging her; at brukeren er
 * trener i DENNE gruppen håndheves i domenelaget (tn-post.ts). Spillerposter
 * krever i tillegg plattformrollen via requireCoachActionUser().
 */

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireCoachActionUser } from "@/lib/auth/action-guards";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import {
  opprettGruppepost,
  opprettSpillerpost,
  merkPostLest,
  hentPostLesekvitteringNavnForViewer,
  sendPaaminnelse,
} from "@/lib/domain/tn-post";
import { erTnPostKind } from "@/lib/domain/tn-post-regler";

type ActionResult = { ok: true } | { ok: false; feil: string };

const PostSchema = z.object({
  tekst: z.string().trim().min(1, "Posten kan ikke være tom").max(2000),
  kind: z.string().refine(erTnPostKind, "Ukjent posttype"),
});

export async function opprettGruppepostAction(
  groupId: string,
  input: { tekst: string; kind: string },
): Promise<ActionResult> {
  const parsed = PostSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, feil: parsed.error.issues[0]?.message ?? "Ugyldig post" };
  }
  // Gruppetrener uten plattformrollen COACH skal også kunne poste.
  // Domenelaget krever at forfatteren er trener i akkurat denne gruppen.
  const bruker = await getCurrentUser();
  if (!bruker) return { ok: false, feil: "Du er ikke logget inn" };
  try {
    await opprettGruppepost({ forfatterId: bruker.id, groupId, tekst: parsed.data.tekst, kind: parsed.data.kind });
    revalidatePath(`/team-norway/${groupId}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, feil: err instanceof Error ? err.message : "Kunne ikke publisere posten" };
  }
}

export async function opprettSpillerpostAction(
  spillerId: string,
  input: { tekst: string; kind: string },
): Promise<ActionResult> {
  const parsed = PostSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, feil: parsed.error.issues[0]?.message ?? "Ugyldig post" };
  }
  const bruker = await requireCoachActionUser();
  try {
    await opprettSpillerpost({ forfatterId: bruker.id, spillerId, tekst: parsed.data.tekst, kind: parsed.data.kind });
    revalidatePath(`/team-norway/spiller/${spillerId}/post`);
    return { ok: true };
  } catch (err) {
    return { ok: false, feil: err instanceof Error ? err.message : "Kunne ikke publisere posten" };
  }
}

/**
 * Kvitter en post som lest — kalt fra klienten når en spiller/foresatt
 * faktisk ser posten (best-effort, feiler stille). Alle innloggede kan
 * kalle denne; `merkPostLest` skriver kun en rad, ingen datalesing skjer
 * her — IDOR er ikke en risiko (en falsk positiv lesekvittering på egen
 * bruker-id er ufarlig), så ingen ekstra tilgangssjekk er nødvendig.
 */
export async function merkPostLestAction(postId: string): Promise<void> {
  const bruker = await getCurrentUser();
  if (!bruker) return;
  await merkPostLest(postId, bruker.id).catch(() => undefined);
}

export type LesekvitteringNavnSvar = {
  apnet: { userId: string; navn: string; readAt: string }[];
  mangler: { userId: string; navn: string }[];
} | null;

/** «Se hvem» — henter navnelisten bak brøken, IDOR-sikret i domenelaget. */
export async function hentLesekvitteringNavnAction(postId: string): Promise<LesekvitteringNavnSvar> {
  const bruker = await getCurrentUser();
  if (!bruker) return null;
  const svar = await hentPostLesekvitteringNavnForViewer(postId, bruker.id);
  if (!svar) return null;
  return {
    apnet: svar.apnet.map((a) => ({ ...a, readAt: a.readAt.toISOString() })),
    mangler: svar.mangler,
  };
}

export type PaaminnelseSvar = { ok: true; sendtAtIso: string; antall: number } | { ok: false; feil: string };

/** «Send påminnelse» — tilgang og engangsregel håndheves i domenelaget. */
export async function sendPaaminnelseAction(postId: string): Promise<PaaminnelseSvar> {
  if (!z.string().min(1).max(200).safeParse(postId).success) return { ok: false, feil: "Ugyldig innlegg" };
  const bruker = await getCurrentUser();
  if (!bruker) return { ok: false, feil: "Du er ikke logget inn" };
  try {
    const svar = await sendPaaminnelse(postId, bruker.id);
    return { ok: true, sendtAtIso: svar.sendtAt.toISOString(), antall: svar.antall };
  } catch (err) {
    return { ok: false, feil: err instanceof Error ? err.message : "Kunne ikke sende påminnelse" };
  }
}
