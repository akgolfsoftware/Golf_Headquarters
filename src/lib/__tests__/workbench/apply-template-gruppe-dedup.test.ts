import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { templateHarness } from "./template-rollout-harness";
const h=templateHarness(); beforeEach(()=>h.reset());
async function preview(extra={}) { const r=await (await h.actions()).forhaandsvisMalUtrulling(h.state.group.id,h.state.template.id,{...h.input,...extra}); assert.ok(r.ok,r.ok?"":r.error); return r.data; }
async function apply(fingerprint:string,extra={}) { return (await h.actions()).coachApplyTemplateToGroup(h.state.group.id,h.state.template.id,{...h.input,...extra,expectedFingerprint:fingerprint}); }
test("D23/D49: gruppecoach med eller uten personlig skriverett oppretter bare spillerforslag", async()=>{
  for (const canWrite of [false,true]) { h.reset(); h.state.canWrite=canWrite; const p=await preview(); assert.equal(p.personalWriteScope,canWrite); const r=await apply(p.fingerprint); assert.ok(r.ok); assert.equal(r.okterOpprettet,4);
    for(const row of h.state.store.rows.values()) { assert.equal(row.needsPlayerApproval,true); assert.equal(row.approvalStatus,"PENDING"); assert.equal(row.groupId,null); assert.equal(row.origin,"WANG"); assert.equal(row.sourceGroupSessionId,null); }
  }
});
test("D49: gruppens utkast eies av coachen og holder seg innen virkelig gruppetid",async()=>{
  const options={mode:"GRUPPEUTKAST" as const}; const p=await preview(options); assert.equal(p.newCount,2); assert.equal(p.sessions[0].startMinute,480); assert.equal(p.sessions[0].location,"Syntetisk anlegg");
  const r=await apply(p.fingerprint,options); assert.ok(r.ok); assert.equal(h.state.store.rows.size,2);
  for(const row of h.state.store.rows.values()) { assert.equal(row.playerId,"syntetisk-coach"); assert.equal(row.coachId,row.playerId); assert.equal(row.groupId,h.state.group.id); assert.equal(row.origin,"GROUP"); assert.equal(row.status,"DRAFT"); assert.equal(row.needsPlayerApproval,false); assert.match(row.id,/^wb-group-[a-f0-9]{64}$/); }
});
test("ingen utrulling uten konkret forhåndsvisning, tilgang eller gyldig mottaker",async()=>{
  const api=await h.actions(); assert.equal((await api.coachApplyTemplateToGroup(h.state.group.id,h.state.template.id,h.input)).ok,false);
  h.state.canEdit=false; assert.equal((await api.forhaandsvisMalUtrulling(h.state.group.id,h.state.template.id,h.input)).ok,false); assert.equal(h.state.store.rows.size,0);
  h.state.canEdit=true; assert.equal((await api.forhaandsvisMalUtrulling(h.state.group.id,h.state.template.id,{...h.input,recipientIds:["annen-spiller"]})).ok,false);
  h.state.capability=false; await assert.rejects(()=>api.forhaandsvisMalUtrulling(h.state.group.id,h.state.template.id,h.input));
});
test("endret mal, banktilgang, bankrevisjon, mottakere eller gruppefrist avviser bekreftelsen",async()=>{
  for(const change of [()=>{h.state.template.updatedAt=new Date(1);},()=>{h.state.group.members.pop();},()=>{h.state.bankRevision=new Date(1);},()=>{h.state.bankBlocked.add("spiller-b");},()=>{h.state.canEdit=false;}]) {
    h.reset(); const p=await preview(); change(); assert.equal((await apply(p.fingerprint)).ok,false); assert.equal(h.state.store.rows.size,0);
  }
  h.reset(); const p=await preview({mode:"GRUPPEUTKAST" as const}); h.state.group.schedules[0].endAt=new Date("2026-01-05T08:00:00Z"); assert.equal((await apply(p.fingerprint,{mode:"GRUPPEUTKAST" as const})).ok,false);
});
test("bankkilden kontrolleres per faktisk mottaker, og utvalget kan avgrenses til en gyldig spiller",async()=>{
  h.state.bankBlocked.add("spiller-b"); const api=await h.actions();
  assert.equal((await api.forhaandsvisMalUtrulling(h.state.group.id,h.state.template.id,h.input)).ok,false);
  const options={recipientIds:["spiller-a"]}; const p=await preview(options); assert.equal(p.recipients.length,1);
  const r=await apply(p.fingerprint,options); assert.ok(r.ok); assert.equal(h.state.store.rows.size,2); assert.ok([...h.state.store.rows.values()].every(row=>row.playerId==="spiller-a"));
});
test("samme utrulling, samtidig bekreftelse og senere re-forsøk gir ingen duplikater eller overskriving",async()=>{
  const p=await preview(); const results=await Promise.all([apply(p.fingerprint),apply(p.fingerprint)]); assert.ok(results.every(r=>r.ok)); assert.equal(h.state.store.rows.size,4); assert.equal(h.state.store.usage,1);
  const row=[...h.state.store.rows.values()][0]; row.title="Spillerens egen versjon"; row.status="COMPLETED";
  const retry=await apply(p.fingerprint); assert.ok(retry.ok); assert.equal(retry.okterOpprettet,0); assert.equal(retry.eksisterende,4); assert.equal(h.state.store.rows.get(row.id)?.title,"Spillerens egen versjon"); assert.equal(h.state.store.rows.get(row.id)?.status,"COMPLETED");
});
test("en urelatert eksisterende økt røres aldri av malforslagene",async()=>{
  h.state.store.rows.set("annen-okt",{id:"annen-okt",playerId:"spiller-a",title:"Eksisterende plan",status:"PUBLISHED"});
  const p=await preview(); const r=await apply(p.fingerprint); assert.ok(r.ok); assert.equal(h.state.store.rows.get("annen-okt")?.title,"Eksisterende plan"); assert.equal(h.state.store.rows.size,5);
});
test("maluker med hull bevarer kalendermellomrommet og finner ingen oppdiktet uke",async()=>{
  h.state.template.sessions[1].ukeNr=3; const p=await preview({uker:3});
  assert.equal((Date.parse(p.sessions[1].date)-Date.parse(p.sessions[0].date))/86400000,15);
  assert.equal(p.sessions.length,2);
});
test("manglende, tvetydig eller for kort gruppetid og samling uten invitasjon avvises",async()=>{
  const api=await h.actions(); const opts={...h.input,mode:"GRUPPEUTKAST" as const};
  h.state.group.schedules=[]; assert.equal((await api.forhaandsvisMalUtrulling(h.state.group.id,h.state.template.id,opts)).ok,false);
  h.reset(); h.state.group.schedules.push({...h.state.group.schedules[0],id:"annen-tid"}); assert.equal((await api.forhaandsvisMalUtrulling(h.state.group.id,h.state.template.id,opts)).ok,false);
  const p=await preview({mode:"GRUPPEUTKAST" as const,groupScheduleIds:["tid-0","tid-1"]}); assert.equal(p.sessions.length,2);
  h.reset(); h.state.template.sessions[0].varighetMin=150; assert.equal((await api.forhaandsvisMalUtrulling(h.state.group.id,h.state.template.id,opts)).ok,false);
});
