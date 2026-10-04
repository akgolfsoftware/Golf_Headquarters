/** Dedicated loopback DB, real GoTrue cookies and the unchanged application access guards. */
import assert from "node:assert/strict";
import {after,before,mock,test} from "node:test";
import {AsyncLocalStorage} from "node:async_hooks";
import {randomBytes} from "node:crypto";
import {writeFileSync} from "node:fs";
import pg from "pg";
import {createClient,type User,type UserResponse,type AuthTokenResponsePassword,type SupabaseClient} from "@supabase/supabase-js";
import {createServerClient} from "@supabase/ssr";
import {Prisma} from "../../src/generated/prisma/client";
import {executionSeconds,readSessionExecution} from "../../src/lib/workbench/wb-session-life";
import {summerTreningsvolum} from "../../src/lib/workbench/treningsvolum";
type Cookie={name:string;value:string};
const storage=new AsyncLocalStorage<Cookie[]>();const cookies=new Map<string,Cookie[]>();const ids=new Map<string,string>();
const prefix="rest-r07-local-20261002";
let db:typeof import("../../src/lib/prisma").prisma;
let actions:typeof import("../../src/lib/workbench/wb-actions");
let life:typeof import("../../src/lib/workbench/wb-session-life-actions");
mock.module("next/headers",{namedExports:{cookies:async()=>({getAll:()=>storage.getStore()??[],set:(name:string,value:string)=>{const all=storage.getStore();if(!all)return;const old=all.find(c=>c.name===name);if(old)old.value=value;else all.push({name,value});}})}});
mock.module("next/navigation",{namedExports:{redirect:(path:string)=>{throw Error(`LOCAL_REDIRECT:${path}`);},notFound:()=>{throw Error("LOCAL_NOT_FOUND");}}});
mock.module("next/cache",{namedExports:{revalidatePath:()=>undefined}});
function as<T>(actor:string,fn:()=>Promise<T>){return storage.run(cookies.get(actor)??[],fn);}
function data<T>(result:{ok:true;data:T}|{ok:false;error:string}):T{assert.ok(result.ok,result.ok?undefined:result.error);if(!result.ok)throw Error("Local action rejected");return result.data;}
async function row(id:string){return db.workbenchSession.findUniqueOrThrow({where:{id}});}
async function fixture(name:string,patch:Record<string,unknown>={}){
 const id=`${prefix}-${name}`;await db.workbenchSession.deleteMany({where:{id,playerId:ids.get("player")!}});
 return db.workbenchSession.create({data:{id,playerId:ids.get("player")!,coachId:ids.get("coach")!,createdBy:"PLAYER",date:new Date("2026-09-01T00:00:00Z"),startMinute:600,durationMinutes:60,title:"Syntetisk gjennomføring",pyramid:"TEK",status:"PUBLISHED",localOverride:true,
  drills:{create:{id:`${id}-drill`,title:"Syntetisk øvelse",durationMinutes:60,sortOrder:0,akFormel:{pyramid:"TEK",area:"TEE",label:"Syntetisk",future:{keep:0}},repAntall:0,planRepsAuto:0}},...patch}});
}
async function mutate(id:string,action:string,patch:Record<string,unknown>={}){const r=await row(id);return as("player",()=>life.mutateSessionExecution({sessionId:id,action,expectedUpdatedAt:r.updatedAt.toISOString(),requestId:randomBytes(12).toString("hex"),...patch}));}
before(async()=>{
 const url=new URL(process.env.DATABASE_URL!);assert.equal(process.env.LOCAL_WORKBENCH_PROJECT,"ak-hq-workbench-20261002");assert.equal(url.hostname,"127.0.0.1");assert.equal(url.port,"55722");assert.equal(process.env.NEXT_PUBLIC_SUPABASE_URL,"http://127.0.0.1:55721");
 const pool=new pg.Pool({connectionString:url.toString()});try{const result=await pool.query("SELECT shobj_description(oid,'pg_database') AS identity FROM pg_database WHERE datname=current_database()");assert.equal(result.rows[0].identity,"ak-hq-workbench-20261002");}finally{await pool.end();}
 db=(await import("../../src/lib/prisma")).prisma;
 const admin=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}});
 const listed=await admin.auth.admin.listUsers();assert.equal(listed.error,null,"Local synthetic Auth listing failed");
 const credentials:Record<string,string>={};
 for(const [actor,role] of [["player","PLAYER"],["coach","COACH"],["foreign","COACH"],["parent","PARENT"]] as const){
  const email=`${prefix}-${actor}@akgolf.test`;const password=randomBytes(24).toString("base64url");const existing:User|undefined=listed.data.users.find(u=>u.email===email);
  const created:UserResponse=existing?await admin.auth.admin.updateUserById(existing.id,{password}):await admin.auth.admin.createUser({email,password,email_confirm:true});assert.equal(created.error,null,"Local synthetic Auth provisioning failed");assert.ok(created.data.user);
  const user=await db.user.upsert({where:{email},create:{id:`${prefix}-${actor}`,authId:created.data.user.id,email,name:`Syntetisk R07 ${actor}`,role,tier:"PRO",dateOfBirth:new Date("2000-01-01T00:00:00Z"),trialEndsAt:new Date("2040-01-01T00:00:00Z"),requiresGuardianConsent:false,preferences:{onboarding:{stepCompleted:7}}},update:{authId:created.data.user.id}});ids.set(actor,user.id);
  const jar:Cookie[]=[];const auth:Pick<SupabaseClient,"auth">=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{cookies:{getAll:()=>jar,setAll:values=>{jar.splice(0,jar.length,...values.map(c=>({name:c.name,value:c.value})));}}});
  const login:AuthTokenResponsePassword=await auth.auth.signInWithPassword({email,password});assert.equal(login.error,null,"Real local Auth sign-in failed");const verified:UserResponse=await auth.auth.getUser();assert.equal(verified.data.user?.id,created.data.user.id);cookies.set(actor,jar);
  for(const [key,value] of Object.entries({EMAIL:email,PASSWORD:password,ID:user.id}))credentials[`LOCAL_R07_${actor.toUpperCase()}_${key}`]=value;
 }
 writeFileSync(".codex/environments/workbench/.env.execution-users",Object.entries(credentials).map(([k,v])=>`${k}=${v}`).join("\n")+"\n",{mode:0o600});
 const groupId=`${prefix}-group`;await db.group.upsert({where:{id:groupId},create:{id:groupId,name:"Syntetisk R07-gruppe",slug:groupId,managedByAkGolf:true,coachId:ids.get("coach")!},update:{}});
 await db.groupMember.upsert({where:{groupId_userId:{groupId,userId:ids.get("player")!}},create:{groupId,userId:ids.get("player")!,role:"PLAYER"},update:{endedAt:null}});
 actions=await import("../../src/lib/workbench/wb-actions");life=await import("../../src/lib/workbench/wb-session-life-actions");
});
after(async()=>{if(db){await db.user.updateMany({where:{id:ids.get("player")!},data:{requiresGuardianConsent:false}});await db.$disconnect();}});
test("start → pause → ny Live-lesing → fortsett → fullfør beholder samme økt/drill og registrert 0",async()=>{
 const created=await fixture("journey");data(await as("player",()=>actions.startSession(created.id)));
 const started=await row(created.id);const raw=started.liveSnapshot as Record<string,unknown>;const execution=readSessionExecution(raw)!;
 await db.workbenchSession.update({where:{id:created.id},data:{liveSnapshot:{...raw,future:{keep:"opaque"},execution:{...execution,runningSinceISO:new Date(Date.now()-120000).toISOString()}} as Prisma.InputJsonValue}});
 data(await mutate(created.id,"PAUSE"));const paused=await row(created.id);const phase=readSessionExecution(paused.liveSnapshot)!;assert.equal(phase.phase,"PAUSED");assert.ok(phase.accumulatedSec>=120&&phase.accumulatedSec<125);assert.equal(executionSeconds(phase,Date.now()+3600000),phase.accumulatedSec);
 const loaded=data(await as("player",()=>actions.loadWorkbenchLive({playerId:created.playerId,weekStart:"2026-08-31",sessionId:created.id})));assert.equal(loaded.current?.id,created.id);assert.equal(readSessionExecution(loaded.snapshot)?.phase,"PAUSED");
 assert.equal((await as("player",()=>actions.saveWorkbenchLiveSnapshot({sessionId:created.id,totalSec:phase.accumulatedSec,drills:[{drillId:`${created.id}-drill`,reps:0,elapsedSec:0,status:"active"}],seriesTargets:{[`${created.id}-drill`]:3}}))).ok,false);
 data(await mutate(created.id,"RESUME"));data(await mutate(created.id,"FINISH",{actualMinutes:0,perceivedEffort:1}));const done=await row(created.id);assert.equal(done.id,created.id);assert.equal(done.actualMinutes,0);assert.equal(done.status,"COMPLETED");assert.equal(done.localOverride,true);assert.deepEqual((done.liveSnapshot as Record<string,unknown>).future,{keep:"opaque"});assert.equal(await db.workbenchDrill.count({where:{id:`${created.id}-drill`}}),1);
 const total=summerTreningsvolum([{...done}],{fraDato:new Date("2026-08-31T00:00:00Z"),tilDato:new Date("2026-09-07T00:00:00Z"),naa:new Date()}).total;assert.equal(total.faktiskMinutter,0);assert.equal(total.gjennomforteOkter,1);
});
test("etterregistrering med årsak; retry/tapt svar og stale grunnversjon overskriver aldri nyere retting",async()=>{
 const original=await fixture("correction",{status:"COMPLETED",actualMinutes:45,liveSnapshot:{legacy:{unknown:0}}});const input={sessionId:original.id,action:"RECORD",outcome:"COMPLETED",actualMinutes:0,reason:"Syntetisk feilregistrering",expectedUpdatedAt:original.updatedAt.toISOString(),requestId:`${prefix}-lost-response`};
 data(await as("player",()=>life.mutateSessionExecution(input)));const first=await row(original.id);data(await as("player",()=>life.mutateSessionExecution(input)));assert.equal((await row(original.id)).updatedAt.toISOString(),first.updatedAt.toISOString());
 data(await mutate(original.id,"RECORD",{outcome:"COMPLETED",actualMinutes:45,reason:"Syntetisk ny retting"}));data(await as("player",()=>life.mutateSessionExecution(input)));assert.equal((await row(original.id)).actualMinutes,45);assert.equal(readSessionExecution((await row(original.id)).liveSnapshot)?.events.length,2);
 assert.equal((await as("player",()=>life.mutateSessionExecution({...input,requestId:`${prefix}-stale`,actualMinutes:null}))).ok,false);assert.equal((await row(original.id)).actualMinutes,45);
 data(await mutate(original.id,"RECORD",{outcome:"COMPLETED",actualMinutes:null,reason:"Syntetisk ukjent tid"}));assert.equal((await row(original.id)).actualMinutes,null);
 data(await mutate(original.id,"RECORD",{outcome:"COMPLETED",reason:"Bevar uttrykkelig ukjent"}));assert.equal((await row(original.id)).actualMinutes,null);assert.deepEqual(((await row(original.id)).liveSnapshot as Record<string,unknown>).legacy,{unknown:0});
});
test("samtidige klienter får én bekreftet mutasjon, ikke overskriving",async()=>{
 const created=await fixture("cas");data(await as("player",()=>actions.startSession(created.id)));const current=await row(created.id);
 const command={sessionId:created.id,action:"PAUSE",expectedUpdatedAt:current.updatedAt.toISOString()};const results=await Promise.all(["a","b"].map(suffix=>as("player",()=>life.mutateSessionExecution({...command,requestId:`${prefix}-cas-${suffix}`}))));assert.equal(results.filter(r=>r.ok).length,1);assert.equal(readSessionExecution((await row(created.id)).liveSnapshot)?.events.length,1);
});
test("avbrutt beholder kjente 45/0/null, ingen gjenåpning eller sletting av logg",async()=>{
 for(const actualMinutes of [45,0,null]){const created=await fixture(`abort-${actualMinutes}`,{actualMinutes});data(await as("player",()=>actions.startSession(created.id)));data(await mutate(created.id,"ABORT",{reason:"Syntetisk avbrudd"}));const aborted=await row(created.id);assert.equal(aborted.status,"ABANDONED");assert.equal(aborted.actualMinutes,actualMinutes);assert.equal((await mutate(created.id,"RESUME")).ok,false);assert.equal((await as("player",()=>actions.deleteSession(created.id))).ok,false);assert.equal((await as("player",()=>actions.removeDrill({sessionId:created.id,drillId:`${created.id}-drill`}))).ok,false);assert.equal(await db.workbenchSession.count({where:{id:created.id}}),1);}
});
test("trygt utkast kan slettes, mens registrert gjennomføring bevares",async()=>{
 const draft=await fixture("draft-delete",{status:"DRAFT"});data(await as("player",()=>actions.deleteSession(draft.id)));assert.equal(await db.workbenchSession.count({where:{id:draft.id}}),0);
 const recorded=await fixture("recorded-delete",{status:"COMPLETED",actualMinutes:0});assert.equal((await as("player",()=>actions.deleteSession(recorded.id))).ok,false);assert.equal(await db.workbenchSession.count({where:{id:recorded.id}}),1);
});
test("eier og aktuell coach, fremmed coach/foresatt/minor og master/pending/skjult/malgrenser",async()=>{
 const created=await fixture("scope");for(const actor of ["foreign","parent"]){assert.equal((await as(actor,()=>life.loadSessionExecution(created.id))).ok,false);assert.equal((await as(actor,()=>life.mutateSessionExecution({sessionId:created.id,action:"RECORD",outcome:"COMPLETED",actualMinutes:0,reason:"Syntetisk",expectedUpdatedAt:created.updatedAt.toISOString(),requestId:`${prefix}-scope-${actor}`}))).ok,false);}
 assert.equal((await as("coach",()=>life.loadSessionExecution(created.id))).ok,true);
 await db.user.update({where:{id:created.playerId},data:{requiresGuardianConsent:true,guardianConsentGivenAt:null}});await assert.rejects(as("player",()=>life.loadSessionExecution(created.id)),/samtykke/);await db.user.update({where:{id:created.playerId},data:{requiresGuardianConsent:false}});
 for(const patch of [{needsPlayerApproval:true},{hiddenByPlayer:true},{approvalStatus:"REJECTED"},{isTemplate:true}]){const hidden=await fixture(`guard-${Object.keys(patch)[0]}`,patch);assert.equal((await as("player",()=>life.mutateSessionExecution({sessionId:hidden.id,action:"RECORD",outcome:"COMPLETED",reason:"Syntetisk",expectedUpdatedAt:hidden.updatedAt.toISOString(),requestId:`${prefix}-guard-${Object.keys(patch)[0]}`}))).ok,false);}
});
test("fremtid og ukjente JSON-versjoner avvises; avslutning fra eldre klient sletter ikke råsnapshot",async()=>{
 const future=await fixture("future",{date:new Date("2099-01-01T00:00:00Z")});assert.equal((await mutate(future.id,"RECORD",{outcome:"COMPLETED",actualMinutes:0,reason:"Syntetisk"})).ok,false);
 const unknown=await fixture("unknown",{status:"IN_PROGRESS",liveSnapshot:{execution:{version:7},opaque:{keep:true}}});const original=unknown.liveSnapshot;assert.equal((await mutate(unknown.id,"PAUSE")).ok,false);assert.deepEqual((await row(unknown.id)).liveSnapshot,original);
 const legacy=await fixture("legacy",{status:"IN_PROGRESS",liveSnapshot:{totalSec:45,drills:[{drillId:"old-drill",reps:0,extra:{keep:true}}],legacy:{keep:true}}});data(await as("player",()=>actions.completeSession(legacy.id)));assert.deepEqual(((await row(legacy.id)).liveSnapshot as Record<string,unknown>).legacy,{keep:true});
});
