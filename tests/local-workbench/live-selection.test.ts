/** Separate loopback Postgres + real GoTrue/application guards. Reuses synthetic accounts. */
import assert from 'node:assert/strict';
import { before, after, mock, test } from 'node:test';
import { AsyncLocalStorage } from 'node:async_hooks';
import { readFileSync } from 'node:fs';
import { parse } from 'dotenv';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient, AuthTokenResponsePassword } from '@supabase/supabase-js';
import pg from 'pg';
const request = new AsyncLocalStorage<{name:string;value:string}[]>();
const sessions = new Map<string,{name:string;value:string}[]>();
const credentials = parse(readFileSync('.codex/environments/workbench/.env.users'));
const prefix='samlet-live-local';
let db: typeof import('../../src/lib/prisma').prisma;
let actions: typeof import('../../src/lib/workbench/wb-actions');
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
 db=(await import('../../src/lib/prisma')).prisma;actions=await import('../../src/lib/workbench/wb-actions');
 for(const key of ['P01','P02','COACH_A','COACH_B']){
  const cookies:{name:string;value:string}[]=[];
  const auth: Pick<SupabaseClient, 'auth'>=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{cookies:{getAll:()=>cookies,setAll:all=>{cookies.splice(0,cookies.length,...all.map(c=>({name:c.name,value:c.value})));}}});
  const result: AuthTokenResponsePassword=await auth.auth.signInWithPassword({email:credentials[`LOCAL_${key}_EMAIL`],password:credentials[`LOCAL_${key}_PASSWORD`]});assert.equal(result.error,null,'Local synthetic login');sessions.set(key,cookies);
 }
});
after(async()=>{ if(db){ await db.workbenchSession.deleteMany({where:{id:{startsWith:prefix}}}); await db.$disconnect(); } });

const week='2028-01-03';
async function fixture(){
 await db.workbenchSession.deleteMany({where:{id:{startsWith:prefix}}});
 for(const [suffix,playerId,status,startMinute] of [
  ['first',p1,'PUBLISHED',600],['selected',p1,'PUBLISHED',720],['foreign',credentials.LOCAL_P02_ID,'PUBLISHED',660],
  ['draft',p1,'DRAFT',780],['hidden',p1,'PUBLISHED',800],['pending',p1,'PUBLISHED',820]
 ] as const) await db.workbenchSession.create({data:{id:`${prefix}-${suffix}`,playerId,coachId:c1,createdBy:'COACH',date:new Date(`${week}T00:00:00Z`),startMinute,durationMinutes:30,title:`Syntetisk ${suffix}`,pyramid:'TEK',status,
 hiddenByPlayer:suffix==='hidden',needsPlayerApproval:suffix==='pending'}});
}
test('Live velger eksplisitt publisert økt i stedet for første, og endrer ingen status ved lesing',async()=>{
 await fixture();
 for(const actor of ['P01','COACH_A']){
  const live=data(await as(actor,()=>actions.loadWorkbenchLive({playerId:p1,weekStart:week,sessionId:`${prefix}-selected`})));
  assert.equal(live.next?.id,`${prefix}-selected`);assert.equal(live.current,null);
 }
 assert.equal((await db.workbenchSession.findUniqueOrThrow({where:{id:`${prefix}-selected`}})).status,'PUBLISHED');
});
test('Live avviser fremmed, skjult, ubesvart og utkast uten å åpne en annen økt',async()=>{
 await db.workbenchSession.create({data:{id:`${prefix}-published-template`,playerId:p1,coachId:c1,createdBy:'COACH',isTemplate:true,date:new Date(`${week}T00:00:00Z`),startMinute:500,durationMinutes:30,title:'Syntetisk publisert mal',pyramid:'TEK',status:'PUBLISHED'}});
 const withoutSelection=data(await as('P01',()=>actions.loadWorkbenchLive({playerId:p1,weekStart:week})));
 assert.equal(withoutSelection.next?.id,`${prefix}-first`);
 assert.equal((await as('P01',()=>actions.loadWorkbenchLive({playerId:p1,weekStart:week,sessionId:`${prefix}-published-template`}))).ok,false);
 assert.equal((await as('P01',()=>actions.startSession(`${prefix}-published-template`))).ok,false);
 assert.equal((await as('P01',()=>actions.startNextWorkbenchLiveSession({nextSessionId:`${prefix}-published-template` }))).ok,false);
 assert.equal((await db.workbenchSession.findUniqueOrThrow({where:{id:`${prefix}-published-template`}})).status,'PUBLISHED');
 for(const suffix of ['foreign','hidden','pending','draft','missing']){
  assert.equal((await as('P01',()=>actions.loadWorkbenchLive({playerId:p1,weekStart:week,sessionId:`${prefix}-${suffix}`}))).ok,false);
 }
 assert.equal((await as('COACH_B',()=>actions.loadWorkbenchLive({playerId:p1,weekStart:week,sessionId:`${prefix}-selected`}))).ok,false);
});
test('valgt pågående økt beholdes; annet pågående arbeid vises sammen med valgt neste',async()=>{
 await db.workbenchSession.update({where:{id:`${prefix}-first`},data:{status:'IN_PROGRESS'}});
 const next=data(await as('P01',()=>actions.loadWorkbenchLive({playerId:p1,weekStart:week,sessionId:`${prefix}-selected`})));
 assert.equal(next.current?.id,`${prefix}-first`);assert.equal(next.next?.id,`${prefix}-selected`);
 const current=data(await as('P01',()=>actions.loadWorkbenchLive({playerId:p1,weekStart:week,sessionId:`${prefix}-first`})));
 assert.equal(current.current?.id,`${prefix}-first`);assert.ok(current.snapshot);
});
test('PlayerHQ egen kalender bruker bare egen spiller og portal-lenker',async()=>{
 await db.workbenchSession.create({data:{id:`${prefix}-own-template`,playerId:p1,coachId:p1,createdBy:'PLAYER',isTemplate:true,date:new Date(`${week}T00:00:00Z`),startMinute:600,durationMinutes:30,title:'Syntetisk egen mal',pyramid:'TEK',status:'DRAFT'}});
 await db.workbenchSession.create({data:{id:`${prefix}-coach-template`,playerId:p1,coachId:c1,createdBy:'COACH',isTemplate:true,date:new Date(`${week}T00:00:00Z`),startMinute:600,durationMinutes:30,title:'Syntetisk trener mal',pyramid:'TEK',status:'DRAFT'}});
 await db.workbenchSession.create({data:{id:`${prefix}-foreign-template`,playerId:credentials.LOCAL_P02_ID,coachId:c1,createdBy:'COACH',isTemplate:true,date:new Date(`${week}T00:00:00Z`),startMinute:600,durationMinutes:30,title:'Syntetisk fremmed mal',pyramid:'TEK',status:'DRAFT'}});
 const {loadPlayerMinCalendar}=await import('../../src/lib/workbench/spiller-min-kalender');
 const calendar=data(await as('P01',()=>loadPlayerMinCalendar(week)));
 const items=calendar.days.flatMap(d=>d.items);
 assert.ok(items.some(i=>i.session?.id===`${prefix}-selected`));
 assert.ok(items.every(i=>!i.session||i.session.playerId===p1));
 assert.ok(items.every(i=>i.href.startsWith('/portal/')));
 assert.ok(items.every(i=>!i.id.includes('foreign')&&!i.id.includes('hidden')));
 assert.ok(calendar.templates.some(t=>t.id===`${prefix}-own-template`));
 assert.ok(calendar.templates.some(t=>t.id===`${prefix}-coach-template`));
 assert.ok(calendar.templates.every(t=>t.id!==`${prefix}-foreign-template`));
 assert.ok(items.every(i=>!i.session?.isTemplate));
});

test('malmerking før start kan fjernes; pågående original avvises og historisk mal kan repareres',async()=>{
 await fixture(); const id=`${prefix}-selected`;
 assert.equal((await as('P01',()=>actions.setSessionTemplate(id,true))).ok,true);
 assert.equal((await as('P01',()=>actions.setSessionTemplate(id,false))).ok,true);
 data(await as('P01',()=>actions.startSession(id)));
 const before=await db.workbenchSession.findUniqueOrThrow({where:{id}});
 assert.equal((await as('P01',()=>actions.setSessionTemplate(id,true))).ok,false);
 assert.deepEqual(await db.workbenchSession.findUniqueOrThrow({where:{id}}),before);
 await db.workbenchSession.update({where:{id},data:{isTemplate:true}});
 assert.equal((await as('P01',()=>actions.setSessionTemplate(id,false))).ok,true);
 data(await as('P01',()=>actions.completeSession(id)));
 assert.equal((await db.workbenchSession.findUniqueOrThrow({where:{id}})).status,'COMPLETED');
});
