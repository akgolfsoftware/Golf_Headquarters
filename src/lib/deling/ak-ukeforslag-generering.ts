import "server-only";
import { Prisma } from "@/generated/prisma/client";
import { canonicalJson } from "@/lib/agents/canonical-json";
import type { AkGruppeoppdrag } from "./ak-gruppeoppdrag";
import { hentAkUkegrunnlag, brukSammeAkUkegrunnlag, laasOgLesSammeAkUkegrunnlag, type AkUkegrunnlag } from "./ak-ukegrunnlag";
import { akUkeutkastSchema, akUkeforslagSchema } from "./ak-ukeforslag-format";
import { hentAkUkekandidater, type AkUkekandidater } from "./ak-ukekandidater";
import { kontrollerAkUkeforslag } from "./ak-ukeforslag-kontroll";

/** Internal server orchestration, not an action or a cron activation. The planner
 * must supply concrete, qualified exercises, revisions, minutes and times. There
 * is deliberately no default time, arbitrary exercise or generic fallback.
 * The legacy callback receives only allowlisted model context; IDs, evidence
 * and profile text are not model input. A future model adapter must preserve
 * this boundary and the outstanding purpose/qualification checks.
 *
 * Legacy internal v1 producer retained for existing callers/tests; inactive.
 * New bank-backed integration must use genererAkBankukeforslag below. */
export function genererAkUkeforslag(jobb: AkGruppeoppdrag, spillerId: unknown, uke: unknown,
  utform: (modell: AkUkegrunnlag["modell"]) => Promise<unknown>) {
  return generer(jobb, spillerId, uke, utform, false);
}

/** Trusted server planner only. Candidate IDs/proofs are not cloud prompt input.
 * No actual model adapter, import, cron or automatic decision is activated. */
export function genererAkBankukeforslag(jobb: AkGruppeoppdrag, spillerId: unknown, uke: unknown,
  utform: (modell: AkUkegrunnlag["modell"], kandidater: AkUkekandidater) => Promise<unknown>) {
  return generer(jobb, spillerId, uke, utform, true);
}

async function generer(jobb: AkGruppeoppdrag, spillerId: unknown, uke: unknown,
  utform: (modell: AkUkegrunnlag["modell"], kandidater: AkUkekandidater) => Promise<unknown>, bankbundet: boolean,
) {
  const grunnlag = await hentAkUkegrunnlag(jobb, spillerId, uke);
  if (!grunnlag || grunnlag.harManedsEllerUkevalg) return { status: "INGEN_GRUNNLAG" as const };

  const bank = bankbundet ? await hentAkUkekandidater(jobb, spillerId, uke) : null;
  if (bankbundet && (!bank || canonicalJson(bank.bevis.deling) !== canonicalJson(grunnlag.deling) ||
    canonicalJson(bank.bevis.databevis) !== canonicalJson(grunnlag.databevis))) return { status: "UTDATERT" as const };
  if (bank && !bank.kandidater.length) return { status: "INGEN_BANKKANDIDATER" as const };

  // Capture ends before asynchronous planner/model work; never hold DB locks
  // across network calls. Clone so a planner cannot mutate the captured basis.
  const raw = await utform(structuredClone(grunnlag.modell), structuredClone(bank?.kandidater ?? []));
  if (raw === null) return { status: "INGEN_UTKAST" as const };
  const utkast = akUkeutkastSchema.parse(raw);
  const forslag = akUkeforslagSchema.parse({ ...utkast, ...(bank ? { versjon: 2, bankFingeravtrykk: bank.bevis.kandidatFingeravtrykk, fagligeRad: [] } : { versjon: 1 }),
    deling: grunnlag.deling, databevis: grunnlag.databevis });

  const oppdrag = { gruppeId: grunnlag.deling.gruppeId, coachId: grunnlag.deling.coachId };
  const lagret = await brukSammeAkUkegrunnlag(oppdrag, grunnlag.deling.spillerId, grunnlag.deling, grunnlag.databevis,
    async (tx, ferskt) => {
      // Same checks at creation and approval, including locked exercise versions.
      forslag.fagligeRad = (await kontrollerAkUkeforslag(tx, forslag, ferskt)).fagligeRad;
      if (!await laasOgLesSammeAkUkegrunnlag(tx, { id: grunnlag.deling.spillerId }, oppdrag, grunnlag.databevis)) {
        throw Error("utdatert-ukegrunnlag");
      }
      // Every weekly decision also locks the plan before its action row. Lock
      // only the same recipient, grant and week; never revive an old grant.
      const ko = {
        userId: grunnlag.deling.spillerId, coachId: grunnlag.deling.coachId, planId: grunnlag.planId,
        agentName: "weekly-plan-proposals", actionType: "WEEKLY_PROPOSAL",
        status: { in: ["PENDING", "PROCESSING"] }, AND: [
          { suggestion: { path: ["deling"], equals: grunnlag.deling } },
          { suggestion: { path: ["databevis", "uke"], equals: grunnlag.databevis.uke } },
        ],
      } satisfies Prisma.PlanActionWhereInput;
      const kandidater = await tx.planAction.findMany({ where: ko, select: { id: true } });
      if (kandidater.length) await tx.$queryRaw`SELECT id FROM plan_actions
        WHERE id IN (${Prisma.join(kandidater.map(r => r.id))}) ORDER BY id FOR UPDATE`;
      // Re-read after waiting: another authorized decision may have finished.
      const eksisterende = await tx.planAction.findMany({ where: ko,
        orderBy: [{ createdAt: "asc" }, { id: "asc" }], select: { id: true, status: true, suggestion: true } });
      if (eksisterende.some(r => r.status === "PROCESSING")) return { status: "BEHANDLES" as const };
      const utdaterte: string[] = [];
      let gjeldendeId: string | undefined;
      for (const rad of eksisterende) {
        const parsed = akUkeforslagSchema.safeParse(rad.suggestion);
        if (!parsed.success || parsed.data.databevis.planId !== grunnlag.planId) {
          return { status: "KREVER_GJENNOMGANG" as const };
        }
        const gammelt = parsed.data;
        // A legacy producer must never replace or reuse a bank-bound contract.
        if (!bankbundet && gammelt.versjon === 2) return { status: "KREVER_GJENNOMGANG" as const };
        if (bankbundet && (gammelt.versjon !== 2 || gammelt.bankFingeravtrykk !== bank?.bevis.kandidatFingeravtrykk)) {
          utdaterte.push(rad.id); continue;
        }
        let utdatert = canonicalJson(gammelt.databevis) !== canonicalJson(grunnlag.databevis);
        if (!utdatert) {
          // Exercise revisions are separate from the weekly data fingerprint.
          // A deleted or revised exercise also requires a genuinely new draft.
          const drills = gammelt.sessions.flatMap(s => s.drills);
          const ids = [...new Set(drills.map(d => d.exerciseId))].sort();
          const revisjoner = await tx.$queryRaw<Array<{ id: string; revisjon: string }>>`
            SELECT id, xmin::text AS revisjon FROM exercise_definitions
            WHERE id IN (${Prisma.join(ids)}) ORDER BY id FOR SHARE`;
          utdatert = drills.some(d => revisjoner.find(r => r.id === d.exerciseId)?.revisjon !== d.exerciseRevisjon);
        }
        if (utdatert) utdaterte.push(rad.id);
        else {
          // Never deduplicate to a well-shaped but invalid historical draft.
          const kontroll = await kontrollerAkUkeforslag(tx, gammelt, ferskt);
          if (canonicalJson(gammelt.fagligeRad ?? []) !== canonicalJson(kontroll.fagligeRad)) utdaterte.push(rad.id);
          else gjeldendeId ??= rad.id;
        }
      }
      // The historical-proposal checks can also wait on source rows. Keep the
      // final weekly comparison after those waits and before any queue write.
      if (!await laasOgLesSammeAkUkegrunnlag(tx, { id: grunnlag.deling.spillerId }, oppdrag, grunnlag.databevis)) {
        throw Error("utdatert-ukegrunnlag");
      }
      // SUPERSEDED is a system transition, not a coach rejection/approval.
      // Keep original body, evidence, comments and decision attribution intact.
      // Closing rows and creating their replacement commit or roll back together.
      if (utdaterte.length) await tx.planAction.updateMany({
        where: { ...ko, id: { in: utdaterte }, status: "PENDING" }, data: { status: "SUPERSEDED" },
      });
      if (gjeldendeId) return { status: "FINNES" as const, id: gjeldendeId };
      const action = await tx.planAction.create({ data: {
        userId: grunnlag.deling.spillerId, coachId: grunnlag.deling.coachId, planId: grunnlag.planId,
        agentName: "weekly-plan-proposals", actionType: "WEEKLY_PROPOSAL", status: "PENDING",
        suggestion: akUkeforslagSchema.parse(forslag),
      }, select: { id: true } });
      return { status: "OPPRETTET" as const, id: action.id, erstattetAntall: utdaterte.length };
    });
  return lagret?.verdi ?? { status: "UTDATERT" as const };
}
