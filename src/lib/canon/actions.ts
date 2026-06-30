"use server";

import { revalidatePath } from "next/cache";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { validerPlan, validerOkt, type PlanValidering } from "./valider-plan";

/**
 * CANON-validering — server actions UI kaller for levende invariant-validering.
 * Lese-validering: alle portal-roller. Overstyring av HARDT brudd: kun coach.
 */

/** Valider en hel plan → brudd + plan-kvalitetsscore. */
export async function validatePlan(planId: string): Promise<PlanValidering> {
  await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  return validerPlan(planId);
}

/** Valider én økt (okt-scope) → brudd. */
export async function validateSession(sessionId: string): Promise<PlanValidering> {
  await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  return validerOkt(sessionId);
}

export type OverstyrInput = {
  invariantId: string;
  sessionId?: string;
  planId?: string;
  begrunnelse: string;
};

/**
 * Coach overstyrer et hardt invariant-brudd. Krever begrunnelse, logges med coachId.
 * Spiller kan aldri overstyre (requirePortalUser blokkerer PLAYER).
 */
export async function overstyrInvariant(
  input: OverstyrInput,
): Promise<{ ok: boolean; error?: string }> {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const begrunnelse = input.begrunnelse?.trim();
  if (!begrunnelse) return { ok: false, error: "Begrunnelse er påkrevd for å overstyre." };
  if (!input.invariantId) return { ok: false, error: "invariantId mangler." };
  if (!input.sessionId && !input.planId) return { ok: false, error: "sessionId eller planId må oppgis." };

  await prisma.invariantOverride.create({
    data: {
      invariantId: input.invariantId,
      sessionId: input.sessionId ?? null,
      planId: input.planId ?? null,
      begrunnelse,
      coachId: coach.id,
    },
  });

  revalidatePath("/admin/spillere/[id]/workbench", "page");
  return { ok: true };
}

/** Aktive overstyringer for en plan/økt (så UI viser «overstyrt»-tilstand). */
export async function hentOverrides(input: {
  planId?: string;
  sessionId?: string;
}): Promise<Array<{ invariantId: string; begrunnelse: string; coachId: string; opprettet: Date }>> {
  await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  if (!input.planId && !input.sessionId) return [];
  const rows = await prisma.invariantOverride.findMany({
    where: {
      ...(input.sessionId ? { sessionId: input.sessionId } : {}),
      ...(input.planId ? { planId: input.planId } : {}),
    },
    select: { invariantId: true, begrunnelse: true, coachId: true, opprettet: true },
    orderBy: { opprettet: "desc" },
  });
  return rows;
}
