import assert from "node:assert/strict";
import { before,beforeEach,mock,test } from "node:test";
let tillatt=true, fail=false, reads=0;
const created: Array<Record<string, unknown>>=[];
const oppdrag={gruppeId:'group-a',coachId:'coach-a'};
const tx={ user:{findMany:async()=>[{id:'player'}]}, round:{findMany:async()=>{reads++;return [];}},
  trainingLog:{}, planAction:{findMany:async()=>[],create:async({data}:{data:Record<string,unknown>})=>{created.push(data);}} };
mock.module('@/lib/deling/ak-gruppeoppdrag',{namedExports:{hentAkGruppeoppdrag:async()=>[oppdrag],
  medAkGruppeoppdrag:async(jobb:unknown,run:(tx:object,scope:object)=>Promise<unknown>)=>{
    assert.deepEqual(jobb,oppdrag); if(fail)throw Error('privat råfeil');
    return tillatt?run(tx,{id:{in:['player']}}):null;
  }}});
mock.module('@/lib/agents/agent-runner',{namedExports:{runAgent:async(_name:unknown,_id:unknown,run:()=>Promise<unknown>)=>run()}});
mock.module('@/lib/training/volum',{namedExports:{hentTreningsVolum:async(_id:unknown,_uker:unknown,_now:unknown,db:unknown)=>{assert.equal(db,tx);return [];}}});
mock.module('@/lib/ai-plan/treningsgap-grunnlag',{namedExports:{TRENINGS_GAP_TERSKEL:.2,vurderTreningsgap:()=>({svakestOmraade:'PUTT',analyseVersjon:'2026-10-23.1',andelTrening:0,forklaring:'Vurder grunnlaget',rader:[]})}});
let run:typeof import('./training-gap').runTrainingGap;
before(async()=>{({runTrainingGap:run}=await import('./training-gap'));});
beforeEach(()=>{tillatt=true;fail=false;reads=0;created.length=0;});
test('manglende deling stopper trening-/rundelesing og forslag',async()=>{
  tillatt=false;const r=await run();assert.equal(r.planActionsWritten,0);assert.equal(reads,0);assert.equal(created.length,0);
});
test('forslaget bruker kontrollert mottaker, gruppe og COACH_REVIEW i samme transaksjon',async()=>{
  const r=await run();assert.equal(r.planActionsWritten,1);assert.equal(reads,1);
  assert.equal(created[0].coachId,'coach-a');assert.equal(created[0].actionType,'COACH_REVIEW');
  assert.match(JSON.stringify(created[0].suggestion),/group-a/);
});
test('låsefeil gir ingen reservevei eller råfeil i agentresultatet',async()=>{
  fail=true;const r=await run();assert.equal(r.planActionsWritten,0);assert.equal(reads,0);
  assert.deepEqual(r.output,{planActionsWritten:0,feiledeGrupper:1});assert(!JSON.stringify(r).includes('privat'));
});
