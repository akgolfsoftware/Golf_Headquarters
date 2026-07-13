"use server";

/**
 * I5 · Oppfølgingskøen: dra et spillerkort til en annen kolonne = coachens
 * manuelle overstyring av det beregnede nivået (7 dagers virkning), lagret
 * som Signal (kind OPPFOLGING_STATUS, payload { status }) — gjenbruk av
 * eksisterende modell, ingen schema-endring. «Løst» = kvittert.
 */

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { erCoachetSpiller, harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";

const InputSchema = z.object({
  spillerId: z.string().min(1),
  status: z.enum(["risk", "watch", "check", "ok"]),
});

export async function settOppfolgingsstatus(
  spillerId: string,
  status: "risk" | "watch" | "check" | "ok",
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

  await prisma.signal.create({
    data: {
      userId: parsed.data.spillerId,
      kind: "OPPFOLGING_STATUS",
      payload: { status: parsed.data.status },
    },
  });

  revalidatePath("/admin/queue");
  return { ok: true };
}
