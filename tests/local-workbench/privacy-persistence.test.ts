/** Local-only synthetic GDPR persistence proof; external deletion is a deterministic stub. */
import assert from 'node:assert/strict';
import { before, beforeEach, after, mock, test } from 'node:test';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
const prefix='r16-local-personvern';const own=`${prefix}-p1`,foreign=`${prefix}-p2`;
const ownSecret='OWN_PRIVATE_SYNTHETIC',foreignSecret='FOREIGN_PRIVATE_SYNTHETIC';
let db:typeof import('../../src/lib/prisma').prisma;
let privacy:typeof import('../../src/lib/workbench/workbench-personvern');
let anon:typeof import('../../src/lib/gdpr/anonymiser-bruker');
let externalFail=false;let externalCalls=0;
mock.module('@/lib/gdpr/slett-eksterne-data',{namedExports:{slettEksterneBrukerdata:async(_id:string,opts?:{dryRun?:boolean})=>{
 if(!opts?.dryRun)externalCalls++;return{authSlettet:false,stripeKundeSlettet:false,storageFilerFjernet:0,bookingerGjestevasket:0,feil:externalFail?['Syntetisk ekstern feil']:[],dryRun:Boolean(opts?.dryRun),plan:['Ingen ekte eksterne handlinger']};
}}});
before(async()=>{
 const url=new URL(process.env.DATABASE_URL!);assert.equal(process.env.LOCAL_WORKBENCH_PROJECT,'ak-hq-workbench-20261002');assert.equal(url.hostname,'127.0.0.1');assert.equal(url.port,'55722');
 const sql=new pg.Pool({connectionString:url.toString()});try{const r=await sql.query("SELECT shobj_description(oid,'pg_database') AS identity FROM pg_database WHERE datname=current_database()");assert.equal(r.rows[0].identity,'ak-hq-workbench-20261002');}finally{await sql.end();}
 db=(await import('../../src/lib/prisma')).prisma;privacy=await import('../../src/lib/workbench/workbench-personvern');anon=await import('../../src/lib/gdpr/anonymiser-bruker');
});
after(async()=>{await db?.$disconnect();});
const date=new Date('2027-01-04T00:00:00Z');
async function fixture(){
 externalFail=false;externalCalls=0;
 await db.workbenchSession.deleteMany({where:{id:{startsWith:prefix}}});await db.workbenchPhysicalBlock.deleteMany({where:{id:{startsWith:prefix}}});await db.workbenchTournamentPlan.deleteMany({where:{id:{startsWith:prefix}}});await db.workbenchPlanConflict.deleteMany({where:{id:{startsWith:prefix}}});await db.weekPlan.deleteMany({where:{playerId:{in:[own,foreign]}}});await db.user.deleteMany({where:{id:{in:[own,foreign]}}});
 for(const [id,secret] of [[own,ownSecret],[foreign,foreignSecret]]){
  await db.user.create({data:{id,authId:randomUUID(),email:`${id}@example.invalid`,name:secret,role:'PLAYER'}});
  const season=await db.seasonPlan.create({data:{id:`${id}-season`,userId:id,year:2901,startDate:date,endDate:new Date('2027-12-31T00:00:00Z'),name:secret,notes:secret}});
  await db.periodBlock.create({data:{id:`${id}-period`,seasonPlanId:season.id,lPhase:'GRUNN',startDate:date,endDate:new Date('2027-02-01T00:00:00Z'),focus:secret,notes:secret,weeklyVolMin:120,weeklyVolMax:240,weeklySessionBudget:{FYS:0,TEK:4,unknown:secret}}});
  await db.tournamentEntry.create({data:{id:`${id}-entry`,userId:id,seasonPlanId:season.id,manualName:secret,category:secret,notes:secret,withdrawnReason:secret}});
  const formula={pyramid:'FYS',area:'STYRKE',label:secret,unknown:secret,detaljer:{mengde:{enhet:'SERIER',antall:0,reps:6,vektKg:60,rir:0,pauseSek:90,unknown:secret},mal:{notat:secret},sted:{hoved:'ANNET',delvalg:secret}}};
  await db.workbenchSession.create({data:{id:`${id}-session`,playerId:id,coachId:'syntetisk-coach',createdBy:'COACH',date,startMinute:600,durationMinutes:60,title:secret,pyramid:'FYS',actualMinutes:0,perceivedEffort:5,notes:secret,location:secret,rationale:secret,maalsetning:secret,liveSnapshot:{private:secret},
   ...(id===own?{groupId:`${prefix}-group`,sourceGroupSessionId:`${prefix}-master`}:{}),
   drills:{create:{id:`${id}-drill`,title:secret,description:secret,techniqueFocus:secret,durationMinutes:30,sortOrder:0,repAntall:30,repSett:4,repReps:6,akFormel:formula}}}});
  await db.workbenchPhysicalBlock.create({data:{id:`${id}-physical`,playerId:id,coachId:'syntetisk-coach',createdBy:'COACH',title:secret,focus:secret,notes:secret,startDate:date,endDate:date,weeks:{create:{id:`${id}-week`,weekIndex:0,weekStart:date,label:secret,notes:secret,plannedMinutes:60,targetTonnageKg:1440,readinessSummary:{private:secret},sessions:{create:{id:`${id}-physical-session`,playerId:id,date,title:secret,sortOrder:0,location:secret,playerNote:secret,durationMinutes:45,actualLoad:225,perceivedEffort:5,exercises:{create:{id:`${id}-exercise`,title:secret,note:secret,tempo:secret,sortOrder:0,setsTarget:4,repsMin:6,repsMax:8,weightKg:60,rirTarget:0,logs:{create:{id:`${id}-log`,playerId:id,setNumber:1,reps:6,weightKg:60,rir:0,note:secret}}}}}}}}}});
  await db.workbenchTournamentPlan.create({data:{id:`${id}-tournament`,playerId:id,coachId:'syntetisk-coach',createdBy:'COACH',title:secret,notes:secret,format:secret,startDate:date,endDate:date,preparations:{create:{id:`${id}-prep`,title:secret,date,category:'TEST',sortOrder:0,notes:secret}},rounds:{create:{id:`${id}-round`,roundNumber:1,date,startHole:secret,routine:secret,gamePlan:secret,notes:secret,source:secret,grossScore:72,strokesGained:1.5}},goals:{create:{id:`${id}-goal`,kind:'RESULTAT',title:secret,targetValue:72,unit:'SLAG',sortOrder:0}},evaluations:{create:{id:`${id}-evaluation`,createdBy:'syntetisk-coach',grossTotal:72,sgTotal:1.5,source:secret,summary:secret,learnings:secret,nextAction:secret}},conflicts:{create:{id:`${id}-conflict`,playerId:id,type:'OVERLAPP',title:secret,details:secret}}}});
  await db.weekPlan.create({data:{id:`${id}-weekplan`,playerId:id,isoYear:2901,weekNumber:1,customNotes:secret,plannedHoursFys:2.5,repTargetDry:40,repetitionTargets:{private:secret},planningDetails:{version:999,private:secret}}});
 }
 await db.workbenchTournamentGoal.create({data:{id:`${prefix}-unsafe-unit`,planId:`${own}-tournament`,kind:'RESULTAT',title:ownSecret,unit:ownSecret,targetValue:12,sortOrder:1}});
 await db.workbenchSession.create({data:{id:`${prefix}-master`,playerId:`${prefix}-group`,coachId:own,groupId:`${prefix}-group`,createdBy:'COACH',origin:'GROUP',date,startMinute:600,durationMinutes:60,title:foreignSecret,pyramid:'FYS',notes:foreignSecret}});
 // Avvikende relasjoner må ikke lekke en annen eiers personlige barn gjennom egen forelder.
 await db.workbenchPhysicalSession.create({data:{id:`${prefix}-foreign-child`,weekId:`${own}-week`,playerId:foreign,date,title:foreignSecret,playerNote:foreignSecret,sortOrder:1}});
 await db.workbenchPhysicalLog.create({data:{id:`${prefix}-foreign-log`,exerciseId:`${own}-exercise`,playerId:foreign,setNumber:2,note:foreignSecret,reps:99}});
 await db.workbenchPlanConflict.create({data:{id:`${prefix}-foreign-conflict`,playerId:foreign,tournamentPlanId:`${own}-tournament`,type:'OVERLAPP',title:foreignSecret,details:foreignSecret}});
}
beforeEach(fixture);
function withoutUpdatedAt(value:unknown):unknown{return JSON.parse(JSON.stringify(value,(key,v)=>key==='updatedAt'?undefined:v));}
async function snapshot(id:string){return{
 workbench:await privacy.eksporterWorkbenchData(id),season:await db.seasonPlan.findMany({where:{userId:id},include:{periodBlocks:true}}),entries:await db.tournamentEntry.findMany({where:{userId:id}}),week:await db.weekPlan.findMany({where:{playerId:id}}),
};}
test('innsyn viser bare egen gruppekopi og egne barn/logger/konflikter, aldri master eller fremmed eier',async()=>{
 const result=await privacy.eksporterWorkbenchData(own);assert.equal(result.sessions.length,1);assert.equal(result.sessions[0].sourceGroupSessionId,`${prefix}-master`);
 assert.equal(result.physicalBlocks[0].weeks[0].sessions.length,1);assert.equal(result.physicalBlocks[0].weeks[0].sessions[0].exercises[0].logs.length,1);
 assert.equal(result.tournamentPlans[0].conflicts.length,1);assert.equal(result.physicalLogs.length,1);assert.equal(result.conflicts.length,1);assert.doesNotMatch(JSON.stringify(result),new RegExp(foreignSecret));
});
test('ekte vask er eier-/relasjonsavgrenset, bevarer tall/dose/fagkoder og fjerner ukjent JSON idempotent',async()=>{
 const before=await snapshot(own),otherBefore=await snapshot(foreign);const masterBefore=await db.workbenchSession.findUniqueOrThrow({where:{id:`${prefix}-master`}});
 assert.ok(await privacy.anonymiserWorkbenchData(own)>10);const after=await snapshot(own);
 // Ukeplanene vaskes av kontoorkestratoren, ikke denne Workbench-hjelperen.
 const {week:_week,...washed}=after;assert.doesNotMatch(JSON.stringify(washed),new RegExp(ownSecret));
 assert.deepEqual(withoutUpdatedAt(await snapshot(foreign)),withoutUpdatedAt(otherBefore));assert.deepEqual(await db.workbenchSession.findUniqueOrThrow({where:{id:masterBefore.id}}),masterBefore);
 const session=after.workbench.sessions[0];assert.equal(session.actualMinutes,0);assert.equal(session.durationMinutes,60);assert.equal(session.perceivedEffort,5);assert.equal(session.liveSnapshot,null);
 assert.equal(session.drills[0].repAntall,30);assert.equal(session.drills[0].repSett,4);assert.deepEqual(session.drills[0].akFormel,{pyramid:'FYS',area:'STYRKE',label:'Anonymisert øvelse',detaljer:{mengde:{enhet:'SERIER',antall:0,reps:6,vektKg:60,rir:0,pauseSek:90}}});
 assert.equal(after.workbench.physicalBlocks[0].weeks[0].sessions[0].exercises[0].weightKg,60);assert.equal(after.workbench.physicalLogs[0].rir,0);assert.equal(after.workbench.tournamentPlans[0].rounds[0].grossScore,72);assert.equal(after.workbench.tournamentPlans[0].rounds[0].strokesGained,1.5);
 assert.equal(after.workbench.tournamentPlans[0].goals.find(g=>g.id===`${own}-goal`)?.unit,'SLAG');assert.equal(after.workbench.tournamentPlans[0].goals.find(g=>g.id===`${prefix}-unsafe-unit`)?.unit,null);
 assert.deepEqual(after.season[0].periodBlocks[0].weeklySessionBudget,{FYS:0,TEK:4});assert.equal(after.season[0].periodBlocks[0].weeklyVolMin,before.season[0].periodBlocks[0].weeklyVolMin);
 await privacy.anonymiserWorkbenchData(own);assert.deepEqual(withoutUpdatedAt(await snapshot(own)),withoutUpdatedAt(after));
 assert.equal((await db.workbenchPhysicalSession.findUniqueOrThrow({where:{id:`${prefix}-foreign-child`}})).playerNote,foreignSecret);assert.equal((await db.workbenchPhysicalLog.findUniqueOrThrow({where:{id:`${prefix}-foreign-log`}})).note,foreignSecret);
});
test('dryRun endrer ingen data; ekstern feil hindrer ferdigmarkering; retry vasker opaque uke-JSON og fullfører',async()=>{
 const before=await snapshot(own);const userBefore=await db.user.findUniqueOrThrow({where:{id:own}});const now=new Date('2026-10-02T12:00:00Z');
 const dry=await anon.anonymiserBruker(own,now,{dryRun:true});assert.equal(dry.dryRun,true);assert.deepEqual(await snapshot(own),before);assert.deepEqual(await db.user.findUniqueOrThrow({where:{id:own}}),userBefore);assert.equal(externalCalls,0);
 externalFail=true;await assert.rejects(()=>anon.anonymiserBruker(own,now),/Ekstern sletting/);assert.equal((await db.user.findUniqueOrThrow({where:{id:own}})).anonymisertAt,null);
 externalFail=false;const result=await anon.anonymiserBruker(own,now);assert.ok(result.vasket.workbench>10);assert.equal((await db.user.findUniqueOrThrow({where:{id:own}})).anonymisertAt?.toISOString(),now.toISOString());
 const plans=await db.weekPlan.findMany({where:{playerId:own}});assert.equal(plans[0].repetitionTargets,null);assert.equal(plans[0].planningDetails,null);assert.equal(plans[0].customNotes,null);assert.equal(plans[0].plannedHoursFys,2.5);assert.equal(plans[0].repTargetDry,40);
 const first=withoutUpdatedAt(await snapshot(own));await anon.anonymiserBruker(own,now);assert.deepEqual(withoutUpdatedAt(await snapshot(own)),first);assert.equal((await db.user.findUniqueOrThrow({where:{id:foreign}})).name,foreignSecret);
});
