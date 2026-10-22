"use server";

/**
 * Team Norway — testøkt uten testdag (utkast 3, Anders 22.10.2026, §TRACKMAN I TEAM NORWAY-TESTENE punkt 1).
 * Treneren fører flere tester for ÉN spiller i ett løp. Hver test er sin egen `TestSession` med
 * `userId` = spilleren og `recordedById` = treneren på resultatet. Testdag trengs bare når hele gruppa tester
 * (`saveTnTestSomCoach`, tn-testforing-actions.ts), og den stien er uendret.
 *
 * Tilgang (sjekkes i samme transaksjon som skrivingen, via delingslåsen i `medTnSpillerData`):
 *  1. Plattformrolle COACH eller ADMIN.
 *  2. Gruppe-rolle COACH i Team Norway (Assist Coach leser bare). ADMIN slipper gjennom rollesjekken,
 *     men må fortsatt ha navngitt deling, som for lesing.
 *  3. Spilleren har delt med treneren (navngitt deling). Uten deling: ingen skriving.
 *  4. Testen er en trener kan føre (`trenerKanFore`: Teknikk og PEI).
 *  5. Økten hører ikke til en testdag; den føres fra testdagen.
 */
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentTnArbeidskontekst, medTnSpillerData } from "@/lib/domain/tn-arbeidsflate";
import { syncTalentEtterTest } from "@/lib/talent/test-sync";
import { tnProtocol, tnVersion } from "@/lib/portal-tester/tn-catalog";
import { tnDefinitionData, tnDefinitionId } from "@/lib/portal-tester/tn-integration";
import { trenerKanFore } from "@/lib/portal-tester/testbatteri";
import { tnSameValues, tnScore, tnValidate } from "@/lib/portal-tester/tn-scoring";
import { TnSaveSchema, TnSessionSchema, type TnSaveResult } from "@/lib/portal-tester/tn-session";

const TnTestoktSchema = TnSaveSchema.omit({ testDayParticipantId: true, ownerId: true }).extend({ spillerId: z.string().min(1).max(200) });

class Avvist extends Error {}

export async function saveTnTestForSpiller(input: unknown): Promise<TnSaveResult> {
  const trener = await requirePortalUser({ tillatDemo: true, allow: ["COACH", "ADMIN"] });
  const parsed = TnTestoktSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ugyldige registreringer." };
  const data = parsed.data;

  const kontekst = await hentTnArbeidskontekst(trener);
  if (!kontekst || kontekst.erSpiller || (trener.role !== "ADMIN" && kontekst.rolle !== "COACH")) {
    return { ok: false, error: "Du er ikke trener i Team Norway og kan ikke føre tester." };
  }
  const base = tnProtocol(data.protocolId, undefined, data.version);
  const p = base?.variableCount ? tnProtocol(data.protocolId, data.count, data.version) : base;
  if (!p || p.rows.length !== data.count) return { ok: false, error: "Ukjent testvariant eller feil antall forsøk." };
  if (!trenerKanFore({ protokollId: p.id })) return { ok: false, error: "Denne testen fører spilleren selv i PlayerHQ." };
  const valideringsfeil = tnValidate(p, data.values, data.intent === "complete");
  if (valideringsfeil) return { ok: false, error: valideringsfeil };
  const result = data.intent === "complete" ? tnScore(p, data.values) : null;
  const definitionId = tnDefinitionId(p);

  try {
    const saved = await medTnSpillerData(trener, data.spillerId, async (tx) => {
      const existing = await tx.testSession.findUnique({ where: { id: data.sessionId } });
      if (existing && (existing.userId !== data.spillerId || existing.testId !== definitionId)) throw new Avvist("Økten er ikke tilgjengelig.");
      if (existing && (await tx.testDayParticipant.findFirst({ where: { sessionId: existing.id }, select: { id: true } }))) {
        throw new Avvist("Økten hører til en testdag. Før den fra testdagen.");
      }
      const state = existing ? TnSessionSchema.safeParse(existing.scoringData) : null;
      if (existing && (!state?.success || state.data.version !== tnVersion(p) || state.data.protocolId !== p.id || state.data.count !== data.count)) {
        throw new Avvist("Protokollen er endret. Start en ny test og behold dette utkastet.");
      }
      // Samme lagringskvittering etter et tapt svar gir samme svar, aldri en ny rad.
      const receipt = state?.success ? state.data.lastMutation : undefined;
      if (data.mutationId && receipt?.id === data.mutationId) {
        if (receipt.intent !== data.intent || receipt.baseRevision !== data.revision || !tnSameValues(state!.data!.values, data.values) || state!.data!.notes !== data.notes) {
          throw new Avvist("Økten fikk forskjellige verdier med samme lagringskvittering.");
        }
        return { ok: true as const, revision: state!.data!.revision, resultId: existing?.testResultId ?? undefined };
      }
      if (existing?.status === "COMPLETED" && data.intent === "complete") {
        if (!tnSameValues(state!.data!.values, data.values) || state!.data!.notes !== data.notes) throw new Avvist("Økten er fullført. Nye verdier kan ikke overskrive resultatet.");
        return { ok: true as const, revision: state!.data!.revision, resultId: existing.testResultId ?? undefined };
      }
      if (existing && existing.status !== "IN_PROGRESS") throw new Avvist("Økten er avsluttet og kan ikke overskrives.");
      if (existing && state!.data!.revision !== data.revision) throw new Avvist("Økten er endret i en annen fane. Last siden på nytt før du fortsetter.");
      if (!existing && data.revision !== 0) throw new Avvist("Utkastet finnes ikke. Last siden på nytt.");

      const revision = data.revision + 1;
      const scoringData = {
        version: tnVersion(p), protocolId: p.id, count: data.count, revision, values: data.values, notes: data.notes,
        ...(data.mutationId ? { lastMutation: { id: data.mutationId, intent: data.intent, baseRevision: data.revision } } : {}),
      };
      if (!existing) {
        await tx.testDefinition.upsert({ where: { id: definitionId }, update: {}, create: tnDefinitionData(p) });
        await tx.testSession.create({ data: { id: data.sessionId, userId: data.spillerId, testId: definitionId, scoringData } });
      } else {
        const changed = await tx.testSession.updateMany({
          where: { id: data.sessionId, userId: data.spillerId, status: "IN_PROGRESS", scoringData: { equals: state!.data! } },
          data: { scoringData },
        });
        if (changed.count !== 1) throw new Avvist("Økten ble endret samtidig. Last siden på nytt før du fortsetter.");
      }
      let resultId: string | undefined;
      if (result) {
        const record = await tx.testResult.create({
          data: { userId: data.spillerId, testId: definitionId, takenAt: new Date(), score: result.score, notes: data.notes || null, details: result, recordedById: trener.id },
          select: { id: true },
        });
        resultId = record.id;
      }
      if (data.intent !== "draft") {
        await tx.testSession.update({
          where: { id: data.sessionId },
          data: { status: result ? "COMPLETED" : "ABORTED", ...(result ? { completedAt: new Date(), testResultId: resultId } : { abortedAt: new Date() }) },
        });
      }
      return { ok: true as const, revision, ...(resultId ? { resultId } : {}) };
    });
    if (!saved) return { ok: false, error: "Spilleren har ikke delt med deg. Testen kan ikke føres." };
    // Etterarbeid etter lagring: en feil her betyr aldri at resultatet mangler.
    try {
      revalidatePath(`/team-norway/spiller/${data.spillerId}/tester`);
      revalidatePath(`/admin/spillere/${data.spillerId}/tester`);
      if (saved.resultId) await syncTalentEtterTest(data.spillerId).catch(() => console.error("Team Norway testøkt: talentsynk må prøves igjen."));
    } catch {
      console.error("Team Norway testøkt: resultat lagret, oppfriskning feilet.");
    }
    return saved;
  } catch (e) {
    if (e instanceof Avvist) return { ok: false, error: e.message };
    return { ok: false, retryable: true, error: "Kunne ikke lagre. Slagene er lagret på telefonen. Prøv igjen." };
  }
}
