/** Faktisk registrering, oppslag og samtidighet mot egen lokal testbase. */
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
const schema = `gap_test_${randomUUID().replaceAll("-", "")}`;
const options = `-c search_path=${schema}`;
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: connection, options }, { schema }) });
mock.module("../../src/lib/prisma", { namedExports: { prisma: db } });

mock.module("../../src/lib/agents/agent-runner", { namedExports: { runAgent: async (_name: unknown, _id: unknown, run: () => Promise<unknown>) => run() } });
test("Treningsgap: faktisk gruppedeling, mottaker og observasjon under lås", async t => {
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
    await sql.query(`CREATE TYPE "RoundPlayStatus" AS ENUM ('COMPLETED','IN_PROGRESS');
      CREATE TABLE rounds (id text PRIMARY KEY, "userId" text REFERENCES users(id), "playedAt" timestamptz,
        score integer, "sgTotal" double precision, "sgOtt" double precision, "sgApp" double precision, "sgArg" double precision, "sgPutt" double precision,
        "playStatus" "RoundPlayStatus" DEFAULT 'COMPLETED', "partialSave" boolean DEFAULT false,
        "sgReferenceSetId" text DEFAULT 'synthetic-ref', "benchmarkLevelSnapshot" text DEFAULT 'hcp-5', "sgEngineVersion" text DEFAULT 'v1',
        "sgSource" text DEFAULT 'beregnet', "roundType" text DEFAULT 'turnering', "dataQuality" text DEFAULT 'slag_for_slag_komplett');
      CREATE TABLE hole_scores (id text PRIMARY KEY, "roundId" text REFERENCES rounds(id), "holeNumber" integer, strokes integer);
      CREATE TABLE training_logs (id text PRIMARY KEY, "userId" text REFERENCES users(id), date date, "sgArea" text, minutes integer);
      CREATE TABLE plan_actions (id text PRIMARY KEY, "userId" text REFERENCES users(id), "coachId" text REFERENCES users(id),
        "planId" text, "actionType" text, suggestion jsonb, status text DEFAULT 'PENDING', "agentName" text, provenance jsonb,
        sjekkpunkt text, "fangstId" text, "decidedAt" timestamptz, "decidedById" text, "rejectReason" text, "decisionNote" text,
        "originalSuggestion" jsonb, "editedBeforeApproval" boolean DEFAULT false, "createdAt" timestamptz DEFAULT now(), "updatedAt" timestamptz);
      INSERT INTO rounds (id,"userId","playedAt",score,"sgTotal","sgOtt","sgApp","sgArg","sgPutt")
        SELECT 'r'||n, 'p', now()-interval '1 day'*n,72,-3,0,0,0,-3 FROM generate_series(1,5) n;
      INSERT INTO hole_scores (id,"roundId","holeNumber",strokes)
        SELECT r.id||'-'||n,r.id,n,4 FROM rounds r CROSS JOIN generate_series(1,18) n;
      INSERT INTO training_logs VALUES ('log','p',current_date,'APP',100);`);
    const { runTrainingGap: run } = await import('../../src/lib/agents/training-gap');
    const { settAkProfilValg: sett } = await import('../../src/lib/deling/ak-profil-valg');
    const { medAkGruppeoppdrag: jobb, hentAkGruppeoppdrag } = await import('../../src/lib/deling/ak-gruppeoppdrag');
    const { executePlanAction } = await import('../../src/lib/agents/plan-action-executor');
    const valg = (gruppeId: string, gitt: boolean) => sett({id:'p',role:'PLAYER'},'p',{gruppeId,gitt,tekstVersjon:AK_PROFIL_VERSJON});
    const slettEgneForslag = () => sql.query('DELETE FROM plan_actions');
    await t.test('medlemskap uten eget ja gir ingen observasjon',async()=>{
      assert.deepEqual((await hentAkGruppeoppdrag()).map(j=>j.gruppeId),['a','b']);
      const r=await run();assert.equal(r.planActionsWritten,0);assert.equal(await db.planAction.count(),0);
    });
    await t.test('deling til A gir bare ansvarlig trener A en observasjon med kilder',async()=>{
      assert.deepEqual(await valg('a',true),{ok:true});
      assert.equal((await run()).planActionsWritten,1);
      const r=await db.planAction.findFirstOrThrow();
      assert.equal(r.coachId,'coach-a');assert.equal(r.actionType,'COACH_REVIEW');
      assert.match(JSON.stringify(r.suggestion),/"gruppeId":"a"/);assert.match(JSON.stringify(r.provenance),/r5/);
      assert.equal((await run()).planActionsWritten,0);
    });
    await t.test('godkjenning av ny og eldre observasjon legger aldri til økter',async()=>{
      const row=await db.planAction.findFirstOrThrow();
      await db.planAction.update({where:{id:row.id},data:{status:'PROCESSING'}});
      for(const type of ['COACH_REVIEW','TRAINING_GAP']) {
        await db.planAction.update({where:{id:row.id},data:{actionType:type}});
        const result=await executePlanAction(row.id);
        assert.equal(result.sessionsAdded,0);assert.equal(result.sessionsRemoved,0);assert.equal(result.sessionsModified,0);
      }
      await slettEgneForslag();
    });
    await t.test('ADMIN som eier A kan ikke bruke ja bare til B; annen gruppe får ikke kopi',async()=>{
      await valg('a',false);await valg('b',true);
      await sql.query(`UPDATE users SET role='ADMIN' WHERE id='coach-a'`);
      assert.equal((await run()).planActionsWritten,1);
      const rows=await db.planAction.findMany({select:{coachId:true}});assert.deepEqual(rows,[{coachId:'coach-b'}]);
      await slettEgneForslag();await valg('b',false);await valg('a',true);
      await sql.query(`UPDATE users SET role='COACH' WHERE id='coach-a'`);
    });
    await t.test('eierskifte etter ruting avviser gammel mottaker og ugyldige ID-er',async()=>{
      await sql.query(`UPDATE groups SET "coachId"='coach-b' WHERE id='a'`);
      let kalt=false;
      assert.equal(await jobb({gruppeId:'a',coachId:'coach-a'},async()=>{kalt=true;return true;}),null);
      assert.equal(kalt,false);
      assert.equal(await jobb({gruppeId:'',coachId:'coach-b'},async()=>true),null);
      assert.equal((await run()).planActionsWritten,1);
      assert.equal((await db.planAction.findFirstOrThrow()).coachId,'coach-b');
      await slettEgneForslag();await sql.query(`UPDATE groups SET "coachId"='coach-a' WHERE id='a'`);
    });
    await t.test('samtidige jobber lager ett forslag per delt gruppe og mottaker',async()=>{
      const result=await Promise.all([run(),run()]);
      assert.equal(result.reduce((sum,r)=>sum+(r.planActionsWritten??0),0),1);
      assert.equal(await db.planAction.count(),1);await slettEgneForslag();
    });
    await t.test('trekk, utmelding og arkivering stopper neste forslag',async()=>{
      await valg('a',false);assert.equal((await run()).planActionsWritten,0);
      await valg('a',true);await sql.query(`UPDATE group_members SET "endedAt"=now() WHERE id='pa'`);
      assert.equal((await run()).planActionsWritten,0);
      await sql.query(`UPDATE group_members SET "endedAt"=null WHERE id='pa'; UPDATE groups SET "arkivertAt"=now() WHERE id='a'`);
      assert.equal((await run()).planActionsWritten,0);
      await sql.query(`UPDATE groups SET "arkivertAt"=null WHERE id='a'`);
    });
    await t.test('feil ved lagring ruller tilbake hele gruppens jobb og rapporteres uten råfeil',async()=>{
      await sql.query(`ALTER TABLE plan_actions ADD CONSTRAINT synthetic_failure CHECK ("agentName" <> 'training-gap') NOT VALID`);
      const r=await run();assert.equal(r.planActionsWritten,0);assert.equal(await db.planAction.count(),0);
      assert.deepEqual(r.output,{planActionsWritten:0,feiledeGrupper:1});
      await sql.query(`ALTER TABLE plan_actions DROP CONSTRAINT synthetic_failure`);
    });
  } finally {
    await db.$disconnect();await sql.end();await admin.query(`DROP SCHEMA "${schema}" CASCADE`);await admin.end();
  }
});
