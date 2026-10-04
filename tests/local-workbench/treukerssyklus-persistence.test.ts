/** Separate loopback Postgres + real GoTrue/application guards. Reuses synthetic accounts. */
import assert from 'node:assert/strict';
import { before, after, mock, test } from 'node:test';
import { AsyncLocalStorage } from 'node:async_hooks';
import { readFileSync } from 'node:fs';
import { parse } from 'dotenv';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient, AuthTokenResponsePassword } from '@supabase/supabase-js';
import pg from 'pg';
import {randomUUID} from 'node:crypto';
import {isoUkeMandag, isoUkeIdentitet, tommeUkeplandetaljer} from '../../src/lib/workbench/ukeplan-schema';
import {syklusUker} from '../../src/lib/workbench/treukerssyklus';
const request = new AsyncLocalStorage<{name:string;value:string}[]>();
const sessions = new Map<string,{name:string;value:string}[]>();
const credentials = parse(readFileSync('.codex/environments/workbench/.env.users'));
const prefix='r063-local-cycle';
let db: typeof import('../../src/lib/prisma').prisma;
let actions: typeof import('../../src/lib/workbench/treukerssyklus-actions');
const p1=credentials.LOCAL_P01_ID, c1=credentials.LOCAL_COACH_A_ID;
mock.module('next/headers',{namedExports:{cookies:async()=>({getAll:()=>request.getStore()??[],set:()=>{}})}});
mock.module('next/cache',{namedExports:{revalidatePath:()=>{}}});
mock.module('next/navigation',{namedExports:{redirect:()=>{throw Error('Redirect');},notFound:()=>{throw Error('Not found');}}});
function as<T>(actor:string,fn:()=>Promise<T>){return request.run(sessions.get(actor)??[],fn);}
function data<T>(r:{ok:true;data:T}|{ok:false;error:string}):T {assert.ok(r.ok,r.ok?'':r.error);if(!r.ok)throw Error('Rejected');return r.data;}
before(async()=>{
 const url=new URL(process.env.DATABASE_URL!); assert.equal(process.env.LOCAL_WORKBENCH_PROJECT,'ak-hq-workbench-20261002');
 assert.equal(url.hostname,'127.0.0.1');assert.equal(url.port,'55722');assert.equal(process.env.NEXT_PUBLIC_SUPABASE_URL,'http://127.0.0.1:55721');
 const sql=new pg.Pool({connectionString:url.toString()});try {const r=await sql.query("SELECT shobj_description(oid,'pg_database') AS identity FROM pg_database WHERE datname=current_database()");assert.equal(r.rows[0].identity,'ak-hq-workbench-20261002');}finally{await sql.end();}
 db=(await import('../../src/lib/prisma')).prisma;actions=await import('../../src/lib/workbench/treukerssyklus-actions');
 for(const key of ['P01','P02','COACH_A','COACH_B']){
  const cookies:{name:string;value:string}[]=[];
  const auth: Pick<SupabaseClient, 'auth'>=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{cookies:{getAll:()=>cookies,setAll:all=>{cookies.splice(0,cookies.length,...all.map(c=>({name:c.name,value:c.value})));}}});
  const result: AuthTokenResponsePassword=await auth.auth.signInWithPassword({email:credentials[`LOCAL_${key}_EMAIL`],password:credentials[`LOCAL_${key}_PASSWORD`]});assert.equal(result.error,null,'Local synthetic login');sessions.set(key,cookies);
 }
});
after(async()=>{await db?.$disconnect();});
const source=isoUkeMandag(2032,52),target='2033-01-17';
async function load(anchorWeek=source,targetWeek?:string){return data(await as('P01',()=>actions.lastTreukerssyklus({playerId:p1,anchorWeek,...(targetWeek?{targetWeek}:{})})));}
test('tre frie typer/null0 over ISO-årsskifte; eier/coach, fremmed og retry bevarer ny redigering',async()=>{
 for(const [i,week] of syklusUker(source).entries()){
  await db.weekPlan.deleteMany({where:{id:`${prefix}-source-${i}`}});
  await db.weekPlan.create({data:{id:`${prefix}-source-${i}`,playerId:p1,...isoUkeIdentitet(week),notes:[]}});
 }
 const old=await load();
 const weeks=old.weeks.map((w,i)=>{const details=tommeUkeplandetaljer();details.weekType=(['tuten','spesial','grunn'] as const)[i];details.location=`Syntetisk ${i}`;details.areas.FYS={priority:'REDUSERE',focus:'Syntetisk fokus',sessionBudget:i===1?null:0};return {expected:w.expected,fields:{planningDetails:details,notes:i===1?['TEST' as const]:[],plannedHoursFys:i===1?null:0}};});
 const input={playerId:p1,anchorWeek:source,requestId:randomUUID(),weeks};
 for(const actor of ['P02','COACH_B'])assert.equal((await as(actor,()=>actions.lagreTreukerssyklus(input))).ok,false);
 const saved=data(await as('COACH_A',()=>actions.lagreTreukerssyklus(input)));
 assert.deepEqual(saved.weeks.map(w=>w.plan?.planningDetails?.weekType),['tuten','spesial','grunn']);
 assert.deepEqual(saved.weeks.map(w=>w.plan?.plannedHoursFys),[0,null,0]);
 assert.deepEqual(saved.weeks.map(w=>w.plan?.isoYear),[2032,2032,2033]);
 const wb=await import('../../src/lib/workbench/wb-actions');
 const middle=saved.weeks[1].plan!;
 data(await as('P01',()=>wb.saveWeekPlan({playerId:p1,isoYear:middle.isoYear,weekNumber:middle.weekNumber,customNotes:'Nyere ukenotat',planningDetails:{...middle.planningDetails!,cycle:undefined}})));
 const retry=data(await as('P01',()=>actions.lagreTreukerssyklus(input)));
 assert.equal(retry.weeks[1].plan?.customNotes,'Nyere ukenotat');assert.ok(retry.weeks[1].plan?.planningDetails?.cycle);
 assert.equal((await as('P01',()=>wb.saveWeekPlan({playerId:p1,isoYear:middle.isoYear,weekNumber:middle.weekNumber,planningDetails:null}))).ok,false);
});
test('kopi bevarer rå drillJSON/dose/referanser, nyeDRAFT-IDer, måløkter og ingen actual/live/gruppemaster',async()=>{
 const sid=`${prefix}-session`;await db.workbenchSession.deleteMany({where:{id:{startsWith:prefix}}});
 await db.workbenchSession.deleteMany({where:{id:{startsWith:'wb-cycle-'},playerId:p1,title:'Syntetisk kilde',date:new Date(`${target}T00:00:00Z`)}});
 const raw={pyramid:'FYS',area:'STYRKE',label:'Historisk',future:{behold:true},detaljer:{mengde:{rir:7,reps:0},future:[0,null]}};
 await db.workbenchSession.create({data:{id:sid,playerId:p1,coachId:c1,date:new Date(`${source}T00:00:00Z`),startMinute:600,durationMinutes:45,title:'Syntetisk kilde',pyramid:'FYS',createdBy:'COACH',status:'COMPLETED',actualMinutes:0,perceivedEffort:5,liveSnapshot:{private:'skal ikke kopieres'},publishedAt:new Date(),rationale:'Formål',location:'Sted',maalsetning:'Mål',drills:{create:{id:`${prefix}-drill`,title:'Historisk',sortOrder:4,durationMinutes:45,akFormel:raw,sourceId:'historisk-bank',positionTaskId:'historisk-position',repAntall:0,repReps:6}}}});
 await db.workbenchSession.create({data:{id:`${prefix}-target-local`,playerId:p1,coachId:c1,date:new Date(`${target}T00:00:00Z`),startMinute:900,durationMinutes:20,title:'Behold lokal',pyramid:'FYS',createdBy:'COACH',localOverride:true}});
 await db.workbenchSession.create({data:{id:`${prefix}-hidden`,playerId:p1,coachId:c1,date:new Date(`${source}T00:00:00Z`),startMinute:900,durationMinutes:20,title:'Skjult',pyramid:'FYS',createdBy:'COACH',hiddenByPlayer:true}});
 const beforeLocal=await db.workbenchSession.findUniqueOrThrow({where:{id:`${prefix}-target-local`}});
 const preview=await load(source,target);assert.ok(preview.targets);assert.equal(preview.weeks[0].excludedSessions,1);
 const input={playerId:p1,anchorWeek:source,targetWeek:target,requestId:randomUUID(),sourceExpected:preview.weeks.map(w=>w.expected),targetExpected:preview.targets.map(w=>w.expected),confirmedFilledTargets:false};
 assert.equal((await as('P01',()=>actions.kopierTreukerssyklus(input))).ok,false);
 const accepted={...input,confirmedFilledTargets:true};data(await as('P01',()=>actions.kopierTreukerssyklus(accepted)));
 const copies=await db.workbenchSession.findMany({where:{playerId:p1,title:'Syntetisk kilde',date:new Date(`${target}T00:00:00Z`)},include:{drills:true}});assert.equal(copies.length,1);
 const copy=copies[0];assert.notEqual(copy.id,sid);assert.equal(copy.status,'DRAFT');assert.equal(copy.actualMinutes,null);assert.equal(copy.liveSnapshot,null);assert.equal(copy.publishedAt,null);assert.equal(copy.sourceGroupSessionId,null);assert.equal(copy.seriesId,null);
 assert.notEqual(copy.drills[0].id,`${prefix}-drill`);assert.deepEqual(copy.drills[0].akFormel,raw);assert.equal(copy.drills[0].repAntall,0);assert.equal(copy.drills[0].positionTaskId,'historisk-position');assert.equal(copy.drills[0].sortOrder,0);
 data(await as('P01',()=>actions.kopierTreukerssyklus(accepted)));assert.equal(await db.workbenchSession.count({where:{playerId:p1,title:'Syntetisk kilde',date:new Date(`${target}T00:00:00Z`)}}),1);
 assert.deepEqual(await db.workbenchSession.findUniqueOrThrow({where:{id:beforeLocal.id}}),beforeLocal);
});
test('forventet tomt mål blir stale ved ny rad; oppløsning beholder alle planverdier; legacy avvises',async()=>{
 const next='2033-02-07';await db.weekPlan.deleteMany({where:{id:`${prefix}-stale-target`}});
 const preview=await load(source,next);assert.ok(preview.targets);assert.equal(preview.targets[0].plan,null);
 await db.weekPlan.create({data:{id:`${prefix}-stale-target`,playerId:p1,...isoUkeIdentitet(next),customNotes:'Nyere målplan'}});
 const result=await as('P01',()=>actions.kopierTreukerssyklus({playerId:p1,anchorWeek:source,targetWeek:next,requestId:randomUUID(),sourceExpected:preview.weeks.map(w=>w.expected),targetExpected:preview.targets!.map(w=>w.expected),confirmedFilledTargets:true}));
 assert.equal(result.ok,false);assert.equal((await db.weekPlan.findUniqueOrThrow({where:{id:`${prefix}-stale-target`}})).customNotes,'Nyere målplan');
 const linked=await load(target);const original=linked.weeks.map(w=>w.plan?.plannedHoursFys);
 const dissolved=data(await as('COACH_A',()=>actions.opplosTreukerssyklus({playerId:p1,anchorWeek:target,expected:linked.weeks.map(w=>w.expected)})));
 assert.deepEqual(dissolved.weeks.map(w=>w.plan?.plannedHoursFys),original);assert.ok(dissolved.weeks.every(w=>!w.plan?.planningDetails?.cycle));
 const legacyAnchor='2029-12-31';await db.weekPlan.deleteMany({where:{id:`${prefix}-legacy`}});
 // Kalenderår2029 på en mandag i ISO2030/1 er en uavklart historisk kandidat.
 await db.weekPlan.create({data:{id:`${prefix}-legacy`,playerId:p1,isoYear:2029,weekNumber:1,notes:[]}});
 const noAccess=await as('P02',()=>actions.lastTreukerssyklus({playerId:p1,anchorWeek:legacyAnchor}));assert.equal(noAccess.ok,false);
 const rejected=await as('P01',()=>actions.lastTreukerssyklus({playerId:p1,anchorWeek:legacyAnchor}));assert.equal(rejected.ok,false);if(!rejected.ok)assert.match(rejected.error,/eldre ukeplan/);
 assert.equal(await db.weekPlan.count({where:{id:`${prefix}-legacy`}}),1);
});
test('stale kilde og feil på uke2 ruller atomisk tilbake; unknown avvises',async()=>{
 const preview=await load();const input={playerId:p1,anchorWeek:source,requestId:randomUUID(),weeks:preview.weeks.map(w=>({expected:w.expected,fields:{customNotes:'Skal ikke skrives'}}))};
 await db.weekPlan.update({where:{id:`${prefix}-source-1`},data:{customNotes:'Endret av annen økt'}});
 assert.equal((await as('P01',()=>actions.lagreTreukerssyklus(input))).ok,false);
 assert.notEqual((await db.weekPlan.findUniqueOrThrow({where:{id:`${prefix}-source-0`}})).customNotes,'Skal ikke skrives');
 const fresh=await load();const before=await db.weekPlan.findUniqueOrThrow({where:{id:`${prefix}-source-0`}});
 const rollback={playerId:p1,anchorWeek:source,requestId:randomUUID(),weeks:fresh.weeks.map((w,i)=>({expected:w.expected,fields:{customNotes:'Skal ikke skrives',...(i===1?{seasonPlanId:'fremmed-eller-mangler'}:{})}}))};
 assert.equal((await as('COACH_A',()=>actions.lagreTreukerssyklus(rollback))).ok,false);assert.deepEqual(await db.weekPlan.findUniqueOrThrow({where:{id:before.id}}),before);
 await db.weekPlan.update({where:{id:`${prefix}-source-0`},data:{planningDetails:{version:2,future:{behold:true}}}});
 assert.equal((await as('P01',()=>actions.lastTreukerssyklus({playerId:p1,anchorWeek:source}))).ok,false);assert.deepEqual((await db.weekPlan.findUniqueOrThrow({where:{id:before.id}})).planningDetails,{version:2,future:{behold:true}});
});
test('lagring bevarer null/valgt sesong under overlapp; kopi beregner målets nyeste sesong',async()=>{
 const anchor=isoUkeMandag(2034,18),copyTarget=isoUkeMandag(2034,30);
 const oldId=`${prefix}-season-old`,newId=`${prefix}-season-new`;
 for(const [id,year,start] of [[oldId,2034,'2034-01-01'],[newId,2035,'2034-03-01']] as const){
  await db.seasonPlan.upsert({where:{id},create:{id,userId:p1,year,startDate:new Date(`${start}T00:00:00Z`),endDate:new Date('2034-12-31T00:00:00Z'),name:'Syntetisk overlapp'},update:{}});
 }
 for(const [i,week] of syklusUker(anchor).entries()){
  const id=`${prefix}-season-source-${i}`;await db.weekPlan.deleteMany({where:{id}});
  await db.weekPlan.create({data:{id,playerId:p1,...isoUkeIdentitet(week),seasonPlanId:i===1?oldId:null,notes:[]}});
 }
 const preview=await load(anchor);
 const saved=data(await as('P01',()=>actions.lagreTreukerssyklus({playerId:p1,anchorWeek:anchor,requestId:randomUUID(),weeks:preview.weeks.map(w=>({expected:w.expected,fields:{customNotes:'Syntetisk ukeendring'}}))})));
 assert.deepEqual(saved.weeks.map(w=>w.plan?.seasonPlanId),[null,oldId,null]);
 // En eksplisitt null og valgt eldre, gyldig sesong skal også respekteres.
 const explicit=data(await as('P01',()=>actions.lagreTreukerssyklus({playerId:p1,anchorWeek:anchor,requestId:randomUUID(),weeks:saved.weeks.map((w,i)=>({expected:w.expected,fields:{seasonPlanId:i===0?oldId:null}}))})));
 assert.deepEqual(explicit.weeks.map(w=>w.plan?.seasonPlanId),[oldId,null,null]);
 const targets=await load(anchor,copyTarget);assert.ok(targets.targets);
 const copied=data(await as('COACH_A',()=>actions.kopierTreukerssyklus({playerId:p1,anchorWeek:anchor,targetWeek:copyTarget,requestId:randomUUID(),sourceExpected:targets.weeks.map(w=>w.expected),targetExpected:targets.targets!.map(w=>w.expected),confirmedFilledTargets:true})));
 assert.deepEqual(copied.weeks.map(w=>w.plan?.seasonPlanId),[newId,newId,newId]);
 assert.deepEqual((await load(anchor)).weeks.map(w=>w.plan?.seasonPlanId),[oldId,null,null]);
});
