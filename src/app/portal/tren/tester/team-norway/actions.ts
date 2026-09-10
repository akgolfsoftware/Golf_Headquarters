"use server";

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { syncTalentEtterTest } from "@/lib/talent/test-sync";
import { tnDefinitionData } from "@/lib/portal-tester/tn-integration";
import { prisma } from "@/lib/prisma";
import { TN_VERSION, tnProtocol } from "@/lib/portal-tester/tn-catalog";
import { tnScore, tnValidate } from "@/lib/portal-tester/tn-scoring";
import { TnSaveSchema, TnSessionSchema, type TnSaveResult } from "@/lib/portal-tester/tn-session";

/** Own sessions only. Result and completion are one transaction; retries cannot create a second result. */
export async function saveTnTest(input: unknown): Promise<TnSaveResult> {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  const parsed = TnSaveSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ugyldige registreringer." };
  const data = parsed.data;
  const base = tnProtocol(data.protocolId);
  const p = base?.variableCount ? tnProtocol(data.protocolId, data.count) : base;
  if (!p || p.rows.length !== data.count) return { ok: false, error: "Ukjent testvariant eller feil antall forsøk." };
  const error = tnValidate(p, data.values, data.intent === "complete");
  if (error) return { ok: false, error };
  const result = data.intent === "complete" ? tnScore(p, data.values) : null;
  const definitionId = `tn-v3-${p.id}`;
  try {
    const saved = await prisma.$transaction(async tx => {
      const existing = await tx.testSession.findUnique({ where: { id: data.sessionId } });
      if (existing && (existing.userId !== user.id || existing.testId !== definitionId)) throw new Error("Økten er ikke tilgjengelig.");
      const state = existing ? TnSessionSchema.safeParse(existing.scoringData) : null;
      if (existing && (!state?.success || state.data.protocolId !== p.id || state.data.count !== data.count)) throw new Error("Protokollen er endret. Start en ny test og behold dette utkastet.");
      if (existing?.status === "COMPLETED" && data.intent === "complete") {
        if (JSON.stringify(state!.data!.values) !== JSON.stringify(data.values) || state!.data!.notes !== data.notes) throw new Error("Økten er fullført. Nye verdier kan ikke overskrive resultatet.");
        return { ok: true as const, revision: state!.data!.revision, resultId: existing.testResultId ?? undefined };
      }
      if (existing && existing.status !== "IN_PROGRESS") throw new Error("Økten er avsluttet og kan ikke overskrives.");
      if (existing && state!.data!.revision !== data.revision) throw new Error("Økten er endret i en annen fane. Last siden på nytt før du fortsetter.");
      if (!existing && data.revision !== 0) throw new Error("Utkastet finnes ikke. Last siden på nytt.");
      const revision = data.revision + 1;
      const scoringData = { version: TN_VERSION, protocolId: p.id, count: data.count, revision, values: data.values, notes: data.notes };
      if (!existing) {
        // New stable identities preserve old test definitions/results and their historical scoring.
        await tx.testDefinition.upsert({
          where: { id: definitionId }, update: {},
          create: tnDefinitionData(p),
        });
        await tx.testSession.create({ data: { id: data.sessionId, userId: user.id, testId: definitionId, scoringData } });
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
        // One completed protocol satisfies one assignment. A free-count variant must use the assigned default count.
        if (p.rows.length === base!.rows.length) {
          const assignment = await tx.testAssignment.findFirst({ where: { playerId: user.id, testId: definitionId, status: "OPEN" }, orderBy: { createdAt: "asc" }, select: { id: true, coachId: true } });
          if (assignment) {
            const claimed = await tx.testAssignment.updateMany({ where: { id: assignment.id, playerId: user.id, status: "OPEN" }, data: { status: "COMPLETED", completedResultId: record.id } });
            if (claimed.count === 1) await tx.notification.create({ data: { userId: assignment.coachId, type: "melding", title: "Test fullført", body: `«${p.name}» er fullført.`, link: `/admin/spillere/${user.id}/tester` } });
          }
        }
      }
      if (data.intent !== "draft") await tx.testSession.update({ where: { id: data.sessionId }, data: {
        status: result ? "COMPLETED" : "ABORTED", ...(result ? { completedAt: new Date(), testResultId: resultId } : { abortedAt: new Date() }),
      } });
      return { ok: true as const, revision, ...(resultId ? { resultId } : {}) };
    });
    try { revalidatePath("/portal/tren/tester/team-norway"); } catch { console.error("Team Norway: resultat lagret, oppfriskning feilet."); }
    if (data.intent === "complete") await syncTalentEtterTest(user.id).catch(() => console.error("Team Norway: talentsynk må prøves igjen."));
    try { revalidatePath("/portal/tren/tester"); revalidatePath("/portal/talent/mitt-niva"); revalidatePath("/admin/tester"); } catch { /* Durable save already succeeded. */ }
    return saved;
  } catch (e) {
    // Domain errors are safe copy. Infrastructure errors should not expose SQL or connection details.
    const message = e instanceof Error ? e.message : "";
    return { ok: false, error: /^(Økten|Protokollen|Utkastet)/.test(message) ? message : "Kunne ikke lagre. Registreringene er fortsatt i denne fanen. Prøv igjen." };
  }
}
