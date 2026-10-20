import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { templateHarness } from "./template-rollout-harness";
const h=templateHarness();beforeEach(()=>h.reset());
async function grunnlag() {
  const api=await h.actions();const input={...h.input,mode:"GRUPPEUTKAST" as const};
  const preview=await api.forhaandsvisMalUtrulling(h.state.group.id,h.state.template.id,input);assert.ok(preview.ok);
  const created=await api.coachApplyTemplateToGroup(h.state.group.id,h.state.template.id,{...input,expectedFingerprint:preview.data.fingerprint});assert.ok(created.ok);
  const publication=await api.forhaandsvisMalGruppePublisering(h.state.group.id,created.sessionIds);assert.ok(publication.ok,publication.ok?"":publication.error);
  return {ids:created.sessionIds,data:publication.data};
}
test("gruppeutkast blir faktiske publiserte gruppeoriginaler og lenkede medlemskopier",async()=>{
  const p=await grunnlag();assert.equal(p.data.recipients.length,2);
  const {publishGroupWorkbenchSessions}=await import("@/lib/workbench/group-session-actions");
  const result=await publishGroupWorkbenchSessions({groupId:h.state.group.id,sessionIds:p.ids,expected:p.data.expected});assert.ok(result.ok,result.ok?"":result.error);
  assert.equal(h.state.store.rows.size,6);assert.equal([...h.state.store.rows.values()].filter(r=>r.sourceGroupSessionId).length,4);
  const fresh=await (await h.actions()).forhaandsvisMalGruppePublisering(h.state.group.id,p.ids);assert.ok(fresh.ok);
  const retry=await publishGroupWorkbenchSessions({groupId:h.state.group.id,sessionIds:p.ids,expected:fresh.data.expected});assert.ok(retry.ok);assert.equal(h.state.store.rows.size,6);
});
test("publisering avviser endrede driller, medlemskap og gruppetider inne i transaksjonen",async()=>{
  const {publishGroupWorkbenchSessions}=await import("@/lib/workbench/group-session-actions");
  for(const change of [()=>{h.state.store.drills[0].title="Endret innhold";},()=>{h.state.group.members.pop();},()=>{h.state.group.schedules[0].updatedAt=new Date(2);}]){
    h.reset();const p=await grunnlag();change();const result=await publishGroupWorkbenchSessions({groupId:h.state.group.id,sessionIds:p.ids,expected:p.data.expected});
    assert.equal(result.ok,false);assert.equal(h.state.store.rows.size,2);assert.ok([...h.state.store.rows.values()].every(r=>r.status==="DRAFT"));
  }
});
test("mistet banktilgang eller gruppetid stopper ny publiseringsforhåndsvisning",async()=>{
  const p=await grunnlag();const api=await h.actions();h.state.bankBlocked.add("spiller-b");assert.equal((await api.forhaandsvisMalGruppePublisering(h.state.group.id,p.ids)).ok,false);
  h.state.bankBlocked.clear();h.state.group.schedules=[];assert.equal((await api.forhaandsvisMalGruppePublisering(h.state.group.id,p.ids)).ok,false);
});
test("tilbaketrukket bankdeling etter forhåndsvisning stopper også selve publiseringen",async()=>{
  const p=await grunnlag();h.state.bankBlocked.add("spiller-b");
  const {publishGroupWorkbenchSessions}=await import("@/lib/workbench/group-session-actions");
  const response=await publishGroupWorkbenchSessions({groupId:h.state.group.id,sessionIds:p.ids,expected:p.data.expected});
  assert.equal(response.ok,false);assert.equal(h.state.store.rows.size,2);assert.ok([...h.state.store.rows.values()].every(row=>row.status==="DRAFT"));
});
