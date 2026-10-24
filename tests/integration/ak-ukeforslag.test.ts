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
    const bankModul = await import('../../src/lib/masterbrain/drill-bank');
    const bankOriginal = bankModul.hentGodkjenteOvelsesbankElementer();
    let bankKilde = structuredClone(bankOriginal);
    mock.module('../../src/lib/masterbrain/drill-bank',{namedExports:{...bankModul,hentGodkjenteOvelsesbankElementer:()=>bankKilde}});

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
    await t.test('changed basis and unsupported month override stop approval; old advice must be renewed',async()=>{
      await reset();let action=await opprett();
      await sql.query(`UPDATE period_blocks SET "weeklySessionBudget"='{"TEK":2}' WHERE id='period'`);
      await assert.rejects(behandle(viewer,action.id,'ACCEPTED'),/utdatert/);
      action=await opprett();await assert.rejects(behandle(viewer,action.id,'ACCEPTED'),/utdatert-faglig-vurdering/);
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
    await t.test('interactive entries cannot report success for an already decided, replaced or processing week',async()=>{
      const {acceptPlanAction,rejectPlanAction}=await import('../../src/lib/agents/actions');
      const {godtaPlanAction,avvisPlanAction}=await import('../../src/app/admin/varsler/actions');
      const {approveRequestDetailed,declineRequestDetailed,requestMoreInfo}=await import('../../src/app/admin/(legacy)/approvals/actions');
      for(const status of ['ACCEPTED','REJECTED','SUPERSEDED','PROCESSING']) {
        await reset();const action=await opprett();await db.planAction.update({where:{id:action.id},data:{status}});
        const before=await db.planAction.findUniqueOrThrow({where:{id:action.id}});
        for(const call of [()=>acceptPlanAction(action.id),()=>rejectPlanAction(action.id),()=>godtaPlanAction(action.id),
          ()=>avvisPlanAction(action.id),()=>approveRequestDetailed(action.id,'Ny kommentar'),
          ()=>declineRequestDetailed(action.id,'Ikke nå'),()=>requestMoreInfo(action.id,'Et nytt spørsmål')]) {
          await assert.rejects(call,/allerede behandlet eller erstattet/);
        }
        assert.deepEqual(await db.planAction.findUniqueOrThrow({where:{id:action.id}}),before);
        assert.equal(await db.notification.count(),0);assert.deepEqual(await counts(),empty);
        assert.equal((await behandle(viewer,action.id,'ACCEPTED')).status,'UNCHANGED');
      }
    });
    await t.test('structured weekly receipts keep denied access private and record only one concurrent approval',async()=>{
      await reset();let action=await opprett();
      const {acceptPlanActionMedKvittering,rejectPlanActionMedKvittering}=await import('../../src/lib/agents/actions');
      await valg(false);
      await assert.rejects(()=>acceptPlanActionMedKvittering(action.id),/forbidden/);
      await assert.rejects(()=>rejectPlanActionMedKvittering(action.id),/forbidden/);
      assert.deepEqual(await counts(),empty);await valg(true);
      // A new grant must not revive the old proposal's captured sharing proof.
      await assert.rejects(()=>acceptPlanActionMedKvittering(action.id),/forbidden/);
      await reset();action=await opprett();
      const results=await Promise.all([acceptPlanActionMedKvittering(action.id),acceptPlanActionMedKvittering(action.id)]);
      assert.equal(results.filter(r=>r.ok).length,1);
      const unchanged=results.find(r=>!r.ok);assert.ok(unchanged && !unchanged.ok);
      assert.equal(unchanged.kode,'ALLEREDE_BEHANDLET');assert.equal(unchanged.oppdater,true);
      assert.deepEqual(await rejectPlanActionMedKvittering(action.id),unchanged);
      assert.deepEqual(await counts(),{plan:1,drills:1,v2:1,v2drills:1,spor:1});
    });
    await t.test('concurrent interactive approvals give one success and one unchanged error',async()=>{
      await reset();const action=await opprett();
      const {acceptPlanAction}=await import('../../src/lib/agents/actions');
      const {godtaPlanAction}=await import('../../src/app/admin/varsler/actions');
      const results=await Promise.allSettled([acceptPlanAction(action.id),godtaPlanAction(action.id)]);
      assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
      const failed=results.find(r=>r.status==='rejected');assert.ok(failed && failed.status==='rejected');
      assert.match(String(failed.reason),/allerede behandlet eller erstattet/);
      assert.deepEqual(await counts(),{plan:1,drills:1,v2:1,v2drills:1,spor:1});
    });
    await t.test('recorded weekly question has a distinct receipt while the proposal remains pending',async()=>{
      await reset();const action=await opprett();
      assert.deepEqual(await behandle(viewer,action.id,'QUESTION','Syntetisk spørsmål'),{status:'UNCHANGED',applied:false,questionRecorded:true});
      assert.equal((await db.planAction.findUniqueOrThrow({where:{id:action.id}})).status,'PENDING');
      assert.equal(await db.notification.count(),1);assert.deepEqual(await counts(),empty);
      const {requestMoreInfo}=await import('../../src/app/admin/(legacy)/approvals/actions');
      await requestMoreInfo(action.id,'Et annet uttrykkelig spørsmål');assert.equal(await db.notification.count(),2);
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
    await t.test('facility uncertainty is stored advice, never combined across places or hidden on approval',async()=>{
      await reset();
      await sql.query(`UPDATE exercise_definitions SET "fasilitetKrav"=ARRAY['RADAR','DRIVING_RANGE']::"DrillFasilitet"[] WHERE id='drill'`);
      try {
        const candidate=await utkast();
        for(const withPlaces of [false,true]) {
          if(withPlaces) await sql.query(`INSERT INTO player_facilities (id,"userId",name,notes,capabilities) VALUES
            ('foreign-f','private','Syntetisk annet sted','Syntetisk privat tekst',ARRAY['RADAR','DRIVING_RANGE']),
            ('f1','p','Syntetisk sted 1',NULL,ARRAY['RADAR']),('f2','p','Syntetisk sted 2',NULL,ARRAY['DRIVING_RANGE'])`);
          const result=await generer(jobb,'p','2026-10-26',async()=>candidate);assert.ok('id' in result);
          const body=JSON.parse(JSON.stringify((await db.planAction.findUniqueOrThrow({where:{id:result.id}})).suggestion));
          assert.deepEqual(body.fagligeRad,[{kode:'FASILITET_IKKE_BEKREFTET',oktIndeks:0,exerciseId:'drill'}]);
          assert.deepEqual(await counts(),empty);
          assert.equal((await behandle(viewer,result.id,'ACCEPTED')).applied,true);await reset();
        }
        const legacy=await opprett();
        await assert.rejects(behandle(viewer,legacy.id,'ACCEPTED'),/utdatert-faglig-vurdering/);
        assert.deepEqual(await counts(),empty);await reset();
        await sql.query(`UPDATE player_facilities SET capabilities=ARRAY['RADAR','DRIVING_RANGE'] WHERE id='f1'`);
        const result=await generer(jobb,'p','2026-10-26',async()=>candidate);assert.ok('id' in result);
        const body=JSON.parse(JSON.stringify((await db.planAction.findUniqueOrThrow({where:{id:result.id}})).suggestion));
        assert.deepEqual(body.fagligeRad,[]);
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
    await t.test('measured facilities stay local and invalid measurements cannot create a basis',async()=>{
      await reset();
      await sql.query(`INSERT INTO player_facilities (id,"userId",name,notes,capabilities,type,"isIndoor","rangeLengdeM","maksPuttLengdeM")
        VALUES ('f','p','Syntetisk privat sted','Syntetisk privat notat',ARRAY['PUTTING_GREEN_LANG'],'HJEMME',true,200,12)`);
      try {
        const { hentAkUkegrunnlag: hent }=await import('../../src/lib/deling/ak-ukegrunnlag');
        const basis=await hent(jobb,'p','2026-10-26');assert.ok(basis);
        assert.deepEqual(basis.fasiliteter,[{capabilities:['PUTTING_GREEN_LANG'],type:'HJEMME',isIndoor:true,rangeLengdeM:200,maksPuttLengdeM:12}]);
        for(const text of ['Syntetisk privat sted','Syntetisk privat notat']) assert.ok(!JSON.stringify(basis).includes(text));
        for(const field of ['capabilities','type','isIndoor','rangeLengdeM','maksPuttLengdeM']) assert.ok(!Object.hasOwn(basis.modell,field));
        assert.ok(!JSON.stringify(basis.modell).includes('HJEMME'));
        await sql.query(`UPDATE player_facilities SET "maksPuttLengdeM"=-1 WHERE id='f'`);
        assert.equal(await hent(jobb,'p','2026-10-26'),null);
        await sql.query(`UPDATE player_facilities SET "maksPuttLengdeM"=NULL WHERE id='f'`);
        assert.equal((await hent(jobb,'p','2026-10-26'))?.fasiliteter[0].maksPuttLengdeM,null);
      } finally {await reset();await sql.query(`DELETE FROM player_facilities`);}
    });
    await t.test('measurement and environment changes invalidate generation and acceptance without replacing proof',async()=>{
      await reset();await sql.query(`INSERT INTO player_facilities (id,"userId",name,capabilities,type,"maksPuttLengdeM")
        VALUES ('f','p','Syntetisk sted',ARRAY['RADAR'],'KLUBBANLEGG',15)`);
      try {
        const candidate=await utkast();
        const generated=await generer(jobb,'p','2026-10-26',async()=>{
          await sql.query(`UPDATE player_facilities SET "maksPuttLengdeM"=5 WHERE id='f'`);return candidate;
        });
        assert.equal(generated.status,'UTDATERT');assert.equal(await db.planAction.count(),0);
        const action=await opprett();
        await sql.query(`UPDATE player_facilities SET type='SIMULATOR',"isIndoor"=true WHERE id='f'`);
        await assert.rejects(behandle(viewer,action.id,'ACCEPTED'),/utdatert-ukegrunnlag/);
        assert.deepEqual(await counts(),empty);
      } finally {await reset();await sql.query(`DELETE FROM player_facilities`);}
    });
    await t.test('measured length changed under a held facility lock is reread before approval',async()=>{
      await reset();await sql.query(`INSERT INTO player_facilities (id,"userId",name,capabilities,"maksPuttLengdeM")
        VALUES ('f','p','Syntetisk sted',ARRAY['RADAR'],20)`);
      const action=await opprett();await sql.query('BEGIN');
      await sql.query(`UPDATE player_facilities SET "maksPuttLengdeM"=2 WHERE id='f'`);
      const denied=assert.rejects(behandle(viewer,action.id,'ACCEPTED'),/utdatert-ukegrunnlag/);
      let blocked=false;
      try {
        for(let i=0;i<100;i++) {
          const lock=await admin.query(`SELECT 1 FROM pg_stat_activity WHERE application_name=$1 AND wait_event_type='Lock'
            AND query LIKE '%player_facilities%' AND query LIKE '%FOR SHARE%'`,[schema]);
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
    await t.test('unknown or differing exercise level is visible advice and explicit approval remains possible',async()=>{
      await reset();await sql.query(`UPDATE exercise_definitions SET "minKategori"='D',"maxKategori"='D' WHERE id='drill'`);
      try {
        for(const score of [null,70]) {
          if(score!==null) {await sql.query(`INSERT INTO profile_links(hq_user_id,status) VALUES ('p','confirmed')`);await settNiva(score);}
          const result=await generer(jobb,'p','2026-10-26',utkast);assert.ok('id' in result);
          const body=JSON.parse(JSON.stringify((await db.planAction.findUniqueOrThrow({where:{id:result.id}})).suggestion));
          assert.deepEqual(body.fagligeRad,[{kode:'OVELSESNIVA_BOR_VURDERES',oktIndeks:0,exerciseId:'drill'}]);
          assert.deepEqual(await counts(),empty);
          assert.equal((await behandle(viewer,result.id,'ACCEPTED')).applied,true);await reset();
        }
        await settNiva(74);
        const result=await generer(jobb,'p','2026-10-26',async input=>{
          assert.equal(input.category,'D');assert.equal(input.categorySource,'BRUTTO_TURNERING');
          assert.ok(!JSON.stringify(input).includes('Syntetisk privat'));return utkast();
        });assert.ok('id' in result);
        assert.equal((await behandle(viewer,result.id,'ACCEPTED')).applied,true);
        await reset();await sql.query(`UPDATE exercise_definitions SET "minHcp"=0 WHERE id='drill'`);
        const action=await opprett();await assert.rejects(behandle(viewer,action.id,'ACCEPTED'),/utdatert-faglig-vurdering/);
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
    await t.test('budget deviations are advisory while dates outside the requested week are invalid',async()=>{
      await reset();const candidate=await utkast();
      const result=await generer(jobb,'p','2026-10-26',async()=>({...candidate,sessions:[candidate.sessions[0],
        {...candidate.sessions[0],scheduledAt:'2026-10-28T16:00:00Z'}]}));assert.ok('id' in result);
      const body=JSON.parse(JSON.stringify((await db.planAction.findUniqueOrThrow({where:{id:result.id}})).suggestion));
      assert.deepEqual(body.fagligeRad,[{kode:'UKESBUDSJETT_AVVIKER',omrade:'TEK'}]);
      assert.deepEqual(await counts(),empty);
      assert.equal((await behandle(viewer,result.id,'ACCEPTED')).applied,true);
      assert.equal((await counts()).plan,2);await reset();
      await assert.rejects(generer(jobb,'p','2026-10-26',async()=>({...candidate,sessions:[
        {...candidate.sessions[0],scheduledAt:'2026-11-02T16:00:00Z'}]})),/ugyldig-uketid/);
      assert.equal(await db.planAction.count(),0);
    });
    await t.test('missing period and budget produce advice and nullable period; retired phase tags do not veto',async()=>{
      await reset();
      await sql.query(`UPDATE period_blocks SET "endDate"='2026-10-25',"weeklySessionBudget"=NULL;
        UPDATE exercise_definitions SET "lPhases"=ARRAY['TURNERING']::"LPhase"[] WHERE id='drill'`);
      try {
        const result=await generer(jobb,'p','2026-10-26',utkast);assert.ok('id' in result);
        const body=JSON.parse(JSON.stringify((await db.planAction.findUniqueOrThrow({where:{id:result.id}})).suggestion));
        assert.deepEqual(body.fagligeRad,[{kode:'PERIODE_MANGLER'},{kode:'UKESBUDSJETT_MANGLER'}]);
        assert.equal((await behandle(viewer,result.id,'ACCEPTED')).applied,true);
        assert.equal((await db.trainingPlanSession.findFirstOrThrow()).lPhase,null);await reset();
        await sql.query(`UPDATE period_blocks SET "endDate"='2026-11-30',"lPhase"='GRUNN',"weeklySessionBudget"='{"TEK":1}' `);
        const fresh=await generer(jobb,'p','2026-10-26',utkast);assert.ok('id' in fresh);
        assert.equal((await behandle(viewer,fresh.id,'ACCEPTED')).applied,true);
      } finally {await reset();await sql.query(`UPDATE period_blocks SET "endDate"='2026-11-30',"lPhase"='GRUNN',"weeklySessionBudget"='{"TEK":1}' ;
        UPDATE exercise_definitions SET "lPhases"=ARRAY['GRUNN']::"LPhase"[] WHERE id='drill'`);}
    });
    await t.test('missing or altered stored advice requires a new proposal and preserves the old body',async()=>{
      await reset();await sql.query(`UPDATE period_blocks SET "weeklySessionBudget"='{"TEK":2}'`);
      try {
        for(const advice of [undefined,[],[{kode:'PERIODE_MANGLER'}]]) {
          const old=await opprett();const body=JSON.parse(JSON.stringify(old.suggestion));
          if(advice!==undefined) body.fagligeRad=advice;
          await db.planAction.update({where:{id:old.id},data:{suggestion:body}});
          await assert.rejects(behandle(viewer,old.id,'ACCEPTED'),/utdatert-faglig-vurdering/);
          assert.deepEqual(await counts(),empty);
          const fresh=await generer(jobb,'p','2026-10-26',utkast);assert.ok('id' in fresh);assert.notEqual(fresh.id,old.id);
          assert.equal('erstattetAntall' in fresh && fresh.erstattetAntall,1);
          const saved=await db.planAction.findUniqueOrThrow({where:{id:old.id}});
          assert.equal(saved.status,'SUPERSEDED');assert.deepEqual(saved.suggestion,body);
          assert.equal((await behandle(viewer,fresh.id,'ACCEPTED')).applied,true);await reset();
        }
      } finally {await reset();await sql.query(`UPDATE period_blocks SET "weeklySessionBudget"='{"TEK":1}'`);}
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
    await t.test('advice reaches the shared read projection and own export without raw levels or proof',async()=>{
      await reset();await sql.query(`UPDATE period_blocks SET "weeklySessionBudget"='{"TEK":2}'`);
      try {
        const result=await generer(jobb,'p','2026-10-26',utkast);assert.ok('id' in result);
        const read=await les(viewer);
        assert.match(JSON.stringify(read.planActions),/Faglige råd – veiledende/);
        assert.match(JSON.stringify(read.planActions),/avviker fra registrert øktbudsjett/);
        const own=await eksporter('p');
        assert.deepEqual(own.mottatt[0].forslag?.fagligeRad,['TEK: Antall foreslåtte økter avviker fra registrert øktbudsjett.']);
        assert.doesNotMatch(JSON.stringify(own),/fingeravtrykk|exerciseRevisjon|databevis|minHcp|råscore/);
      } finally {await reset();await sql.query(`UPDATE period_blocks SET "weeklySessionBudget"='{"TEK":1}'`);}
    });
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

    const { byggAkBankkopi } = await import('../../src/lib/deling/ak-bankkobling-format');
    const { hentAkBankkoblinger: lesBank } = await import('../../src/lib/deling/ak-bankkobling-lesing');
    const bankkopi = byggAkBankkopi(bankOriginal[0]);
    const bankData = {...bankkopi.data,csTargetByKategori:Prisma.DbNull};
    const resetBank=async()=>{await reset();await db.exerciseDefinition.deleteMany({where:{id:{startsWith:'bank-copy'}}});bankKilde=structuredClone(bankOriginal);};
    await t.test('bank reader requires an explicit verified reference, not a matching exercise name',async()=>{
      await resetBank();await db.exerciseDefinition.create({data:{...bankData,id:'bank-copy',parametersJson:Prisma.DbNull}});
      assert.deepEqual((await lesBank(jobb,'p'))?.verdi,[]);
      await db.exerciseDefinition.update({where:{id:'bank-copy'},data:bankData});
      const result=await lesBank(jobb,'p');assert.equal(result?.verdi.length,1);assert.equal(result?.bevis.spillerId,'p');
      assert.deepEqual(Object.keys(result!.verdi[0]).sort(),['bankFingeravtrykk','bankId','exerciseId','exerciseRevisjon']);
      assert.equal(result!.verdi[0].bankId,bankkopi.bankId);assert.match(result!.verdi[0].exerciseRevisjon,/^\d+$/);
      assert.deepEqual(await counts(),empty);
    });
    await t.test('bank reference cannot certify altered instructions, requirements or local overrides',async()=>{
      await resetBank();await db.exerciseDefinition.create({data:{...bankData,id:'bank-copy'}});
      const changes: Prisma.ExerciseDefinitionUpdateInput[] = [
        {name:'Syntetisk annet navn'},{description:'Syntetisk endret instruksjon med samme referanse'},
        {fasilitetKrav:[]},{minKategori:'B'},{durationMin:20},{coachNotes:'Syntetisk privat instruks'},
        {videoUrl:'https://example.invalid/other'}, {lPhases:['GRUNN']},
        {parametersJson:{...bankData.parametersJson,extraInstruction:'Syntetisk tillegg'}},
      ];
      for(const data of changes) {
        await db.exerciseDefinition.update({where:{id:'bank-copy'},data});
        assert.deepEqual((await lesBank(jobb,'p'))?.verdi,[]);
        await db.exerciseDefinition.update({where:{id:'bank-copy'},data:bankData});
      }
      assert.equal((await lesBank(jobb,'p'))?.verdi.length,1);assert.deepEqual(await counts(),empty);
    });
    await t.test('bank reader excludes private and coach/player copies even with identical approved content',async()=>{
      await resetBank();await db.exerciseDefinition.create({data:{...bankData,id:'bank-copy'}});
      for(const data of [{visibility:'PRIVATE' as const},{source:'COACH' as const,createdBy:'coach-a'},
        {source:'PLAYER' as const,createdBy:'p'},{createdBy:'coach-b'}]) {
        await db.exerciseDefinition.update({where:{id:'bank-copy'},data});
        assert.deepEqual((await lesBank(jobb,'p'))?.verdi,[]);
        await db.exerciseDefinition.update({where:{id:'bank-copy'},data:bankData});
      }
    });
    await t.test('duplicate verified database copies are ambiguous, never selected by order',async()=>{
      await resetBank();await db.exerciseDefinition.create({data:{...bankData,id:'bank-copy'}});
      await db.exerciseDefinition.create({data:{...bankData,id:'bank-copy-2'}});
      assert.deepEqual((await lesBank(jobb,'p'))?.verdi,[]);
      await db.exerciseDefinition.delete({where:{id:'bank-copy-2'}});
      assert.equal((await lesBank(jobb,'p'))?.verdi.length,1);
    });
    await t.test('changed, withdrawn or invalid source cannot be hidden behind a stored source hash',async()=>{
      await resetBank();await db.exerciseDefinition.create({data:{...bankData,id:'bank-copy'}});
      bankKilde=bankOriginal.filter(r=>r.id!==bankkopi.bankId);assert.deepEqual((await lesBank(jobb,'p'))?.verdi,[]);
      bankKilde=bankOriginal.map(r=>r.id===bankkopi.bankId?{...r,beskrivelse:'Syntetisk endret godkjent instruksjon'}:r);
      assert.deepEqual((await lesBank(jobb,'p'))?.verdi,[]);
      bankKilde=[...bankOriginal,bankOriginal[0]];await assert.rejects(lesBank(jobb,'p'),/tvetydig/);
      bankKilde=bankOriginal.map(r=>r.id===bankkopi.bankId?{...r,status:'KANDIDAT'}:r);await assert.rejects(lesBank(jobb,'p'));
      bankKilde=structuredClone(bankOriginal);assert.equal((await lesBank(jobb,'p'))?.verdi.length,1);
    });
    await t.test('bank reader still requires current group, recipient and explicit sharing for ADMIN',async()=>{
      await resetBank();await db.exerciseDefinition.create({data:{...bankData,id:'bank-copy'}});
      for(const target of [{gruppeId:'a',coachId:'admin'},{gruppeId:'a',coachId:'coach-b'},
        {gruppeId:'wang',coachId:'coach-a'},{gruppeId:'tn',coachId:'coach-a'}]) assert.equal(await lesBank(target,'p'),null);
      await valg(false);assert.equal(await lesBank(jobb,'p'),null);await valg(true);
      assert.equal((await lesBank(jobb,'p'))?.verdi.length,1);
    });
    await t.test('bank copy edited while reader waits is rechecked after its row lock',async()=>{
      await resetBank();await db.exerciseDefinition.create({data:{...bankData,id:'bank-copy'}});
      await sql.query('BEGIN');await sql.query(`UPDATE exercise_definitions SET description='Syntetisk endret instruksjon' WHERE id='bank-copy'`);
      const pending=lesBank(jobb,'p');let blocked=false;
      try {
        for(let i=0;i<100;i++) {
          const lock=await admin.query(`SELECT 1 FROM pg_stat_activity WHERE application_name=$1 AND wait_event_type='Lock' AND query LIKE '%exercise_definitions%' AND query LIKE '%FOR SHARE%'`,[schema]);
          if(lock.rowCount){blocked=true;break;}await new Promise(r=>setTimeout(r,10));
        }
      } finally {await sql.query('COMMIT');}
      assert.equal(blocked,true);assert.deepEqual((await pending)?.verdi,[]);assert.deepEqual(await counts(),empty);
    });


    const { hentAkUkekandidater: hentKandidater, brukSammeAkUkekandidater: brukKandidater } = await import('../../src/lib/deling/ak-ukekandidater');
    const kandidater=()=>hentKandidater(jobb,'p','2026-10-26');
    const kandidatStart=async()=>{await resetBank();await db.exerciseDefinition.create({data:{...bankData,id:'bank-copy'}});};
    let brukt=0;
    const brukKandidat=(bevis:unknown)=>brukKandidater(jobb,'p',bevis,async tx=>{
      brukt++;return tx.exerciseDefinition.count({where:{id:'bank-copy'}});
    });
    await t.test('candidate observations combine only verified copies with current player inputs and no source text',async()=>{
      await kandidatStart();const r=await kandidater();assert.ok(r);assert.equal(r.kandidater.length,1);
      const k=r.kandidater[0];assert.equal(k.bankId,bankkopi.bankId);
      assert.equal(k.periode.type,'GRUNN');assert.equal(k.periode.ovelsesSamsvar,'IKKE_VURDERT');
      assert.equal(k.fagligVurdering,'GJENSTAR');assert.equal(k.fasilitetsstatus,'INGEN_REGISTRERTE_STEDER');
      for(const field of ['name','description','godkjentInnhold','bruttoSnitt','hcp','runder','maksPuttLengdeM','notes']) {
        assert.ok(!JSON.stringify(r.kandidater).includes(`"${field}"`));
      }
      assert.deepEqual(await brukKandidat(r.bevis),{verdi:1});assert.deepEqual(await counts(),empty);
    });
    await t.test('candidate evidence rejects invalid proofs, wrong scope and retraction followed by new consent',async()=>{
      await kandidatStart();const r=await kandidater();assert.ok(r);const before=brukt;
      for(const bevis of [null,{}, {...r.bevis,kandidatFingeravtrykk:'bad'}, {...r.bevis,versjon:2}]) assert.equal(await brukKandidat(bevis),null);
      for(const target of [{gruppeId:'a',coachId:'admin'},{gruppeId:'a',coachId:'coach-b'},
        {gruppeId:'wang',coachId:'coach-a'},{gruppeId:'tn',coachId:'coach-a'}]) {
        assert.equal(await hentKandidater(target,'p','2026-10-26'),null);
        assert.equal(await brukKandidater(target,'p',r.bevis,async()=>++brukt),null);
      }
      assert.equal(await hentKandidater(jobb,'private','2026-10-26'),null);
      await valg(false);assert.equal(await kandidater(),null);assert.equal(await brukKandidat(r.bevis),null);
      await valg(true);assert.equal(await brukKandidat(r.bevis),null);assert.equal(brukt,before);
      assert.ok(await kandidater());
    });
    await t.test('candidate evidence covers changed current bank, changed row versions and ambiguous copies',async()=>{
      await kandidatStart();let r=await kandidater();assert.ok(r);const before=brukt;
      bankKilde=bankOriginal.filter(k=>k.id!==bankkopi.bankId);assert.equal(await brukKandidat(r.bevis),null);
      bankKilde=structuredClone(bankOriginal);
      await db.exerciseDefinition.update({where:{id:'bank-copy'},data:{description:bankData.description}});
      assert.equal(await brukKandidat(r.bevis),null);r=await kandidater();assert.ok(r);
      await db.exerciseDefinition.create({data:{...bankData,id:'bank-copy-2'}});
      assert.equal(await brukKandidat(r.bevis),null);assert.deepEqual((await kandidater())?.kandidater,[]);
      await db.exerciseDefinition.deleteMany({where:{id:{startsWith:'bank-copy'}}});
      r=await kandidater();assert.ok(r);assert.deepEqual(r.kandidater,[]);
      await db.exerciseDefinition.create({data:{...bankData,id:'bank-copy'}});
      assert.equal(await brukKandidat(r.bevis),null);assert.equal(brukt,before);
    });
    await t.test('candidate evidence detects changed own measurements and level but excludes other player facilities',async()=>{
      await kandidatStart();const r=await kandidater();assert.ok(r);const before=brukt;
      try {
        await sql.query(`INSERT INTO player_facilities (id,"userId",name,"maksPuttLengdeM") VALUES ('outside-candidate','private','Syntetisk privat sted',40)`);
        assert.deepEqual(await brukKandidat(r.bevis),{verdi:1});
        await sql.query(`INSERT INTO player_facilities (id,"userId",name,"maksPuttLengdeM") VALUES ('candidate-f','p','Syntetisk eget sted',12)`);
        assert.equal(await brukKandidat(r.bevis),null);
        const fresh=await kandidater();assert.ok(fresh);
        await sql.query(`UPDATE users SET hcp=11 WHERE id='p'`);
        assert.equal(await brukKandidat(fresh.bevis),null);assert.equal(brukt,before+1);
      } finally {await sql.query(`DELETE FROM player_facilities;UPDATE users SET hcp=NULL WHERE id='p'`);}
    });
    await t.test('bank source changed while candidate use waits is read after the lock',async()=>{
      await kandidatStart();const r=await kandidater();assert.ok(r);const before=brukt;
      await sql.query('BEGIN');await sql.query(`SELECT id FROM exercise_definitions WHERE id='bank-copy' FOR UPDATE`);
      const pending=brukKandidat(r.bevis);let blocked=false;
      try {
        for(let i=0;i<100;i++) {
          const lock=await admin.query(`SELECT 1 FROM pg_stat_activity WHERE application_name=$1 AND wait_event_type='Lock'
            AND query LIKE '%exercise_definitions%' AND query LIKE '%FOR SHARE%'`,[schema]);
          if(lock.rowCount){blocked=true;break;}await new Promise(r=>setTimeout(r,10));
        }
        bankKilde=bankOriginal.filter(k=>k.id!==bankkopi.bankId);
      } finally {await sql.query('COMMIT');}
      assert.equal(blocked,true);assert.equal(await pending,null);assert.equal(brukt,before);
      bankKilde=structuredClone(bankOriginal);
    });
    await t.test('weekly inputs changed during bank wait are rechecked before candidate callback',async()=>{
      await kandidatStart();const r=await kandidater();assert.ok(r);const before=brukt;
      await sql.query('BEGIN');await sql.query(`SELECT id FROM exercise_definitions WHERE id='bank-copy' FOR UPDATE`);
      const pending=brukKandidat(r.bevis);let blocked=false;
      try {
        for(let i=0;i<100;i++) {
          const lock=await admin.query(`SELECT 1 FROM pg_stat_activity WHERE application_name=$1 AND wait_event_type='Lock'
            AND query LIKE '%exercise_definitions%' AND query LIKE '%FOR SHARE%'`,[schema]);
          if(lock.rowCount){blocked=true;break;}await new Promise(r=>setTimeout(r,10));
        }
        await sql.query(`UPDATE signals SET value=-77 WHERE id='sg'`);
      } finally {await sql.query('COMMIT');}
      try {assert.equal(blocked,true);assert.equal(await pending,null);assert.equal(brukt,before);}
      finally {await sql.query(`UPDATE signals SET value=-1 WHERE id='sg'`);}
    });

    const { genererAkBankukeforslag: genererBank } = await import('../../src/lib/deling/ak-ukeforslag-generering');
    const bankUtkast=async()=>{
      const template=await utkast();const r=await sql.query(`SELECT xmin::text AS revision FROM exercise_definitions WHERE id='bank-copy'`);
      return {...template,sessions:[{...template.sessions[0],pyramidArea:bankData.pyramidArea,
        drills:[{exerciseId:'bank-copy',exerciseRevisjon:r.rows[0].revision,minutter:30}]}]};
    };
    await t.test('bank-backed proposal stores server evidence and advisory requirements; acceptance is explicit',async()=>{
      await kandidatStart();
      const result=await genererBank(jobb,'p','2026-10-26',async(model,rows)=>{
        assert.deepEqual(Object.keys(model).sort(),['category','categorySource','context','signals']);
        assert.equal(rows[0].exerciseId,'bank-copy');
        assert.doesNotMatch(JSON.stringify(rows),/Syntetisk spiller|description|bruttoSnitt|maksPuttLengdeM/);
        rows[0].exerciseId='mutated-local-argument';return bankUtkast();
      });assert.ok('id' in result);
      const stored=await db.planAction.findUniqueOrThrow({where:{id:result.id}});
      const body=akUkeforslagSchema.parse(stored.suggestion);assert.equal(body.versjon,2);
      assert.ok(body.fagligeRad?.some(r=>r.kode==='BANKFASILITET_BOR_VURDERES'));
      assert.ok(body.fagligeRad?.some(r=>r.kode==='FAGLIG_VURDERING_GJENSTAR'));
      assert.deepEqual(await counts(),empty);
      assert.doesNotMatch(JSON.stringify((await les(viewer)).planActions),/bankFingeravtrykk|kandidatFingeravtrykk/);
      assert.doesNotMatch(JSON.stringify(await eksporter('p')),/bankFingeravtrykk|kandidatFingeravtrykk/);
      assert.match(JSON.stringify(await eksporter('p')),/Bankkilden er kontrollert/);
      assert.equal((await behandle(viewer,result.id,'ACCEPTED')).applied,true);
      assert.deepEqual(await counts(),{plan:1,drills:1,v2:1,v2drills:1,spor:1});
    });
    await t.test('empty bank and forbidden group never invoke the bank planner',async()=>{
      await resetBank();let called=0;const build=async()=>{called++;return bankUtkast();};
      assert.equal((await genererBank(jobb,'p','2026-10-26',build)).status,'INGEN_BANKKANDIDATER');
      for(const target of [{gruppeId:'a',coachId:'admin'},{gruppeId:'wang',coachId:'coach-a'},{gruppeId:'tn',coachId:'coach-a'}]) {
        assert.equal((await genererBank(target,'p','2026-10-26',build)).status,'INGEN_GRUNNLAG');
      }
      assert.equal(called,0);assert.equal(await db.planAction.count(),0);
    });
    await t.test('bank planner cannot choose unverified copies or inject trusted evidence',async()=>{
      await kandidatStart();
      await assert.rejects(genererBank(jobb,'p','2026-10-26',utkast),/ovelse-utenfor-verifisert-bank/);
      for(const extra of [{bankFingeravtrykk:'a'.repeat(64)},{fagligeRad:[]},{versjon:1}]) {
        await assert.rejects(genererBank(jobb,'p','2026-10-26',async()=>({...await bankUtkast(),...extra})));
      }
      assert.equal(await db.planAction.count(),0);assert.deepEqual(await counts(),empty);
    });
    await t.test('bank changes during planning prevent persistence, including identical row rewrites',async()=>{
      for(const change of [async()=>{bankKilde=[];},async()=>{await db.exerciseDefinition.update({where:{id:'bank-copy'},data:bankData});}]) {
        await kandidatStart();const draft=await bankUtkast();
        await assert.rejects(genererBank(jobb,'p','2026-10-26',async()=>{await change();return draft;}),/utdatert-bankgrunnlag/);
        assert.equal(await db.planAction.count(),0);assert.deepEqual(await counts(),empty);
      }
    });
    await t.test('bank-bound approval requires unchanged source and sharing; rejection still works after bank removal',async()=>{
      await kandidatStart();const result=await genererBank(jobb,'p','2026-10-26',bankUtkast);assert.ok('id' in result);
      await assert.rejects(behandle({id:'admin',role:'ADMIN'},result.id,'ACCEPTED'),/forbidden/);
      bankKilde=[];await assert.rejects(behandle(viewer,result.id,'ACCEPTED'),/utdatert-bankgrunnlag/);
      assert.deepEqual(await counts(),empty);
      assert.equal((await behandle(viewer,result.id,'REJECTED')).status,'REJECTED');
      await kandidatStart();const next=await genererBank(jobb,'p','2026-10-26',bankUtkast);assert.ok('id' in next);
      await valg(false);await valg(true);await assert.rejects(behandle(viewer,next.id,'ACCEPTED'),/forbidden/);
      assert.deepEqual(await counts(),empty);
    });
    await t.test('bank renewal preserves old content, deduplicates fresh version and cannot downgrade to legacy',async()=>{
      await kandidatStart();const legacy=await opprett();
      const first=await genererBank(jobb,'p','2026-10-26',bankUtkast);assert.ok('id' in first);
      assert.equal((await db.planAction.findUniqueOrThrow({where:{id:legacy.id}})).status,'SUPERSEDED');
      assert.deepEqual((await db.planAction.findUniqueOrThrow({where:{id:legacy.id}})).suggestion,legacy.suggestion);
      assert.equal((await generer(jobb,'p','2026-10-26',utkast)).status,'KREVER_GJENNOMGANG');
      assert.equal((await genererBank(jobb,'p','2026-10-26',bankUtkast)).status,'FINNES');
      const old=await db.planAction.findUniqueOrThrow({where:{id:first.id}});
      await db.exerciseDefinition.update({where:{id:'bank-copy'},data:bankData});
      const fresh=await genererBank(jobb,'p','2026-10-26',bankUtkast);assert.ok('id' in fresh);assert.notEqual(fresh.id,first.id);
      const saved=await db.planAction.findUniqueOrThrow({where:{id:first.id}});
      assert.equal(saved.status,'SUPERSEDED');assert.deepEqual(saved.suggestion,old.suggestion);
      assert.deepEqual(await counts(),empty);
    });
    await t.test('concurrent bank generation deduplicates and failed approval rolls back before retry',async()=>{
      await kandidatStart();
      const results=await Promise.all([genererBank(jobb,'p','2026-10-26',bankUtkast),genererBank(jobb,'p','2026-10-26',bankUtkast)]);
      assert.deepEqual(results.map(r=>r.status).sort(),['FINNES','OPPRETTET']);assert.equal(await db.planAction.count(),1);
      const saved=await db.planAction.findFirstOrThrow();
      await sql.query(`CREATE OR REPLACE FUNCTION fail_write() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic rollback'; END $$;
        CREATE TRIGGER fail_bank BEFORE INSERT ON training_drills_v2 FOR EACH ROW EXECUTE FUNCTION fail_write()`);
      try {await assert.rejects(behandle(viewer,saved.id,'ACCEPTED'));}
      finally {await sql.query('DROP TRIGGER fail_bank ON training_drills_v2');}
      assert.deepEqual(await counts(),empty);assert.equal((await db.planAction.findUniqueOrThrow({where:{id:saved.id}})).status,'PENDING');
      assert.equal((await behandle(viewer,saved.id,'ACCEPTED')).applied,true);
      assert.equal((await behandle(viewer,saved.id,'ACCEPTED')).status,'UNCHANGED');
      assert.deepEqual(await counts(),{plan:1,drills:1,v2:1,v2drills:1,spor:1});
    });
    await t.test('bank approval rechecks source after waiting on exercise locks',async()=>{
      await kandidatStart();const result=await genererBank(jobb,'p','2026-10-26',bankUtkast);assert.ok('id' in result);
      await sql.query('BEGIN');await sql.query(`SELECT id FROM exercise_definitions WHERE id='bank-copy' FOR UPDATE`);
      const pending=behandle(viewer,result.id,'ACCEPTED');const denied=assert.rejects(pending,/utdatert-bankgrunnlag/);let blocked=false;
      try {
        for(let i=0;i<100;i++) {
          const lock=await admin.query(`SELECT 1 FROM pg_stat_activity WHERE application_name=$1 AND wait_event_type='Lock' AND query LIKE '%exercise_definitions%' AND query LIKE '%FOR SHARE%'`,[schema]);
          if(lock.rowCount){blocked=true;break;}await new Promise(r=>setTimeout(r,10));
        }
        bankKilde=[];
      } finally {await sql.query('COMMIT');}
      await denied;assert.equal(blocked,true);assert.deepEqual(await counts(),empty);
    });
    await t.test('bank approval rechecks unlocked weekly signals after a bank lock wait',async()=>{
      await kandidatStart();const result=await genererBank(jobb,'p','2026-10-26',bankUtkast);assert.ok('id' in result);
      await sql.query('BEGIN');await sql.query(`SELECT id FROM exercise_definitions WHERE id='bank-copy' FOR UPDATE`);
      const pending=behandle(viewer,result.id,'ACCEPTED');const denied=assert.rejects(pending,/utdatert-ukegrunnlag/);let blocked=false;
      try {
        for(let i=0;i<100;i++) {
          const lock=await admin.query(`SELECT 1 FROM pg_stat_activity WHERE application_name=$1 AND wait_event_type='Lock' AND query LIKE '%exercise_definitions%' AND query LIKE '%FOR SHARE%'`,[schema]);
          if(lock.rowCount){blocked=true;break;}await new Promise(r=>setTimeout(r,10));
        }
        await sql.query(`UPDATE signals SET value=-2 WHERE id='sg'`);
      } finally {await sql.query('COMMIT');}
      try {await denied;assert.equal(blocked,true);assert.deepEqual(await counts(),empty);}
      finally {await sql.query(`UPDATE signals SET value=-1 WHERE id='sg'`);}
    });

  } finally {
    await db.$disconnect(); await sql.end(); await admin.query(`DROP SCHEMA "${schema}" CASCADE`); await admin.end();
  }
});
