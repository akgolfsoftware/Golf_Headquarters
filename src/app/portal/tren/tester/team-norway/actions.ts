"use server";

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { syncTalentEtterTest } from "@/lib/talent/test-sync";
import { tnDefinitionData, tnDefinitionId } from "@/lib/portal-tester/tn-integration";
import { prisma } from "@/lib/prisma";
import { tnVersion, tnProtocol } from "@/lib/portal-tester/tn-catalog";
import { tnScore, tnValidate, tnSameValues } from "@/lib/portal-tester/tn-scoring";
import { TnSaveSchema, TnSessionSchema, type TnSaveResult } from "@/lib/portal-tester/tn-session";
import { aktivtSpillerMedlemskapWhere } from "@/lib/domain/grupper";

/** Own sessions only. Result and completion are one transaction; retries cannot create a second result. */
export async function saveTnTest(input: unknown): Promise<TnSaveResult> {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  const parsed = TnSaveSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ugyldige registreringer." };
  const data = parsed.data;
  if (data.ownerId && data.ownerId !== user.id) return { ok: false, error: "Innlogget konto er endret. Åpne testen fra riktig konto." };
  const base = tnProtocol(data.protocolId, undefined, data.version);
  const p = base?.variableCount ? tnProtocol(data.protocolId, data.count, data.version) : base;
  if (!p || p.rows.length !== data.count) return { ok: false, error: "Ukjent testvariant eller feil antall forsøk." };
  const error = tnValidate(p, data.values, data.intent === "complete");
  if (error) return { ok: false, error };
  const result = data.intent === "complete" ? tnScore(p, data.values) : null;
  const definitionId = tnDefinitionId(p);
  try {
    const saved = await prisma.$transaction(async tx => {
      const existing = await tx.testSession.findUnique({ where: { id: data.sessionId } });
      if (existing && (existing.userId !== user.id || existing.testId !== definitionId)) throw new Error("Økten er ikke tilgjengelig.");
      let testdagDeltaker: { id: string; playerId: string; status: string; sessionId: string | null; testDay: { status: string; groupId: string; testDefinitionId: string; testDefinition: { scoringRule: string | null } } } | null = null;
      if (data.testDayParticipantId) {
        testdagDeltaker = await tx.testDayParticipant.findUnique({
          where: { id: data.testDayParticipantId },
          include: { testDay: { include: { testDefinition: { select: { scoringRule: true } } } } },
        });
        if (!testdagDeltaker || testdagDeltaker.playerId !== user.id || testdagDeltaker.status !== "PENDING" || testdagDeltaker.testDay.status !== "ACTIVE" || testdagDeltaker.testDay.testDefinitionId !== definitionId || testdagDeltaker.testDay.testDefinition.scoringRule !== tnVersion(p)) {
          throw new Error("Testdagstildelingen er ikke tilgjengelig for denne spilleren eller testen.");
        }
        const membership = await tx.groupMember.findFirst({ where: { groupId: testdagDeltaker.testDay.groupId, userId: user.id, ...aktivtSpillerMedlemskapWhere() }, select: { id: true } });
        if (!membership) throw new Error("Du er ikke lenger aktiv spiller i gruppen som eier testdagen.");
        if (existing && testdagDeltaker.sessionId !== existing.id) throw new Error("Økten er ikke lenger koblet til denne testdagstildelingen.");
        if (!existing && testdagDeltaker.sessionId) throw new Error("Testen er startet i en annen fane. Last på nytt før du fortsetter.");
      } else if (existing) {
        const testdagKobling = await tx.testDayParticipant.findFirst({ where: { sessionId: existing.id }, select: { id: true } });
        if (testdagKobling) throw new Error("Økten hører til en testdag. Åpne den fra testdagen for å fortsette.");
      }
      const state = existing ? TnSessionSchema.safeParse(existing.scoringData) : null;
      if (existing && (!state?.success || state.data.version !== tnVersion(p) || state.data.protocolId !== p.id || state.data.count !== data.count)) throw new Error("Protokollen er endret. Start en ny test og behold dette utkastet.");
      // Retry the exact operation after a lost response, including draft/abort.
      // A mutation ID never authorizes ownership, a protocol change or new values.
      const receipt = state?.success ? state.data.lastMutation : undefined;
      if (data.mutationId && receipt?.id === data.mutationId) {
        if (receipt.intent !== data.intent || receipt.baseRevision !== data.revision ||
            !tnSameValues(state!.data!.values, data.values) || state!.data!.notes !== data.notes) {
          throw new Error("Økten fikk forskjellige verdier med samme lagringskvittering.");
        }
        return { ok: true as const, revision: state!.data!.revision, resultId: existing?.testResultId ?? undefined };
      }
      if (existing?.status === "COMPLETED" && data.intent === "complete") {
        if (!tnSameValues(state!.data!.values, data.values) || state!.data!.notes !== data.notes) throw new Error("Økten er fullført. Nye verdier kan ikke overskrive resultatet.");
        return { ok: true as const, revision: state!.data!.revision, resultId: existing.testResultId ?? undefined };
      }
      if (existing && existing.status !== "IN_PROGRESS") throw new Error("Økten er avsluttet og kan ikke overskrives.");
      if (existing && state!.data!.revision !== data.revision) throw new Error("Økten er endret i en annen fane. Last siden på nytt før du fortsetter.");
      if (!existing && data.revision !== 0) throw new Error("Utkastet finnes ikke. Last siden på nytt.");
      const revision = data.revision + 1;
      const scoringData = { version: tnVersion(p), protocolId: p.id, count: data.count, revision, values: data.values, notes: data.notes, ...(data.mutationId ? { lastMutation: { id: data.mutationId, intent: data.intent, baseRevision: data.revision } } : {}) };
      if (!existing) {
        // New stable identities preserve old test definitions/results and their historical scoring.
        await tx.testDefinition.upsert({
          where: { id: definitionId }, update: {},
          create: tnDefinitionData(p),
        });
        await tx.testSession.create({ data: { id: data.sessionId, userId: user.id, testId: definitionId, scoringData } });
        if (testdagDeltaker) {
          const bound = await tx.testDayParticipant.updateMany({ where: { id: testdagDeltaker.id, playerId: user.id, status: "PENDING", sessionId: null }, data: { sessionId: data.sessionId } });
          if (bound.count !== 1) throw new Error("Testen ble startet samtidig. Last siden på nytt.");
        }
      } else {
        const changed = await tx.testSession.updateMany({
          where: { id: data.sessionId, userId: user.id, status: "IN_PROGRESS", scoringData: { equals: state!.data! } },
          data: { scoringData },
        });
        if (changed.count !== 1) throw new Error("Økten ble endret samtidig. Last siden på nytt før du fortsetter.");
      }
      let resultId: string | undefined;
      if (result) {
        const record = await tx.testResult.create({ data: {
          userId: user.id, testId: definitionId, takenAt: new Date(), score: result.score,
          notes: data.notes || null, details: result,
        }, select: { id: true } });
        resultId = record.id;
        if (testdagDeltaker) {
          const completed = await tx.testDayParticipant.updateMany({ where: { id: testdagDeltaker.id, playerId: user.id, status: "PENDING", sessionId: data.sessionId }, data: { status: "DONE", resultId: record.id } });
          if (completed.count !== 1) throw new Error("Testdagen ble endret samtidig. Last siden på nytt.");
        }
        // One completed protocol satisfies one assignment. A free-count variant must use the assigned default count.
        if (p.rows.length === base!.rows.length) {
          const assignment = await tx.testAssignment.findFirst({ where: { playerId: user.id, testId: definitionId, status: "OPEN" }, orderBy: { createdAt: "asc" }, select: { id: true, coachId: true } });
          if (assignment) {
            const claimed = await tx.testAssignment.updateMany({ where: { id: assignment.id, playerId: user.id, status: "OPEN" }, data: { status: "COMPLETED", completedResultId: record.id } });
            if (claimed.count === 1) await tx.notification.create({ data: { userId: assignment.coachId, type: "melding", title: "Test fullført", body: `«${p.name}» er fullført.`, link: `/admin/spillere/${user.id}/tester` } });
          }
        }
      }
      if (data.intent !== "draft") {
        await tx.testSession.update({ where: { id: data.sessionId }, data: {
          status: result ? "COMPLETED" : "ABORTED", ...(result ? { completedAt: new Date(), testResultId: resultId } : { abortedAt: new Date() }),
        } });
        if (!result && testdagDeltaker) {
          const released = await tx.testDayParticipant.updateMany({ where: { id: testdagDeltaker.id, status: "PENDING", sessionId: data.sessionId }, data: { sessionId: null } });
          if (released.count !== 1) throw new Error("Testdagen ble endret samtidig. Last siden på nytt.");
        }
      }
      return { ok: true as const, revision, ...(resultId ? { resultId } : {}) };
    });
    try { revalidatePath("/portal/tren/tester/team-norway"); } catch { console.error("Team Norway: resultat lagret, oppfriskning feilet."); }
    if (data.intent === "complete") await syncTalentEtterTest(user.id).catch(() => console.error("Team Norway: talentsynk må prøves igjen."));
    try { revalidatePath("/portal/tren/tester"); revalidatePath("/portal/talent/mitt-niva"); revalidatePath("/admin/tester"); } catch { /* Durable save already succeeded. */ }
    return saved;
  } catch (e) {
    // Domain errors are safe copy. Infrastructure errors should not expose SQL or connection details.
    const message = e instanceof Error ? e.message : "";
    const domainError = /^(Økten|Protokollen|Utkastet|Testdagstildelingen|Du er ikke lenger|Testen er startet|Denne testen)/.test(message);
    return { ok: false, retryable: !domainError, error: domainError ? message : "Kunne ikke lagre. Registreringene er bevart. Prøv igjen." };
  }
}
