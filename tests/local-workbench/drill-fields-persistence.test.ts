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
const prefix='r071-local-fields';
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
after(async()=>{await db?.$disconnect();});
async function fixture(kind:string){
 const id=`${prefix}-${kind}`;await db.workbenchSession.deleteMany({where:{id}});
 return db.workbenchSession.create({data:{id,playerId:p1,coachId:c1,createdBy:'COACH',date:new Date('2027-01-04T00:00:00Z'),startMinute:600,durationMinutes:60,title:'Syntetisk feltprøve',pyramid:'FYS',status:'PUBLISHED',
  drills:{create:{id:`id-old-${id}`,title:'Historisk RIR7',durationMinutes:20,sortOrder:0,repAntall:0,repReps:6,sourceId:'behold',akFormel:{pyramid:'FYS',area:'STYRKE',label:'Fysisk',ukjent:'behold',detaljer:{historisk:'behold',mengde:{enhet:'SERIER',reps:6,vektKg:60,rir:7,ukjent:'behold'}}}}}},include:{drills:true}});
}
test('nye felter lagres/leses/endres/tømmes; gamle ID/dose/JSON og andre eiere bevares',async()=>{
 const row=await fixture('rundtur');const old=await db.workbenchDrill.findUniqueOrThrow({where:{id:row.drills[0].id}});
 const formula:AKFormel={pyramid:'FYS',area:'KONDISJON',label:'Kondisjon',detaljer:{mengde:{enhet:'MINUTTER',antall:20},kondisjonssegmenter:[{minutter:5,pulssone:'S1'},{minutter:10,pulssone:'S3'}],utstyr:[{navn:'Syntetisk mølle'},{navn:'Markør',antall:0}]}};
 const created=data(await as('P01',()=>actions.addDrill({sessionId:row.id,drill:{title:'Syntetisk kondisjon',durationMinutes:20,akFormel:formula}})));
 const drill=created.drills[1];assert.deepEqual(drill.akFormel.detaljer,formula.detaljer);assert.deepEqual(await db.workbenchDrill.findUniqueOrThrow({where:{id:old.id}}),old);
 const rawFormula={...formula,detaljer:{...formula.detaljer,kondisjonssegmenter:[{minutter:5,pulssone:'S1',historisk:'behold'},{minutter:10,pulssone:'S3'}],utstyr:[{navn:'Syntetisk mølle',historisk:'behold'},{navn:'Markør',antall:0}]}};
 await db.workbenchDrill.update({where:{id:drill.id},data:{akFormel:rawFormula}});
 data(await as('P01',()=>actions.updateDrill({sessionId:row.id,drillId:drill.id,patch:{title:'Bare nytt navn',akFormel:formula}})));
 assert.deepEqual((await db.workbenchDrill.findUniqueOrThrow({where:{id:drill.id}})).akFormel,rawFormula);
 const changed:AKFormel={...formula,detaljer:{...formula.detaljer,kondisjonssegmenter:[{minutter:7,pulssone:'S2'}],utstyr:[{navn:'Syntetisk mølle',antall:2}]}};
 data(await as('COACH_A',()=>actions.updateDrill({sessionId:row.id,drillId:drill.id,patch:{akFormel:changed}})));
 const loaded=data(await as('P01',()=>actions.loadSession(row.id)));assert.ok(loaded);assert.deepEqual(loaded.drills.find(d=>d.id===drill.id)?.akFormel.detaljer,changed.detaljer);
 const rawBefore=await db.workbenchDrill.findUniqueOrThrow({where:{id:drill.id}});
 for(const actor of ['P02','COACH_B'])assert.equal((await as(actor,()=>actions.updateDrill({sessionId:row.id,drillId:drill.id,patch:{title:'Avvist'}}))).ok,false);
 assert.deepEqual(await db.workbenchDrill.findUniqueOrThrow({where:{id:drill.id}}),rawBefore);
 data(await as('P01',()=>actions.updateDrill({sessionId:row.id,drillId:drill.id,patch:{akFormel:{pyramid:'FYS',area:'KONDISJON',label:'Kondisjon'}}})));
 const cleared=await db.workbenchDrill.findUniqueOrThrow({where:{id:drill.id}});assert.deepEqual(cleared.akFormel,{pyramid:'FYS',area:'KONDISJON',label:'Kondisjon'});assert.deepEqual(await db.workbenchDrill.findUniqueOrThrow({where:{id:old.id}}),old);
});
test('historisk RIR7 har tolerant lesing og faktisk editorlagring, nye ugyldige RIR avvises',async()=>{
 const {utkastFraOvelse,byggOvelse}=await import('../../src/lib/domain/workbench/ovelse-utkast');
 const row=await fixture('legacy');const loaded=data(await as('P01',()=>actions.loadSession(row.id)));assert.ok(loaded);const original=loaded.drills[0];assert.equal(original.akFormel.pyramid,'FYS');assert.equal(original.akFormel.detaljer?.mengde?.rir,7);
 const built=byggOvelse('FYS',utkastFraOvelse(original).FYS,{title:'Endret navn',description:'',durationMinutes:20},original);assert.ok(built.ok);
 data(await as('P01',()=>actions.updateDrill({sessionId:row.id,drillId:original.id,patch:{title:built.ovelse.title,akFormel:built.ovelse.akFormel}})));
 const stored=await db.workbenchDrill.findUniqueOrThrow({where:{id:original.id}});assert.equal(stored.repAntall,0);assert.equal(stored.repReps,6);assert.equal(stored.sourceId,'behold');assert.match(JSON.stringify(stored.akFormel),/"rir":7/);assert.match(JSON.stringify(stored.akFormel),/"ukjent":"behold"/);
 for(const rir of [-1,5,8,4.4,NaN]){
  const invalid:AKFormel={pyramid:'FYS',area:'STYRKE',label:'Fysisk',detaljer:{mengde:{enhet:'SERIER',rir}}};
  assert.equal((await as('P01',()=>actions.addDrill({sessionId:row.id,drill:{title:'Ny ugyldig',durationMinutes:20,akFormel:invalid}}))).ok,false);
  assert.equal((await as('P01',()=>actions.updateDrill({sessionId:row.id,drillId:original.id,patch:{akFormel:invalid}}))).ok,false);
 }
 assert.deepEqual(await db.workbenchDrill.findUniqueOrThrow({where:{id:original.id}}),stored);
 data(await as('P01',()=>actions.updateDrill({sessionId:row.id,drillId:original.id,patch:{akFormel:{pyramid:'FYS',area:'STYRKE',label:'Fysisk',detaljer:{mengde:{enhet:'SERIER',reps:6,rir:0}}}}})));
 const corrected=data(await as('P01',()=>actions.loadSession(row.id)));assert.ok(corrected);assert.equal(corrected.drills[0].akFormel.detaljer?.mengde?.rir,0);
});
test('BANE oppgaver og RIR0/4 persistens; ugyldige segmenter/utstyr avvises uten delvis lagring',async()=>{
 const row=await fixture('grenser');
 for(const formula of [{pyramid:'SPILL',area:'BANE',label:'Spill',detaljer:{mengde:{enhet:'OPPGAVER',antall:12}}},{pyramid:'FYS',area:'STYRKE',label:'Fysisk',detaljer:{mengde:{enhet:'SERIER',reps:6,rir:4}}}] satisfies AKFormel[]){
  const saved=data(await as('P01',()=>actions.addDrill({sessionId:row.id,drill:{title:'Gyldig',durationMinutes:20,akFormel:formula}})));assert.deepEqual(saved.drills.at(-1)?.akFormel.detaljer,formula.detaljer);
 }
 const before=await db.workbenchSession.findUniqueOrThrow({where:{id:row.id},include:{drills:true}});
 for(const detaljer of [{kondisjonssegmenter:[{minutter:0,pulssone:'S1' as const}]},{utstyr:[{navn:'Utstyr',antall:1.5}]},{utstyr:[{navn:'',antall:0}]}]){
  assert.equal((await as('P01',()=>actions.addDrill({sessionId:row.id,drill:{title:'Avvist',durationMinutes:20,akFormel:{pyramid:'FYS',area:'KONDISJON',label:'Fysisk',detaljer}}}))).ok,false);
 }
 assert.deepEqual(await db.workbenchSession.findUniqueOrThrow({where:{id:row.id},include:{drills:true}}),before);
});
test('nye frie utstyrnavn vaskes bare i egen separat syntetisk datasubjekt; dose/segmenter og fremmed testøkt bevares',async()=>{
 const {anonymiserWorkbenchData}=await import('../../src/lib/workbench/workbench-personvern');
 const subject=`${prefix}-privacy`;const sessionId=`${subject}-session`;await db.workbenchSession.deleteMany({where:{id:sessionId}});
 await db.workbenchSession.create({data:{id:sessionId,playerId:subject,coachId:c1,date:new Date('2027-01-04T00:00:00Z'),startMinute:600,durationMinutes:20,title:'Syntetisk privat tekst',pyramid:'FYS',createdBy:'COACH',drills:{create:{title:'Privat',sortOrder:0,durationMinutes:20,akFormel:{pyramid:'FYS',area:'KONDISJON',label:'Privat',detaljer:{mengde:{enhet:'SERIER',reps:6,rir:7},kondisjonssegmenter:[{minutter:5,pulssone:'S2'}],utstyr:[{navn:'Syntetisk privat tekst',antall:0},{navn:'Syntetisk privat tekst'}]}}}}}});
 const other=await db.workbenchSession.findUniqueOrThrow({where:{id:`${prefix}-legacy`},include:{drills:true}});
 await anonymiserWorkbenchData(subject);const saved=await db.workbenchSession.findUniqueOrThrow({where:{id:sessionId},include:{drills:true}});
 assert.doesNotMatch(JSON.stringify(saved),/Syntetisk privat tekst/);assert.deepEqual(saved.drills[0].akFormel,{pyramid:'FYS',area:'KONDISJON',label:'Anonymisert øvelse',detaljer:{mengde:{enhet:'SERIER',reps:6,rir:7},kondisjonssegmenter:[{minutter:5,pulssone:'S2'}],utstyr:[{navn:'Anonymisert utstyr',antall:0},{navn:'Anonymisert utstyr'}]}});
 assert.deepEqual(await db.workbenchSession.findUniqueOrThrow({where:{id:other.id},include:{drills:true}}),other);
});
