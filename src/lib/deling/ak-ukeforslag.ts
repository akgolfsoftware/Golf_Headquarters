import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { canonicalJson } from "@/lib/agents/canonical-json";
import { planActionAvvisSpor, planActionOkSpor } from "@/lib/agents/plan-action-spor";
import { upsertV2ForPlanSession } from "@/lib/workbench/v2-sync";
import { akProfilBevisSchema, brukMedSammeAkProfilBevis } from "./ak-profil-mellomlagring";
import { laasOgLesSammeAkUkegrunnlag } from "./ak-ukegrunnlag";
import { akUkeforslagSchema } from "./ak-ukeforslag-format";
import { kontrollerAkUkeforslag } from "./ak-ukeforslag-kontroll";

const id = z.string().trim().min(1).max(200);
export { akUkeforslagSchema } from "./ak-ukeforslag-format";

/** Legacy/malformed rows are part of the family too; never fall through. */
export function erAkUkeforslag(a: { actionType: string; agentName?: string }) {
  return a.actionType === "WEEKLY_PROPOSAL" || a.agentName === "weekly-plan-proposals";
}

/** Only called by a human decision entry. No model calls or automatic approval.
 * New trusted server format is required; old suggestions are never upgraded.
 * Queue creation and reads use the same format; runtime activation is separate.
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
    // Same order as generation: sharing -> owned plan -> action. Otherwise a
    // renewal can hold the plan while approval holds the action (deadlock).
    const plan = await tx.$queryRaw<Array<{ id: string }>>`SELECT id FROM training_plans
      WHERE id = ${r.planId} AND "userId" = ${r.userId} AND "createdById" = ${viewer.id} FOR UPDATE`;
    if (plan.length !== 1) throw Error("forbidden");
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
      await tx.planAction.update({ where: { id: key }, data: { decisionNote: note, decidedById: viewer.id } });
      await tx.notification.create({ data: { userId: r.userId, type: "approval_question",
        title: "Coach trenger mer info", body: note!, link: "/portal/agent-pipeline" } });
      return { status: "UNCHANGED" as const, applied: false };
    }
    let antall = 0;
    if (valg === "ACCEPTED") {
      const grunnlag = await laasOgLesSammeAkUkegrunnlag(tx, scope, jobb, forslag.databevis);
      if (!grunnlag) throw Error("utdatert-ukegrunnlag");
      const { sortert, fase, fagligeRad } = await kontrollerAkUkeforslag(tx, forslag, grunnlag);
      // Bank row waits may outlive a change to unlocked result/signal inputs.
      if (!await laasOgLesSammeAkUkegrunnlag(tx, scope, jobb, forslag.databevis)) throw Error("utdatert-ukegrunnlag");
      // Advice may be accepted, but must belong to this captured proposal.
      // Legacy rows with newly surfaced advice need a fresh proposal, not an
      // invisible upgrade while the coach is deciding on the old content.
      if (canonicalJson(forslag.fagligeRad ?? []) !== canonicalJson(fagligeRad)) throw Error("utdatert-faglig-vurdering");
      for (const s of sortert) {
        const session = await tx.trainingPlanSession.create({ data: { planId: r.planId, title: s.title,
          scheduledAt: new Date(s.scheduledAt), durationMin: s.durationMin, pyramidArea: s.pyramidArea,
          lPhase: fase, status: "PLANNED" }, select: { id: true } });
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
