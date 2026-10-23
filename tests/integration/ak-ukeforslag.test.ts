/** Faktisk registrering, oppslag og samtidighet mot egen lokal testbase. */
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mock, test } from "node:test";
import { Client } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "../../src/generated/prisma/client";
import { AK_PROFIL_VERSJON } from "../../src/lib/deling/ak-profil-regler";
const connection = process.env.COACH_LOCK_TEST_DATABASE_URL;
if (!connection) throw Error("Eksplisitt lokal COACH_LOCK_TEST_DATABASE_URL kreves");
const target = new URL(connection);
if (target.hostname !== "127.0.0.1" || target.port !== "55922" || target.pathname !== "/coach_lock_tests") {
  throw Error("Bare egen lokal coach_lock_tests på 127.0.0.1:55922 er tillatt");
}
const schema = `ukegodkjenning_test_${randomUUID().replaceAll("-", "")}`;
const options = `-c search_path=${schema} -c application_name=${schema}`;
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: connection, options }, { schema }) });
// Same SQL projection/locks as production; only the upstream namespace is
// replaced by a controlled stand-in in this random local synthetic schema.
mock.module("../../src/lib/profil-kobling/niva-kilde", { namedExports: {
  nivaProfilFunksjon: Prisma.raw(`"${schema}".player_profile_for_user`),
  nivaKoblinger: Prisma.raw(`"${schema}".profile_links`),
} });
mock.module("../../src/lib/prisma", { namedExports: { prisma: db } });
let entryViewer={id:'coach-a',role:'COACH'};
mock.module("../../src/lib/auth/requirePortalUser",{namedExports:{requirePortalUser:async()=>entryViewer}});
mock.module("next/cache",{namedExports:{revalidatePath:()=>undefined}});
mock.module("next/navigation",{namedExports:{redirect:()=>{throw Error('synthetic-redirect');}}});


test("Ukeforslag: atomisk plan, V2 og beslutningsspor", async t => {
  const admin = new Client({ connectionString: connection });
  const sql = new Client({ connectionString: connection, options });
  await admin.connect(); await admin.query(`CREATE SCHEMA "${schema}"`); await sql.connect();
  try {
    await sql.query(`CREATE TYPE "UserRole" AS ENUM ('PLAYER', 'COACH', 'ADMIN', 'PARENT');
      CREATE TYPE "PlayerProgram" AS ENUM ('AK_ACADEMY', 'WANG_TOPPIDRETT', 'WANG_UNG');
      CREATE TABLE users (id text PRIMARY KEY, name text DEFAULT 'Syntetisk spiller', role "UserRole" NOT NULL DEFAULT 'PLAYER', "deletedAt" timestamptz,
        "dateOfBirth" timestamptz DEFAULT '1984-01-01', "requiresGuardianConsent" boolean NOT NULL DEFAULT false);
      CREATE TABLE groups (id text PRIMARY KEY, name text NOT NULL, "coachId" text, "managedByAkGolf" boolean NOT NULL DEFAULT true,
        "arkivertAt" timestamptz, program "PlayerProgram", slug text);
      CREATE TABLE group_members (id text PRIMARY KEY, "groupId" text REFERENCES groups(id), "userId" text REFERENCES users(id),
        role text NOT NULL DEFAULT 'PLAYER', "endedAt" timestamptz);
      CREATE TABLE parent_relations (id text PRIMARY KEY, "parentId" text, "childId" text, approved boolean);
      CREATE TABLE delings_samtykker (id text PRIMARY KEY, "userId" text NOT NULL, scope text NOT NULL,
        "mottakerGruppeId" text NOT NULL, "mottakerUserId" text, gitt boolean NOT NULL, "tekstVersjon" text NOT NULL,
        "gittAvUserId" text NOT NULL, "gittAvRolle" text NOT NULL, "createdAt" timestamptz NOT NULL DEFAULT now());
      CREATE TABLE audit_logs (id text PRIMARY KEY, "actorId" text, action text NOT NULL, target text, metadata jsonb, "createdAt" timestamptz NOT NULL DEFAULT now());
      CREATE TABLE notifications (id text PRIMARY KEY, "userId" text REFERENCES users(id), type text NOT NULL, title text NOT NULL,
        body text, link text, "readAt" timestamptz, "groupKey" text, count integer NOT NULL DEFAULT 1, "createdAt" timestamptz DEFAULT now());
      INSERT INTO users (id, role) VALUES ('coach-a','COACH'), ('coach-b','COACH'), ('assistant','COACH'), ('admin','ADMIN'), ('parent','PARENT');
      INSERT INTO users (id) VALUES ('p'), ('child'), ('private');
      UPDATE users SET "dateOfBirth" = '2013-01-01' WHERE id = 'child';
      INSERT INTO groups (id, name, "coachId") VALUES ('a','Syntetisk A','coach-a'), ('b','Syntetisk B','coach-b'),
        ('wang','Syntetisk WANG','coach-a'), ('tn','Syntetisk TN','coach-a'), ('external','Syntetisk ekstern','coach-a');
      UPDATE groups SET program = 'WANG_TOPPIDRETT' WHERE id = 'wang';
      UPDATE groups SET slug = 'team-norway' WHERE id = 'tn';
      UPDATE groups SET "managedByAkGolf" = false WHERE id = 'external';
      INSERT INTO group_members (id, "groupId", "userId") VALUES ('pa','a','p'),('pb','b','p'),('ca','a','child'),
        ('pw','wang','p'),('pt','tn','p'),('pe','external','p');
      INSERT INTO group_members (id, "groupId", "userId", role) VALUES ('assistant-a','a','assistant','ASSISTANT');
      INSERT INTO parent_relations VALUES ('parent-child','parent','child',true);`);

    await sql.query(`ALTER TABLE users ADD COLUMN hcp double precision, ADD COLUMN preferences jsonb;
      CREATE TABLE training_plans (id text PRIMARY KEY, "userId" text, "createdById" text, "isActive" boolean,
        "startDate" timestamptz DEFAULT '2026-01-01', "endDate" timestamptz);
      CREATE TABLE season_plans (id text PRIMARY KEY, "userId" text, "startDate" timestamptz, "endDate" timestamptz);
      CREATE TABLE period_blocks (id text PRIMARY KEY, "seasonPlanId" text, "lPhase" text, "sourceGroupId" text,
        "startDate" timestamptz, "endDate" timestamptz, "weeklySessionBudget" jsonb, "axisMinutes" jsonb, "axisMinutesLight" jsonb);
      CREATE TABLE signals (id text PRIMARY KEY, "userId" text, kind text, value double precision, payload jsonb, "computedAt" timestamptz);
      CREATE TABLE tournament_entries (id text PRIMARY KEY, "userId" text, "tournamentId" text, "wagrPlanEventId" text,
        "manualDate" timestamptz, "entryStatus" text DEFAULT 'PLANNED', "withdrawnAt" timestamptz);
      CREATE TABLE tournaments (id text PRIMARY KEY, "startDate" timestamptz);
      CREATE TABLE wagr_plan_events (id text PRIMARY KEY, "startDate" date, "dateEstimated" boolean);
      CREATE TABLE training_sessions_v2 (id text PRIMARY KEY, "studentId" text, status text, "startTime" timestamptz);
      CREATE TABLE training_plan_sessions (id text PRIMARY KEY, "planId" text, "scheduledAt" timestamptz);
      CREATE TABLE month_plans (id text PRIMARY KEY, "userId" text, year integer, month integer);
      CREATE TABLE week_plans (id text PRIMARY KEY, "playerId" text, "isoYear" integer, "weekNumber" integer);
      INSERT INTO training_plans (id,"userId","createdById","isActive") VALUES ('plan','p','coach-a',true);
      INSERT INTO season_plans VALUES ('season','p','2026-01-01','2026-12-31');
      INSERT INTO period_blocks VALUES ('period','season','GRUNN','a','2026-10-01','2026-11-30','{"TEK":3}',NULL,NULL);
      INSERT INTO training_sessions_v2 VALUES ('done','p','COMPLETED','2026-10-22'),('planned','p','PLANNED','2026-10-23'),
        ('outside','private','COMPLETED','2026-10-22');
      INSERT INTO signals VALUES ('sg','p','SG_AREA',-1,'{"area":"PUTT"}','2026-10-22');`);

    await sql.query('DROP TABLE training_plan_sessions, training_sessions_v2');
    await sql.query(await readFile(new URL('../fixtures/coach-week-accept.sql',import.meta.url),'utf8'));
    await sql.query(`INSERT INTO exercise_definitions (id,name,"pyramidArea",source,"lPhases","updatedAt")
      VALUES ('drill','Syntetisk putting','TEK','SYSTEM',ARRAY['GRUNN']::"LPhase"[],now());
      UPDATE period_blocks SET "weeklySessionBudget"='{"TEK":1}' WHERE id='period';`);
    await sql.query(await readFile(new URL('../fixtures/coach-week-facilities.sql',import.meta.url),'utf8'));
    await sql.query(await readFile(new URL('../fixtures/coach-week-level.sql',import.meta.url),'utf8'));
    const { hentAkUkegrunnlag } = await import('../../src/lib/deling/ak-ukegrunnlag');
    const { behandleAkUkeforslag: behandle } = await import('../../src/lib/deling/ak-ukeforslag');
    const { settAkProfilValg: sett } = await import('../../src/lib/deling/ak-profil-valg');
    const jobb={gruppeId:'a',coachId:'coach-a'}, viewer={id:'coach-a',role:'COACH'};
    const valg=(gitt:boolean)=>sett({id:'p',role:'PLAYER'},'p',{gruppeId:'a',gitt,tekstVersjon:AK_PROFIL_VERSJON});
    await valg(true);
    const opprett=async(target=jobb)=>{
      const basis=await hentAkUkegrunnlag(target,'p','2026-10-26');assert.ok(basis);
      const revision=await sql.query(`SELECT xmin::text AS version FROM exercise_definitions WHERE id='drill'`);
      return db.planAction.create({data:{userId:'p',coachId:target.coachId,planId:'plan',agentName:'weekly-plan-proposals',
        actionType:'WEEKLY_PROPOSAL',status:'PENDING',suggestion:{versjon:1,deling:basis.deling,databevis:basis.databevis,
          tittel:'Syntetisk uke',forklaring:'Syntetisk test av planlegging',sessions:[{title:'Syntetisk putting',pyramidArea:'TEK',
            scheduledAt:'2026-10-27T16:00:00Z',durationMin:30,drills:[{exerciseId:'drill',exerciseRevisjon:revision.rows[0].version,minutter:30}]}]}}});
    };
    const reset=async()=>{
      await sql.query('DELETE FROM training_drills_v2; DELETE FROM training_sessions_v2; DELETE FROM session_drills; DELETE FROM training_plan_sessions; DELETE FROM agent_runs; DELETE FROM plan_actions; DELETE FROM notifications;');
    };
    const counts=async()=>({plan:await db.trainingPlanSession.count(),drills:await db.sessionDrill.count(),
      v2:await db.trainingSessionV2.count(),v2drills:await db.trainingDrillV2.count(),spor:await db.agentRun.count()});
    const empty={plan:0,drills:0,v2:0,v2drills:0,spor:0};
    await t.test('authorized approval creates canonical and mirrored sessions and one audit atomically',async()=>{
      const action=await opprett();assert.equal((await behandle(viewer,action.id,'ACCEPTED')).applied,true);
      assert.deepEqual(await counts(),{plan:1,drills:1,v2:1,v2drills:1,spor:1});
      const v2=await db.trainingSessionV2.findFirstOrThrow({select:{coachId:true,groupId:true,status:true}});
      assert.deepEqual(v2,{coachId:'coach-a',groupId:null,status:'PLANNED'});
      const drill=await db.trainingDrillV2.findFirstOrThrow({select:{durationMinutes:true,exerciseId:true}});
      assert.deepEqual(drill,{durationMinutes:30,exerciseId:'drill'});
      assert.equal((await db.planAction.findUniqueOrThrow({where:{id:action.id}})).decidedById,'coach-a');
    });
    await t.test('duplicate and concurrent approvals never repeat side effects',async()=>{
      await reset();const action=await opprett();
      const result=await Promise.all([behandle(viewer,action.id,'ACCEPTED'),behandle(viewer,action.id,'ACCEPTED')]);
      assert.equal(result.filter(r=>r.applied).length,1);assert.deepEqual(await counts(),{plan:1,drills:1,v2:1,v2drills:1,spor:1});
      assert.equal((await behandle(viewer,action.id,'ACCEPTED')).status,'UNCHANGED');
    });
    await t.test('mirror, status and audit failures roll back every side effect and preserve PENDING',async()=>{
      for(const table of ['training_drills_v2','plan_actions','agent_runs']) {
        await reset();const action=await opprett();
        await sql.query(`CREATE OR REPLACE FUNCTION fail_write() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic rollback'; END $$;
          CREATE TRIGGER fail_week BEFORE ${table==='plan_actions'?'UPDATE':'INSERT'} ON ${table} FOR EACH ROW EXECUTE FUNCTION fail_write();`);
        try {await assert.rejects(behandle(viewer,action.id,'ACCEPTED'));}
        finally {await sql.query(`DROP TRIGGER fail_week ON ${table}`);}
        assert.deepEqual(await counts(),empty);
        assert.equal((await db.planAction.findUniqueOrThrow({where:{id:action.id}})).status,'PENDING');
        assert.equal((await behandle(viewer,action.id,'ACCEPTED')).applied,true);
      }
    });
    await t.test('old schema, wrong coach, ADMIN bypass and player self-approval are denied',async()=>{
      await reset();const action=await opprett();
      for(const actor of [{id:'admin',role:'ADMIN'},{id:'coach-b',role:'COACH'},{id:'p',role:'PLAYER'}]) {
        await assert.rejects(behandle(actor,action.id,'ACCEPTED'),/forbidden/);
      }
      await db.planAction.update({where:{id:action.id},data:{suggestion:{tittel:'Legacy',sessions:[]}}});
      await assert.rejects(behandle(viewer,action.id,'ACCEPTED'),/forbidden/);assert.deepEqual(await counts(),empty);
    });
    await t.test('new consent after withdrawal cannot validate the old proposal',async()=>{
      await reset();const action=await opprett();await valg(false);await assert.rejects(behandle(viewer,action.id,'ACCEPTED'),/forbidden/);
      await valg(true);await assert.rejects(behandle(viewer,action.id,'ACCEPTED'),/forbidden/);assert.deepEqual(await counts(),empty);
    });
    await t.test('changed plan basis, month override and wrong budget stop approval',async()=>{
      await reset();let action=await opprett();
      await sql.query(`UPDATE period_blocks SET "weeklySessionBudget"='{"TEK":2}' WHERE id='period'`);
      await assert.rejects(behandle(viewer,action.id,'ACCEPTED'),/utdatert/);
      action=await opprett();await assert.rejects(behandle(viewer,action.id,'ACCEPTED'),/ukebudsjett/);
      await sql.query(`UPDATE period_blocks SET "weeklySessionBudget"='{"TEK":1}' WHERE id='period'; INSERT INTO month_plans VALUES ('month','p',2026,10);`);
      action=await opprett();await assert.rejects(behandle(viewer,action.id,'ACCEPTED'),/utdatert/);
      await sql.query(`DELETE FROM month_plans`);assert.deepEqual(await counts(),empty);
    });
    await t.test('wrong exercise ownership or area cannot fall back to a random drill',async()=>{
      for(const update of [`source='COACH',"createdBy"='coach-b'`,`"pyramidArea"='FYS'`,`"lPhases"=ARRAY['TURNERING']::"LPhase"[]`]) {
        await reset();const action=await opprett();await sql.query(`UPDATE exercise_definitions SET ${update} WHERE id='drill'`);
        await assert.rejects(behandle(viewer,action.id,'ACCEPTED'),/ugyldig-ukeovelse/);assert.deepEqual(await counts(),empty);
        await sql.query(`UPDATE exercise_definitions SET source='SYSTEM',"createdBy"=NULL,"pyramidArea"='TEK',"lPhases"=ARRAY['GRUNN']::"LPhase"[] WHERE id='drill'`);
      }
    });
    await t.test('rejection records one decision without sessions; changed plan does not prevent rejection',async()=>{
      await reset();const action=await opprett();await sql.query(`UPDATE period_blocks SET "axisMinutes"='{"TEK":90}'`);
      assert.equal((await behandle(viewer,action.id,'REJECTED','Syntetisk avslag')).status,'REJECTED');
      assert.deepEqual(await counts(),{...empty,spor:1});
      assert.equal((await behandle(viewer,action.id,'REJECTED')).status,'UNCHANGED');
    });
    await t.test('explicit information request is scoped, atomic and never changes training',async()=>{
      await reset();const action=await opprett();
      await behandle(viewer,action.id,'QUESTION','Syntetisk spørsmål');assert.equal(await db.notification.count(),1);
      assert.deepEqual(await counts(),empty);await valg(false);
      await assert.rejects(behandle(viewer,action.id,'QUESTION','Syntetisk spørsmål'),/forbidden/);
      assert.equal(await db.notification.count(),1);await valg(true);
    });
    await t.test('every action entry rejects retracted sharing, including legacy and notifications',async()=>{
      await reset();const action=await opprett();await valg(false);
      const {acceptPlanAction,rejectPlanAction}=await import('../../src/lib/agents/actions');
      const {godtaPlanAction,avvisPlanAction}=await import('../../src/app/admin/varsler/actions');
      const {approveRequestDetailed,declineRequestDetailed,requestMoreInfo}=await import('../../src/app/admin/(legacy)/approvals/actions');
      const {acceptAndApplyPlanAction}=await import('../../src/lib/agents/accept-plan-action');
      for(const call of [()=>acceptPlanAction(action.id),()=>rejectPlanAction(action.id),()=>godtaPlanAction(action.id),
        ()=>avvisPlanAction(action.id),()=>approveRequestDetailed(action.id),()=>declineRequestDetailed(action.id,'Syntetisk avslag'),
        ()=>requestMoreInfo(action.id,'Syntetisk spørsmål'),()=>acceptAndApplyPlanAction(action.id,undefined,viewer.id)]) {
        await assert.rejects(call,/forbidden/);
      }
      assert.deepEqual(await counts(),empty);assert.equal(await db.notification.count(),0);await valg(true);
    });
    await t.test('legacy detailed approval uses atomic path and records note without replacing evidence',async()=>{
      await reset();const action=await opprett();
      const {approveRequestDetailed}=await import('../../src/app/admin/(legacy)/approvals/actions');
      const {acceptAndApplyPlanAction}=await import('../../src/lib/agents/accept-plan-action');
      await assert.rejects(acceptAndApplyPlanAction(action.id,{changed:true},viewer.id),/forbidden/);
      await assert.rejects(approveRequestDetailed(action.id,'Syntetisk merknad'),/synthetic-redirect/);
      assert.deepEqual(await counts(),{plan:1,drills:1,v2:1,v2drills:1,spor:1});
      const current=await db.planAction.findUniqueOrThrow({where:{id:action.id}});
      assert.equal(current.decisionNote,'Syntetisk merknad');assert.deepEqual(current.suggestion,action.suggestion);
    });
    await t.test('generic executor cannot execute weekly proposals even when PROCESSING',async()=>{
      await reset();const action=await opprett();await db.planAction.update({where:{id:action.id},data:{status:'PROCESSING'}});
      const {executePlanAction}=await import('../../src/lib/agents/plan-action-executor');
      await assert.rejects(executePlanAction(action.id),/ukeforslag-krever-delt-godkjenning/);assert.deepEqual(await counts(),empty);
    });
    await t.test('responsible ADMIN requires same plan owner and current role, with no bypass',async()=>{
      await reset();await sql.query(`UPDATE groups SET "coachId"='admin' WHERE id='a'; UPDATE training_plans SET "createdById"='admin' WHERE id='plan';`);
      const job={gruppeId:'a',coachId:'admin'};
      let action=await opprett(job);assert.equal((await behandle({id:'admin',role:'ADMIN'},action.id,'ACCEPTED')).applied,true);
      await reset();action=await opprett(job);await sql.query(`UPDATE users SET role='PLAYER' WHERE id='admin'`);
      await assert.rejects(behandle({id:'admin',role:'ADMIN'},action.id,'ACCEPTED'),/forbidden/);assert.deepEqual(await counts(),empty);
      await sql.query(`UPDATE users SET role='ADMIN' WHERE id='admin'; UPDATE groups SET "coachId"='coach-a' WHERE id='a'; UPDATE training_plans SET "createdById"='coach-a' WHERE id='plan';`);
      entryViewer=viewer;
    });
    await t.test('routing changed while action lock is held is checked again before any write',async()=>{
      await reset();const action=await opprett();await sql.query('BEGIN');
      await sql.query(`UPDATE plan_actions SET "coachId"='coach-b' WHERE id=$1`,[action.id]);
      let done=false;const result=behandle(viewer,action.id,'ACCEPTED').finally(()=>{done=true;});
      const denied=assert.rejects(result,/forbidden/);
      try {await new Promise(r=>setTimeout(r,120));assert.equal(done,false);}
      finally {await sql.query('COMMIT');}
      await denied;assert.deepEqual(await counts(),empty);
    });
    await t.test('concurrent retraction waits for approval and blocks every subsequent decision',async()=>{
      await reset();const action=await opprett();await sql.query('BEGIN');
      await sql.query('SELECT id FROM plan_actions WHERE id=$1 FOR UPDATE',[action.id]);
      const pending=behandle(viewer,action.id,'ACCEPTED');
      // Wait until the decision is blocked on the row, after acquiring sharing locks.
      let blocked=false;
      for(let i=0;i<100;i++) {
        const lock=await admin.query(`SELECT 1 FROM pg_stat_activity WHERE application_name=$1 AND wait_event_type='Lock' AND query LIKE '%plan_actions%' AND query LIKE '%FOR UPDATE%'`,[schema]);
        if(lock.rowCount){blocked=true;break;} await new Promise(r=>setTimeout(r,10));
      }
      let revoked=false;const revoke=valg(false).then(r=>{revoked=true;return r;});
      try {assert.equal(blocked,true);await new Promise(r=>setTimeout(r,60));assert.equal(revoked,false);}
      finally {await sql.query('COMMIT');}
      assert.equal((await pending).applied,true);await revoke;
      await assert.rejects(behandle(viewer,action.id,'ACCEPTED'),/forbidden/);await valg(true);
    });

    await t.test('editing an exercise after proposal creation requires a new proposal',async()=>{
      await reset();const action=await opprett();
      await sql.query(`UPDATE exercise_definitions SET name='Endret syntetisk øvelse' WHERE id='drill'`);
      await assert.rejects(behandle(viewer,action.id,'ACCEPTED'),/ugyldig-ukeovelse/);assert.deepEqual(await counts(),empty);
    });


    const { hentAkUkeforslag: les } = await import('../../src/lib/deling/ak-ukeforslag-lesing');
    await t.test('reading returns only the authorized display payload and consistent totals',async()=>{
      await reset();const action=await opprett();const r=await les(viewer);
      assert.equal(r.pendingCount,1);assert.deepEqual(r.planActions.map(a=>a.id),[action.id]);
      const json=JSON.stringify(r);for(const key of ['fingeravtrykk','databevis','tekstVersjon','exerciseRevisjon','deling']) assert.equal(json.includes(key),false);
      const count=await les(viewer,{maksRader:0});assert.equal(count.pendingCount,1);assert.deepEqual(count.planActions,[]);
      assert.ok(count.eldstePending);assert.deepEqual(await counts(),empty);
    });
    await t.test('old formats, wrong routing, malformed bodies and foreign plans never count',async()=>{
      await reset();const action=await opprett();
      const variants=[{suggestion:{}},{coachId:'coach-b'},{agentName:'other'},
        {suggestion:{...JSON.parse(JSON.stringify(action.suggestion)),extra:'malformed'}},
        {suggestion:{...JSON.parse(JSON.stringify(action.suggestion)),databevis:{versjon:1,uke:'2026-10-26',planId:'other',fingeravtrykk:'a'.repeat(64)}}}];
      for(const change of variants){await db.planAction.update({where:{id:action.id},data:change});assert.equal((await les(viewer)).pendingCount,0);
        await db.planAction.update({where:{id:action.id},data:{coachId:viewer.id,agentName:'weekly-plan-proposals',suggestion:action.suggestion!}});}
      await sql.query(`UPDATE training_plans SET "createdById"='coach-b' WHERE id='plan'`);
      assert.equal((await les(viewer)).pendingCount,0);
      await sql.query(`UPDATE training_plans SET "createdById"='coach-a' WHERE id='plan'`);
    });
    await t.test('no global ADMIN view or stale role; responsible ADMIN follows the same grant',async()=>{
      await reset();await opprett();
      for(const wrong of [{id:'coach-b',role:'COACH'},{id:'admin',role:'ADMIN'},{id:'assistant',role:'COACH'},{id:'p',role:'PLAYER'}]) assert.equal((await les(wrong)).pendingCount,0);
      await sql.query(`UPDATE users SET role='ADMIN' WHERE id='coach-a'`);
      await reset();await opprett();assert.equal((await les({...viewer,role:'ADMIN'})).pendingCount,1);
      await sql.query(`UPDATE users SET role='PLAYER' WHERE id='coach-a'`);assert.equal((await les({...viewer,role:'ADMIN'})).pendingCount,0);
      await sql.query(`UPDATE users SET role='COACH' WHERE id='coach-a'`);
    });
    await t.test('retraction and a subsequent new yes cannot revive an old queue item',async()=>{
      await reset();await opprett();await valg(false);assert.equal((await les(viewer)).pendingCount,0);
      await valg(true);assert.equal((await les(viewer)).pendingCount,0);
      const fresh=await opprett();assert.deepEqual((await les(viewer)).planActions.map(a=>a.id),[fresh.id]);
      await sql.query(`UPDATE group_members SET "endedAt"=now() WHERE id='pa'`);assert.equal((await les(viewer)).pendingCount,0);
      await sql.query(`UPDATE group_members SET "endedAt"=NULL WHERE id='pa'`);assert.equal((await les(viewer)).pendingCount,0);
    });
    await t.test('accepted history remains visible after its own training write but not after revoked sharing',async()=>{
      await reset();const action=await opprett();const since=new Date(Date.now()-60000);
      await behandle(viewer,action.id,'ACCEPTED');
      const r=await les(viewer,{status:['ACCEPTED'],godkjentAvViewerSiden:since});
      assert.equal(r.pendingCount,0);assert.equal(r.acceptedCount,1);assert.equal(r.accepted7d,1);assert.equal(r.godkjentAvViewer,1);assert.equal(r.planActions.length,1);
      assert.equal((await les(viewer,{status:'PENDING'})).planActions.length,0);
      assert.equal((await les(viewer,{status:['ACCEPTED'],endretSiden:new Date(Date.now()+60000)})).planActions.length,0);
      await valg(false);assert.equal((await les(viewer)).acceptedCount,0);await valg(true);
    });
    await t.test('paging counts all valid rows and selects oldest/newest after validation',async()=>{
      await reset();const basis=await opprett();await db.planAction.delete({where:{id:basis.id}});
      const rows=Array.from({length:205},(_,i)=>({id:`page-${String(i).padStart(3,'0')}`,userId:'p',coachId:'coach-a',planId:'plan',agentName:'weekly-plan-proposals',actionType:'WEEKLY_PROPOSAL',status:'PENDING',
        createdAt:new Date(Date.now()-(205-i)*60000),suggestion:i<102?{...JSON.parse(JSON.stringify(basis.suggestion)),extra:'malformed'}:basis.suggestion!}));
      await db.planAction.createMany({data:rows});
      const r=await les(viewer,{maksRader:2,rekkefolge:'eldst'});assert.equal(r.pendingCount,103);assert.deepEqual(r.planActions.map(a=>a.id),['page-102','page-103']);
      assert.equal(r.eldstePending?.createdAt.getTime(),rows[102].createdAt.getTime());
      assert.deepEqual((await les(viewer,{maksRader:2})).planActions.map(a=>a.id),['page-204','page-203']);
    });
    await t.test('retraction committed while reader waits for group lock is visible after waiting',async()=>{
      await reset();await opprett();await sql.query('BEGIN');
      await sql.query(`SELECT pg_advisory_xact_lock(hashtext('ak-gruppeanalyse'),hashtext('a'))`);
      const pending=les(viewer);let blocked=false;
      try {
        for(let i=0;i<100;i++){const lock=await admin.query(`SELECT 1 FROM pg_stat_activity WHERE application_name=$1 AND wait_event_type='Lock' AND query LIKE '%pg_advisory_xact_lock%'`,[schema]);
          if(lock.rowCount){blocked=true;break;}await new Promise(r=>setTimeout(r,10));}
        assert.equal(blocked,true);await sql.query(`UPDATE delings_samtykker SET gitt=false WHERE "userId"='p' AND "mottakerGruppeId"='a'`);
      } finally {await sql.query('COMMIT');}
      assert.equal((await pending).pendingCount,0);await valg(true);
    });
    await t.test('combined reader merges authorized families without counting legacy weekly proposals',async()=>{
      await reset();const action=await opprett();
      await db.planAction.create({data:{userId:'p',agentName:'weekly-plan-proposals',actionType:'WEEKLY_PROPOSAL',status:'PENDING',suggestion:{forklaring:'Gammelt syntetisk forslag'}}});
      const { hentAkDeltePlanforslag }=await import('../../src/lib/deling/ak-delte-planforslag');
      const r=await hentAkDeltePlanforslag(viewer);assert.equal(r.pendingCount,1);assert.deepEqual(r.planActions.map(a=>a.id),[action.id]);
      const older=new Date(Date.now()-60000);
      const observation=await db.planAction.create({data:{userId:'p',coachId:viewer.id,agentName:'training-gap',actionType:'COACH_REVIEW',status:'PENDING',createdAt:older,
        suggestion:{forklaring:'Syntetisk observasjon',deling:{gruppeId:'a',scope:'AK_GOLF_COACHINGPROFIL',tekstVersjon:AK_PROFIL_VERSJON}}}});
      const mixed=await hentAkDeltePlanforslag(viewer,{maksRader:1,rekkefolge:'eldst'});assert.equal(mixed.pendingCount,2);
      assert.deepEqual(mixed.planActions.map(a=>a.id),[observation.id]);assert.equal(mixed.eldstePending?.createdAt.getTime(),older.getTime());
      assert.deepEqual((await hentAkDeltePlanforslag(viewer,{maksRader:1})).planActions.map(a=>a.id),[action.id]);
      assert.equal((await hentAkDeltePlanforslag(viewer,{maksRader:0})).pendingCount,2);
      await valg(false);assert.equal((await hentAkDeltePlanforslag(viewer)).pendingCount,0);await valg(true);
    });


    const { akUkeforslagSchema } = await import('../../src/lib/deling/ak-ukeforslag-format');
    const { genererAkUkeforslag: generer } = await import('../../src/lib/deling/ak-ukeforslag-generering');
    const utkast=async()=>{
      const rev=await sql.query(`SELECT xmin::text AS version FROM exercise_definitions WHERE id='drill'`);
      return {tittel:'Syntetisk uke',forklaring:'Syntetisk konkret plan',sessions:[{title:'Syntetisk økt',pyramidArea:'TEK',
        scheduledAt:'2026-10-27T16:00:00Z',durationMin:30,drills:[{exerciseId:'drill',exerciseRevisjon:rev.rows[0].version,minutter:30}]}]};
    };
    await t.test('generator captures server evidence, passes only model fields and requires explicit approval',async()=>{
      await reset();const candidate=await utkast();
      const r=await generer(jobb,'p','2026-10-26',async input=>{
        assert.deepEqual(Object.keys(input).sort(),['category','categorySource','context','signals']);
        assert.deepEqual(Object.keys(input.context).sort(),['completedSessions','daysUntilTournament','sgWeaknesses']);
        assert.deepEqual(Object.keys(input.signals).sort(),['aktivFase','foretrukneDager','okterPerUke']);
        input.signals.aktivFase='TURNERING'; // cannot change the captured DB basis
        return candidate;
      });
      assert.equal(r.status,'OPPRETTET');assert.ok('id' in r);
      const action=await db.planAction.findUniqueOrThrow({where:{id:r.id}});
      assert.equal(action.userId,'p');assert.equal(action.coachId,'coach-a');assert.equal(action.planId,'plan');
      assert.deepEqual(await counts(),empty);
      assert.equal((await les(viewer)).pendingCount,1);
      assert.equal((await behandle(viewer,r.id,'ACCEPTED')).applied,true);
      assert.equal((await counts()).plan,1);
    });
    await t.test('generation and approval require all exercise capabilities at one player facility',async()=>{
      await reset();
      await sql.query(`UPDATE exercise_definitions SET "fasilitetKrav"=ARRAY['RADAR','DRIVING_RANGE']::"DrillFasilitet"[] WHERE id='drill'`);
      try {
        // Neither a missing profile, somebody else's place nor a union of places is evidence.
        const candidate=await utkast();
        await assert.rejects(generer(jobb,'p','2026-10-26',async()=>candidate),/mangler-ovelsesfasilitet/);
        await sql.query(`INSERT INTO player_facilities (id,"userId",name,notes,capabilities) VALUES
          ('foreign-f','private','Syntetisk annet sted','Syntetisk privat tekst',ARRAY['RADAR','DRIVING_RANGE']),
          ('f1','p','Syntetisk sted 1',NULL,ARRAY['RADAR']),('f2','p','Syntetisk sted 2',NULL,ARRAY['DRIVING_RANGE'])`);
        await assert.rejects(generer(jobb,'p','2026-10-26',async()=>candidate),/mangler-ovelsesfasilitet/);
        const action=await opprett();
        await assert.rejects(behandle(viewer,action.id,'ACCEPTED'),/mangler-ovelsesfasilitet/);
        assert.deepEqual(await counts(),empty);
        assert.equal((await db.planAction.findUniqueOrThrow({where:{id:action.id}})).status,'PENDING');
        await reset();
        await sql.query(`UPDATE player_facilities SET capabilities=ARRAY['RADAR','DRIVING_RANGE'] WHERE id='f1'`);
        const result=await generer(jobb,'p','2026-10-26',async()=>candidate);
        assert.equal(result.status,'OPPRETTET');assert.ok('id' in result);
        assert.equal((await behandle(viewer,result.id,'ACCEPTED')).applied,true);
      } finally {
        await reset();await sql.query(`DELETE FROM player_facilities; UPDATE exercise_definitions SET "fasilitetKrav"=ARRAY[]::"DrillFasilitet"[] WHERE id='drill'`);
      }
    });
    await t.test('facility change during planning or before approval makes the old proposal unusable',async()=>{
      await reset();
      await sql.query(`INSERT INTO player_facilities (id,"userId",name,capabilities) VALUES ('f','p','Syntetisk sted',ARRAY['RADAR'])`);
      try {
        const candidate=await utkast();
        const generated=await generer(jobb,'p','2026-10-26',async()=>{
          await sql.query(`UPDATE player_facilities SET capabilities=ARRAY['BUNKER'] WHERE id='f'`);return candidate;
        });
        assert.equal(generated.status,'UTDATERT');assert.equal(await db.planAction.count(),0);
        const action=await opprett();await sql.query(`DELETE FROM player_facilities WHERE id='f'`);
        await assert.rejects(behandle(viewer,action.id,'ACCEPTED'),/utdatert-ukegrunnlag/);assert.deepEqual(await counts(),empty);
      } finally {await reset();await sql.query(`DELETE FROM player_facilities`);}
    });
    await t.test('facility edit committed while approval waits is checked after the lock',async()=>{
      await reset();await sql.query(`INSERT INTO player_facilities (id,"userId",name,capabilities) VALUES ('f','p','Syntetisk sted',ARRAY['RADAR'])`);
      const action=await opprett();await sql.query('BEGIN');
      await sql.query(`UPDATE player_facilities SET capabilities=ARRAY['BUNKER'] WHERE id='f'`);
      const pending=behandle(viewer,action.id,'ACCEPTED');
      const denied=assert.rejects(pending,/utdatert-ukegrunnlag/);
      let blocked=false;
      try {
        for(let i=0;i<100;i++) {
          const lock=await admin.query(`SELECT 1 FROM pg_stat_activity WHERE application_name=$1 AND wait_event_type='Lock' AND query LIKE '%player_facilities%' AND query LIKE '%FOR SHARE%'`,[schema]);
          if(lock.rowCount){blocked=true;break;}await new Promise(r=>setTimeout(r,10));
        }
      } finally {await sql.query('COMMIT');}
      try {await denied;assert.equal(blocked,true);assert.deepEqual(await counts(),empty);}
      finally {await reset();await sql.query(`DELETE FROM player_facilities`);}
    });
    const aar=Number(new Intl.DateTimeFormat('en-GB',{year:'numeric',timeZone:'Europe/Oslo'}).format(new Date()));
    const nivaProfil=(score:number)=>({person:{name:'Syntetisk privat profilnavn'},turneringer:[{
      start_date:`${aar}-06-01`,year:aar,klasse:'G19',plassering:1,total_score:score,runder:[{runde:1,score}]}]});
    const settNiva=async(score:number)=>{
      await sql.query(`INSERT INTO profile_niva_fixture VALUES ('p',$1) ON CONFLICT(user_id) DO UPDATE SET profile=excluded.profile`,[JSON.stringify(nivaProfil(score))]);
    };
    const ryddNiva=async()=>{
      await reset();await sql.query(`DELETE FROM profile_links; DELETE FROM profile_niva_fixture;
        UPDATE exercise_definitions SET "minKategori"=NULL,"maxKategori"=NULL,"minHcp"=NULL,"maxHcp"=NULL WHERE id='drill'`);
    };
    await t.test('generation and approval both enforce declared level; unknown is not guessed',async()=>{
      await reset();await sql.query(`UPDATE exercise_definitions SET "minKategori"='D',"maxKategori"='D' WHERE id='drill'`);
      try {
        await assert.rejects(generer(jobb,'p','2026-10-26',utkast),/ovelse-passer-ikke-spillerniva/);
        let action=await opprett();await assert.rejects(behandle(viewer,action.id,'ACCEPTED'),/ovelse-passer-ikke-spillerniva/);
        assert.deepEqual(await counts(),empty);await reset();
        await sql.query(`INSERT INTO profile_links(hq_user_id,status) VALUES ('p','confirmed')`);await settNiva(70);
        await assert.rejects(generer(jobb,'p','2026-10-26',utkast),/ovelse-passer-ikke-spillerniva/);
        await settNiva(74);
        const result=await generer(jobb,'p','2026-10-26',async input=>{
          assert.equal(input.category,'D');assert.equal(input.categorySource,'BRUTTO_TURNERING');
          assert.ok(!JSON.stringify(input).includes('Syntetisk privat'));return utkast();
        });
        assert.equal(result.status,'OPPRETTET');assert.ok('id' in result);
        assert.equal((await behandle(viewer,result.id,'ACCEPTED')).applied,true);
        await reset();await sql.query(`UPDATE exercise_definitions SET "minHcp"=0 WHERE id='drill'`);
        action=await opprett();await assert.rejects(behandle(viewer,action.id,'ACCEPTED'),/ovelse-passer-ikke-spillerniva/);
        assert.deepEqual(await counts(),empty);
      } finally {await ryddNiva();}
    });
    await t.test('new results during planning and before approval invalidate the captured level',async()=>{
      await reset();await sql.query(`INSERT INTO profile_links(hq_user_id,status) VALUES ('p','confirmed')`);await settNiva(74);
      try {
        const result=await generer(jobb,'p','2026-10-26',async()=>{await settNiva(80);return utkast();});
        assert.equal(result.status,'UTDATERT');assert.equal(await db.planAction.count(),0);
        const action=await opprett();await settNiva(74);
        await assert.rejects(behandle(viewer,action.id,'ACCEPTED'),/utdatert-ukegrunnlag/);assert.deepEqual(await counts(),empty);
      } finally {await ryddNiva();}
    });
    await t.test('profile retraction committed while approval waits is checked after the lock',async()=>{
      await reset();await sql.query(`INSERT INTO profile_links(hq_user_id,status) VALUES ('p','confirmed')`);await settNiva(74);
      const action=await opprett();await sql.query('BEGIN');
      await sql.query(`UPDATE profile_links SET status='revoked' WHERE hq_user_id='p'`);
      const pending=behandle(viewer,action.id,'ACCEPTED');const denied=assert.rejects(pending,/utdatert-ukegrunnlag/);
      let blocked=false;
      try {
        for(let i=0;i<100;i++) {
          const lock=await admin.query(`SELECT 1 FROM pg_stat_activity WHERE application_name=$1 AND wait_event_type='Lock' AND query LIKE '%profile_links%' AND query LIKE '%FOR SHARE%'`,[schema]);
          if(lock.rowCount){blocked=true;break;}await new Promise(r=>setTimeout(r,10));
        }
      } finally {await sql.query('COMMIT');}
      try {await denied;assert.equal(blocked,true);assert.deepEqual(await counts(),empty);}
      finally {await ryddNiva();}
    });
    await t.test('mutable caller routing cannot change the captured recipient',async()=>{
      await reset();const candidate=await utkast();const request={...jobb};
      const r=await generer(request,'p','2026-10-26',async()=>{request.coachId='coach-b';request.gruppeId='b';return candidate;});
      assert.equal(r.status,'OPPRETTET');
      const saved=await db.planAction.findFirstOrThrow();assert.equal(saved.coachId,'coach-a');
      const body=JSON.parse(JSON.stringify(saved.suggestion));assert.equal(body.deling.gruppeId,'a');
    });
    await t.test('simultaneous generators create one pending proposal; retry does not upgrade it',async()=>{
      await reset();const candidate=await utkast();
      const results=await Promise.all([generer(jobb,'p','2026-10-26',async()=>candidate),generer(jobb,'p','2026-10-26',async()=>candidate)]);
      assert.deepEqual(results.map(r=>r.status).sort(),['FINNES','OPPRETTET']);
      assert.equal(await db.planAction.count(),1);
      const before=await db.planAction.findFirstOrThrow();
      assert.equal((await generer(jobb,'p','2026-10-26',async()=>({...candidate,tittel:'Et annet syntetisk forslag'}))).status,'FINNES');
      assert.deepEqual(await db.planAction.findFirstOrThrow(),before);
    });
    await t.test('renewal closes stale basis without changing old evidence, comments or training',async()=>{
      await reset();const old=await opprett();
      await db.planAction.update({where:{id:old.id},data:{decisionNote:'Syntetisk spørsmål',decidedById:viewer.id}});
      await sql.query(`UPDATE training_plans SET "isActive"=true WHERE id='plan'`);
      const fresh=await generer(jobb,'p','2026-10-26',utkast);
      assert.equal(fresh.status,'OPPRETTET');assert.ok('id' in fresh);assert.notEqual(fresh.id,old.id);
      assert.equal('erstattetAntall' in fresh && fresh.erstattetAntall,1);
      const saved=await db.planAction.findUniqueOrThrow({where:{id:old.id}});
      assert.equal(saved.status,'SUPERSEDED');assert.deepEqual(saved.suggestion,old.suggestion);
      assert.equal(saved.decisionNote,'Syntetisk spørsmål');assert.equal(saved.decidedById,viewer.id);assert.equal(saved.decidedAt,null);
      assert.equal((await behandle(viewer,old.id,'ACCEPTED')).status,'UNCHANGED');
      const queue=await les(viewer,{status:'PENDING'});assert.equal(queue.pendingCount,1);assert.equal(queue.planActions[0].id,fresh.id);
      assert.equal(queue.rejectedCount,0);assert.equal(queue.acceptedCount,0);assert.deepEqual(await counts(),empty);
      assert.equal((await les(viewer)).planActions.find(r=>r.id===old.id)?.status,'SUPERSEDED');
      const { eksporterEgneAkUkeforslag } = await import('../../src/lib/deling/ak-ukeforslag-personvern');
      assert.equal((await eksporterEgneAkUkeforslag('p')).mottatt.find(r=>r.id===old.id)?.status,'SUPERSEDED');
      assert.equal((await behandle(viewer,fresh.id,'ACCEPTED')).applied,true);
    });
    await t.test('revised exercises renew the proposal even with the same weekly data proof',async()=>{
      await reset();const old=await opprett();
      await sql.query(`UPDATE exercise_definitions SET name=name WHERE id='drill'`);
      const fresh=await generer(jobb,'p','2026-10-26',utkast);assert.equal(fresh.status,'OPPRETTET');
      assert.ok('id' in fresh);assert.equal((await db.planAction.findUniqueOrThrow({where:{id:old.id}})).status,'SUPERSEDED');
      assert.deepEqual(await counts(),empty);assert.equal((await behandle(viewer,fresh.id,'ACCEPTED')).applied,true);
    });
    await t.test('processing and malformed candidates stop renewal without closing any history',async()=>{
      for(const state of ['PROCESSING','MALFORMED']) {
        await reset();const old=await opprett();
        await db.planAction.update({where:{id:old.id},data:state==='PROCESSING'?{status:'PROCESSING'}:
          {suggestion:{...old.suggestion as object,sessions:[]}}});
        await sql.query(`UPDATE training_plans SET "isActive"=true WHERE id='plan'`);
        assert.equal((await generer(jobb,'p','2026-10-26',utkast)).status,state==='PROCESSING'?'BEHANDLES':'KREVER_GJENNOMGANG');
        assert.equal(await db.planAction.count(),1);
        assert.equal((await db.planAction.findUniqueOrThrow({where:{id:old.id}})).status,state==='PROCESSING'?'PROCESSING':'PENDING');
        assert.deepEqual(await counts(),empty);
      }
    });
    await t.test('failed replacement insert rolls back the old status; retry creates one replacement',async()=>{
      await reset();const old=await opprett();await sql.query(`UPDATE training_plans SET "isActive"=true WHERE id='plan'`);
      await sql.query(`CREATE OR REPLACE FUNCTION fail_write() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic rollback'; END $$;
        CREATE TRIGGER fail_renewal BEFORE INSERT ON plan_actions FOR EACH ROW EXECUTE FUNCTION fail_write();`);
      try{await assert.rejects(generer(jobb,'p','2026-10-26',utkast));}
      finally{await sql.query('DROP TRIGGER fail_renewal ON plan_actions');}
      assert.equal((await db.planAction.findUniqueOrThrow({where:{id:old.id}})).status,'PENDING');
      assert.equal(await db.planAction.count(),1);assert.deepEqual(await counts(),empty);
      assert.equal((await generer(jobb,'p','2026-10-26',utkast)).status,'OPPRETTET');
      assert.equal(await db.planAction.count({where:{status:'PENDING'}}),1);
    });
    await t.test('concurrent renewal creates one replacement and closes every stale pending duplicate',async()=>{
      await reset();await opprett();await opprett();await sql.query(`UPDATE training_plans SET "isActive"=true WHERE id='plan'`);
      const results=await Promise.all([generer(jobb,'p','2026-10-26',utkast),generer(jobb,'p','2026-10-26',utkast)]);
      assert.deepEqual(results.map(r=>r.status).sort(),['FINNES','OPPRETTET']);
      assert.equal(await db.planAction.count({where:{status:'PENDING'}}),1);
      assert.equal(await db.planAction.count({where:{status:'SUPERSEDED'}}),2);assert.deepEqual(await counts(),empty);
    });
    await t.test('an existing current draft remains unchanged while stale duplicates are closed',async()=>{
      await reset();const old=await opprett();await sql.query(`UPDATE training_plans SET "isActive"=true WHERE id='plan'`);
      const current=await opprett();const result=await generer(jobb,'p','2026-10-26',utkast);
      assert.deepEqual(result,{status:'FINNES',id:current.id});assert.equal(await db.planAction.count(),2);
      assert.equal((await db.planAction.findUniqueOrThrow({where:{id:old.id}})).status,'SUPERSEDED');
      assert.deepEqual((await db.planAction.findUniqueOrThrow({where:{id:current.id}})).suggestion,current.suggestion);
      assert.equal((await les(viewer)).pendingCount,1);assert.deepEqual(await counts(),empty);
    });
    await t.test('renewal never closes other weeks, recipients or historical sharing grants',async()=>{
      await reset();const previous=await opprett();await valg(false);await valg(true);
      const other=await opprett();await db.planAction.update({where:{id:other.id},data:{coachId:'coach-b'}});
      const later=await opprett();const parsed=akUkeforslagSchema.parse(later.suggestion);
      await db.planAction.update({where:{id:later.id},data:{suggestion:{...parsed,databevis:{...parsed.databevis,uke:'2026-11-02'}}}});
      const fresh=await generer(jobb,'p','2026-10-26',utkast);assert.equal(fresh.status,'OPPRETTET');
      for(const row of [previous,other,later]) assert.equal((await db.planAction.findUniqueOrThrow({where:{id:row.id}})).status,'PENDING');
      assert.equal(await db.planAction.count({where:{status:'SUPERSEDED'}}),0);assert.deepEqual(await counts(),empty);
    });
    await t.test('approval and renewal use plan before action so waiting on an action cannot deadlock',async()=>{
      await reset();const old=await opprett();await sql.query(`UPDATE training_plans SET "isActive"=true WHERE id='plan'`);
      await sql.query('BEGIN');await sql.query('SELECT id FROM plan_actions WHERE id=$1 FOR UPDATE',[old.id]);
      const approved=behandle(viewer,old.id,'ACCEPTED');const denied=assert.rejects(approved,/utdatert-ukegrunnlag/);
      let blocked=false;
      try {
        for(let i=0;i<100;i++) {
          const lock=await admin.query(`SELECT 1 FROM pg_stat_activity WHERE application_name=$1 AND wait_event_type='Lock' AND query LIKE '%plan_actions%' AND query LIKE '%FOR UPDATE%'`,[schema]);
          if(lock.rowCount){blocked=true;break;}await new Promise(r=>setTimeout(r,10));
        }
        assert.equal(blocked,true);
        await assert.rejects(admin.query(`SELECT id FROM "${schema}".training_plans WHERE id='plan' FOR UPDATE NOWAIT`),{code:'55P03'});
        const renewed=generer(jobb,'p','2026-10-26',utkast);
        // Attach rejection immediately; assert its outcome after releasing the lock.
        const result=renewed.then(value=>({value}),error=>({error}));
        let generatorBlocked=false;
        for(let i=0;i<100;i++) {
          const lock=await admin.query(`SELECT 1 FROM pg_stat_activity WHERE application_name=$1 AND wait_event_type='Lock'`,[schema]);
          if((lock.rowCount??0)>=2){generatorBlocked=true;break;}await new Promise(r=>setTimeout(r,10));
        }
        await sql.query('COMMIT');await denied;assert.equal(generatorBlocked,true);
        assert.equal(blocked,true);const outcome=await result;assert.ok('value' in outcome);
        assert.equal(outcome.value.status,'OPPRETTET');assert.deepEqual(await counts(),empty);
      } finally {await sql.query('ROLLBACK');}
    });
    await t.test('wrong coach or missing sharing never invokes the planner',async()=>{
      await reset();let called=0;const build=async()=>{called++;return utkast();};
      assert.equal((await generer({gruppeId:'a',coachId:'coach-b'},'p','2026-10-26',build)).status,'INGEN_GRUNNLAG');
      await valg(false);
      assert.equal((await generer(jobb,'p','2026-10-26',build)).status,'INGEN_GRUNNLAG');
      assert.equal(called,0);assert.equal(await db.planAction.count(),0);await valg(true);
    });
    await t.test('revoke and new yes during planner work invalidates captured evidence without holding locks',async()=>{
      await reset();const candidate=await utkast();
      const r=await generer(jobb,'p','2026-10-26',async()=>{await valg(false);await valg(true);return candidate;});
      assert.equal(r.status,'UTDATERT');assert.equal(await db.planAction.count(),0);
    });
    await t.test('plan edit during planner work is rejected even after restoring the same budget',async()=>{
      await reset();const candidate=await utkast();
      const r=await generer(jobb,'p','2026-10-26',async()=>{
        await sql.query(`UPDATE period_blocks SET "weeklySessionBudget"='{"TEK":2}' WHERE id='period'`);
        await sql.query(`UPDATE period_blocks SET "weeklySessionBudget"='{"TEK":1}' WHERE id='period'`);return candidate;
      });
      assert.equal(r.status,'UTDATERT');assert.equal(await db.planAction.count(),0);
    });
    await t.test('exercise edit during planner work rejects the old exercise version',async()=>{
      await reset();const candidate=await utkast();
      await assert.rejects(generer(jobb,'p','2026-10-26',async()=>{
        await sql.query(`UPDATE exercise_definitions SET name='Endret syntetisk øvelse' WHERE id='drill'`);return candidate;
      }),/ugyldig-ukeovelse/);
      assert.equal(await db.planAction.count(),0);
    });
    await t.test('server evidence cannot be supplied by planner; null and thrown errors create no fallback',async()=>{
      await reset();const candidate=await utkast();
      await assert.rejects(generer(jobb,'p','2026-10-26',async()=>({...candidate,deling:{}})));
      assert.equal((await generer(jobb,'p','2026-10-26',async()=>null)).status,'INGEN_UTKAST');
      await assert.rejects(generer(jobb,'p','2026-10-26',async()=>{throw Error('synthetic planner failure');}),/synthetic/);
      assert.equal(await db.planAction.count(),0);
    });
    await t.test('monthly and weekly overrides stop before planner work',async()=>{
      await reset();let called=0;const build=async()=>{called++;return utkast();};
      await sql.query(`INSERT INTO month_plans VALUES ('override','p',2026,10)`);
      assert.equal((await generer(jobb,'p','2026-10-26',build)).status,'INGEN_GRUNNLAG');
      await sql.query(`DELETE FROM month_plans WHERE id='override'; INSERT INTO week_plans VALUES ('override','p',2026,44)`);
      assert.equal((await generer(jobb,'p','2026-10-26',build)).status,'INGEN_GRUNNLAG');
      await sql.query(`DELETE FROM week_plans WHERE id='override'`);assert.equal(called,0);
    });
    await t.test('generator rejects mismatched budget and schedule before persistence',async()=>{
      await reset();const candidate=await utkast();
      await assert.rejects(generer(jobb,'p','2026-10-26',async()=>({...candidate,sessions:[candidate.sessions[0],
        {...candidate.sessions[0],scheduledAt:'2026-10-28T16:00:00Z'}]})),/ukebudsjett-avviker/);
      await assert.rejects(generer(jobb,'p','2026-10-26',async()=>({...candidate,sessions:[
        {...candidate.sessions[0],scheduledAt:'2026-11-02T16:00:00Z'}]})),/ugyldig-uketid/);
      assert.equal(await db.planAction.count(),0);
    });
    await t.test('queue write failure rolls back; no sessions or audit are created',async()=>{
      await reset();const candidate=await utkast();
      await sql.query(`CREATE FUNCTION fail_queue() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic queue failure'; END $$;
        CREATE TRIGGER fail_queue BEFORE INSERT ON plan_actions FOR EACH ROW EXECUTE FUNCTION fail_queue()`);
      try{await assert.rejects(generer(jobb,'p','2026-10-26',async()=>candidate));}
      finally{await sql.query('DROP TRIGGER fail_queue ON plan_actions; DROP FUNCTION fail_queue()');}
      assert.equal(await db.planAction.count(),0);assert.deepEqual(await counts(),empty);
    });


    const { eksporterEgneAkUkeforslag: eksporter, akUkeforslagForAnonymisering: slettWhere,
      akUkebeslutningerForAnonymisering: beslutningWhere } = await import('../../src/lib/deling/ak-ukeforslag-personvern');
    const anonymiserForslag=(konto:string)=>db.$transaction([
      db.planAction.deleteMany({where:slettWhere(konto)}),
      db.planAction.updateMany({where:beslutningWhere(konto),data:{decidedById:null,decisionNote:null,rejectReason:null}}),
    ]);
    await t.test('own export includes proposal and decision without internal evidence after sharing withdrawal',async()=>{
      await reset();const action=await opprett();await behandle(viewer,action.id,'REJECTED','Syntetisk beslutning');
      await valg(false);const data=await eksporter('p');assert.equal(data.mottatt.length,1);
      assert.equal(data.mottatt[0].innholdStatus,'INKLUDERT');assert.equal(data.mottatt[0].forslag?.uke,'2026-10-26');
      assert.equal(data.mottatt[0].avvisningsgrunn,'Syntetisk beslutning');
      assert.doesNotMatch(JSON.stringify(data),/fingeravtrykk|exerciseRevisjon|tekstVersjon|coach-a|gruppeId|databevis/);
      assert.equal((await eksporter('private')).mottatt.length,0);await valg(true);
    });
    await t.test('coach own decisions never read or export the player proposal',async()=>{
      await reset();const action=await opprett();await behandle(viewer,action.id,'REJECTED','Min syntetiske kommentar');
      const data=await eksporter('coach-a');assert.equal(data.mottatt.length,0);assert.equal(data.egneHandlinger.length,1);
      assert.equal(data.egneHandlinger[0].avvisningsgrunn,'Min syntetiske kommentar');
      assert.doesNotMatch(JSON.stringify(data),/Syntetisk putting|sessions|drill|spillerId|coachId|planId/);
      assert.equal((await eksporter('coach-b')).egneHandlinger.length,0);
    });
    await t.test('explicit question attributes its own comment without deciding or exposing player content',async()=>{
      await reset();const action=await opprett();await behandle(viewer,action.id,'QUESTION','Syntetisk spørsmål');
      const row=await db.planAction.findUniqueOrThrow({where:{id:action.id}});
      assert.equal(row.status,'PENDING');assert.equal(row.decidedAt,null);assert.equal(row.decidedById,'coach-a');
      const data=await eksporter('coach-a');assert.equal(data.egneHandlinger[0].beslutningskommentar,'Syntetisk spørsmål');
      assert.doesNotMatch(JSON.stringify(data.egneHandlinger),/sessions|Syntetisk putting|spillerId/);
    });
    await t.test('malformed and misbound own rows are visible as review items without raw historical payload',async()=>{
      await reset();const action=await opprett();
      await db.planAction.create({data:{userId:'p',agentName:'weekly-plan-proposals',actionType:'OTHER',suggestion:{raw:'SKJULT_SYNTETISK_PAYLOAD'}}});
      const source=JSON.parse(JSON.stringify(action.suggestion));source.deling.spillerId='private';
      await db.planAction.update({where:{id:action.id},data:{suggestion:source}});
      const data=await eksporter('p');assert.equal(data.mottatt.length,2);
      assert.ok(data.mottatt.every(r=>r.innholdStatus==='KREVER_MANUELL_GJENNOMGANG'&&r.forslag===null));
      assert.doesNotMatch(JSON.stringify(data),/SKJULT_SYNTETISK_PAYLOAD|Syntetisk putting|private/);
    });
    await t.test('account cleanup deletes own weekly family including legacy rows, retaining unrelated accounts and agents',async()=>{
      await reset();await opprett();
      await db.planAction.createMany({data:[
        {id:'old-week',userId:'p',agentName:'weekly-plan-proposals',actionType:'OTHER',suggestion:{raw:'synthetic'}},
        {id:'different-agent',userId:'p',agentName:'training-gap',actionType:'COACH_REVIEW',suggestion:{}},
        {id:'other-account',userId:'private',agentName:'weekly-plan-proposals',actionType:'WEEKLY_PROPOSAL',suggestion:{}},
      ]});
      await anonymiserForslag('p');assert.deepEqual((await db.planAction.findMany({orderBy:{id:'asc'},select:{id:true}})).map(r=>r.id),['different-agent','other-account']);
      await anonymiserForslag('p');assert.equal(await db.planAction.count(),2);
    });
    await t.test('coach cleanup removes assigned proposals and only its own decision fields on other proposals',async()=>{
      await reset();await opprett();
      await db.planAction.createMany({data:[
        {id:'actor-only',userId:'private',coachId:'coach-b',decidedById:'coach-a',decisionNote:'Egen kommentar',rejectReason:'Egen grunn',agentName:'weekly-plan-proposals',actionType:'WEEKLY_PROPOSAL',suggestion:{keep:'other-player-content'}},
        {id:'unrelated',userId:'private',coachId:'coach-b',decidedById:'coach-b',decisionNote:'Annen kommentar',agentName:'weekly-plan-proposals',actionType:'WEEKLY_PROPOSAL',suggestion:{}},
      ]});
      await anonymiserForslag('coach-a');assert.equal(await db.planAction.count(),2);
      const actor=await db.planAction.findUniqueOrThrow({where:{id:'actor-only'}});
      assert.equal(actor.decidedById,null);assert.equal(actor.decisionNote,null);assert.equal(actor.rejectReason,null);
      assert.deepEqual(actor.suggestion,{keep:'other-player-content'});
      assert.equal((await db.planAction.findUniqueOrThrow({where:{id:'unrelated'}})).decisionNote,'Annen kommentar');
    });
    await t.test('weekly cleanup is atomic with actor-field cleanup and can be retried',async()=>{
      await reset();await opprett();
      await db.planAction.create({data:{id:'actor-fail',userId:'private',coachId:'coach-b',decidedById:'coach-a',decisionNote:'Behold ved feil',agentName:'weekly-plan-proposals',actionType:'WEEKLY_PROPOSAL',suggestion:{}}});
      await sql.query(`CREATE FUNCTION fail_rights() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic cleanup failure'; END $$;
        CREATE TRIGGER fail_rights BEFORE UPDATE ON plan_actions FOR EACH ROW EXECUTE FUNCTION fail_rights()`);
      try{await assert.rejects(anonymiserForslag('coach-a'));assert.equal(await db.planAction.count(),2);}
      finally{await sql.query('DROP TRIGGER fail_rights ON plan_actions; DROP FUNCTION fail_rights()');}
      await anonymiserForslag('coach-a');assert.equal(await db.planAction.count(),1);
      assert.equal((await db.planAction.findUniqueOrThrow({where:{id:'actor-fail'}})).decisionNote,null);
    });

  } finally {
    await db.$disconnect(); await sql.end(); await admin.query(`DROP SCHEMA "${schema}" CASCADE`); await admin.end();
  }
});
