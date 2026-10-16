/** Separate loopback Postgres + real GoTrue/application guards. Reuses synthetic accounts. */
import assert from 'node:assert/strict';
import { before, after, mock, test } from 'node:test';
import { AsyncLocalStorage } from 'node:async_hooks';
import { readFileSync } from 'node:fs';
import { parse } from 'dotenv';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient, AuthTokenResponsePassword } from '@supabase/supabase-js';
import pg from 'pg';
import type { AKFormel } from '../../src/lib/domain/workbench/types';
const request = new AsyncLocalStorage<{name:string;value:string}[]>();
const sessions = new Map<string,{name:string;value:string}[]>();
const credentials = parse(readFileSync('.codex/environments/workbench/.env.users'));
const prefix='r072-oktmeta-local';
let db: typeof import('../../src/lib/prisma').prisma;
let actions: typeof import('../../src/lib/workbench/wb-actions');
let groups: typeof import('../../src/lib/workbench/group-session-actions');
const createdSessions: string[]=[];
const p1=credentials.LOCAL_P01_ID, c1=credentials.LOCAL_COACH_A_ID;
mock.module('next/headers',{namedExports:{cookies:async()=>({getAll:()=>request.getStore()??[],set:()=>{}})}});
mock.module('next/cache',{namedExports:{revalidatePath:()=>{}}});
mock.module('next/navigation',{namedExports:{redirect:()=>{throw Error('Redirect');},notFound:()=>{throw Error('Not found');}}});
function as<T>(actor:string,fn:()=>Promise<T>){return request.run(sessions.get(actor)??[],fn);}
function data<T>(r:{ok:true;data:T}|{ok:false;error:string}):T {assert.ok(r.ok,r.ok?'':r.error);if(!r.ok)throw Error('Rejected');return r.data;}
const formel:AKFormel={pyramid:'TEK',area:'TEE_TOTAL',label:'Syntetisk',detaljer:{mengde:{enhet:'SLAG',antall:30},mal:{notat:'Behold'}}};
const bankId=`${prefix}-system`, sharedId=`${prefix}-shared`, privateId=`${prefix}-private`, foreignSharedId=`${prefix}-foreign-shared`;
const taskId=`${prefix}-task`, foreignTaskId=`${prefix}-foreign-task`, groupId=`${prefix}-group`;
before(async()=>{
 const url=new URL(process.env.DATABASE_URL!); assert.equal(process.env.LOCAL_WORKBENCH_PROJECT,'ak-hq-workbench-20261002');
 assert.equal(url.hostname,'127.0.0.1');assert.equal(url.port,'55722');assert.equal(process.env.NEXT_PUBLIC_SUPABASE_URL,'http://127.0.0.1:55721');
 const sql=new pg.Pool({connectionString:url.toString()});try {const r=await sql.query("SELECT shobj_description(oid,'pg_database') AS identity FROM pg_database WHERE datname=current_database()");assert.equal(r.rows[0].identity,'ak-hq-workbench-20261002');}finally{await sql.end();}
 db=(await import('../../src/lib/prisma')).prisma;actions=await import('../../src/lib/workbench/wb-actions');groups=await import('../../src/lib/workbench/group-session-actions');
 for(const key of ['P01','P02','COACH_A','COACH_B']){
  const cookies:{name:string;value:string}[]=[];
  const auth: Pick<SupabaseClient, 'auth'>=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{cookies:{getAll:()=>cookies,setAll:all=>{cookies.splice(0,cookies.length,...all.map(c=>({name:c.name,value:c.value})));}}});
  const result: AuthTokenResponsePassword=await auth.auth.signInWithPassword({email:credentials[`LOCAL_${key}_EMAIL`],password:credentials[`LOCAL_${key}_PASSWORD`]});assert.equal(result.error,null,'Local synthetic login');sessions.set(key,cookies);
 }
 for(const [id,source,visibility,createdBy] of [[bankId,'SYSTEM','PRIVATE',c1],[sharedId,'COACH','COACH_PLAYERS',c1],[privateId,'COACH','PRIVATE',credentials.LOCAL_COACH_B_ID],[foreignSharedId,'COACH','COACH_PLAYERS',credentials.LOCAL_COACH_B_ID]] as const)
  await db.exerciseDefinition.upsert({where:{id},create:{id,name:`Syntetisk ${id}`,pyramidArea:'TEK',source,visibility,createdBy,utstyr:['Syntetisk matte','Syntetisk kølle'],durationMin:30},update:{}});
 for(const [id,userId] of [[taskId,p1],[foreignTaskId,credentials.LOCAL_P02_ID]] as const){
  await db.technicalPlan.deleteMany({where:{id:`${id}-plan`}});
  await db.technicalPlan.create({data:{id:`${id}-plan`,userId,navn:'Syntetisk bankplan',status:'ACTIVE',startDato:new Date('2027-01-04T00:00:00Z'),opprettetAvId:c1,
   positions:{create:{id:`${id}-pos`,pNummer:'P4.0',navn:'Syntetisk posisjon',sortOrder:0,tasks:{create:{id,tittel:'Syntetisk teknisk oppgave',sortOrder:0,pyramide:'TEK',omraade:'Tee Total',omraadeKode:'TEE_TOTAL'}}}}}});
 }
 await db.group.upsert({where:{id:groupId},create:{id:groupId,name:'Syntetisk bankgruppe',coachId:c1},update:{}});
 for(const userId of [p1,credentials.LOCAL_P02_ID]) await db.groupMember.upsert({where:{groupId_userId:{groupId,userId}},
  create:{groupId,userId,role:'PLAYER',joinedAt:new Date('2020-01-01T00:00:00Z')},update:{endedAt:null}});
});

after(async()=>{
 if(!db)return;
 await db.workbenchSession.deleteMany({where:{OR:[{id:{in:createdSessions}},{id:{startsWith:prefix}},{groupId}],playerId:{in:[p1,c1,credentials.LOCAL_P02_ID]}}});
 await db.technicalPlan.deleteMany({where:{id:{in:[`${taskId}-plan`,`${foreignTaskId}-plan`]}}});
 await db.group.deleteMany({where:{id:groupId}});
 await db.exerciseDefinition.deleteMany({where:{id:{in:[bankId,sharedId,privateId,foreignSharedId]}}});
 await db.$disconnect();
});


const meta={rationale:'Syntetisk formål',location:'Syntetisk sted',maalsetning:'Syntetisk øktmål'};
async function ny(pyramid:AKFormel['pyramid']='TEK') {
 const f:AKFormel={pyramid,area:pyramid==='FYS'?'STYRKE':pyramid==='SPILL'||pyramid==='TURN'?'BANE':'TEE_TOTAL',label:'Syntetisk',detaljer:{mal:{malsetning:'Syntetisk drillmål'}}};
 const result=data(await as('P01',()=>actions.createSession({playerId:p1,date:'2027-01-04',startMinute:600,durationMinutes:30,title:'Syntetisk økt',pyramid,...meta,drills:[{title:'Syntetisk øvelse',durationMinutes:30,akFormel:f}]})));
 createdSessions.push(result.id);return result;
}
test('alle fem grener lagrer og leser formål/sted/øktmål og separat drillmål',async()=>{
 for(const p of ['FYS','TEK','SLAG','SPILL','TURN'] as const){ const row=await ny(p); for(const key of ['rationale','location','maalsetning'] as const) assert.equal(row[key],meta[key]);assert.equal(row.drills[0].akFormel.detaljer?.mal?.malsetning,'Syntetisk drillmål'); }
});
test('redigering/tømming krever versjon, avviser stale/fremmed og lar rå øvelser bestå',async()=>{
 const row=await ny();const d=row.drills[0];await db.workbenchDrill.update({where:{id:d.id},data:{techniqueFocus:'P4.0',repAntall:0,akFormel:{...d.akFormel,ukjent:'Syntetisk'}}});
 const raw=await db.workbenchDrill.findUniqueOrThrow({where:{id:d.id}});
 assert.equal((await as('P01',()=>actions.updateSeriesSession({sessionId:row.id,patch:{rationale:'Ny'},policy:'DENNE'}))).ok,false);
 assert.equal((await as('P01',()=>actions.updateSeriesSession({sessionId:row.id,patch:{rationale:'Ny'},policy:'DENNE',expectedUpdatedAt:new Date(0).toISOString()}))).ok,false);
 assert.equal((await as('P02',()=>actions.updateSeriesSession({sessionId:row.id,patch:{rationale:'Ny'},policy:'DENNE',expectedUpdatedAt:row.updatedAt}))).ok,false);
 assert.equal((await as('COACH_B',()=>actions.updateSeriesSession({sessionId:row.id,patch:{rationale:'Ny'},policy:'DENNE',expectedUpdatedAt:row.updatedAt}))).ok,false);
 const edited=data(await as('P01',()=>actions.updateSeriesSession({sessionId:row.id,patch:{rationale:'Syntetisk ny'},policy:'DENNE',expectedUpdatedAt:row.updatedAt})))[0];assert.equal(edited.location,meta.location);assert.equal(edited.maalsetning,meta.maalsetning);
 const emptied=data(await as('P01',()=>actions.updateSeriesSession({sessionId:row.id,patch:{rationale:null,location:'',maalsetning:null},policy:'DENNE',expectedUpdatedAt:edited.updatedAt})))[0];assert.equal(emptied.rationale,undefined);assert.equal(emptied.location,undefined);assert.equal(emptied.maalsetning,undefined);assert.deepEqual(await db.workbenchDrill.findUniqueOrThrow({where:{id:d.id}}),raw);
});
test('mal/forrige kopierer øktmetadata og rå dose/JSON til nye IDs uten gjennomføringshistorikk',async()=>{
 const row=await ny();await db.workbenchSession.update({where:{id:row.id},data:{actualMinutes:0,perceivedEffort:4,liveSnapshot:{syntetisk:true}}});await db.workbenchDrill.update({where:{id:row.drills[0].id},data:{techniqueFocus:'P4.0',repAntall:0,akFormel:{...row.drills[0].akFormel,ukjent:'Syntetisk'}}});
 const original=await db.workbenchSession.findUniqueOrThrow({where:{id:row.id},include:{drills:true}});
 for(const kind of ['mal','forrige']){const copy=data(await as('P01',()=>actions.createSessionFromSource({playerId:p1,sourceId:`${kind}:${row.id}`,date:'2027-01-11',startMinute:600})));createdSessions.push(copy.id);
  for(const key of ['rationale','location','maalsetning'] as const)assert.equal(copy[key],meta[key]);assert.notEqual(copy.drills[0].id,row.drills[0].id);assert.equal(copy.drills[0].repAntall,0);assert.equal(copy.drills[0].techniqueFocus,'P4.0');assert.equal(copy.actualMinutes,null);assert.equal(copy.perceivedEffort,null);assert.equal(copy.status,'DRAFT');const saved=await db.workbenchSession.findUniqueOrThrow({where:{id:copy.id},include:{drills:true}});assert.deepEqual(saved.drills[0].akFormel,original.drills[0].akFormel);assert.equal(saved.liveSnapshot,null);
 }
 assert.deepEqual(await db.workbenchSession.findUniqueOrThrow({where:{id:row.id},include:{drills:true}}),original);
});
test('serie beholder datoer og hvert utelatt innholdsfelt; fremmed rad med samme seriesId utelates',async()=>{
 const series=data(await as('P01',()=>actions.createSessionSeries({playerId:p1,date:'2027-01-04',startMinute:600,durationMinutes:30,title:'Syntetisk serie',pyramid:'TEK',repeatWeeks:2,...meta})));createdSessions.push(...series.map(s=>s.id));for(const s of series)assert.equal(s.rationale,meta.rationale);
 await db.workbenchSession.update({where:{id:series[1].id},data:{location:'Syntetisk annet sted'}});
 const foreign=await db.workbenchSession.create({data:{id:`${prefix}-foreign-series`,playerId:credentials.LOCAL_P02_ID,coachId:c1,createdBy:'COACH',seriesId:series[0].seriesId,date:new Date('2027-01-11'),startMinute:600,durationMinutes:30,title:'Syntetisk fremmed',pyramid:'TEK'}});createdSessions.push(foreign.id);
 const edited=data(await as('P01',()=>actions.updateSeriesSession({sessionId:series[0].id,patch:{rationale:'Syntetisk ny serie'},policy:'HELE_SERIEN',expectedUpdatedAt:series[0].updatedAt})));assert.equal(edited.length,2);assert.equal(edited.find(s=>s.id===series[1].id)?.location,'Syntetisk annet sted');assert.deepEqual(edited.map(s=>s.date).sort(),series.map(s=>s.date).sort());assert.equal((await db.workbenchSession.findUniqueOrThrow({where:{id:foreign.id}})).rationale,null);
});
test('ekte lokale private opptattblokker gjør flytting/gjentakelse til utkast og samtidige endringer kan ikke overskrive',async()=>{
 const busyId=`${prefix}-busy-conflict`,scheduleId=`${prefix}-schedule-conflict`,tournamentId=`${prefix}-tournament-conflict`,sessionId=`${prefix}-busy-conflict-session`;let copiedIds:string[]=[];
 await db.playerBusyBlock.deleteMany({where:{id:busyId,userId:p1}});
 await db.groupSchedule.deleteMany({where:{id:scheduleId,groupId}});
 await db.workbenchTournamentPlan.deleteMany({where:{id:tournamentId,playerId:p1}});
 await db.workbenchSession.deleteMany({where:{id:sessionId}});
 try {
  await db.playerBusyBlock.create({data:{id:busyId,userId:p1,title:'Syntetisk privat avtale',kind:'HELSE',isPrivate:true,recurring:'WEEKLY',startAt:new Date('2026-09-30T08:00:00.000Z'),endAt:new Date('2026-09-30T09:00:00.000Z')}});
  await db.groupSchedule.create({data:{id:scheduleId,groupId,title:'Syntetisk gruppetrening',kind:'SAMLING',recurring:'WEEKLY',startAt:new Date('2026-09-30T08:00:00.000Z'),endAt:new Date('2026-09-30T09:00:00.000Z')}});
  await db.workbenchTournamentPlan.create({data:{id:tournamentId,playerId:p1,coachId:c1,createdBy:p1,title:'Syntetisk turnering',status:'PUBLISHED',startDate:new Date('2026-10-07T00:00:00.000Z'),endDate:new Date('2026-10-07T00:00:00.000Z')}});
  const session=await db.workbenchSession.create({data:{id:sessionId,playerId:p1,coachId:c1,createdBy:'PLAYER',date:new Date('2026-09-28T00:00:00.000Z'),startMinute:600,durationMinutes:60,title:'Syntetisk konfliktprøve',pyramid:'TEK',status:'PUBLISHED'}});
  const plan=await import('../../src/lib/workbench/plan-handlinger-actions');
  const command={playerId:p1,sessionId,expectedUpdatedAt:session.updatedAt.toISOString(),date:'2026-10-07',startMinute:600,durationMinutes:60};
  const moved=await Promise.all([as('P01',()=>plan.flyttWorkbenchPlanOkt(command)),as('P01',()=>plan.flyttWorkbenchPlanOkt(command))]);
  assert.equal(moved.filter(r=>r.ok).length,1);assert.equal(moved.find(r=>r.ok)?.conflicts,3);
  const saved=await db.workbenchSession.findUniqueOrThrow({where:{id:sessionId}});assert.equal(saved.status,'DRAFT');assert.equal(saved.date.toISOString().slice(0,10),'2026-10-07');
  const copied=await as('P01',()=>plan.kopierWorkbenchPlanOkt({playerId:p1,sessionId,expectedUpdatedAt:saved.updatedAt.toISOString(),dates:['2026-10-14'],startMinute:600}));
  assert.ok(copied.ok,copied.ok?'':copied.error);if(!copied.ok)throw Error('Kopiering ble avvist');
  copiedIds=copied.ids;assert.equal(copied.conflicts,2);const copy=await db.workbenchSession.findUniqueOrThrow({where:{id:copiedIds[0]}});assert.equal(copy.status,'DRAFT');
 } finally {
  await db.workbenchSession.deleteMany({where:{id:{in:[sessionId,...copiedIds]}}});
  await db.workbenchTournamentPlan.deleteMany({where:{id:tournamentId,playerId:p1}});
  await db.groupSchedule.deleteMany({where:{id:scheduleId,groupId}});
  await db.playerBusyBlock.deleteMany({where:{id:busyId,userId:p1}});
 }
});
test('gruppe→medlem kopierer øktmetadata; lokal tilpasning består etter ny publisering',async()=>{
 const payload={groupId,date:'2027-01-04',startMinute:600,durationMinutes:30,title:'Syntetisk gruppe',pyramid:'TEK' as const,...meta,drills:[{title:'Syntetisk',durationMinutes:30,akFormel:{...formel,detaljer:{mal:{malsetning:'Syntetisk drillmål'}}}}]};
 const master=data(await as('COACH_A',()=>groups.saveGroupWorkbenchSession({...payload,requestId:'46ea8f2b-d95d-468b-8eb3-16d2eeb3262a'})));data(await as('COACH_A',()=>groups.publishGroupWorkbenchSessions({groupId,sessionIds:[master.id]})));
 const mine=await db.workbenchSession.findFirstOrThrow({where:{sourceGroupSessionId:master.id,playerId:p1},include:{drills:true}});assert.equal(mine.rationale,meta.rationale);assert.equal(mine.location,meta.location);assert.equal(mine.maalsetning,meta.maalsetning);
 data(await as('P01',()=>actions.updateSeriesSession({sessionId:mine.id,patch:{rationale:'Syntetisk egen'},policy:'DENNE',expectedUpdatedAt:mine.updatedAt.toISOString()})));
 const fresh=await db.workbenchSession.findUniqueOrThrow({where:{id:master.id}});
 const revised=data(await as('COACH_A',()=>groups.saveGroupWorkbenchSession({...payload,sessionId:master.id,expectedUpdatedAt:fresh.updatedAt.toISOString(),rationale:'Syntetisk ny gruppe'})));data(await as('COACH_A',()=>groups.publishGroupWorkbenchSessions({groupId,sessionIds:[revised.id]})));
 const after=await db.workbenchSession.findUniqueOrThrow({where:{id:mine.id}});assert.equal(after.localOverride,true);assert.equal(after.rationale,'Syntetisk egen');const other=await db.workbenchSession.findFirstOrThrow({where:{sourceGroupSessionId:master.id,playerId:credentials.LOCAL_P02_ID}});assert.equal(other.rationale,'Syntetisk ny gruppe');
});

test('inputgrenser og frie ukjente patchfelt avvises uten skriving',async()=>{
 const row=await ny(); const before=await db.workbenchSession.findUniqueOrThrow({where:{id:row.id}});
 for(const patch of [{rationale:'x'.repeat(1001)},{location:'x'.repeat(161)},{maalsetning:'x'.repeat(501)},{rationale:42},{rationale:'Syntetisk',playerId:credentials.LOCAL_P02_ID}])
  assert.equal((await as('P01',()=>actions.updateSeriesSession({sessionId:row.id,patch,policy:'DENNE',expectedUpdatedAt:row.updatedAt} as Parameters<typeof actions.updateSeriesSession>[0]))).ok,false);
 assert.deepEqual(await db.workbenchSession.findUniqueOrThrow({where:{id:row.id}}),before);
});
test('ekte eieravgrenset personvern vasker øktfelter/ny drillmålsetning og bevarer 0/id/dose; fremmed urørt',async()=>{
 const owner=`${prefix}-personvern-eier`, foreign=`${prefix}-personvern-fremmed`;const ids=[`${prefix}-privacy-own`,`${prefix}-privacy-foreign`];
 try {
 for(const [id,playerId] of [[ids[0],owner],[ids[1],foreign]]) await db.workbenchSession.create({data:{id,playerId,coachId:c1,createdBy:'COACH',date:new Date('2027-01-04'),startMinute:600,durationMinutes:30,title:'Syntetisk',pyramid:'FYS',...meta,drills:{create:{title:'Syntetisk',durationMinutes:30,sortOrder:0,repAntall:0,techniqueFocus:'P4.0',akFormel:{pyramid:'FYS',area:'STYRKE',label:'Syntetisk',detaljer:{mal:{malsetning:'Syntetisk privat drillmål'},mengde:{enhet:'SERIER',reps:6,rir:0}}}}}}});
 const foreignBefore=await db.workbenchSession.findUniqueOrThrow({where:{id:ids[1]},include:{drills:true}});
 const privacy=await import('../../src/lib/workbench/workbench-personvern');assert.equal((await privacy.eksporterWorkbenchData(owner)).sessions.length,1);
 await privacy.anonymiserWorkbenchData(owner);const result=await db.workbenchSession.findUniqueOrThrow({where:{id:ids[0]},include:{drills:true}});assert.equal(result.rationale,null);assert.equal(result.location,null);assert.equal(result.maalsetning,null);assert.equal(result.drills[0].repAntall,0);assert.equal(result.drills[0].techniqueFocus,null);assert.deepEqual(result.drills[0].akFormel,{pyramid:'FYS',area:'STYRKE',label:'Anonymisert øvelse',detaljer:{mengde:{enhet:'SERIER',reps:6,rir:0}}});
 await privacy.anonymiserWorkbenchData(owner);const again=await db.workbenchSession.findUniqueOrThrow({where:{id:ids[0]},include:{drills:true}});assert.deepEqual(again.drills[0].akFormel,result.drills[0].akFormel);assert.equal(again.drills[0].id,result.drills[0].id);assert.deepEqual(await db.workbenchSession.findUniqueOrThrow({where:{id:ids[1]},include:{drills:true}}),foreignBefore);
 } finally { await db.workbenchSession.deleteMany({where:{id:{in:ids},playerId:{in:[owner,foreign]}}}); }
});
