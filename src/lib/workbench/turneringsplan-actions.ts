"use server";
import { Prisma } from "@/generated/prisma/client";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { planTilgang, revaliderPlan } from "./plan-tilgang";
import { TurneringsplanInputSchema, type TurneringsplanInput } from "./turneringsplan-kontrakt";
import { tilDatoKolonne } from "./wb-map";

async function tilgangFor(playerId: string) {
  const actor = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const viewer = await planTilgang(playerId);
  return viewer?.id === actor.id ? viewer : null;
}

/** Planfelter og rundetider; registrerte resultater, strategi, mål og logger skrives aldri her. */
export async function lagreWorkbenchTurneringsplan(input: TurneringsplanInput) {
  const parsed = TurneringsplanInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Ugyldig turneringsplan." };
  const v = parsed.data, viewer = await tilgangFor(v.playerId);
  if (!viewer) return { ok: false as const, error: "Ingen tilgang til denne spilleren." };
  try {
    const result = await prisma.$transaction(async tx => {
      const original = v.id ? await tx.workbenchTournamentPlan.findFirst({ where: { id: v.id, playerId: v.playerId }, include: { rounds: true } }) : null;
      if (v.id && (!original || original.updatedAt.toISOString() !== v.expectedUpdatedAt))
        return { ok: false as const, error: "Planen er ikke tilgjengelig eller er endret. Last inn på nytt." };
      if (viewer.role === "PLAYER" && original && original.createdBy !== viewer.id)
        return { ok: false as const, error: "Trenerens turneringsplan kan ikke endres her." };
      const rounds = original?.rounds ?? [];
      if (v.rounds.some(r => r.id && !rounds.some(old => old.id === r.id)))
        return { ok: false as const, error: "Runden tilhører ikke denne turneringsplanen." };
      const removed = rounds.filter(r => !v.rounds.some(next => next.id === r.id));
      if (removed.some(r => r.grossScore !== null || r.strokesGained !== null || r.source !== null || r.notes !== null || r.gamePlan !== null || r.routine !== null))
        return { ok: false as const, error: "Runder med resultater, strategi eller notater bevares. De kan ikke fjernes." };
      const data = { title: v.title, focus: v.focus, ...v.metadata, startDate: tilDatoKolonne(v.startDate), endDate: tilDatoKolonne(v.endDate),
        travelStartDate: v.travelStartDate ? tilDatoKolonne(v.travelStartDate) : null,
        travelEndDate: v.travelEndDate ? tilDatoKolonne(v.travelEndDate) : null };
      if (!original) {
        const row = await tx.workbenchTournamentPlan.create({ data: { ...data, playerId: v.playerId, coachId: viewer.id, createdBy: viewer.id, status: "DRAFT",
          rounds: { create: v.rounds.map((r, i) => ({ roundNumber: i + 1, date: tilDatoKolonne(r.date), teeTimeMinutes: r.teeTimeMinutes })) } }, select: { id: true, updatedAt: true } });
        return { ok: true as const, id: row.id, updatedAt: row.updatedAt.toISOString() };
      }
      const updatedAt = new Date(Math.max(Date.now(), original.updatedAt.getTime() + 1));
      const lock = await tx.workbenchTournamentPlan.updateMany({ where: { id: original.id, playerId: v.playerId, updatedAt: original.updatedAt, status: original.status },
        data: { ...data, updatedAt, status: original.publishedAt ? "CHANGED_AFTER_PUBLISH" : original.status } });
      if (lock.count !== 1) throw new Error("Samtidig endring");
      // Flytt numrene midlertidig utenfor 1–8 så sorteringsbytte ikke bryter unik nøkkel.
      for (const [i, round] of rounds.entries()) await tx.workbenchTournamentRound.update({ where: { id: round.id }, data: { roundNumber: 100 + i } });
      if (removed.length) await tx.workbenchTournamentRound.deleteMany({ where: { planId: original.id, id: { in: removed.map(r => r.id) } } });
      for (const [i, round] of v.rounds.entries()) {
        const roundData = { roundNumber: i + 1, date: tilDatoKolonne(round.date), teeTimeMinutes: round.teeTimeMinutes };
        if (round.id) await tx.workbenchTournamentRound.update({ where: { id: round.id, planId: original.id }, data: roundData });
        else await tx.workbenchTournamentRound.create({ data: { ...roundData, planId: original.id } });
      }
      return { ok: true as const, id: original.id, updatedAt: updatedAt.toISOString() };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    if (result.ok) revaliderPlan(v.playerId);
    return result;
  } catch { return { ok: false as const, error: "Turneringsplanen kunne ikke lagres. Last inn på nytt og prøv igjen." }; }
}
