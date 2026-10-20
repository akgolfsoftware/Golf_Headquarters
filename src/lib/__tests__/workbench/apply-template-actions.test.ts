import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { templateHarness } from "./template-rollout-harness";
const h = templateHarness();
beforeEach(() => h.reset());
async function bekreft() {
  const api = await h.actions(); const preview = await api.forhaandsvisMalUtrulling(h.state.group.id,h.state.template.id,h.input);
  assert.ok(preview.ok);
  return api.coachApplyTemplateToGroup(h.state.group.id,h.state.template.id,{...h.input,expectedFingerprint:preview.data.fingerprint});
}
test("malutrulling ruller alle nye kanoniske økter, driller og bruksteller tilbake ved skrivefeil", async () => {
  h.state.failAt = 2; const result = await bekreft();
  assert.equal(result.ok,false); assert.equal(h.state.store.rows.size,0); assert.equal(h.state.store.drills.length,0); assert.equal(h.state.store.usage,0);
});
test("spillerens egen malbruk oppretter kanoniske utkast og ingen legacy-/M2-rader", async () => {
  h.state.viewer = {id:"spiller-a",role:"PLAYER"};
  const result = await (await h.actions()).applyWorkbenchTemplate(h.state.template.id,1);
  assert.ok(result.ok); assert.equal(h.state.store.rows.size,2);
  for (const row of h.state.store.rows.values()) { assert.equal(row.playerId,"spiller-a"); assert.equal(row.status,"DRAFT"); assert.equal(row.needsPlayerApproval,false); assert.equal(row.miljo,undefined); assert.equal(row.lFase,undefined); assert.equal(row.csNivaa,undefined); }
});
test("spillerens eget malforsøk er idempotent og lar et redigert eller gjennomført innhold stå", async () => {
  h.state.viewer = {id:"spiller-a",role:"PLAYER"}; const api = await h.actions();
  await api.applyWorkbenchTemplate(h.state.template.id,1);
  const row = [...h.state.store.rows.values()][0]; row.title="Spillerens endring"; row.status="COMPLETED";
  const second = await api.applyWorkbenchTemplate(h.state.template.id,1);
  assert.ok(second.ok); assert.equal(second.sessions.length,0); assert.equal(h.state.store.rows.size,2);
  assert.equal(h.state.store.rows.get(row.id)?.title,"Spillerens endring"); assert.equal(h.state.store.rows.get(row.id)?.status,"COMPLETED"); assert.equal(h.state.store.usage,1);
});
test("enkeltspillers coachmal bruker reell capability og eierskap, og blir et forslag", async () => {
  const api = await h.actions();
  h.state.playerAccess=false; assert.equal((await api.coachApplyWorkbenchTemplate("spiller-a",h.state.template.id)).ok,false); assert.equal(h.state.store.rows.size,0);
  h.state.playerAccess=true; h.state.capability=false; await assert.rejects(()=>api.coachApplyWorkbenchTemplate("spiller-a",h.state.template.id));
  h.state.capability=true; const result=await api.coachApplyWorkbenchTemplate("spiller-a",h.state.template.id);
  assert.ok(result.ok); assert.equal(h.state.store.rows.size,2);
  for (const row of h.state.store.rows.values()) { assert.equal(row.needsPlayerApproval,true); assert.equal(row.approvalStatus,"PENDING"); assert.equal(row.status,"PUBLISHED"); }
});
test("øvelsens oppskrift, kanoniske område og faktisk maldose følger med, uten pensjonert CS", async () => {
  const result=await bekreft(); assert.ok(result.ok);
  const drill=h.state.store.drills[0]; assert.equal(drill.exerciseId,"syntetisk-ovelse"); assert.equal(drill.repType,"SETT_REPS"); assert.equal(drill.repSett,3); assert.equal(drill.repReps,5);
  assert.equal((drill.akFormel as Record<string,unknown>).area,"CHIP"); assert.equal(drill.csTarget,undefined); assert.equal(drill.planRepsAuto,undefined); assert.match(String(drill.description),/Syntetisk instruksjon/);
});
