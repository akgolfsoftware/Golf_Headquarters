import "server-only";
import { z } from "zod";
import { Prisma, LPhase } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { canonicalJson } from "@/lib/agents/canonical-json";
import { planActionAvvisSpor, planActionOkSpor } from "@/lib/agents/plan-action-spor";
import { upsertV2ForPlanSession } from "@/lib/workbench/v2-sync";
import { akProfilBevisSchema, brukMedSammeAkProfilBevis } from "./ak-profil-mellomlagring";
import { akUkeDatabevisSchema, laasOgLesSammeAkUkegrunnlag } from "./ak-ukegrunnlag";

const id = z.string().trim().min(1).max(200);
const omrade = z.enum(["FYS", "TEK", "SLAG", "SPILL", "TURN"]);
const okt = z.object({ title: z.string().trim().min(3).max(80), pyramidArea: omrade,
  scheduledAt: z.iso.datetime(), durationMin: z.number().int().min(15).max(360),
  drills: z.array(z.object({ exerciseId: id, exerciseRevisjon: z.string().regex(/^\d{1,20}$/),
    minutter: z.number().int().min(1).max(360) }).strict()).min(1).max(12),
}).strict().refine(s => s.drills.reduce((sum, d) => sum + d.minutter, 0) === s.durationMin,
  "Øvelsenes varighet må stemme med økten");
export const akUkeforslagSchema = z.object({ versjon: z.literal(1),
  deling: akProfilBevisSchema, databevis: akUkeDatabevisSchema,
  tittel: z.string().trim().min(3).max(120), forklaring: z.string().trim().min(3).max(2000),
  sessions: z.array(okt).min(1).max(21),
}).strict();

/** Legacy/malformed rows are part of the family too; never fall through. */
export function erAkUkeforslag(a: { actionType: string; agentName?: string }) {
  return a.actionType === "WEEKLY_PROPOSAL" || a.agentName === "weekly-plan-proposals";
}

/** Only called by a human decision entry. No model calls or automatic approval.
 * New trusted server format is required; old suggestions are never upgraded.
 * Queue creation/read integration remains separate and must precede activation.
 */
export async function behandleAkUkeforslag(viewer: { id: string; role: string }, actionId: unknown,
  valg: "ACCEPTED" | "REJECTED" | "QUESTION", tekst?: string) {
  const key = id.parse(actionId);
  const note = z.string().trim().max(500).optional().parse(tekst) || undefined;
  if (!["COACH", "ADMIN"].includes(viewer.role)) throw Error("forbidden");
  if (valg === "QUESTION" && (!note || note.length < 3)) throw Error("spørsmål-påkrevd");
  // Read only routing/equality metadata before authorization, never the body.
  const [raw] = await prisma.$queryRaw<unknown[]>`SELECT "userId", "coachId", "planId",
    suggestion -> 'deling' AS deling FROM plan_actions WHERE id = ${key}`;
  const routing = z.object({ userId: id, coachId: id, planId: id, deling: akProfilBevisSchema }).safeParse(raw);
  if (!routing.success || routing.data.coachId !== viewer.id || routing.data.deling.coachId !== viewer.id ||
    routing.data.userId !== routing.data.deling.spillerId) throw Error("forbidden");
  const r = routing.data;
  const jobb = { gruppeId: r.deling.gruppeId, coachId: viewer.id };
  const resultat = await brukMedSammeAkProfilBevis(jobb, r.userId, r.deling, async (tx, scope) => {
    await tx.$queryRaw`SELECT id FROM plan_actions WHERE id = ${key} FOR UPDATE`;
    const action = await tx.planAction.findFirst({ where: { id: key, userId: r.userId, coachId: viewer.id,
      planId: r.planId, actionType: "WEEKLY_PROPOSAL", agentName: "weekly-plan-proposals", user: scope },
      select: { id: true, userId: true, status: true, suggestion: true, actionType: true } });
    const parsed = akUkeforslagSchema.safeParse(action?.suggestion);
    if (!action || !parsed.success || canonicalJson(parsed.data.deling) !== canonicalJson(r.deling) ||
      parsed.data.databevis.planId !== r.planId) throw Error("forbidden");
    if (action.status !== "PENDING") return { status: "UNCHANGED" as const, applied: false };
    const forslag = parsed.data;
    if (valg === "QUESTION") {
      await tx.planAction.update({ where: { id: key }, data: { decisionNote: note } });
      await tx.notification.create({ data: { userId: r.userId, type: "approval_question",
        title: "Coach trenger mer info", body: note!, link: "/portal/agent-pipeline" } });
      return { status: "UNCHANGED" as const, applied: false };
    }
    let antall = 0;
    if (valg === "ACCEPTED") {
      const grunnlag = await laasOgLesSammeAkUkegrunnlag(tx, scope, jobb, forslag.databevis);
      if (!grunnlag || grunnlag.harManedsEllerUkevalg || !grunnlag.budsjett) throw Error("utdatert-ukegrunnlag");
      const fase = z.enum(LPhase).safeParse(grunnlag.modell.signals.aktivFase);
      if (!fase.success) throw Error("mangler-periodegrunnlag");
      const start = new Date(`${forslag.databevis.uke}T00:00:00Z`);
      const slutt = new Date(start.getTime() + 7 * 86_400_000);
      if (await tx.trainingPlanSession.count({ where: { planId: r.planId, scheduledAt: { gte: start, lt: slutt } } })) {
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
        { source: "SYSTEM" }, { source: "COACH", createdBy: viewer.id },
      ] }, select: { id: true, pyramidArea: true, lPhases: true } });
      for (const s of sortert) {
        for (const d of s.drills) {
          const exercise = drills.find(e => e.id === d.exerciseId);
          if (!exercise || revisjoner.find(r => r.id === d.exerciseId)?.revisjon !== d.exerciseRevisjon || exercise.pyramidArea !== s.pyramidArea ||
            (exercise.lPhases.length && !exercise.lPhases.includes(fase.data))) throw Error("ugyldig-ukeovelse");
        }
        const session = await tx.trainingPlanSession.create({ data: { planId: r.planId, title: s.title,
          scheduledAt: new Date(s.scheduledAt), durationMin: s.durationMin, pyramidArea: s.pyramidArea,
          lPhase: fase.data, status: "PLANNED" }, select: { id: true } });
        await tx.sessionDrill.createMany({ data: s.drills.map((d, index) => ({ sessionId: session.id,
          exerciseId: d.exerciseId, repsSets: `${d.minutter} min`, repType: "TID", repMinutter: d.minutter, orderIndex: index })) });
        // Individual coaching proposal, not a group class: no sourceGroupId.
        await upsertV2ForPlanSession({ db: tx, coachId: viewer.id, playerId: r.userId,
          planSessionId: session.id, title: s.title, scheduledAt: new Date(s.scheduledAt),
          durationMin: s.durationMin, pyramidArea: s.pyramidArea });
        antall++;
      }
    }
    await tx.planAction.update({ where: { id: key }, data: { status: valg, decidedAt: new Date(),
      decidedById: viewer.id, ...(valg === "REJECTED" ? { rejectReason: note } : { decisionNote: note }) } });
    await tx.agentRun.create({ data: valg === "REJECTED"
      ? planActionAvvisSpor({ actionId: key, actionType: action.actionType, userId: r.userId })
      : planActionOkSpor({ actionId: key, actionType: action.actionType, userId: r.userId,
        applied: true, summary: `${antall} planlagte økter opprettet` }) });
    return { status: valg, applied: valg === "ACCEPTED", summary: `${antall} planlagte økter opprettet` };
  });
  if (!resultat) throw Error("forbidden");
  return resultat.verdi;
}
