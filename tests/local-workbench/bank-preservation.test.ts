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
const prefix='r071-bank-local';
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
async function source(kind='drill',id=bankId){
 const result=data(await as('P01',()=>actions.createSessionFromSource({playerId:p1,sourceId:`${kind}:${id}`,date:'2027-01-04',startMinute:600})));
 createdSessions.push(result.id);return result;
}
test('bank→økt og bank→eksisterende økt setter konkrete koblinger og utstyr med ukjent antall',async()=>{
 const row=await source();assert.equal(row.drills[0].exerciseId,bankId);assert.equal(row.drills[0].sourceId,bankId);
 assert.deepEqual(row.drills[0].akFormel.detaljer?.utstyr,[{navn:'Syntetisk matte'},{navn:'Syntetisk kølle'}]);
 const added=data(await as('P01',()=>actions.addDrillFromSource({sessionId:row.id,sourceId:`drill:${sharedId}`})));
 assert.equal(added.drills[1].exerciseId,sharedId);assert.notEqual(added.drills[0].id,added.drills[1].id);
 const tek=await source('tek',taskId);assert.equal(tek.drills[0].positionTaskId,taskId);
 const withTek=data(await as('P01',()=>actions.addDrillFromSource({sessionId:row.id,sourceId:`tek:${taskId}`})));
 assert.equal(withTek.drills[2].positionTaskId,taskId);
});
test('banklisten og alle kildehandlinger avviser privat/fremmed coachbank og andre spillers tekniske oppgave',async()=>{
 const list=data(await as('P01',()=>actions.loadSources({playerId:p1,weekStart:'2027-01-04'})));
 assert.ok(list.some(s=>s.id===`drill:${bankId}`));assert.ok(list.some(s=>s.id===`drill:${sharedId}`));
 assert.ok(!list.some(s=>s.id===`drill:${privateId}`||s.id===`drill:${foreignSharedId}`));
 const row=await source();
 for(const id of [privateId,foreignSharedId]){
  assert.equal((await as('P01',()=>actions.createSessionFromSource({playerId:p1,sourceId:`drill:${id}`,date:'2027-01-04',startMinute:600}))).ok,false);
  assert.equal((await as('P01',()=>actions.addDrillFromSource({sessionId:row.id,sourceId:`drill:${id}`}))).ok,false);
  assert.equal((await as('P01',()=>actions.createSessionSeries({playerId:p1,date:'2027-01-04',startMinute:600,durationMinutes:30,title:'Syntetisk avvist serie',pyramid:'TEK',repeatWeeks:2,drills:[{title:'Avvist',durationMinutes:30,akFormel:formel,sourceId:id,exerciseId:id}]}))).ok,false);
 }
 assert.equal((await as('P01',()=>actions.addDrillFromSource({sessionId:row.id,sourceId:`tek:${foreignTaskId}`}))).ok,false);
 assert.equal((await as('P01',()=>actions.createSessionFromSource({playerId:p1,sourceId:`tek:${foreignTaskId}`,date:'2027-01-04',startMinute:600}))).ok,false);
 assert.equal((await as('COACH_B',()=>actions.addDrillFromSource({sessionId:row.id,sourceId:`drill:${bankId}`}))).ok,false);
});
test('Stats/ny serie avleder bank-ID fra gammel rå sourceId og får nye øvelse-ID-er per forekomst',async()=>{
 const list=data(await as('P01',()=>actions.loadSources({playerId:p1,weekStart:'2027-01-04'})));const drill=list.find(s=>s.id===`drill:${bankId}`)!.drill!;
 const series=data(await as('P01',()=>actions.createSessionSeries({playerId:p1,date:'2027-01-04',startMinute:600,durationMinutes:30,title:'Syntetisk A/B-serie',pyramid:'TEK',repeatWeeks:2,
  drills:[{title:drill.title,durationMinutes:drill.durationMinutes,akFormel:drill.akFormel,sourceId:drill.sourceId}]})));
 createdSessions.push(...series.map(s=>s.id));assert.equal(series.length,2);assert.notEqual(series[0].drills[0].id,series[1].drills[0].id);
 for(const s of series){assert.equal(s.drills[0].exerciseId,bankId);assert.deepEqual(s.drills[0].akFormel.detaljer?.utstyr,drill.akFormel.detaljer?.utstyr);}
});
test('gruppeoriginal→medlemskopi bevarer rå dose/JSON/bankkobling, egen overstyring og stabile nye ID-er',async()=>{
 const requestId='73176d1a-9930-4c23-bcd1-f7c2ec8b86fd';
 const master=data(await as('COACH_A',()=>groups.saveGroupWorkbenchSession({groupId,requestId,date:'2027-01-04',startMinute:600,durationMinutes:30,title:'Syntetisk gruppebank',pyramid:'TEK',
  drills:[{title:'Syntetisk bank',durationMinutes:30,akFormel:formel,sourceId:bankId,exerciseId:bankId}]})));
 const raw={...formel,unknownOriginal:{value:'Syntetisk'},detaljer:{...formel.detaljer,unknownDose:true,utstyr:[{navn:'Syntetisk matte',antall:0}]}};
 await db.workbenchDrill.update({where:{id:master.drills[0].id},data:{akFormel:raw,repType:'BALLER_SLATT',repAntall:0,repSett:3,repReps:10,planRepsUtenBall:2,positionTaskId:taskId}});
 data(await as('COACH_A',()=>groups.publishGroupWorkbenchSessions({groupId,sessionIds:[master.id]})));
 const copies=await db.workbenchSession.findMany({where:{sourceGroupSessionId:master.id},include:{drills:true}});assert.equal(copies.length,2);
 const original=await db.workbenchDrill.findUniqueOrThrow({where:{id:master.drills[0].id}});
 for(const copy of copies){const d=copy.drills[0];assert.notEqual(d.id,original.id);assert.equal(d.exerciseId,bankId);assert.equal(d.positionTaskId,taskId);assert.equal(d.repAntall,0);assert.equal(d.repReps,10);assert.deepEqual(d.akFormel,raw);}
 const mine=copies.find(c=>c.playerId===p1)!;
 data(await as('P01',()=>actions.updateDrill({sessionId:mine.id,drillId:mine.drills[0].id,patch:{title:'Syntetisk lokal overstyring'}})));
 data(await as('COACH_A',()=>groups.publishGroupWorkbenchSessions({groupId,sessionIds:[master.id]})));
 const again=await db.workbenchSession.findUniqueOrThrow({where:{id:mine.id},include:{drills:true}});assert.equal(again.localOverride,true);assert.equal(again.drills[0].title,'Syntetisk lokal overstyring');assert.equal(again.drills[0].id,mine.drills[0].id);
 assert.deepEqual(await db.workbenchDrill.findUniqueOrThrow({where:{id:master.drills[0].id}}),original);
 assert.equal((await as('COACH_B',()=>groups.publishGroupWorkbenchSessions({groupId,sessionIds:[master.id]}))).ok,false);
});
test('historisk RIR7 består ved urelatert editorendring, men ny/annen RIR5–10 avvises',async()=>{
 const s=await source();const drill=s.drills[0];const old:AKFormel={pyramid:'FYS',area:'STYRKE',label:'Syntetisk legacy',detaljer:{mengde:{enhet:'SERIER',reps:10,vektKg:20,rir:7}}};
 await db.workbenchDrill.update({where:{id:drill.id},data:{akFormel:{...old,unknownOriginal:true}}});
 const edited=data(await as('P01',()=>actions.updateDrill({sessionId:s.id,drillId:drill.id,patch:{title:'Syntetisk ny tittel',akFormel:old}})));
 assert.equal(edited.drills[0].akFormel.detaljer?.mengde?.rir,7);
 assert.equal((await as('P01',()=>actions.updateDrill({sessionId:s.id,drillId:drill.id,patch:{akFormel:{...old,detaljer:{mengde:{...old.detaljer!.mengde!,rir:8}}}}}))).ok,false);
 const saved=await db.workbenchDrill.findUniqueOrThrow({where:{id:drill.id}});assert.deepEqual(saved.akFormel,{...old,unknownOriginal:true});assert.equal(saved.exerciseId,bankId);
});
