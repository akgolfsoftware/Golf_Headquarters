"use server";

/**
 * Server actions for Team Norway-poster (TN-09/TN-10/TN-11, Claw batch 3).
 * Mønster: src/app/admin/(legacy)/team/ekstern-leser-actions.ts.
 *
 * requireCoachActionUser() er den ENESTE autorisasjonen server actions kan
 * stole på (layout-guards kjører ikke for actions) — den fingranulerte
 * sjekken (er trener i DENNE gruppen/for DENNE spilleren) skjer likevel i
 * domenelaget (tn-post.ts), aldri bare her.
 */

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireCoachActionUser } from "@/lib/auth/action-guards";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import {
  opprettGruppepost,
  opprettSpillerpost,
  opprettGruppeDokument,
  merkPostLest,
  hentPostLesekvitteringNavnForViewer,
} from "@/lib/domain/tn-post";
import { erTnPostKind } from "@/lib/domain/tn-post-regler";
import { uploadFile } from "@/lib/storage/supabase-storage";
import { STORAGE_BUCKETS } from "@/lib/storage/buckets";

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
  const bruker = await requireCoachActionUser();
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
    revalidatePath(`/team-norway/spiller/${spillerId}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, feil: err instanceof Error ? err.message : "Kunne ikke publisere posten" };
  }
}

const MAKS_DOKUMENT_BYTES = 50 * 1024 * 1024;

/** TN-11 «Last opp fil» — validerer, laster opp til bucket, oppretter DOKUMENT-posten. */
export async function opprettGruppeDokumentAction(groupId: string, form: FormData): Promise<ActionResult> {
  const bruker = await requireCoachActionUser();
  const fil = form.get("file");
  if (!(fil instanceof File) || fil.size === 0) {
    return { ok: false, feil: "Ingen fil valgt" };
  }
  if (fil.size > MAKS_DOKUMENT_BYTES) {
    return { ok: false, feil: "Filen er for stor. Maksgrense: 50 MB." };
  }
  try {
    const path = `${groupId}/${Date.now()}-${fil.name.replace(/[^a-zA-Z0-9.\-_]/g, "-")}`;
    const opplastet = await uploadFile({ bucket: STORAGE_BUCKETS.TN_POST_VEDLEGG, path, file: fil });
    await opprettGruppeDokument({
      forfatterId: bruker.id,
      groupId,
      fileName: fil.name,
      fileType: fil.type || null,
      fileSize: fil.size,
      path: opplastet.path,
    });
    revalidatePath(`/team-norway/${groupId}/dokumenter`);
    return { ok: true };
  } catch (err) {
    return { ok: false, feil: err instanceof Error ? err.message : "Opplasting feilet" };
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
