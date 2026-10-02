import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
let userId = "player";
let status = "IN_PROGRESS";
let writes = 0;
let lastWhere: unknown;
let deleteCount = 1;
mock.module("@/lib/auth/requireConsentingUser", { namedExports: { requireConsentingUser: async () => ({ id: userId, role: "PLAYER" }) } });
mock.module("@/lib/auth/coached", { namedExports: { harCoachTilgangTilSpiller: async () => false } });
mock.module("@/lib/agents/triggers", { namedExports: { triggerLiveSessionAgent: async () => {} } });
mock.module("@/lib/workbench/v2-sync", { namedExports: { GENERERT_FRA: "test" } });
mock.module("@/lib/teknisk-plan/apply-reps", { namedExports: { applyPositionTaskReps: async () => {} } });
mock.module("next/navigation", { namedExports: { redirect: () => { throw new Error("unexpected redirect"); } } });
mock.module("next/cache", { namedExports: { revalidatePath: () => {} } });
const dbFake = {
 trainingSessionV2: { findUnique: async () => ({id:"s",studentId:"player",hostId:null,coachId:"coach",status,participants:[],drills:[{id:"d1",sortOrder:0},{id:"d2",sortOrder:1}]}) },
 trainingDrillV2: {
  upsert: async ({create}: {create: Record<string,unknown>}) => {writes++; return {...create, actualDurationSec:null};},
  deleteMany: async ({where}: {where:unknown}) => { writes++; lastWhere=where; return {count:deleteCount}; }
 }
};
mock.module("@/lib/prisma", { namedExports: { prisma: { ...dbFake, $transaction: async (run: (tx: typeof dbFake) => unknown) => run(dbFake) } } });
let actions: typeof import("@/app/portal/(fullscreen)/live/[sessionId]/actions");
before(async () => { actions = await import("@/app/portal/(fullscreen)/live/[sessionId]/actions"); });
beforeEach(()=>{userId="player";status="IN_PROGRESS";writes=0;deleteCount=1;lastWhere=null;});
const input={sessionId:"s",requestId:"d12acd73-0193-4b78-a7bd-1120ce1839a0",name:"Syntetisk øvelse",durationMinutes:15,pyramide:"TEK" as const,plannedReps:20};
test("ny øvelse har stabil id og kan registreres med samme server-id",async()=>{
 const a=await actions.addLiveSessionDrill(input),b=await actions.addLiveSessionDrill(input);
 assert.equal(a.id,b.id);assert.equal(a.name,input.name);assert.equal(a.plannedReps,20);
});
test("fremmed spiller og avsluttet økt kan ikke opprette eller fjerne",async()=>{
 userId="foreign";
 await assert.rejects(actions.addLiveSessionDrill(input));await assert.rejects(actions.removeLiveSessionDrill({sessionId:"s",drillId:"d1"}));
 userId="player";status="COMPLETED";
 await assert.rejects(actions.addLiveSessionDrill(input));await assert.rejects(actions.removeLiveSessionDrill({sessionId:"s",drillId:"d1"}));assert.equal(writes,0);
});
test("ugyldig volum og navn avvises før databaseendring",async()=>{
 for(const bad of [{...input,name:" "},{...input,durationMinutes:0},{...input,durationMinutes:121},{...input,plannedReps:-1},{...input,requestId:"not-uuid"}])await assert.rejects(actions.addLiveSessionDrill(bad));
 assert.equal(writes,0);
});
test("fjerning avgrenser økt, id og tomme registreringer",async()=>{
 await actions.removeLiveSessionDrill({sessionId:"s",drillId:"d2"});
 const where=lastWhere as {id:string;sessionId:string;logs:unknown;OR:unknown};
 assert.equal(where.id,"d2");assert.equal(where.sessionId,"s");assert.ok(where.logs);assert.ok(where.OR);
 deleteCount=0;await assert.rejects(actions.removeLiveSessionDrill({sessionId:"s",drillId:"foreign"}),/bevare/);
});
