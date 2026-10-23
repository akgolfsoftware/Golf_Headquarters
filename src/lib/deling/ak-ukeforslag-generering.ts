import "server-only";
import type { AkGruppeoppdrag } from "./ak-gruppeoppdrag";
import { hentAkUkegrunnlag, brukSammeAkUkegrunnlag, type AkUkegrunnlag } from "./ak-ukegrunnlag";
import { akUkeutkastSchema, akUkeforslagSchema } from "./ak-ukeforslag-format";
import { kontrollerAkUkeforslag } from "./ak-ukeforslag-kontroll";

/** Internal server orchestration, not an action or a cron activation. The planner
 * must supply concrete, qualified exercises, revisions, minutes and times. There
 * is deliberately no default time, arbitrary exercise or generic fallback.
 * Only the allowlisted model context is passed to the callback; IDs, evidence
 * and profile text remain here. A future model adapter must not bypass its own
 * prompt allowlist or the still outstanding purpose/qualification checks.
 */
export async function genererAkUkeforslag(jobb: AkGruppeoppdrag, spillerId: unknown, uke: unknown,
  utform: (modell: AkUkegrunnlag["modell"]) => Promise<unknown>,
) {
  const grunnlag = await hentAkUkegrunnlag(jobb, spillerId, uke);
  if (!grunnlag || grunnlag.harManedsEllerUkevalg || !grunnlag.budsjett ||
    !grunnlag.modell.signals.aktivFase) return { status: "INGEN_GRUNNLAG" as const };

  // Capture ends before asynchronous planner/model work; never hold DB locks
  // across network calls. Clone so a planner cannot mutate the captured basis.
  const raw = await utform(structuredClone(grunnlag.modell));
  if (raw === null) return { status: "INGEN_UTKAST" as const };
  const utkast = akUkeutkastSchema.parse(raw);
  const forslag = akUkeforslagSchema.parse({ ...utkast, versjon: 1,
    deling: grunnlag.deling, databevis: grunnlag.databevis });

  const oppdrag = { gruppeId: grunnlag.deling.gruppeId, coachId: grunnlag.deling.coachId };
  const lagret = await brukSammeAkUkegrunnlag(oppdrag, grunnlag.deling.spillerId, grunnlag.deling, grunnlag.databevis,
    async (tx, ferskt) => {
      // Same checks at creation and approval, including locked exercise versions.
      await kontrollerAkUkeforslag(tx, forslag, ferskt);
      // Target-plan lock serializes simultaneous generators, including different
      // group assignments for the same plan. Never replace/upgrade an old row.
      const eksisterende = await tx.planAction.findFirst({ where: {
        userId: grunnlag.deling.spillerId, coachId: grunnlag.deling.coachId, planId: grunnlag.planId,
        agentName: "weekly-plan-proposals", actionType: "WEEKLY_PROPOSAL",
        status: { in: ["PENDING", "PROCESSING"] }, AND: [
          { suggestion: { path: ["deling"], equals: grunnlag.deling } },
          { suggestion: { path: ["databevis", "uke"], equals: grunnlag.databevis.uke } },
        ],
      }, select: { id: true } });
      if (eksisterende) return { status: "FINNES" as const, id: eksisterende.id };
      const action = await tx.planAction.create({ data: {
        userId: grunnlag.deling.spillerId, coachId: grunnlag.deling.coachId, planId: grunnlag.planId,
        agentName: "weekly-plan-proposals", actionType: "WEEKLY_PROPOSAL", status: "PENDING",
        suggestion: forslag,
      }, select: { id: true } });
      return { status: "OPPRETTET" as const, id: action.id };
    });
  return lagret?.verdi ?? { status: "UTDATERT" as const };
}
