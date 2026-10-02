"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import { gyldigPlanDato } from "./plan-kontekst";
import { tilDatoKolonne, fraDatoKolonne } from "./wb-map";
import type { WbResultat } from "./wb-actions";

const InputSchema = z.object({
  playerId: z.string().min(1).max(200), seasonPlanId: z.string().min(1).max(200),
  startDato: z.string().refine(v => Boolean(gyldigPlanDato(v)), "Ugyldig startdato."),
  sluttDato: z.string().refine(v => Boolean(gyldigPlanDato(v)), "Ugyldig sluttdato."),
  expectedUpdatedAt: z.string().datetime(),
}).strict().refine(v => v.startDato <= v.sluttDato, "Sluttdato må være på eller etter startdato.");
type LagretGrense = { id: string; startDate: string; endDate: string; updatedAt: string };
const STALE = "Årsplanen er endret siden du åpnet den. Last inn på nytt før du lagrer.";

/** Oppdaterer bare grensene; navn, notater og alle perioder bevares. */
export async function saveSeasonBounds(input: {
  playerId: string; seasonPlanId: string; startDato: string; sluttDato: string; expectedUpdatedAt: string;
}): Promise<WbResultat<LagretGrense>> {
  const viewer = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  if (viewer.role !== "PLAYER" && viewer.role !== "COACH" && viewer.role !== "ADMIN")
    return { ok: false, error: "Ingen tilgang til å endre årsplanen." };
  const parsed = InputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Ugyldige sesonggrenser." };
  const value = parsed.data;
  if (viewer.id !== value.playerId && (viewer.role !== "COACH" && viewer.role !== "ADMIN" ||
    !(await harCoachTilgangTilSpiller(viewer, value.playerId)))) return { ok: false, error: "Ingen tilgang til denne spilleren." };
  try {
    const resultat = await prisma.$transaction(async tx => {
      const plan = await tx.seasonPlan.findFirst({
        where: { id: value.seasonPlanId, userId: value.playerId },
        select: { id: true, startDate: true, endDate: true, updatedAt: true,
          periodBlocks: { select: { startDate: true, endDate: true } } },
      });
      if (!plan) return { ok: false as const, error: "Fant ikke en tilgjengelig årsplan." };
      if (plan.updatedAt.toISOString() !== value.expectedUpdatedAt) return { ok: false as const, error: STALE };
      const start = tilDatoKolonne(value.startDato), slutt = tilDatoKolonne(value.sluttDato);
      if (plan.periodBlocks.some(p => p.startDate < start || p.endDate > slutt))
        return { ok: false as const, error: "Sesonggrensene må omfatte alle eksisterende perioder. Periodene er ikke endret." };
      // Sammenlign-og-skriv beskytter også når to åpne skjermer lagrer samtidig.
      const updatedAt = new Date(Math.max(Date.now(), plan.updatedAt.getTime() + 1));
      const skrevet = await tx.seasonPlan.updateMany({
        where: { id: plan.id, userId: value.playerId, updatedAt: new Date(value.expectedUpdatedAt) },
        data: { startDate: start, endDate: slutt, updatedAt },
      });
      if (skrevet.count !== 1) return { ok: false as const, error: STALE };
      return { ok: true as const, data: { id: plan.id, startDate: fraDatoKolonne(start), endDate: fraDatoKolonne(slutt), updatedAt: updatedAt.toISOString() } };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    if (resultat.ok) {
      revalidatePath(`/admin/workbench/${value.playerId}`);
      revalidatePath("/portal/planlegge/workbench");
    }
    return resultat;
  } catch {
    return { ok: false, error: "Sesonggrensene kunne ikke lagres. Planen kan ha blitt endret; last inn på nytt og prøv igjen." };
  }
}
