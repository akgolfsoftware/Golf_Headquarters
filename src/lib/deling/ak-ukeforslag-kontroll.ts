import "server-only";
import { z } from "zod";
import { Prisma, LPhase } from "@/generated/prisma/client";
import { ovelseMatcherAkNiva } from "./ak-spillerniva";
import type { AkUkegrunnlag } from "./ak-ukegrunnlag";
import type { AkUkeforslag } from "./ak-ukeforslag-format";
import { lesAkUkekandidatgrunnlag } from "./ak-ukekandidater";
import type { AkUkerad } from "./ak-ukeforslag-rad";

/** DB-only validation inside the existing locked sharing/plan transaction.
 * These are structural rules, not complete sporting suitability or a calendar check. */
export async function kontrollerAkUkeforslag(tx: Prisma.TransactionClient, forslag: AkUkeforslag,
  grunnlag: Omit<AkUkegrunnlag, "deling" | "databevis">) {
  const omrade = z.enum(["FYS", "TEK", "SLAG", "SPILL", "TURN"]);
  // Month/week choices are not yet interpreted by this planner; do not ignore
  // a more specific user plan. This is a missing adapter, not a training rule.
  if (grunnlag.harManedsEllerUkevalg) throw Error("utdatert-ukegrunnlag");
  const fagligeRad: AkUkerad = [];
  const fase = z.enum(LPhase).safeParse(grunnlag.modell.signals.aktivFase);
  if (!fase.success) fagligeRad.push({ kode: "PERIODE_MANGLER" });
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
  if (!grunnlag.budsjett) fagligeRad.push({ kode: "UKESBUDSJETT_MANGLER" });
  else for (const area of omrade.options) {
    if (sortert.filter(s => s.pyramidArea === area).length !== (grunnlag.budsjett[area] ?? 0)) {
      fagligeRad.push({ kode: "UKESBUDSJETT_AVVIKER", omrade: area });
    }
  }
  const bank = forslag.versjon === 2 ? await lesAkUkekandidatgrunnlag(tx, grunnlag) : null;
  if (forslag.versjon === 2 && bank?.fingeravtrykk !== forslag.bankFingeravtrykk) throw Error("utdatert-bankgrunnlag");
  const ids = [...new Set(sortert.flatMap(s => s.drills.map(d => d.exerciseId)))].sort();
  const revisjoner = await tx.$queryRaw<Array<{ id: string; revisjon: string }>>`
    SELECT id, xmin::text AS revisjon FROM exercise_definitions WHERE id IN (${Prisma.join(ids)}) ORDER BY id FOR SHARE`;
  const drills = await tx.exerciseDefinition.findMany({ where: { id: { in: ids }, OR: [
    { source: "SYSTEM" }, { source: "COACH", createdBy: forslag.deling.coachId },
  ] }, select: { id: true, pyramidArea: true, fasilitetKrav: true, minKategori: true, maxKategori: true, minHcp: true, maxHcp: true } });
  for (const s of sortert) {
    for (const d of s.drills) {
      const exercise = drills.find(e => e.id === d.exerciseId);
      if (!exercise || revisjoner.find(r => r.id === d.exerciseId)?.revisjon !== d.exerciseRevisjon || exercise.pyramidArea !== s.pyramidArea) {
        throw Error("ugyldig-ukeovelse");
      }
      // Retired exercise lPhases are not a source of new period prescriptions.
      const sted = { oktIndeks: forslag.sessions.indexOf(s), exerciseId: d.exerciseId };
      if (bank) {
        const kandidat = bank.kandidater.find(k => k.exerciseId === d.exerciseId && k.exerciseRevisjon === d.exerciseRevisjon);
        if (!kandidat) throw Error("ovelse-utenfor-verifisert-bank");
        fagligeRad.push({ kode: "FAGLIG_VURDERING_GJENSTAR", ...sted });
        if (kandidat.fasilitetsstatus !== "KRAV_OPPFYLT_VED_ETT_STED") fagligeRad.push({ kode: "BANKFASILITET_BOR_VURDERES", ...sted });
      }
      if (!ovelseMatcherAkNiva(exercise, grunnlag.niva)) fagligeRad.push({ kode: "OVELSESNIVA_BOR_VURDERES", ...sted });
      // A single recorded place must cover every structured requirement of
      // this exercise. Never combine unrelated places or trust old true defaults.
      // Empty requirements mean no special requirements in ExerciseDefinition;
      // this does not certify distance, environment, opening hours or suitability.
      if (exercise.fasilitetKrav.length && !grunnlag.fasiliteter.some(f =>
        exercise.fasilitetKrav.every(krav => f.capabilities.includes(krav)))) {
        fagligeRad.push({ kode: "FASILITET_IKKE_BEKREFTET", ...sted });
      }
    }
  }
  return { sortert, fase: fase.success ? fase.data : null, fagligeRad };
}
