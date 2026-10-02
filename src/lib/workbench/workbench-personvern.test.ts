import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { Prisma } from "@/generated/prisma/client";

const calls: { model: string; operation: string; where: unknown; data?: Record<string, unknown> }[] = [];
const models = ["seasonPlan", "periodBlock", "tournamentEntry", "workbenchSession", "workbenchDrill", "workbenchPhysicalBlock", "workbenchPhysicalWeek",
  "workbenchPhysicalSession", "workbenchPhysicalExercise", "workbenchPhysicalLog", "workbenchTournamentPlan",
  "workbenchTournamentPreparation", "workbenchTournamentRound", "workbenchTournamentGoal", "workbenchTournamentEvaluation", "workbenchPlanConflict"];
mock.module("@/lib/prisma", { namedExports: { prisma: Object.fromEntries(models.map(model => [model, {
  findMany: async ({ where }: { where: unknown }) => { calls.push({ model, operation: "read", where }); return [{ id: model }]; },
  updateMany: async ({ where, data }: { where: unknown; data: Record<string, unknown> }) => {
    calls.push({ model, operation: "wash", where, data }); return { count: 1 };
  },
}])) } });

test.beforeEach(() => { calls.length = 0; });
test("innsyn avgrenser alle fem innganger til spiller, aldri coach eller gruppe", async () => {
  const { eksporterWorkbenchData } = await import("./workbench-personvern");
  const result = await eksporterWorkbenchData("syntetisk-eier");
  assert.equal(calls.length, 5);
  for (const c of calls) assert.deepEqual(c.where, { playerId: "syntetisk-eier" });
  assert.equal(result.sessions.length, 1); assert.equal(result.physicalLogs.length, 1);
});
test("vask er eieravgrenset gjennom direkte felt eller relasjon; tall bevares", async () => {
  const { anonymiserWorkbenchData } = await import("./workbench-personvern");
  assert.equal(await anonymiserWorkbenchData("syntetisk-eier"), 16);
  for (const c of calls.filter(c => c.operation === "wash")) {
    assert.match(JSON.stringify(c.where), /syntetisk-eier/);
    assert.doesNotMatch(JSON.stringify(c.where), /coachId|groupId/);
    assert.doesNotMatch(JSON.stringify(c.data), /actualMinutes|durationMinutes|grossScore|weightKg|repAntall|repSett/);
  }
  assert.equal(calls.find(c => c.model === "workbenchTournamentPlan" && c.operation === "wash")?.data?.format, null);
  assert.equal(calls.find(c => c.model === "workbenchTournamentRound" && c.operation === "wash")?.data?.source, null);
  assert.equal(calls.find(c => c.model === "workbenchTournamentGoal" && c.operation === "wash")?.data?.unit, null);
  const session = calls.find(c => c.model === "workbenchSession")!;
  assert.equal(session.data?.liveSnapshot, Prisma.DbNull);
  assert.equal(session.data?.notes, null);
  assert.equal(calls.find(c => c.model === "workbenchDrill" && c.operation === "wash")?.data?.description, null);
  assert.deepEqual(calls.find(c => c.model === "workbenchPhysicalExercise")?.where, { session: { playerId: "syntetisk-eier" } });
});

test("formelvask bevarer fagkoder og fjerner fritekst og ukjent JSON", async () => {
  const { anonymisertAkFormel } = await import("./workbench-personvern");
  assert.deepEqual(anonymisertAkFormel({ pyramid: "TEK", area: "PUTT_0_3", label: "Syntetisk personlig tekst", ukjent: "Personlig tekst" }),
    { pyramid: "TEK", area: "PUTT_0_3", label: "Anonymisert øvelse" });
  assert.deepEqual(anonymisertAkFormel({ pyramid: "Syntetisk navn", area: "PUTT_0_3", label: "Tekst" }), {});
});

test("formelvask beholder validert JSON-dose uten fritekst og tåler ugyldige historiske detaljer", async () => {
  const { anonymisertAkFormel } = await import("./workbench-personvern");
  const safe = { pyramid: "FYS", area: "STYRKE", motorikk: "AUTO", belastning: "INNENDORS", press: "ALENE",
    detaljer: { mengde: { enhet: "SERIER", antall: 0, reps: 6, vektKg: 60, rir: 0, pauseSek: 90 } }, label: "Anonymisert øvelse" };
  assert.deepEqual(anonymisertAkFormel({ ...safe, label: "Personlig tekst", ukjent: "Personlig tekst", detaljer: {
    ...safe.detaljer, sted: { hoved: "ANNET", delvalg: "Personlig tekst" }, mal: { notat: "Personlig tekst" }, historisk: "Personlig tekst",
  } }), safe);
  assert.deepEqual(anonymisertAkFormel({ pyramid: "TEK", area: "PUTT_0_3", label: "Tekst", motorikk: "Personlig tekst", detaljer: "Ukjent format" }),
    { pyramid: "TEK", area: "PUTT_0_3", label: "Anonymisert øvelse" });
  assert.deepEqual(anonymisertAkFormel(safe), safe);
});

test('nye segment-/utstyrfelter vasker fritekst, beholder tall og historisk RIR uten å tape dose',async()=>{
 const {anonymisertAkFormel}=await import('./workbench-personvern');
 const dirty={pyramid:'FYS',area:'KONDISJON',label:'Syntetisk persontekst',detaljer:{
  mengde:{enhet:'SERIER',reps:6,vektKg:60,rir:7},
  kondisjonssegmenter:[{minutter:5,pulssone:'S1',ukjent:'Syntetisk persontekst'}],
  utstyr:[{navn:'Syntetisk persontekst',antall:0},{navn:'Annen fritekst'}],
 }};
 const expected={pyramid:'FYS',area:'KONDISJON',label:'Anonymisert øvelse',detaljer:{mengde:{enhet:'SERIER',reps:6,vektKg:60,rir:7},kondisjonssegmenter:[{minutter:5,pulssone:'S1'}],utstyr:[{navn:'Anonymisert utstyr',antall:0},{navn:'Anonymisert utstyr'}]}};
 assert.deepEqual(anonymisertAkFormel(dirty),expected);assert.deepEqual(anonymisertAkFormel(expected),expected);
 assert.deepEqual(anonymisertAkFormel({...dirty,detaljer:{utstyr:[{navn:'Persontekst',antall:-1}],kondisjonssegmenter:[{minutter:5,pulssone:'Persontekst'}]}}),{pyramid:'FYS',area:'KONDISJON',label:'Anonymisert øvelse'});
});
