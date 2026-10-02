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
const prefix='r071-local-drill';
let db: typeof import('../../src/lib/prisma').prisma;
let actions: typeof import('../../src/lib/workbench/wb-actions');
const p1=credentials.LOCAL_P01_ID, c1=credentials.LOCAL_COACH_A_ID;
mock.module('next/headers',{namedExports:{cookies:async()=>({getAll:()=>request.getStore()??[],set:()=>{}})}});
mock.module('next/cache',{namedExports:{revalidatePath:()=>{}}});
mock.module('next/navigation',{namedExports:{redirect:()=>{throw Error('Redirect');},notFound:()=>{throw Error('Not found');}}});
function as<T>(actor:string,fn:()=>Promise<T>){return request.run(sessions.get(actor)??[],fn);}
function data<T>(r:{ok:true;data:T}|{ok:false;error:string}):T {assert.ok(r.ok,r.ok?'':r.error);if(!r.ok)throw Error('Rejected');return r.data;}
const formel:AKFormel={pyramid:'TEK',area:'TEE_TOTAL',label:'Syntetisk',detaljer:{mengde:{enhet:'SLAG',antall:30},mal:{notat:'Behold'}}};
before(async()=>{
 const url=new URL(process.env.DATABASE_URL!); assert.equal(process.env.LOCAL_WORKBENCH_PROJECT,'ak-hq-workbench-20261002');
 assert.equal(url.hostname,'127.0.0.1');assert.equal(url.port,'55722');assert.equal(process.env.NEXT_PUBLIC_SUPABASE_URL,'http://127.0.0.1:55721');
 const sql=new pg.Pool({connectionString:url.toString()});try {const r=await sql.query("SELECT shobj_description(oid,'pg_database') AS identity FROM pg_database WHERE datname=current_database()");assert.equal(r.rows[0].identity,'ak-hq-workbench-20261002');}finally{await sql.end();}
 db=(await import('../../src/lib/prisma')).prisma;actions=await import('../../src/lib/workbench/wb-actions');
 for(const key of ['P01','P02','COACH_A','COACH_B']){
  const cookies:{name:string;value:string}[]=[];
  const auth: Pick<SupabaseClient, 'auth'>=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{cookies:{getAll:()=>cookies,setAll:all=>{cookies.splice(0,cookies.length,...all.map(c=>({name:c.name,value:c.value})));}}});
  const result: AuthTokenResponsePassword=await auth.auth.signInWithPassword({email:credentials[`LOCAL_${key}_EMAIL`],password:credentials[`LOCAL_${key}_PASSWORD`]});assert.equal(result.error,null,'Local synthetic login');sessions.set(key,cookies);
 }
});
after(async()=>{await db?.$disconnect();});
async function fixture(kind='ordinary'){
 const id=`${prefix}-${kind}`;await db.workbenchSession.deleteMany({where:{id}});
 return db.workbenchSession.create({data:{id,playerId:p1,coachId:c1,createdBy:'COACH',date:new Date('2027-01-04T00:00:00Z'),startMinute:600,durationMinutes:60,title:'Syntetisk',pyramid:'TEK',status:'PUBLISHED',
 ...(kind==='copy'?{sourceGroupSessionId:`${prefix}-original`}:{}),
 drills:{create:{id:`${id}-drill`,title:'Historisk',description:'Original',durationMinutes:30,sortOrder:0,akFormel:{...formel,legacy:{source:'syntetisk'},detaljer:{...formel.detaljer,historicalFlag:true,mengde:{enhet:'SLAG',antall:30,legacyUnit:'ball'}}},
 sourceId:'syntetisk-kilde',positionTaskId:'syntetisk-position',repType:'BALLER_SLATT',repAntall:30,repMinutter:9,repSett:3,repReps:10,techniqueFocus:'Originalmål'}}},include:{drills:true}});
}
test('addDrill bevarer ID, koblinger, dose, JSON og liveSnapshot på vanlig økt og lokal gruppekopi',async()=>{
 const exercise=await db.exerciseDefinition.upsert({where:{id:`${prefix}-exercise`},create:{id:`${prefix}-exercise`,name:'Syntetisk bankøvelse',pyramidArea:'TEK'},update:{}});
 for(const kind of ['ordinary','copy']){
  const row=await fixture(kind);await db.workbenchDrill.update({where:{id:row.drills[0].id},data:{exerciseId:exercise.id}});
  await db.workbenchSession.update({where:{id:row.id},data:{liveSnapshot:{drillId:row.drills[0].id,reps:12}}});
  const before=await db.workbenchDrill.findUniqueOrThrow({where:{id:row.drills[0].id}});
  data(await as('COACH_A',()=>actions.addDrill({sessionId:row.id,atIndex:0,drill:{title:'Ny',durationMinutes:10,akFormel:formel}})));
  const after=await db.workbenchDrill.findUniqueOrThrow({where:{id:before.id}});assert.deepEqual({...after,sortOrder:0},before);
  const saved=await db.workbenchSession.findUniqueOrThrow({where:{id:row.id},include:{drills:true}});assert.equal(saved.drills.length,2);assert.deepEqual(saved.liveSnapshot,{drillId:before.id,reps:12});assert.equal(saved.localOverride,kind==='copy');
 }
});
test('updateDrill leser, endrer og tømmer uten å miste historiske JSON-felt eller kilde/dose',async()=>{
 const row=await fixture();const old=row.drills[0];
 data(await as('COACH_A',()=>actions.updateDrill({sessionId:row.id,drillId:old.id,patch:{title:'Endret',description:undefined,techniqueFocus:null,akFormel:{...formel,detaljer:{mengde:{enhet:'SLAG',antall:0}}}}})));
 const saved=await db.workbenchDrill.findUniqueOrThrow({where:{id:old.id}});assert.equal(saved.id,old.id);assert.equal(saved.description,'Original');assert.equal(saved.techniqueFocus,null);assert.equal(saved.repAntall,30);assert.equal(saved.positionTaskId,old.positionTaskId);assert.equal(saved.sourceId,old.sourceId);
 assert.deepEqual(saved.akFormel,{pyramid:'TEK',area:'TEE_TOTAL',label:'Syntetisk',legacy:{source:'syntetisk'},detaljer:{historicalFlag:true,mengde:{enhet:'SLAG',antall:0,legacyUnit:'ball'}}});
 data(await as('P01',()=>actions.updateDrill({sessionId:row.id,drillId:old.id,patch:{description:null}})));
 assert.equal((await db.workbenchDrill.findUniqueOrThrow({where:{id:old.id}})).description,null);
});
test('updateDrill avviser fremmede eiere/øvelser, ugyldige verdier og foreldet editor uten skriving',async()=>{
 const row=await fixture();const drillId=row.drills[0].id;
 for(const actor of ['P02','COACH_B']) assert.equal((await as(actor,()=>actions.updateDrill({sessionId:row.id,drillId,patch:{title:'Avvis'}}))).ok,false);
 assert.equal((await as('P01',()=>actions.updateDrill({sessionId:row.id,drillId:'annen-øvelse',patch:{title:'Avvis'}}))).ok,false);
 for(const durationMinutes of [0,-1,NaN,Infinity,0.5,601]) assert.equal((await as('P01',()=>actions.updateDrill({sessionId:row.id,drillId,patch:{durationMinutes}}))).ok,false);
 assert.equal((await as('P01',()=>actions.updateDrill({sessionId:row.id,drillId,patch:{title:undefined}}))).ok,false);
 assert.equal((await as('P01',()=>actions.updateDrill({sessionId:row.id,drillId,expectedUpdatedAt:new Date(0).toISOString(),patch:{title:'Avvis'}}))).ok,false);
 assert.equal((await db.workbenchDrill.findUniqueOrThrow({where:{id:drillId}})).title,'Historisk');
});
test('to samtidige editorer gir én lagring; lokal gruppekopi overstyres uten originalendring',async()=>{
 const original=await fixture('original');const row=await fixture('copy');const old=row.drills[0];const patch={durationMinutes:75};
 const results=await Promise.all(['COACH_A','P01'].map(actor=>as(actor,()=>actions.updateDrill({sessionId:row.id,drillId:old.id,expectedUpdatedAt:row.updatedAt.toISOString(),patch}))));
 assert.equal(results.filter(r=>r.ok).length,1);
 const updated=await db.workbenchSession.findUniqueOrThrow({where:{id:row.id},include:{drills:true}});assert.equal(updated.localOverride,true);assert.equal(updated.durationMinutes,75);assert.equal(updated.drills[0].id,old.id);
 const again=data(await as('P01',()=>actions.updateDrill({sessionId:row.id,drillId:old.id,patch})));assert.equal(again.drills.length,1);assert.equal(again.drills[0].id,old.id);
 assert.deepEqual(await db.workbenchSession.findUniqueOrThrow({where:{id:original.id},include:{drills:true}}),original);
});
test('mal og forrige uke kopierer all rå dose/JSON/kilde med nye ID-er og uten å endre originalen',async()=>{
 const source=await fixture('template');
 const bank=await db.exerciseDefinition.upsert({where:{id:`${prefix}-exercise`},create:{id:`${prefix}-exercise`,name:'Syntetisk',pyramidArea:'TEK'},update:{}});
 await db.workbenchDrill.update({where:{id:source.drills[0].id},data:{exerciseId:bank.id,sortOrder:4,planRepsUtenBall:3,planRepsLavFart:5,planRepsAuto:7}});
 await db.workbenchDrill.create({data:{id:`prefix-second-${source.id}`,sessionId:source.id,title:'Nummer to',durationMinutes:15,sortOrder:9,akFormel:{...formel,historical:{nested:true}},repType:'TID',repMinutter:15,positionTaskId:'annen-historisk-oppgave'}});
 const original=await db.workbenchSession.findUniqueOrThrow({where:{id:source.id},include:{drills:{orderBy:{sortOrder:'asc'}}}});
 for(const kind of ['mal','forrige']){
  const copy=data(await as('P01',()=>actions.createSessionFromSource({playerId:p1,sourceId:`${kind}:${source.id}`,date:'2027-01-11',startMinute:600})));
  assert.notEqual(copy.id,source.id);assert.equal(copy.drills.length,2);
  const rows=await db.workbenchDrill.findMany({where:{sessionId:copy.id},orderBy:{sortOrder:'asc'}});
  rows.forEach((drill,index)=>{
   const old=original.drills[index];assert.notEqual(drill.id,old.id);assert.equal(drill.sortOrder,index);
   assert.deepEqual({...drill,id:old.id,sessionId:old.sessionId,sortOrder:old.sortOrder},old);
  });
 }
 assert.deepEqual(await db.workbenchSession.findUniqueOrThrow({where:{id:source.id},include:{drills:{orderBy:{sortOrder:'asc'}}}}),original);
 assert.equal((await as('COACH_B',()=>actions.createSessionFromSource({playerId:p1,sourceId:`mal:${source.id}`,date:'2027-01-11',startMinute:600}))).ok,false);
});
