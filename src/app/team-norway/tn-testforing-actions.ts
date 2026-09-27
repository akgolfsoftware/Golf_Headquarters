"use server";

/**
 * Team Norway — trenerføring: coachen fører en test PÅ VEGNE AV en valgt
 * spiller, som del av en testdag (`TestDay`/`TestDayParticipant`, additiv
 * kildekode — se docs/design-audit/team-norway-testdag-modellforslag-
 * 2026-09-14.md). Bevisst adskilt fra `saveTnTest` (src/app/portal/tren/
 * tester/team-norway/actions.ts) — egenføringens userId-vakt (spilleren kan
 * KUN skrive på seg selv) skal aldri svekkes eller deles med denne stien.
 *
 * Autorisasjon (strengere enn generell AgencyOS-coach-scoping, presisert i
 * review 14.09.2026 — ALT sjekkes på nytt INNI transaksjonen, ikke bare ved
 * et forhåndsoppslag, slik at en samtidig statusendring/utmelding fanges):
 *  1. Platform-rolle COACH/ADMIN (`requirePortalUser`).
 *  2. Deltakeren må høre til en `TestDay` i den KANONISKE Team Norway-
 *     gruppen (`slug === "team-norway"`), med `TestDay.status = "ACTIVE"`.
 *  3. Coachen må selv ha et AKTIVT `GroupMember.role = "COACH"`-medlemskap
 *     (samme kanon som resten av appen: `endedAt: null`, gjenbrukt fra
 *     `aktivtMedlemskapWhere`/`aktivtSpillerMedlemskapWhere` — ASSISTANT gir
 *     aldri skriverett) i nettopp den gruppen.
 *  4. Spilleren må selv ha et AKTIVT `GroupMember.role = "PLAYER"`-
 *     medlemskap i samme gruppe.
 *  5. Deltakerraden må stå i `PENDING` (draft/complete) — `SKIPPED`/
 *     `ABSENT` må først settes tilbake til køen via
 *     `settTestdagDeltakerStatus`; `DONE` behandles idempotent (punkt 6).
 *
 * Sessionen coachen skriver til er ALDRI klient-styrt: serveren leser/setter
 * `TestDayParticipant.sessionId` selv.
 *
 * 6. Idempotens på et FULLFØRT resultat: kun et forsøk med EKSAKT samme
 *    verdier/notater som det lagrede resultatet returneres som "ok" (samme
 *    revision). Et forsøk på å sende ANDRE verdier, eller på draft/abort
 *    etter fullført, avvises uttrykkelig — det er ikke det samme som å la
 *    en dobbeltklikket "Fullfør"-knapp lykkes stille.
 * 7. Protokollversjon låses til testdagen: `TestDefinition.scoringRule` må
 *    være nøyaktig dagens `TN_VERSION`. En testdag opprettet under en eldre
 *    protokollutgave avvises med en presis feilmelding — INGEN stille
 *    omtolking av gamle data mot en nyere katalogversjon. Antall forsøk er
 *    låst til protokollens `rows.length` på opprettelsestidspunktet, ikke
 *    hva klienten sender.
 * 8. Avbrutt utkast (`abort`) nuller `TestDayParticipant.sessionId` (raden
 *    forblir PENDING) — den gamle `TestSession`-raden blir historikk
 *    (ABORTED), men blokkerer ikke et NYTT forsøk. Uten dette ville en
 *    avbrutt økt låst deltakeren permanent.
 */
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { TEAM_NORWAY_SLUG, aktivtMedlemskapWhere, aktivtSpillerMedlemskapWhere } from "@/lib/domain/grupper";
import { medSerialisertTestdagTransaksjon } from "@/lib/domain/tn-testdag-lock";
import { syncTalentEtterTest } from "@/lib/talent/test-sync";
import { tnProtocol, TN_VERSION } from "@/lib/portal-tester/tn-catalog";
import { tnScore, tnValidate, TnValuesSchema, type TnValues } from "@/lib/portal-tester/tn-scoring";
import { TnSessionSchema, type TnSaveResult } from "@/lib/portal-tester/tn-session";

const TnCoachSaveSchema = z.object({
  testDayParticipantId: z.string().min(1),
  revision: z.number().int().nonnegative(),
  values: TnValuesSchema,
  notes: z.string().max(2000).default(""),
  intent: z.enum(["draft", "abort", "complete"]),
});

function likeVerdier(a: TnValues, b: TnValues): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Trenerførte testdag-økter — playerId/protokoll kommer ALLTID fra den autoriserte deltakerraden, aldri fra klienten. */
export async function saveTnTestSomCoach(input: unknown): Promise<TnSaveResult> {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const parsed = TnCoachSaveSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ugyldige registreringer." };
  const data = parsed.data;

  try {
    const saved = await medSerialisertTestdagTransaksjon(async (tx) => {
      const deltaker = await tx.testDayParticipant.findUnique({
        where: { id: data.testDayParticipantId },
        include: { testDay: { include: { group: true, testDefinition: true } } },
      });
      if (!deltaker || deltaker.testDay.group.slug !== TEAM_NORWAY_SLUG) throw new Error("Fant ikke denne deltakeren i Team Norway-testdagen.");
      if (deltaker.testDay.status !== "ACTIVE") throw new Error("Testdagen er ikke aktiv og tar ikke imot nye registreringer.");

      if (coach.role !== "ADMIN") {
        const coachMedlem = await tx.groupMember.findFirst({
          where: { groupId: deltaker.testDay.groupId, userId: coach.id, role: "COACH", ...aktivtMedlemskapWhere() },
          select: { id: true },
        });
        if (!coachMedlem) throw new Error("Du er ikke aktiv trener i Team Norway-gruppen.");
      }
      const spillerMedlem = await tx.groupMember.findFirst({
        where: { groupId: deltaker.testDay.groupId, userId: deltaker.playerId, ...aktivtSpillerMedlemskapWhere() },
        select: { id: true },
      });
      if (!spillerMedlem) throw new Error("Spilleren er ikke lenger et aktivt medlem av Team Norway-gruppen.");

      // Protokollversjon låst til testdagen — aldri live-katalogen.
      if (deltaker.testDay.testDefinition.scoringRule !== TN_VERSION) {
        throw new Error(`Testdagens protokollversjon (${deltaker.testDay.testDefinition.scoringRule}) er utdatert mot dagens ${TN_VERSION} og kan ikke føres videre.`);
      }
      const protokollJson = deltaker.testDay.testDefinition.protocol as { protocolId?: string } | null;
      const p = protokollJson?.protocolId ? tnProtocol(protokollJson.protocolId) : null;
      if (!p) throw new Error("Testdagens protokoll finnes ikke i katalogen.");
      const count = p.rows.length; // låst til protokollen på opprettelsestidspunktet, ikke klienten

      if (deltaker.status === "DONE") {
        if (!deltaker.resultId) throw new Error("Denne testen er allerede fullført.");
        const lagretResultat = await tx.testResult.findUnique({ where: { id: deltaker.resultId }, select: { details: true, notes: true } });
        const lagretParsed = TnSessionSchema.safeParse(
          deltaker.sessionId ? (await tx.testSession.findUnique({ where: { id: deltaker.sessionId }, select: { scoringData: true } }))?.scoringData : null,
        );
        const sammeVerdier = lagretParsed.success && likeVerdier(lagretParsed.data.values, data.values) && (lagretResultat?.notes ?? "") === data.notes;
        if (data.intent !== "complete" || !sammeVerdier) {
          throw new Error("Denne testen er allerede fullført. Nye verdier eller draft/avbryt kan ikke overskrive resultatet.");
        }
        return { ok: true as const, revision: lagretParsed.success ? lagretParsed.data.revision : data.revision, resultId: deltaker.resultId };
      }
      if (deltaker.status !== "PENDING") {
        throw new Error("Denne deltakeren er hoppet over eller ikke møtt. Sett tilbake til køen før du kan føre en test.");
      }

      const validationError = tnValidate(p, data.values, data.intent === "complete");
      if (validationError) throw new Error(validationError);
      const result = data.intent === "complete" ? tnScore(p, data.values) : null;
      const spillerId = deltaker.playerId;
      const definitionId = deltaker.testDay.testDefinitionId;
      const sessionId = deltaker.sessionId ?? crypto.randomUUID();

      const existing = await tx.testSession.findUnique({ where: { id: sessionId } });
      if (existing && existing.userId !== spillerId) throw new Error("Økten er ikke tilgjengelig.");
      const state = existing ? TnSessionSchema.safeParse(existing.scoringData) : null;
      if (existing && (!state?.success || state.data.protocolId !== p.id || state.data.count !== count)) throw new Error("Protokollen er endret. Start en ny test og behold dette utkastet.");
      if (existing && existing.status !== "IN_PROGRESS") throw new Error("Utkastet var avbrutt — dette skal ikke skje uten at deltakeren fikk et nytt sessionId. Prøv igjen.");
      if (existing && state!.data!.revision !== data.revision) throw new Error("Økten er endret i en annen fane. Last siden på nytt før du fortsetter.");
      if (!existing && data.revision !== 0) throw new Error("Utkastet finnes ikke. Last siden på nytt.");

      const revision = data.revision + 1;
      const scoringData = { version: TN_VERSION, protocolId: p.id, count, revision, values: data.values, notes: data.notes };
      if (!existing) {
        await tx.testSession.create({ data: { id: sessionId, userId: spillerId, testId: definitionId, scoringData } });
        // Claim: kun hvis deltakeren FORTSATT ikke har en session (matcher
        // snapshotet vi leste). To samtidige første drafts kan ellers begge
        // opprette en TestSession-rad og etterlate én av dem foreldreløs —
        // Serializable-innpakningen gjør at taperen her serialiseringsfeiler
        // og prøver hele transaksjonen på nytt (og finner da eksisterende).
        const bundet = await tx.testDayParticipant.updateMany({ where: { id: deltaker.id, sessionId: null }, data: { sessionId } });
        if (bundet.count !== 1) throw new Error("Økten ble startet samtidig i en annen fane. Last siden på nytt.");
      } else {
        const changed = await tx.testSession.updateMany({
          where: { id: sessionId, userId: spillerId, status: "IN_PROGRESS", scoringData: { equals: state!.data! } },
          data: { scoringData },
        });
        if (changed.count !== 1) throw new Error("Økten ble endret samtidig. Last siden på nytt før du fortsetter.");
      }

      let resultId: string | undefined;
      if (result) {
        const record = await tx.testResult.create({
          data: { userId: spillerId, testId: definitionId, takenAt: new Date(), score: result.score, notes: data.notes || null, details: result, recordedById: coach.id },
          select: { id: true },
        });
        resultId = record.id;
        // Atomisk, idempotent avslutning: kun en rad som FORTSATT er PENDING
        // kan gå til DONE — en samtidig andre fullføring kan ikke vinne over
        // den første (updateMany.count !== 1 kaster og ruller transaksjonen tilbake).
        const fullfort = await tx.testDayParticipant.updateMany({ where: { id: deltaker.id, status: "PENDING" }, data: { status: "DONE", resultId: record.id } });
        if (fullfort.count !== 1) throw new Error("Denne testen ble fullført samtidig av en annen. Last siden på nytt.");
        await tx.testSession.update({ where: { id: sessionId }, data: { status: "COMPLETED", completedAt: new Date(), testResultId: resultId } });
      } else if (data.intent === "abort") {
        // Nuller sessionId (raden er fortsatt PENDING) slik at et nytt forsøk
        // ikke låses bak den avbrutte, avsluttede TestSession-raden. Match
        // på FORVENTET sessionId + PENDING — nuller aldri en session en
        // konkurrerende, senere transaksjon allerede har satt.
        await tx.testSession.update({ where: { id: sessionId }, data: { status: "ABORTED", abortedAt: new Date() } });
        const nullet = await tx.testDayParticipant.updateMany({ where: { id: deltaker.id, status: "PENDING", sessionId }, data: { sessionId: null } });
        if (nullet.count !== 1) throw new Error("Deltakeren ble endret samtidig. Last siden på nytt.");
      }
      return { ok: true as const, revision, ...(resultId ? { resultId } : {}) };
    });
    // Etterarbeid (cache-oppfriskning, talentsynk) skjer ETTER at
    // transaksjonen er commitet — en feil her betyr aldri at lagringen
    // mislyktes, og skal derfor ALDRI kunne gjøre at funksjonen returnerer
    // "Kunne ikke lagre" for et resultat som allerede står i databasen.
    // Egen try/catch, isolert fra svaret som gis til brukeren.
    try {
      revalidatePath("/team-norway/fellestesting");
      revalidatePath("/team-norway/spillere");
      if (saved.resultId) {
        const deltaker = await prisma.testDayParticipant.findUnique({ where: { id: data.testDayParticipantId }, select: { playerId: true } });
        if (deltaker) {
          revalidatePath(`/admin/spillere/${deltaker.playerId}/tester`);
          await syncTalentEtterTest(deltaker.playerId).catch(() => console.error("Team Norway trenerføring: talentsynk må prøves igjen."));
        }
      }
    } catch {
      console.error("Team Norway trenerføring: resultat lagret, oppfriskning/etterarbeid feilet.");
    }
    return saved;
  } catch (e) {
    const message = e instanceof Error ? e.message : "";
    const trygg = /^(Økten|Protokollen|Utkastet|Denne testen|Denne deltakeren|Deltakeren|Testdagens|Testdagen|Fant ikke|Du er ikke|Spilleren er ikke)/.test(message);
    return { ok: false, error: trygg ? message : "Kunne ikke lagre. Registreringene er fortsatt i denne fanen. Prøv igjen." };
  }
}
