import "server-only";
import { z } from "zod";
import { Prisma, LPhase } from "@/generated/prisma/client";
import type { AkUkegrunnlag } from "./ak-ukegrunnlag";
import type { AkUkeforslag } from "./ak-ukeforslag-format";

/** DB-only validation inside the existing locked sharing/plan transaction.
 * These are structural rules, not complete sporting suitability or a calendar check. */
export async function kontrollerAkUkeforslag(tx: Prisma.TransactionClient, forslag: AkUkeforslag,
  grunnlag: Omit<AkUkegrunnlag, "deling" | "databevis">) {
  const omrade = z.enum(["FYS", "TEK", "SLAG", "SPILL", "TURN"]);
  if (grunnlag.harManedsEllerUkevalg || !grunnlag.budsjett) throw Error("utdatert-ukegrunnlag");
  const fase = z.enum(LPhase).safeParse(grunnlag.modell.signals.aktivFase);
  if (!fase.success) throw Error("mangler-periodegrunnlag");
  const start = new Date(`${forslag.databevis.uke}T00:00:00Z`);
  const slutt = new Date(start.getTime() + 7 * 86_400_000);
  if (await tx.trainingPlanSession.count({ where: { planId: forslag.databevis.planId, scheduledAt: { gte: start, lt: slutt } } })) {
    throw Error("uken-har-allerede-okter");
  }
  const sortert = [...forslag.sessions].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  let forrigeSlutt = start.getTime();
  for (const s of sortert) {
    const tid = new Date(s.scheduledAt).getTime();
    const end = tid + s.durationMin * 60_000;
    if (tid < forrigeSlutt || tid < start.getTime() || end > slutt.getTime()) throw Error("ugyldig-uketid");
    forrigeSlutt = end;
  }
  for (const area of omrade.options) {
    if (sortert.filter(s => s.pyramidArea === area).length !== (grunnlag.budsjett[area] ?? 0)) throw Error("ukebudsjett-avviker");
  }
  const ids = [...new Set(sortert.flatMap(s => s.drills.map(d => d.exerciseId)))].sort();
  const revisjoner = await tx.$queryRaw<Array<{ id: string; revisjon: string }>>`
    SELECT id, xmin::text AS revisjon FROM exercise_definitions WHERE id IN (${Prisma.join(ids)}) ORDER BY id FOR SHARE`;
  const drills = await tx.exerciseDefinition.findMany({ where: { id: { in: ids }, OR: [
    { source: "SYSTEM" }, { source: "COACH", createdBy: forslag.deling.coachId },
  ] }, select: { id: true, pyramidArea: true, lPhases: true } });
  for (const s of sortert) {
    for (const d of s.drills) {
      const exercise = drills.find(e => e.id === d.exerciseId);
      if (!exercise || revisjoner.find(r => r.id === d.exerciseId)?.revisjon !== d.exerciseRevisjon || exercise.pyramidArea !== s.pyramidArea ||
        (exercise.lPhases.length && !exercise.lPhases.includes(fase.data))) throw Error("ugyldig-ukeovelse");
    }
  }
  return { sortert, fase: fase.data };
}
