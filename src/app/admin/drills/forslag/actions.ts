"use server";

// Godkjenn/avvis AI-genererte drill-forslag (CaddieDraft med toolName
// "createDrillSuggestion", produsert av drill-forslag-agenten). Godkjenning
// oppretter en ExerciseDefinition i biblioteket; avvisning markerer forslaget
// som REJECTED. Bare COACH/ADMIN, audit-loggført.

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { PyramidArea, SkillArea } from "@/generated/prisma/enums";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { DRILL_DRAFT_TOOL } from "@/lib/agents/drill-forslag-agent";

export type ForslagResultat = { ok: true; melding: string } | { ok: false; melding: string };

// Validerer toolInput-blobben fra CaddieDraft (gotcha: JSON-blobs valideres).
const DrillInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  skillArea: z.nativeEnum(SkillArea).optional(),
  pyramidArea: z.nativeEnum(PyramidArea),
  durationMin: z.number().int().positive().optional(),
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
        videoUrl: parsed.data.videoUrl ?? null,
        createdBy: user.id,
      },
    });
    await prisma.caddieDraft.update({
      where: { id: draft.id },
      data: { status: "APPROVED", resolvedAt: new Date() },
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
): Promise<ForslagResultat> {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const draft = await hentEgetForslag(draftId, user.id);
  if (!draft) return { ok: false, melding: "Forslag ikke funnet" };

  await prisma.caddieDraft.update({
    where: { id: draft.id },
    data: { status: "REJECTED", resolvedAt: new Date() },
  });
  revalidatePath("/admin/drills/forslag");
  return { ok: true, melding: "Avvist" };
}
