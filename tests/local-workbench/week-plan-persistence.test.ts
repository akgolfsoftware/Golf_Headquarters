/** Real local Postgres + GoTrue + application auth guards. Only Next's request
 * cookie storage, redirect throws and cache invalidation are supplied outside its HTTP runtime.
 * This is not hosted RLS policy or visual acceptance evidence.
 */
import assert from 'node:assert/strict';
import { before, after, mock, test } from 'node:test';
import { AsyncLocalStorage } from 'node:async_hooks';
import { randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import pg from 'pg';
import { createClient, type User as AuthUser, type UserResponse, type AuthTokenResponsePassword, type SupabaseClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { tommeUkeplandetaljer, isoUkeIdentitet } from '../../src/lib/workbench/ukeplan-schema';

type Cookie = { name: string; value: string };
const request = new AsyncLocalStorage<Cookie[]>();
const sessions = new Map<string, Cookie[]>();
const actors = new Map<string, string>();
const invalidated = new Set<string>();
const PREFIX = 'local-workbench-20261002';
const YEAR = 2027;
const WEEK = 1;
let db: typeof import('../../src/lib/prisma').prisma;
let wb: typeof import('../../src/lib/workbench/wb-actions');
let ownSeason: string;
let foreignSeason: string;
mock.module('next/headers', { namedExports: { cookies: async () => ({
  getAll: () => request.getStore() ?? [],
  set: (name: string, value: string) => {
    const cookies = request.getStore();
    if (!cookies) return;
    const previous = cookies.find(c => c.name === name);
    if (previous) previous.value = value; else cookies.push({ name, value });
  },
}) } });
mock.module('next/navigation', { namedExports: { redirect: (path: string) => { throw new Error(`NEXT_REDIRECT;${path}`); }, notFound: () => { throw new Error('NEXT_NOT_FOUND'); } } });
mock.module('next/cache', { namedExports: { revalidatePath: (path: string) => invalidated.add(path) } });
function as<T>(actor: string, action: () => Promise<T>): Promise<T> { return request.run(sessions.get(actor) ?? [], action); }
function data<T>(result: {ok:true;data:T}|{ok:false;error:string}): T {
  assert.equal(result.ok,true,result.ok ? undefined : result.error);
  if (!result.ok) throw new Error('Operation rejected'); return result.data;
}
function input() { return {playerId: actors.get('P01')!, isoYear:YEAR, weekNumber:WEEK}; }
function details() {
  const result=tommeUkeplandetaljer(); result.weekType='spesial'; result.location='Syntetisk treningssted';
  result.areas.SLAG={priority:'UTVIKLE',focus:'Syntetisk uke-fokus',sessionBudget:3}; return result;
}
async function row() { return db.weekPlan.findUniqueOrThrow({where:{playerId_isoYear_weekNumber:input()}}); }
before(async()=>{
  const url=new URL(process.env.DATABASE_URL!);
  assert.equal(process.env.LOCAL_WORKBENCH_PROJECT,'ak-hq-workbench-20261002');
  assert.equal(url.hostname,'127.0.0.1');assert.equal(url.port,'55722');
  assert.equal(process.env.NEXT_PUBLIC_SUPABASE_URL,'http://127.0.0.1:55721');
  const sql=new pg.Pool({connectionString:url.toString()});
  try {
    const identity=await sql.query("SELECT shobj_description(oid,'pg_database') AS identity FROM pg_database WHERE datname=current_database()");
    assert.equal(identity.rows[0].identity,'ak-hq-workbench-20261002');
    const column=await sql.query("SELECT data_type,is_nullable FROM information_schema.columns WHERE table_schema='public' AND table_name='week_plans' AND column_name='planningDetails'");
    assert.deepEqual(column.rows,[{data_type:'jsonb',is_nullable:'YES'}]);
  } finally {await sql.end();}
  db=(await import('../../src/lib/prisma')).prisma;
  const admin=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}});
  const listed=await admin.auth.admin.listUsers();assert.equal(listed.error,null);
  const credentials: Record<string,string>={};
  for(const [key,role] of [['COACH_A','COACH'],['COACH_B','COACH'],['P01','PLAYER'],['P02','PLAYER']] as const){
    const email=`${PREFIX}-${key.toLowerCase()}@akgolf.test`;const password=randomBytes(24).toString('base64url');
    const old: AuthUser | undefined=listed.data.users.find(u=>u.email===email);
    const created: UserResponse=old ? await admin.auth.admin.updateUserById(old.id,{password}) : await admin.auth.admin.createUser({email,password,email_confirm:true});
    assert.equal(created.error,null,'Synthetic Auth provisioning failed');assert.ok(created.data.user);
    const user=await db.user.upsert({where:{email},create:{id:`${PREFIX}-${key.toLowerCase()}`,authId:created.data.user.id,email,name:`Syntetisk ${key}`,role,tier:'PRO',dateOfBirth:new Date('2000-01-01T00:00:00Z'),requiresGuardianConsent:false,trialEndsAt:new Date('2040-01-01T00:00:00Z'),preferences:{onboarding:{stepCompleted:7}}},update:{authId:created.data.user.id}});
    actors.set(key,user.id);const cookies:Cookie[]=[];
    const auth: Pick<SupabaseClient, 'auth'>=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{cookies:{getAll:()=>cookies,setAll:all=>{cookies.splice(0,cookies.length,...all.map(c=>({name:c.name,value:c.value})));}}});
    const login: AuthTokenResponsePassword=await auth.auth.signInWithPassword({email,password});assert.equal(login.error,null,'Real local Auth sign-in failed');
    const verified: UserResponse=await auth.auth.getUser();assert.equal(verified.data.user?.id,created.data.user.id);
    sessions.set(key,cookies);
    credentials[`LOCAL_${key}_EMAIL`]=email;credentials[`LOCAL_${key}_PASSWORD`]=password;credentials[`LOCAL_${key}_ID`]=user.id;
  }
  writeFileSync('.codex/environments/workbench/.env.users',Object.entries(credentials).map(([k,v])=>`${k}=${v}`).join('\n')+'\n',{mode:0o600});
  for(const [key,coach,player] of [['a','COACH_A','P01'],['b','COACH_B','P02']] as const){
    const id=`${PREFIX}-group-${key}`;
    await db.group.upsert({where:{id},create:{id,name:'Syntetisk testgruppe',slug:id,managedByAkGolf:true,coachId:actors.get(coach)!},update:{}});
    await db.groupMember.upsert({where:{groupId_userId:{groupId:id,userId:actors.get(player)!}},create:{groupId:id,userId:actors.get(player)!,role:'PLAYER'},update:{endedAt:null}});
  }
  for(const key of ['P01','P02']){
    const season=await db.seasonPlan.upsert({where:{userId_year:{userId:actors.get(key)!,year:2026}},create:{userId:actors.get(key)!,year:2026,startDate:new Date('2026-08-01T00:00:00Z'),endDate:new Date('2027-07-31T00:00:00Z'),name:'Syntetisk sesong over årsskifte'},update:{}});
    if(key==='P01')ownSeason=season.id;else foreignSeason=season.id;
  }
  await db.weekPlan.deleteMany({where:{playerId:actors.get('P01')!,isoYear:YEAR,weekNumber:{in:[1,2,53]}}});
  wb=await import('../../src/lib/workbench/wb-actions');
});
after(async()=>{if(db)await db.$disconnect();});
test('trener lagrer detaljer med SQL JSONB og gjenleser samme rad',async()=>{
 const saved=data(await as('COACH_A',()=>wb.saveWeekPlan({...input(),planningDetails:details(),plannedHoursSlag:2,repTargetDry:0})));
 assert.deepEqual(saved.planningDetails,details());assert.deepEqual((await row()).planningDetails,details());assert.equal((await row()).repTargetDry,0);
 assert.equal((await row()).seasonPlanId,ownSeason);
});
test('spillerens og trenerens vanlige lesesti bruker ekte lokal Auth og samme ukeplan',async()=>{
 for(const actor of ['COACH_A','P01']){
 const loaded=data(await as(actor,()=>wb.loadWeek({playerId:actors.get('P01')!,weekStart:'2027-01-04',mode:{kind:'PLAYER',subjectId:actors.get('P01')!,sources:[]}})));
 assert.deepEqual(loaded.weekPlan?.planningDetails,details());assert.equal(loaded.weekPlan?.isoYear,2027);
 }
});
test('endring lagres på samme rad uten å endre eldre budsjett og null skiller fra nullstilt JSON',async()=>{
 const previous=await row();const changed=details();changed.location=null;changed.areas.SLAG.focus='Endret syntetisk fokus';
 data(await as('P01',()=>wb.saveWeekPlan({...input(),planningDetails:changed})));
 const stored=await row();assert.equal(stored.id,previous.id);assert.equal(stored.plannedHoursSlag,2);assert.deepEqual(stored.planningDetails,changed);
});
test('utelatt og eksplisitt undefined beholdes mens null tømmer SQL-kolonnen',async()=>{
 const before=await row();
 data(await as('COACH_A',()=>wb.saveWeekPlan({...input(),customNotes:'Syntetisk merknad'})));assert.deepEqual((await row()).planningDetails,before.planningDetails);
 data(await as('COACH_A',()=>wb.saveWeekPlan({...input(),planningDetails:undefined})));assert.deepEqual((await row()).planningDetails,before.planningDetails);
 data(await as('P01',()=>wb.saveWeekPlan({...input(),planningDetails:null,plannedHoursSlag:null,repTargetDry:null})));
 const stored=await row();assert.equal(stored.planningDetails,null);assert.equal(stored.plannedHoursSlag,null);assert.equal(stored.repTargetDry,null);
 const sql=await db.$queryRaw<Array<{sqlNull:boolean,jsonNull:boolean}>>`SELECT "planningDetails" IS NULL AS "sqlNull", "planningDetails" = 'null'::jsonb AS "jsonNull" FROM week_plans WHERE id=${stored.id}`;
 assert.deepEqual(sql,[{sqlNull:true,jsonNull:null}]);
});
test('fremmed trener og spiller avvises uten å endre raden',async()=>{
 const before=await row();for(const actor of ['COACH_B','P02']){
 assert.equal((await as(actor,()=>wb.saveWeekPlan({...input(),planningDetails:details()}))).ok,false);
 assert.equal((await as(actor,()=>wb.loadWeek({playerId:actors.get('P01')!,weekStart:'2027-01-04',mode:{kind:'PLAYER',subjectId:actors.get('P01')!,sources:[]}}))).ok,false);
 }assert.deepEqual(await row(),before);
});
test('uinnlogget forespørsel og falsk cookie avvises av ekte appvakt',async()=>{
 await assert.rejects(as('SIGNED_OUT',()=>wb.saveWeekPlan({...input(),planningDetails:details()})),/NEXT_REDIRECT/);
 const forged = sessions.get('P01')!.map(cookie => {
  const session = JSON.parse(Buffer.from(cookie.value.slice('base64-'.length), 'base64url').toString());
  const parts = session.access_token.split('.'); parts[2] = 'a'.repeat(parts[2].length); session.access_token = parts.join('.');
  return { name: cookie.name, value: 'base64-' + Buffer.from(JSON.stringify(session)).toString('base64url') };
 });
 await assert.rejects(request.run(forged,()=>wb.saveWeekPlan({...input(),planningDetails:details()})),/NEXT_REDIRECT/);
});
test('årsskifte kobler ISO 2027 uke 1 til sesongåret 2026 og leses fra desembermandag',async()=>{
 assert.deepEqual(isoUkeIdentitet('2026-12-28'),{isoYear:2026,weekNumber:53});
 data(await as('P01',()=>wb.saveWeekPlan({...input(),isoYear:2026,weekNumber:53,planningDetails:details()})));
 const loaded=data(await as('COACH_A',()=>wb.loadWeek({playerId:actors.get('P01')!,weekStart:'2027-01-01',mode:{kind:'PLAYER',subjectId:actors.get('P01')!,sources:[]}})));
 assert.equal(loaded.weekPlan?.isoYear,2026);assert.equal(loaded.weekPlan?.weekNumber,53);assert.equal(loaded.weekPlan?.seasonPlanId,ownSeason);
 assert.deepEqual(loaded.weekPlan?.planningDetails,details());
});
test('fremmed årsplan og ugyldig uke/JSON/budsjett avvises før skriving',async()=>{
 const before=await row();
 for(const patch of [{seasonPlanId:foreignSeason},{isoYear:2027,weekNumber:53},{planningDetails:{...details(),version:2}},{plannedHoursSlag:-1},{repTargetDry:1.5}]){
 assert.equal((await as('P01',()=>wb.saveWeekPlan({...input(),...patch} as Parameters<typeof wb.saveWeekPlan>[0]))).ok,false);
 }assert.deepEqual(await row(),before);
});
test('eksplisitt nullstilt årsplankobling beholdes ved eldre klient uten felt',async()=>{
 data(await as('P01',()=>wb.saveWeekPlan({...input(),seasonPlanId:null})));
 data(await as('COACH_A',()=>wb.saveWeekPlan({...input(),planningDetails:details()})));
 assert.equal((await row()).seasonPlanId,null);assert.ok(invalidated.has('/portal/planlegge/workbench'));
});

test('faktisk tidsbruk lagrer 0, bevarer undefined og nullstiller null med ekte lokal Auth',async()=>{
 const created=data(await as('COACH_A',()=>wb.createSession({playerId:actors.get('P01')!,date:'2026-10-01',startMinute:540,durationMinutes:30,title:'Syntetisk faktisk-tid-test',pyramid:'SLAG',drills:[]})));
 try {
  assert.equal((await db.workbenchSession.findUniqueOrThrow({where:{id:created.id}})).actualMinutes,null);
  // Gjennomføring registreres først når spilleren har en publisert økt.
  data(await as('COACH_A',()=>wb.publishSessions([created.id])));
  data(await as('P01',()=>wb.updateSessionEffort({sessionId:created.id,actualMinutes:0,perceivedEffort:1})));
  assert.equal((await db.workbenchSession.findUniqueOrThrow({where:{id:created.id}})).actualMinutes,0);
  data(await as('COACH_A',()=>wb.updateSessionEffort({sessionId:created.id,actualMinutes:undefined,perceivedEffort:4})));
  assert.equal((await db.workbenchSession.findUniqueOrThrow({where:{id:created.id}})).actualMinutes,0);
  data(await as('P01',()=>wb.updateSessionEffort({sessionId:created.id,actualMinutes:null,perceivedEffort:null})));
  const cleared=await db.workbenchSession.findUniqueOrThrow({where:{id:created.id}});assert.equal(cleared.actualMinutes,null);assert.equal(cleared.perceivedEffort,null);
  for(const actor of ['COACH_B','P02'])assert.equal((await as(actor,()=>wb.updateSessionEffort({sessionId:created.id,actualMinutes:15}))).ok,false);
  for(const actualMinutes of [-1,NaN,Infinity,0.5,1441])assert.equal((await as('P01',()=>wb.updateSessionEffort({sessionId:created.id,actualMinutes}))).ok,false);
  assert.deepEqual(await db.workbenchSession.findUniqueOrThrow({where:{id:created.id}}),cleared);
  data(await as('COACH_A',()=>wb.publishSessions([created.id])));
  data(await as('P01',()=>wb.completeSessionWithEffort({sessionId:created.id,actualMinutes:0,perceivedEffort:1})));
  const completed=await db.workbenchSession.findUniqueOrThrow({where:{id:created.id}});assert.equal(completed.actualMinutes,0);assert.equal(completed.status,'COMPLETED');
 } finally {await db.workbenchSession.deleteMany({where:{id:created.id}});}
});
