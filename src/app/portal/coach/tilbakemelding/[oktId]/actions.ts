"use server";

// Server actions for /portal/coach/tilbakemelding/[oktId] (Paper W3).
//
// sendTilbakemeldingSvar — «Send svar» GJENBRUKER lagreDineOrd (ETTER-skjermens
// eksisterende action): samme persistens (completedSummary.dineOrd), samme
// tilgangs- og statuskontroll, og coachen leser svaret samme sted i stallen.
// Ingen ny lagringsvei for spillerens ord.
//
// kvitterTilbakemelding — «Forstått» uten tekst: completedSummary
// .tilbakemeldingKvittert (JSON-felt, ingen schema-endring). Samme forsiktige
// merge-mønster som sendBriefTilSpiller/lagreCoachVurdering.

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { lagreDineOrd } from "@/app/portal/(fullscreen)/live/[sessionId]/actions";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/error-tracking";
import { nonEmpty } from "@/lib/validation/schemas";

export type TilbakemeldingActionResult = { ok: true } | { ok: false; error: string };

const SvarSchema = z.object({
  oktId: z.string().min(1, "Økt-ID er påkrevd"),
  tekst: nonEmpty(2000),
});

export type SendTilbakemeldingSvarInput = z.infer<typeof SvarSchema>;

export async function sendTilbakemeldingSvar(
  input: SendTilbakemeldingSvarInput,
): Promise<TilbakemeldingActionResult> {
  const parsed = SvarSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ugyldig input" };
  }

  try {
    const res = await lagreDineOrd(parsed.data.oktId, parsed.data.tekst);
    if (!res.ok) {
      return { ok: false, error: res.error ?? "Kunne ikke sende svaret" };
    }
  } catch (error) {
    await logError({
      context: "portal.coach.sendTilbakemeldingSvar",
      error,
      meta: { oktId: parsed.data.oktId },
    });
    return { ok: false, error: "Fant ikke økta, eller du har ikke tilgang" };
  }

  revalidatePath(`/portal/coach/tilbakemelding/${parsed.data.oktId}`);
  return { ok: true };
}

const KvitterSchema = z.object({
  oktId: z.string().min(1, "Økt-ID er påkrevd"),
});

export async function kvitterTilbakemelding(
  input: z.infer<typeof KvitterSchema>,
): Promise<TilbakemeldingActionResult> {
  const parsed = KvitterSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ugyldig input" };
  }

  // Direkte bruker-sjekk i stedet for requirePortalUser: den kaster redirect(),
  // som try/catch her ville svelget — en action skal svare { ok: false }.
  const me = await getCurrentUser();
  if (!me) return { ok: false, error: "Ikke innlogget" };

  try {
    // Kun spilleren økta tilhører kvitterer.
    const okt = await prisma.trainingSessionV2.findFirst({
      where: { id: parsed.data.oktId, studentId: me.id },
      select: { id: true, completedSummary: true },
    });
    if (!okt) return { ok: false, error: "Fant ikke økta" };

    const raw: unknown = okt.completedSummary;
    const eksisterende =
      raw && typeof raw === "object" && !Array.isArray(raw)
        ? (raw as Record<string, unknown>)
        : {};

    const oppdatert: Record<string, unknown> = {
      ...eksisterende,
      tilbakemeldingKvittert: {
        at: new Date().toISOString(),
        byId: me.id,
      },
    };

    await prisma.trainingSessionV2.update({
      where: { id: okt.id },
      data: { completedSummary: oppdatert as object },
    });
  } catch (error) {
    await logError({
      context: "portal.coach.kvitterTilbakemelding",
      error,
      meta: { oktId: parsed.data.oktId },
    });
    return { ok: false, error: "Kunne ikke lagre kvitteringen" };
  }

  revalidatePath(`/portal/coach/tilbakemelding/${parsed.data.oktId}`);
  return { ok: true };
}
