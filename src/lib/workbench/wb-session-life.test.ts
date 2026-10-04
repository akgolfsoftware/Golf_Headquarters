import assert from "node:assert/strict";
import {test} from "node:test";
import {ExecutionCommandSchema,executionSeconds,initialSessionExecution,readSessionExecution,sealSessionSnapshot,transitionSessionExecution,type ExecutionCommand} from "./wb-session-life";
const time="2026-10-02T08:00:00.000Z";
const row=()=>({status:"IN_PROGRESS",actualMinutes:null as number|null,perceivedEffort:null as number|null,liveSnapshot:{totalSec:0,execution:initialSessionExecution(time),future:{opaque:"bevar"},drills:[{drillId:"d",reps:0,unknown:"bevar"}]}});
function command(action:ExecutionCommand["action"],patch:Partial<ExecutionCommand>={}):ExecutionCommand{return {sessionId:"s",expectedUpdatedAt:time,requestId:`request-${action}`,action,...patch};}
test("pause og fortsett teller bare aktive intervaller, også etter ny lesing",()=>{
 const r=row();const pause=transitionSessionExecution(command("PAUSE"),r,"owner","2026-10-02T08:02:00.000Z");assert.equal(pause.retry,false);if(pause.retry)return;
 const execution=readSessionExecution(pause.snapshot)!;assert.equal(executionSeconds(execution,Date.parse("2026-10-02T10:00:00Z")),120);
 const resume=transitionSessionExecution(command("RESUME"),{...r,liveSnapshot:pause.snapshot},"owner","2026-10-02T10:00:00.000Z");if(resume.retry)return;
 assert.equal(executionSeconds(readSessionExecution(resume.snapshot)!,Date.parse("2026-10-02T10:01:00Z")),180);
 assert.deepEqual(resume.snapshot.future,{opaque:"bevar"});assert.deepEqual(resume.snapshot.drills,r.liveSnapshot.drills);
});
test("slutt beholder rå JSON og null, mens uttrykkelig faktisk 0 registreres som 0",()=>{
 for(const actualMinutes of [null,0,45]){const r=row();const result=transitionSessionExecution(command("FINISH",{actualMinutes}),r,"owner","2026-10-02T08:05:00.000Z");if(result.retry)return;
 assert.equal(result.status,"COMPLETED");assert.equal(result.actualMinutes,actualMinutes);assert.equal(result.snapshot.execution.runningSinceISO,null);assert.deepEqual(result.snapshot.future,r.liveSnapshot.future);}
});
test("avbrutt beholder kjent faktisk tid; undefined erstatter aldri med planlagt eller null",()=>{
 const result=transitionSessionExecution(command("ABORT",{reason:"Syntetisk avbrudd"}),{...row(),actualMinutes:45},"owner",time);if(result.retry)return;assert.equal(result.status,"ABANDONED");assert.equal(result.actualMinutes,45);
 assert.throws(()=>transitionSessionExecution(command("RESUME"),{...row(),status:"ABANDONED",liveSnapshot:result.snapshot},"owner",time),/ikke pågående/);
});
test("etterregistrering har før/etter-historikk og idempotent requestId",()=>{
 const input=command("RECORD",{outcome:"COMPLETED",actualMinutes:0,reason:"Rettet syntetisk tidsbruk"});const original={...row(),status:"COMPLETED",actualMinutes:45};
 const result=transitionSessionExecution(input,original,"owner",time);if(result.retry)return;
 assert.equal(result.snapshot.execution.events[0].before.actualMinutes,45);assert.equal(result.snapshot.execution.events[0].after.actualMinutes,0);
 assert.deepEqual(transitionSessionExecution(input,{...original,liveSnapshot:result.snapshot},"owner",time),{retry:true});
 assert.throws(()=>transitionSessionExecution({...input,actualMinutes:25},{...original,liveSnapshot:result.snapshot},"owner",time),/allerede brukt/);
});
test("null tømmer faktisk tid uttrykkelig, ikke undefined",()=>{
 for(const actualMinutes of [undefined,null]){const result=transitionSessionExecution(command("RECORD",{outcome:"COMPLETED",actualMinutes,reason:"Syntetisk retting"}),{...row(),status:"COMPLETED",actualMinutes:45},"owner",time);if(result.retry)return;assert.equal(result.actualMinutes,actualMinutes===undefined?45:null);}
});
test("ny ukjent versjon eller ugjennomsiktig eldre JSON avvises uten tap",()=>{
 for(const liveSnapshot of [{execution:{version:2,private:"bevar"}},["legacy"]]){const original=structuredClone(liveSnapshot);assert.throws(()=>transitionSessionExecution(command("PAUSE"),{...row(),liveSnapshot},"owner",time));assert.deepEqual(liveSnapshot,original);}
});
test("legacy snapshots og ukjente metadata overlever avslutning",()=>{
 const raw={startedAtISO:time,totalSec:75,drills:[{reps:0}],unknown:{v:1}};const sealed=sealSessionSnapshot(raw,"COMPLETED",time);assert.deepEqual(sealed.drills,raw.drills);assert.deepEqual(sealed.unknown,raw.unknown);assert.equal(readSessionExecution(sealed)?.accumulatedSec,75);
});
test("mengder krever heltall; årsak ved retting/avbrudd og resultat ved registrering",()=>{
 for(const actualMinutes of [-1,NaN,Infinity,0.5,1441])assert.equal(ExecutionCommandSchema.safeParse(command("FINISH",{actualMinutes})).success,false);
 for(const actualMinutes of [0,1440,null,undefined])assert.equal(ExecutionCommandSchema.safeParse(command("FINISH",{actualMinutes})).success,true);
 assert.equal(ExecutionCommandSchema.safeParse(command("RECORD",{outcome:"COMPLETED"})).success,false);
 assert.equal(ExecutionCommandSchema.safeParse(command("ABORT",{reason:" "})).success,false);
 assert.equal(ExecutionCommandSchema.safeParse(command("PAUSE",{actualMinutes:0})).success,false);
});
