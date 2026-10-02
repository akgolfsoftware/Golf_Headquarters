import { createHash } from "node:crypto";
import { Prisma } from "@/generated/prisma/client";
import { addDays } from "@/lib/domain/workbench/operations";
import { tilDatoKolonne, fraDatoKolonne } from "./wb-map";
import { isoUkeIdentitet, parseWeekPlanData, tommeUkeplandetaljer, type WeekPlanningDetails } from "./ukeplan-schema";
import { syklusUker, syklusPlanfelter, type TreukerssyklusData, type LagreSyklusInput, type KopierSyklusInput } from "./treukerssyklus";
import type { WeekPlanFieldsSchema } from "./ukeplan-schema";
import type { z } from "zod";

export class SyklusFeil extends Error {}

type Db = Prisma.TransactionClient;
type Actor = { id: string; role: string };
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
export const syklusFingerprint = hash;
const stale = () => new SyklusFeil("En kilde- eller måluke er endret. Last inn en ny forhåndsvisning. Ingen del av syklusen er skrevet.");
function kanKopieres(row: { id: string; status: string; hiddenByPlayer: boolean; needsPlayerApproval: boolean; isAgentProposal: boolean; groupId: string | null; sourceGroupSessionId: string | null; isTemplate: boolean; blockType: string }) {
  return row.blockType === "OEKT" && ["DRAFT", "SCHEDULED", "PUBLISHED", "COMPLETED", "SKIPPED"].includes(row.status) && !row.hiddenByPlayer && !row.needsPlayerApproval && !row.isAgentProposal && !row.isTemplate && !row.groupId && !row.sourceGroupSessionId;
}
export async function lesSyklusCore(db: Db, playerId: string, anchor: string) {
  const result = await Promise.all(syklusUker(anchor).map(async weekStart => {
    const key = { playerId, ...isoUkeIdentitet(weekStart) };
    const row = await db.weekPlan.findUnique({ where: { playerId_isoYear_weekNumber: key } });
    const plan = row ? parseWeekPlanData(row) : null;
    if (row && !plan) throw new SyklusFeil("Ukeplanen har ukjente eller ugyldige felt og må gjennomgås. Lagret innhold er bevart.");
    if (row?.repetitionTargets !== null && row?.repetitionTargets !== undefined) throw new SyklusFeil("Historiske mengdefelt må gjennomgås før treukerssyklusen brukes. De lagrede feltene er bevart.");
    const calendarYear = Number(weekStart.slice(0, 4));
    if (!row && calendarYear !== key.isoYear && await db.weekPlan.findUnique({ where: { playerId_isoYear_weekNumber: { ...key, isoYear: calendarYear } } })) throw new SyklusFeil("En eldre ukeplan med uavklart ISO-år må gjennomgås før syklusen brukes.");
    if (plan?.planningDetails?.cycle) {
      const cycle = plan.planningDetails.cycle;
      if (syklusUker(cycle.anchorWeek)[cycle.position] !== weekStart) throw new SyklusFeil("Sykluskoblingen passer ikke til denne uka. Gjennomgå planen.");
    }
    const rows = await db.workbenchSession.findMany({ where: { playerId, date: { gte: tilDatoKolonne(weekStart), lt: tilDatoKolonne(addDays(weekStart, 7)) } }, include: { drills: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } }, orderBy: [{ date: "asc" }, { id: "asc" }] });
    const copyable = rows.filter(kanKopieres);
    return { raw: rows, weekStart, expected: hash({ row, rows }), plan, sessions: copyable.map(s => ({ id: s.id, title: s.title, date: fraDatoKolonne(s.date), status: s.status })), excludedSessions: rows.length - copyable.length };
  }));
  const [a, b, c] = result; return [a, b, c] as const;
}
export function offentligSyklus(weeks: Awaited<ReturnType<typeof lesSyklusCore>>): TreukerssyklusData["weeks"] {
  return weeks.map(({ raw: _raw, ...week }) => week) as TreukerssyklusData["weeks"];
}
export async function laasSyklus(db: Db, playerId: string) {
  // Låser bare spillerens rader. Serializable beskytter også forventet tomme nøkler.
  await db.$queryRaw`SELECT "id" FROM "week_plans" WHERE "playerId" = ${playerId} ORDER BY "id" FOR UPDATE`;
  await db.$queryRaw`SELECT "id" FROM "workbench_sessions" WHERE "playerId" = ${playerId} ORDER BY "id" FOR SHARE`;
}
function sammenheng(weeks: Awaited<ReturnType<typeof lesSyklusCore>>, anchor: string) {
  const links = weeks.map(w => w.plan?.planningDetails?.cycle);
  if (links.some(Boolean) && !links.every((c, i) => c && c.anchorWeek === anchor && c.position === i && c.id === links[0]?.id)) throw new SyklusFeil("Uker i en annen eller ufullstendig syklus må oppløses først.");
}
function allerede(weeks: Awaited<ReturnType<typeof lesSyklusCore>>, requestId: string, fingerprint: string) {
  const receipts = weeks.map(w => w.plan?.planningDetails?.cycle);
  if (!receipts.some(c => c?.operationId === requestId)) return false;
  if (!receipts.every(c => c?.operationId === requestId && c.fingerprint === fingerprint)) throw stale();
  return true;
}
async function skrivUke(db: Db, playerId: string, weekStart: string, fields: z.infer<typeof WeekPlanFieldsSchema>, details: WeekPlanningDetails, existingSeasonPlanId?: string | null) {
  const seasonWhere = { userId: playerId, startDate: { lte: tilDatoKolonne(addDays(weekStart, 6)) }, endDate: { gte: tilDatoKolonne(weekStart) } };
  let seasonPlanId: string | null = null;
  // Lagring beholder valgt kobling/null ved undefined. Kopi sender ingen gammel
  // kobling hit og beregner målets sesong fra de faktiske måldatoene.
  const selectedSeasonPlanId = fields.seasonPlanId === undefined ? existingSeasonPlanId : fields.seasonPlanId;
  if (selectedSeasonPlanId !== null) {
    const season = await db.seasonPlan.findFirst({ where: { ...seasonWhere, ...(selectedSeasonPlanId ? { id: selectedSeasonPlanId } : {}) }, orderBy: [{ startDate: "desc" }, { year: "desc" }] });
    if (selectedSeasonPlanId && !season) throw new SyklusFeil("Årsplanen tilhører ikke spilleren eller dekker ikke den faktiske uka.");
    seasonPlanId = season?.id ?? null;
  }
  const key = { playerId, ...isoUkeIdentitet(weekStart) };
  const values = { ...fields, seasonPlanId, planningDetails: details };
  await db.weekPlan.upsert({ where: { playerId_isoYear_weekNumber: key }, create: { ...key, ...values, weekType: fields.weekType ?? "UTVIKLING", notes: fields.notes ?? [] }, update: values });
}
export async function lagreSyklusCore(db: Db, input: LagreSyklusInput) {
  await laasSyklus(db, input.playerId);
  const current = await lesSyklusCore(db, input.playerId, input.anchorWeek); const fingerprint = hash(input);
  if (allerede(current, input.requestId, fingerprint)) return offentligSyklus(current);
  if (current.some((w, i) => w.expected !== input.weeks[i].expected)) throw stale();
  sammenheng(current, input.anchorWeek);
  const id = current[0].plan?.planningDetails?.cycle?.id ?? input.requestId;
  for (let i = 0; i < 3; i++) {
    const fields = input.weeks[i].fields;
    const details = fields.planningDetails === null ? tommeUkeplandetaljer() : fields.planningDetails ?? current[i].plan?.planningDetails ?? tommeUkeplandetaljer();
    await skrivUke(db, input.playerId, current[i].weekStart, fields, { ...details, cycle: { version: 1, id, anchorWeek: input.anchorWeek, position: i, operationId: input.requestId, fingerprint } }, current[i].plan?.seasonPlanId);
  }
  return offentligSyklus(await lesSyklusCore(db, input.playerId, input.anchorWeek));
}
export async function kopierSyklusCore(db: Db, input: KopierSyklusInput, actor: Actor) {
  await laasSyklus(db, input.playerId);
  const source = await lesSyklusCore(db, input.playerId, input.anchorWeek); const targets = await lesSyklusCore(db, input.playerId, input.targetWeek); const fingerprint = hash(input);
  if (allerede(targets, input.requestId, fingerprint)) return offentligSyklus(targets);
  if (source.some((w, i) => w.expected !== input.sourceExpected[i]) || targets.some((w, i) => w.expected !== input.targetExpected[i])) throw stale();
  sammenheng(source, input.anchorWeek); sammenheng(targets, input.targetWeek);
  if (!source.every(w => w.plan?.planningDetails?.cycle)) throw new SyklusFeil("Lagre de tre kildeukene som én syklus før kopiering.");
  if (targets.some(w => w.plan || w.raw.length) && !input.confirmedFilledTargets) throw new SyklusFeil("Bekreft konsekvensen for de fylte målukene i forhåndsvisningen.");
  for (let i = 0; i < 3; i++) {
    const fields = syklusPlanfelter(source[i].plan);
    await skrivUke(db, input.playerId, targets[i].weekStart, fields, { ...(fields.planningDetails ?? tommeUkeplandetaljer()), cycle: { version: 1, id: input.requestId, anchorWeek: input.targetWeek, position: i, operationId: input.requestId, fingerprint } });
    for (const row of source[i].raw.filter(kanKopieres)) {
      const id = `wb-cycle-${hash([input.playerId, input.requestId, row.id])}`;
      const offset = Math.round((row.date.getTime() - tilDatoKolonne(source[i].weekStart).getTime()) / 86_400_000);
      await db.workbenchSession.create({ data: {
        id, playerId: input.playerId, coachId: actor.role === "PLAYER" ? row.coachId : actor.id, date: tilDatoKolonne(addDays(targets[i].weekStart, offset)), startMinute: row.startMinute, durationMinutes: row.durationMinutes,
        title: row.title, pyramid: row.pyramid, blockType: row.blockType, environment: row.environment, practiceType: row.practiceType, location: row.location, rationale: row.rationale, maalsetning: row.maalsetning, notes: row.notes, skillArea: row.skillArea, pressureLevel: row.pressureLevel, pPosisjoner: row.pPosisjoner,
        status: "DRAFT", origin: actor.role === "PLAYER" ? "PLAYER" : "COACH", createdBy: actor.role === "PLAYER" ? "PLAYER" : "COACH",
        drills: { create: row.drills.map((d, order) => ({ id: `wb-cycle-drill-${hash([id, d.id])}`, title: d.title, description: d.description, durationMinutes: d.durationMinutes, akFormel: d.akFormel === null ? Prisma.JsonNull : d.akFormel,
          techniqueFocus: d.techniqueFocus, sourceId: d.sourceId, exerciseId: d.exerciseId, positionTaskId: d.positionTaskId, sortOrder: order,
          repType: d.repType, repAntall: d.repAntall, repMinutter: d.repMinutter, repSett: d.repSett, repReps: d.repReps, planRepsUtenBall: d.planRepsUtenBall, planRepsLavFart: d.planRepsLavFart, planRepsAuto: d.planRepsAuto,
        })) },
      } });
    }
  }
  return offentligSyklus(await lesSyklusCore(db, input.playerId, input.targetWeek));
}
