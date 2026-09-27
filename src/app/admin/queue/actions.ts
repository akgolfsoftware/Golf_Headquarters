"use server";

/**
 * I5 · Oppfølgingskøen: flytting med dra-og-slipp eller kortets statusvalg
 * gir coachens manuelle overstyring av det beregnede nivået, lagret som
 * FollowUpCase — én rad per spiller, ingen tidsbegrensning (beslutning
 * 23.09.2026, AG-03b). Erstatter det tidligere Signal-baserte sporet
 * (kind OPPFOLGING_STATUS), som glemte status etter sju dager og ikke visste
 * hvem som satte den. «Løst» = kvittert (status "ok").
 */

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { erCoachetSpiller, harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import type { QueueStatus } from "./status";

const InputSchema = z.object({
  spillerId: z.string().min(1),
  status: z.enum(["risk", "watch", "check", "ok"]),
});

export async function settOppfolgingsstatus(
  spillerId: string,
  status: QueueStatus,
): Promise<{ ok: boolean; error?: string }> {
  const parsed = InputSchema.safeParse({ spillerId, status });
  if (!parsed.success) return { ok: false, error: "Ugyldig status." };
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  // I0-porten gjelder også skriving: aldri oppfølgingsstatus på selvbetjente.
  if (!(await erCoachetSpiller(parsed.data.spillerId))) {
    return { ok: false, error: "Spilleren er ikke i coaching-sporet." };
  }
  // Coach-scoping: kun egne spillere (ADMIN = alle coachede).
  if (!(await harCoachTilgangTilSpiller(coach, parsed.data.spillerId))) {
    return { ok: false, error: "Du har ikke tilgang til denne spilleren." };
  }

  const lost = parsed.data.status === "ok";
  await prisma.followUpCase.upsert({
    where: { userId: parsed.data.spillerId },
    create: {
      userId: parsed.data.spillerId,
      status: parsed.data.status,
      setById: coach.id,
      ...(lost ? { resolvedAt: new Date(), resolvedById: coach.id } : {}),
    },
    update: {
      status: parsed.data.status,
      setById: coach.id,
      setAt: new Date(),
      resolvedAt: lost ? new Date() : null,
      resolvedById: lost ? coach.id : null,
    },
  });

  revalidatePath("/admin/queue");
  return { ok: true };
}
