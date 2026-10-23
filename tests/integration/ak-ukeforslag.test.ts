/** Faktisk registrering, oppslag og samtidighet mot egen lokal testbase. */
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mock, test } from "node:test";
import { Client } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
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

  } finally {
    await db.$disconnect(); await sql.end(); await admin.query(`DROP SCHEMA "${schema}" CASCADE`); await admin.end();
  }
});
