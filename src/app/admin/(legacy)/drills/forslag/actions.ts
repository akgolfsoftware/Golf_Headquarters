"use server";

// Godkjenn/avvis AI-genererte drill-forslag (CaddieDraft med toolName
// "createDrillSuggestion", produsert av drill-forslag-agenten). Godkjenning
// oppretter en ExerciseDefinition i biblioteket; avvisning markerer forslaget
// som REJECTED. Bare COACH/ADMIN, audit-loggført.

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { PyramidArea, SkillArea, NgfKategori } from "@/generated/prisma/enums";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { DRILL_DRAFT_TOOL } from "@/lib/agents/drill-forslag-agent";
import { avgjorDraft } from "@/lib/caddie/draft-status";
import { AVVIS_GRUNNER, erAvvisGrunn, type AvvisGrunn } from "@/lib/agenticos";

export type ForslagResultat = { ok: true; melding: string } | { ok: false; melding: string };

// Validerer toolInput-blobben fra CaddieDraft (gotcha: JSON-blobs valideres).
// .nullish() (ikke .optional()) på skillArea/minKategori/maxKategori: disse
// kan komme som eksplisitt `null` fra fabrikk-agenten (JSON beholder null,
// i motsetning til undefined), ikke bare være fraværende.
const DrillInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  skillArea: z.nativeEnum(SkillArea).nullish(),
  pyramidArea: z.nativeEnum(PyramidArea),
  durationMin: z.number().int().positive().optional(),
  minKategori: z.nativeEnum(NgfKategori).nullish(),
  maxKategori: z.nativeEnum(NgfKategori).nullish(),
  videoUrl: z.string().url().nullish(),
});

async function hentEgetForslag(draftId: string, userId: string) {
  return prisma.caddieDraft.findFirst({
    where: {
      id: draftId,
      userId,
      toolName: DRILL_DRAFT_TOOL,
      status: "PENDING",
    },
  });
}

export async function godkjennDrillForslag(
  draftId: string,
): Promise<ForslagResultat> {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const draft = await hentEgetForslag(draftId, user.id);
  if (!draft) return { ok: false, melding: "Forslag ikke funnet" };

  const parsed = DrillInputSchema.safeParse(draft.toolInput);
  if (!parsed.success) {
    return { ok: false, melding: "Ugyldig forslag-data" };
  }

  try {
    const drill = await prisma.exerciseDefinition.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        pyramidArea: parsed.data.pyramidArea,
        skillArea: parsed.data.skillArea ?? null,
        durationMin: parsed.data.durationMin ?? null,
        minKategori: parsed.data.minKategori ?? null,
        maxKategori: parsed.data.maxKategori ?? null,
        videoUrl: parsed.data.videoUrl ?? null,
        createdBy: user.id,
      },
    });
    await avgjorDraft({
      draftId: draft.id,
      interaksjonId: draft.interaksjonId,
      status: "APPROVED",
    });
    await audit({
      actorId: user.id,
      action: "drill.created",
      target: `ExerciseDefinition:${drill.id}`,
      metadata: { kilde: "drill-forslag-agent", draftId: draft.id },
    });
    revalidatePath("/admin/drills/forslag");
    revalidatePath("/admin/drills");
    return { ok: true, melding: "Lagt til i biblioteket" };
  } catch (err) {
    console.error("godkjennDrillForslag failed", err);
    return { ok: false, melding: "Kunne ikke opprette drill" };
  }
}

export async function avvisDrillForslag(
  draftId: string,
  grunn?: AvvisGrunn,
): Promise<ForslagResultat> {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const draft = await hentEgetForslag(draftId, user.id);
  if (!draft) return { ok: false, melding: "Forslag ikke funnet" };

  await avgjorDraft({
    draftId: draft.id,
    interaksjonId: draft.interaksjonId,
    status: "REJECTED",
    begrunnelse: grunn && erAvvisGrunn(grunn) ? AVVIS_GRUNNER[grunn] : undefined,
  });
  revalidatePath("/admin/drills/forslag");
  return { ok: true, melding: "Avvist" };
}

/* ─── Video-forslag (media-lofte-agent, toolName "suggestDrillVideo") ──── */
// Godkjenning setter videoUrl på en EKSISTERENDE ExerciseDefinition (i
// motsetning til drill-forslag over, som oppretter en helt ny øvelse).

const VideoInputSchema = z.object({
  exerciseId: z.string().min(1),
  videoUrl: z.string().url(),
});

async function hentEgetVideoForslag(draftId: string, userId: string) {
  return prisma.caddieDraft.findFirst({
    where: { id: draftId, userId, toolName: "suggestDrillVideo", status: "PENDING" },
  });
}

export async function godkjennVideoForslag(
  draftId: string,
): Promise<ForslagResultat> {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const draft = await hentEgetVideoForslag(draftId, user.id);
  if (!draft) return { ok: false, melding: "Forslag ikke funnet" };

  const parsed = VideoInputSchema.safeParse(draft.toolInput);
  if (!parsed.success) return { ok: false, melding: "Ugyldig forslag-data" };

  try {
    await prisma.exerciseDefinition.update({
      where: { id: parsed.data.exerciseId },
      data: { videoUrl: parsed.data.videoUrl },
    });
    await avgjorDraft({
      draftId: draft.id,
      interaksjonId: draft.interaksjonId,
      status: "APPROVED",
    });
    await audit({
      actorId: user.id,
      action: "drill.video-godkjent",
      target: `ExerciseDefinition:${parsed.data.exerciseId}`,
      metadata: { kilde: "media-lofte-agent", draftId: draft.id },
    });
    revalidatePath("/admin/drills/forslag");
    revalidatePath("/admin/drills");
    revalidatePath("/portal/drills");
    return { ok: true, melding: "Video lagt til" };
  } catch (err) {
    console.error("godkjennVideoForslag failed", err);
    return { ok: false, melding: "Kunne ikke lagre video" };
  }
}

export async function avvisVideoForslag(
  draftId: string,
  grunn?: AvvisGrunn,
): Promise<ForslagResultat> {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const draft = await hentEgetVideoForslag(draftId, user.id);
  if (!draft) return { ok: false, melding: "Forslag ikke funnet" };

  await avgjorDraft({
    draftId: draft.id,
    interaksjonId: draft.interaksjonId,
    status: "REJECTED",
    begrunnelse: grunn && erAvvisGrunn(grunn) ? AVVIS_GRUNNER[grunn] : undefined,
  });
  revalidatePath("/admin/drills/forslag");
  return { ok: true, melding: "Avvist" };
}
