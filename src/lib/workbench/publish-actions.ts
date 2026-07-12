"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { PlanStatus } from "@/generated/prisma/client";

const PUBLISHABLE: PlanStatus[] = ["DRAFT", "REJECTED"];

/* ── WB4: publiser-diff ──────────────────────────────────────
   Snapshot av øktene lagres ved hver publisering; neste publisering
   diffes mot den (lagt til / fjernet / endret + belastnings-impact). */
function mandagDenneUka(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

const SnapshotSchema = z.array(
  z.object({
    id: z.string(),
    title: z.string(),
    scheduledAt: z.string(),
    durationMin: z.number(),
    pyramidArea: z.string(),
  }),
);
type SnapshotOkt = z.infer<typeof SnapshotSchema>[number];

async function hentPlanOgOkter(targetUserId: string) {
  const plan = await prisma.trainingPlan.findFirst({
    where: { userId: targetUserId },
    orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      name: true,
      status: true,
      userId: true,
      publishedSnapshot: true,
      sessions: {
        // Diff-vinduet: inneværende uke (fra mandag) og fremover — det er
        // dette spilleren forholder seg til når planen publiseres.
        where: { scheduledAt: { gte: mandagDenneUka() } },
        orderBy: { scheduledAt: "asc" },
        select: { id: true, title: true, scheduledAt: true, durationMin: true, pyramidArea: true },
      },
    },
  });
  return plan;
}

function tilSnapshot(sessions: { id: string; title: string; scheduledAt: Date; durationMin: number; pyramidArea: string }[]): SnapshotOkt[] {
  return sessions.map((s) => ({
    id: s.id,
    title: s.title,
    scheduledAt: s.scheduledAt.toISOString(),
    durationMin: s.durationMin,
    pyramidArea: s.pyramidArea,
  }));
}

export type PubliserDiff = {
  forsteGang: boolean;
  lagtTil: { title: string; nar: string }[];
  fjernet: { title: string; nar: string }[];
  endret: { title: string; hva: string }[];
  minutterFor: number;
  minutterNa: number;
};

/** Diff mot forrige publiserte snapshot — vises i bekreft-modalen FØR publisering. */
export async function hentPubliserDiff(
  playerId?: string,
): Promise<{ ok: boolean; diff?: PubliserDiff; error?: string }> {
  const user = await requirePortalUser(
    playerId ? { allow: ["COACH", "ADMIN"] } : { allow: ["PLAYER", "COACH", "ADMIN"] },
  );
  const targetUserId = playerId ?? user.id;
  const plan = await hentPlanOgOkter(targetUserId);
  if (!plan) return { ok: false, error: "Ingen plan" };

  const naa = tilSnapshot(plan.sessions);
  const parsed = SnapshotSchema.safeParse(plan.publishedSnapshot);
  const forrige: SnapshotOkt[] = parsed.success ? parsed.data : [];
  const naar = (iso: string) => {
    const d = new Date(iso);
    return `${d.getDate()}.${d.getMonth() + 1} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const forrigeMap = new Map(forrige.map((s) => [s.id, s]));
  const naaMap = new Map(naa.map((s) => [s.id, s]));
  const lagtTil = naa.filter((s) => !forrigeMap.has(s.id)).map((s) => ({ title: s.title, nar: naar(s.scheduledAt) }));
  const fjernet = forrige.filter((s) => !naaMap.has(s.id)).map((s) => ({ title: s.title, nar: naar(s.scheduledAt) }));
  const endret = naa
    .filter((s) => {
      const f = forrigeMap.get(s.id);
      return f && (f.title !== s.title || f.scheduledAt !== s.scheduledAt || f.durationMin !== s.durationMin || f.pyramidArea !== s.pyramidArea);
    })
    .map((s) => {
      const f = forrigeMap.get(s.id)!;
      const hva = [
        f.title !== s.title ? "tittel" : null,
        f.scheduledAt !== s.scheduledAt ? `tid → ${naar(s.scheduledAt)}` : null,
        f.durationMin !== s.durationMin ? `varighet → ${s.durationMin} min` : null,
        f.pyramidArea !== s.pyramidArea ? `område → ${s.pyramidArea}` : null,
      ].filter(Boolean).join(" · ");
      return { title: s.title, hva };
    });

  return {
    ok: true,
    diff: {
      forsteGang: !parsed.success || forrige.length === 0,
      lagtTil,
      fjernet,
      endret,
      minutterFor: forrige.reduce((a, s) => a + s.durationMin, 0),
      minutterNa: naa.reduce((a, s) => a + s.durationMin, 0),
    },
  };
}

function revalidateWorkbench(playerId: string) {
  revalidatePath("/portal/planlegge/workbench");
  revalidatePath(`/admin/spillere/${playerId}/workbench`);
}

/**
 * Publiser aktiv treningsplan: DRAFT/REJECTED → PENDING_PLAYER.
 * Coach sender med `playerId`; spiller publiserer egen plan uten id.
 */
export async function publishWorkbenchPlan(
  playerId?: string,
): Promise<{ ok: boolean; error?: string; status?: PlanStatus }> {
  const user = await requirePortalUser(
    playerId ? { allow: ["COACH", "ADMIN"] } : { allow: ["PLAYER", "COACH", "ADMIN"] },
  );

  const targetUserId = playerId ?? user.id;
  if (!playerId && user.id !== targetUserId) {
    return { ok: false, error: "Ikke tillatt" };
  }

  const plan = await prisma.trainingPlan.findFirst({
    where: { userId: targetUserId },
    orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
    select: { id: true, name: true, status: true, userId: true },
  });

  if (!plan) {
    return { ok: false, error: "Ingen aktiv plan å publisere" };
  }

  if (!PUBLISHABLE.includes(plan.status)) {
    return { ok: false, error: "Planen er allerede publisert eller aktiv" };
  }

  // WB4: snapshot av kommende økter lagres — diff-grunnlag for neste publisering.
  const snapshotPlan = await hentPlanOgOkter(plan.userId);
  await prisma.trainingPlan.update({
    where: { id: plan.id },
    data: {
      status: "PENDING_PLAYER",
      playerComment: null,
      publishedSnapshot: tilSnapshot(snapshotPlan?.sessions ?? []),
    },
  });

  try {
    await prisma.notification.create({
      data: {
        userId: plan.userId,
        type: "plan",
        title: "Ny treningsplan venter på godkjenning",
        body: `Planen «${plan.name}» er sendt til deg. Åpne Workbench for å godkjenne.`,
        link: "/portal/planlegge/workbench",
      },
    });
  } catch (err) {
    console.error("[workbench] Kunne ikke opprette plan-varsel", err);
  }

  revalidateWorkbench(targetUserId);
  return { ok: true, status: "PENDING_PLAYER" };
}