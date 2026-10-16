"use server";

/**
 * Øvelsesvelgeren i Workbench (beslutning 16.10.2026): søk i alle øvelser, mest brukt først,
 * og «Ny øvelse» som lagres i Øvelsesbanken og legges i økta.
 *
 * Tilgang: spilleren selv, eller en coach/admin med tilgang til spilleren. Søket krever
 * innsyn; «Ny øvelse» krever skrivetilgang, samme regel som resten av Workbench.
 * Personvern: logg ID-er, aldri navn.
 */
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { harCoachLesetilgangTilSpiller, harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import { logError } from "@/lib/error-tracking";
import { PyramidAreaSchema } from "@/lib/domain/workbench/schemas";
import type { WorkbenchSession } from "@/lib/domain/workbench/types";
import { addDrill, type WbResultat } from "./wb-actions";
import { hentVelgerOvelser, NyBankOvelseSchema, opprettBankOvelse } from "./ovelse-bank";
import { velgOvelser, type VelgerResultat } from "./ovelse-velger";

const INGEN_TILGANG = "Du har ikke tilgang til denne spilleren.";
/** Så mange rader vises i velgeren; resten nås med søk eller Øvelsesbanken. */
const GRENSE = 40;

async function viewerFor(playerId: string, modus: "les" | "skriv") {
  const user = await requirePortalUser({ tillatDemo: true });
  const viewer = { id: user.id, role: user.role };
  if (user.id === playerId) return viewer;
  if (user.role !== "COACH" && user.role !== "ADMIN") return null;
  const ok = modus === "les" ? await harCoachLesetilgangTilSpiller(viewer, playerId) : await harCoachTilgangTilSpiller(viewer, playerId);
  return ok ? viewer : null;
}

const SokSchema = z.object({
  playerId: z.string().min(1).max(200),
  q: z.string().max(120).default(""),
  pyramide: PyramidAreaSchema.nullable().default(null),
});

/** Søk i alle øvelser brukeren har tilgang til for spilleren. Uten søkeord: mest brukt først. */
export async function sokOvelser(input: { playerId: string; q?: string; pyramide?: string | null }): Promise<WbResultat<VelgerResultat>> {
  const p = SokSchema.safeParse(input);
  if (!p.success) return { ok: false, error: "Ugyldig søk." };
  const viewer = await viewerFor(p.data.playerId, "les");
  if (!viewer) return { ok: false, error: INGEN_TILGANG };
  const alle = await hentVelgerOvelser(viewer, p.data.playerId);
  return { ok: true, data: velgOvelser(alle, { q: p.data.q, pyramide: p.data.pyramide, grense: GRENSE }) };
}

const OpprettSchema = z.object({
  playerId: z.string().min(1).max(200),
  /** Økta øvelsen legges i. Utelatt: bare lagre i Øvelsesbanken. */
  sessionId: z.string().min(1).max(200).optional(),
  ovelse: NyBankOvelseSchema,
});

export type OpprettOvelseResultat = { id: string; session: WorkbenchSession | null; feilIOkta: string | null };

/** «Ny øvelse»: lagres i Øvelsesbanken og legges i økta når `sessionId` er satt. */
export async function opprettOvelseIBank(input: z.input<typeof OpprettSchema>): Promise<WbResultat<OpprettOvelseResultat>> {
  const p = OpprettSchema.safeParse(input);
  if (!p.success) return { ok: false, error: p.error.issues[0]?.message ?? "Ugyldig øvelse." };
  const { playerId, sessionId, ovelse } = p.data;
  const viewer = await viewerFor(playerId, "skriv");
  if (!viewer) return { ok: false, error: INGEN_TILGANG };
  if (sessionId) {
    const okt = await prisma.workbenchSession.findUnique({ where: { id: sessionId }, select: { playerId: true } });
    if (okt?.playerId !== playerId) return { ok: false, error: "Fant ikke økten." };
  }

  let id: string;
  try {
    id = (await opprettBankOvelse(viewer, playerId, ovelse)).id;
  } catch (error) {
    await logError({ context: "workbench.opprettOvelseIBank", error, meta: { viewerId: viewer.id, playerId } });
    return { ok: false, error: "Øvelsen ble ikke lagret. Prøv igjen." };
  }
  revalidatePath("/portal/drills");
  revalidatePath("/admin/ovelser");

  if (!sessionId) return { ok: true, data: { id, session: null, feilIOkta: null } };
  const lagt = await addDrill({ sessionId, drill: {
    title: ovelse.title, description: ovelse.description || undefined, durationMinutes: ovelse.durationMinutes,
    akFormel: ovelse.akFormel, sourceId: id, exerciseId: id,
  } });
  return lagt.ok
    ? { ok: true, data: { id, session: lagt.data, feilIOkta: null } }
    : { ok: true, data: { id, session: null, feilIOkta: lagt.error } };
}
