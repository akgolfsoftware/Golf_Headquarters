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
let viewer = { id: "coach-a", role: "COACH" };
mock.module("../../src/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async () => viewer } });
mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("next/navigation", { namedExports: { redirect: () => { throw Error("synthetic-redirect"); } } });

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
      CREATE TABLE agent_runs (id text PRIMARY KEY, "agentName" text, "userId" text, status text, duration integer,
        output jsonb, error text, "createdAt" timestamptz DEFAULT now());
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
    const { behandleAkTreningsobservasjon: beslutning, hentAkTreningsobservasjoner: les } = await import('../../src/lib/deling/ak-treningsobservasjon');
    const { acceptPlanAction, rejectPlanAction } = await import('../../src/lib/agents/actions');
    const { godtaPlanAction, avvisPlanAction } = await import('../../src/app/admin/varsler/actions');
    const { approveRequestDetailed, declineRequestDetailed, requestMoreInfo } = await import('../../src/app/admin/(legacy)/approvals/actions');
    const { acceptAndApplyPlanAction } = await import('../../src/lib/agents/accept-plan-action');
    const coach = { id: 'coach-a', role: 'COACH' };
    const ny = async () => {
      await slettEgneForslag(); await sql.query('DELETE FROM agent_runs');
      await valg('a',true); await valg('b',false); await run();
      return db.planAction.findFirstOrThrow();
    };
    await t.test('liste, antall og eldste bruker samme gruppe, mottaker og nåværende deling',async()=>{
      const rad=await ny();
      const resultat=await les(coach); assert.equal(resultat.planActions[0]?.id,rad.id);
      assert.equal(resultat.pendingCount,1); assert.ok(resultat.eldstePending);
      assert.equal((await les({id:'admin',role:'ADMIN'})).planActions.length,0);
      assert.equal((await les({id:'coach-b',role:'COACH'})).pendingCount,0);
      await valg('a',false); await valg('b',true);
      assert.deepEqual(await les(coach),{planActions:[],pendingCount:0,acceptedCount:0,rejectedCount:0,accepted7d:0,rejected7d:0,godkjentAvViewer:0,eldstePending:null});
      await assert.rejects(()=>beslutning(coach,rad.id,'ACCEPTED'),/forbidden/);
      assert.equal((await db.planAction.findUniqueOrThrow({where:{id:rad.id}})).status,'PENDING');
    });
    await t.test('sekundærlister beholder vindu, sortering, grense og fersk historikkdeling', async () => {
      const rad = await ny();
      const start = new Date('2026-01-01T00:00:00Z');
      await db.planAction.update({ where: { id: rad.id }, data: { createdAt: start, updatedAt: start } });
      for (const [id, createdAt, updatedAt, status, decidedById] of [
        ['synthetic-new', '2026-01-03', '2026-01-03', 'PENDING', null],
        ['synthetic-done', '2025-12-30', '2026-01-05', 'ACCEPTED', coach.id],
        ['synthetic-other-actor', '2025-12-30', '2026-01-04', 'ACCEPTED', 'p'],
        ['synthetic-old', '2025-12-30', '2025-12-31', 'REJECTED', coach.id],
      ] as const) {
        await db.planAction.create({ data: { userId: rad.userId, coachId: rad.coachId, agentName: rad.agentName, actionType: rad.actionType, suggestion: rad.suggestion!, id, createdAt: new Date(createdAt), updatedAt: new Date(updatedAt),
          status, decidedAt: new Date(updatedAt), decidedById } });
      }
      assert.deepEqual((await les(coach, { status: 'PENDING', maksRader: 1, rekkefolge: 'eldst' })).planActions.map(r => r.id), [rad.id]);
      assert.deepEqual((await les(coach, { status: 'PENDING', maksRader: 1 })).planActions.map(r => r.id), ['synthetic-new']);
      const historikk = { status: ['ACCEPTED', 'REJECTED'] as const, maksRader: 1, endretSiden: start, rekkefolge: 'endret' as const, godkjentAvViewerSiden: start };
      const lest = await les(coach, historikk);
      assert.deepEqual(lest.planActions.map(r => r.id), ['synthetic-done']);
      assert.equal(lest.godkjentAvViewer, 1); assert.equal(lest.pendingCount, 2);
      assert.equal((await les(coach, { ...historikk, maksRader: 0 })).planActions.length, 0);
      assert.deepEqual((await les(coach, { ...historikk, maksRader: 12 })).planActions.map(r => r.id), ['synthetic-done', 'synthetic-other-actor']);
      await valg('a', false);
      const trukket = await les(coach, historikk);
      assert.deepEqual(trukket.planActions, []); assert.equal(trukket.godkjentAvViewer, 0); assert.equal(trukket.pendingCount, 0);
    });
    await t.test('flere ansvarlige grupper sorteres samlet, hver med eget ja', async () => {
      const rad = await ny();
      await sql.query(`UPDATE groups SET "coachId"='coach-a' WHERE id='b'`);
      try {
        await valg('b', true);
        const gruppeB = { userId: rad.userId, coachId: rad.coachId, agentName: rad.agentName, actionType: rad.actionType, id: 'synthetic-group-b', createdAt: new Date(rad.createdAt.getTime() + 60000),
          suggestion: { forklaring: 'Syntetisk B', deling: { gruppeId: 'b', scope: 'AK_GOLF_COACHINGPROFIL', tekstVersjon: AK_PROFIL_VERSJON } } };
        await db.planAction.create({ data: gruppeB });
        const lest = await les(coach, { status: 'PENDING', maksRader: 1 });
        assert.equal(lest.pendingCount, 2); assert.equal(lest.planActions[0].id, gruppeB.id);
        assert.equal((await les(coach, { status: 'PENDING', maksRader: 1, rekkefolge: 'eldst' })).planActions[0].id, rad.id);
        await valg('b', false);
        const trukket = await les(coach, { status: 'PENDING', maksRader: 1 });
        assert.equal(trukket.pendingCount, 1); assert.equal(trukket.planActions[0].id, rad.id);
      } finally { await sql.query(`UPDATE groups SET "coachId"='coach-b' WHERE id='b'`); }
    });
    await t.test('ADMIN, feil mottaker, ukjent ID, gammel versjon og annen agent gir ingen beslutning',async()=>{
      const rad=await ny();
      for(const aktor of [{id:'admin',role:'ADMIN'},{id:'coach-b',role:'COACH'},{id:'assistant',role:'COACH'}]) {
        await assert.rejects(()=>beslutning(aktor,rad.id,'ACCEPTED'),/forbidden/);
      }
      await assert.rejects(()=>beslutning(coach,'finnes-ikke','ACCEPTED'),/forbidden/);
      await sql.query(`UPDATE plan_actions SET suggestion=jsonb_set(suggestion,'{deling,tekstVersjon}','"gammel"')`);
      assert.equal((await les(coach)).pendingCount,0);
      await assert.rejects(()=>beslutning(coach,rad.id,'REJECTED'),/forbidden/);
      await sql.query(`UPDATE plan_actions SET suggestion=$1::jsonb, "agentName"='churn-radar'`,[JSON.stringify(rad.suggestion)]);
      await assert.rejects(()=>beslutning(coach,rad.id,'ACCEPTED'),/forbidden/);
      assert.equal(await db.agentRun.count(),0);
    });
    await t.test('eierskifte, rolleendring, utmelding og arkivering stopper behandling',async()=>{
      const rad=await ny();
      const endringer=[
        [`UPDATE groups SET "coachId"='coach-b' WHERE id='a'`,`UPDATE groups SET "coachId"='coach-a' WHERE id='a'`],
        [`UPDATE users SET role='PLAYER' WHERE id='coach-a'`,`UPDATE users SET role='COACH' WHERE id='coach-a'`],
        [`UPDATE group_members SET "endedAt"=now() WHERE id='pa'`,`UPDATE group_members SET "endedAt"=null WHERE id='pa'`],
        [`UPDATE groups SET "arkivertAt"=now() WHERE id='a'`,`UPDATE groups SET "arkivertAt"=null WHERE id='a'`],
      ];
      for(const [endre,gjenopprett] of endringer){
        await sql.query(endre); await assert.rejects(()=>beslutning(coach,rad.id,'ACCEPTED'),/forbidden/);
        await sql.query(gjenopprett);
      }
      assert.equal(await db.agentRun.count(),0);
    });
    await t.test('godkjenning er atomisk, dobbel behandling gir ett spor og ingen treningsendring',async()=>{
      const rad=await ny();
      const resultater=await Promise.all([beslutning(coach,rad.id,'ACCEPTED'),beslutning(coach,rad.id,'REJECTED')]);
      assert.equal(resultater.filter(r=>r.status!=='UNCHANGED').length,1);
      assert.equal(await db.agentRun.count(),1);
      const ferdig=await db.planAction.findUniqueOrThrow({where:{id:rad.id}});
      assert.equal(ferdig.decidedById,'coach-a'); assert.ok(ferdig.decidedAt);
      assert.equal(await db.trainingLog.count(),1); assert.equal(await db.round.count(),5);
      assert.equal((await les(coach)).pendingCount,0);
      assert.equal((await les(coach)).acceptedCount+(await les(coach)).rejectedCount,1);
    });
    await t.test('feil i beslutningssporet ruller status tilbake; ingen retry av planhandling',async()=>{
      const rad=await ny();
      await sql.query(`ALTER TABLE agent_runs ADD CONSTRAINT synthetic_audit_failure CHECK ("agentName" <> 'plan-action-executor') NOT VALID`);
      await assert.rejects(()=>beslutning(coach,rad.id,'ACCEPTED'));
      const uendret=await db.planAction.findUniqueOrThrow({where:{id:rad.id}});
      assert.equal(uendret.status,'PENDING');assert.equal(uendret.decidedAt,null);
      await sql.query('ALTER TABLE agent_runs DROP CONSTRAINT synthetic_audit_failure');
    });
    await t.test('egen spiller trenger ikke deling for egen observasjon, andre får ikke tilgang',async()=>{
      const rad=await ny();await valg('a',false);
      await assert.rejects(()=>beslutning({id:'private',role:'PLAYER'},rad.id,'ACCEPTED'),/forbidden/);
      assert.equal((await beslutning({id:'p',role:'PLAYER'},rad.id,'ACCEPTED')).status,'ACCEPTED');
      await sql.query(`UPDATE plan_actions SET status='PENDING',"actionType"='TRAINING_GAP',suggestion='{}'`);
      assert.equal((await beslutning({id:'p',role:'PLAYER'},rad.id,'REJECTED')).status,'REJECTED');
      await sql.query(`UPDATE users SET "deletedAt"=now() WHERE id='p'`);
      await assert.rejects(()=>beslutning({id:'p',role:'PLAYER'},rad.id,'ACCEPTED'),/forbidden/);
      await sql.query(`UPDATE users SET "deletedAt"=null WHERE id='p'`);
    });
    await t.test('alle godkjennings- og avvisningsinnganger kontrollerer trekk, også varsler og gammel detaljside',async()=>{
      const rad=await ny();viewer=coach;await valg('a',false);
      for(const handling of [()=>acceptPlanAction(rad.id),()=>rejectPlanAction(rad.id),()=>godtaPlanAction(rad.id),
        ()=>avvisPlanAction(rad.id),()=>approveRequestDetailed(rad.id),()=>declineRequestDetailed(rad.id,'Ikke nå'),
        ()=>requestMoreInfo(rad.id,'Hva betyr dette?'),()=>acceptAndApplyPlanAction(rad.id,undefined,coach.id)]){
        await assert.rejects(handling,/forbidden/);
      }
      await assert.rejects(()=>godtaPlanAction('finnes-ikke'),/not-found/);
      assert.equal(await db.agentRun.count(),0);
      await valg('a',true);await godtaPlanAction(rad.id);
      assert.equal((await db.planAction.findUniqueOrThrow({where:{id:rad.id}})).status,'ACCEPTED');
    });
    await t.test('observation entries reject no-op receipts without overwriting history or creating notifications',async()=>{
      viewer=coach;
      for(const status of ['ACCEPTED','REJECTED','SUPERSEDED','PROCESSING']) {
        const rad=await ny();await db.planAction.update({where:{id:rad.id},data:{status}});
        const before=await db.planAction.findUniqueOrThrow({where:{id:rad.id}});
        for(const call of [()=>acceptPlanAction(rad.id),()=>rejectPlanAction(rad.id),()=>godtaPlanAction(rad.id),
          ()=>avvisPlanAction(rad.id),()=>approveRequestDetailed(rad.id,'Ny kommentar'),
          ()=>declineRequestDetailed(rad.id,'Ikke nå'),()=>requestMoreInfo(rad.id,'Et nytt spørsmål')]) {
          await assert.rejects(call,/allerede behandlet eller erstattet/);
        }
        assert.deepEqual(await db.planAction.findUniqueOrThrow({where:{id:rad.id}}),before);
        assert.equal(await db.agentRun.count(),0);assert.equal(await db.notification.count(),0);
      }
    });
    await t.test('structured observation receipt returns a known no-op only after sharing checks',async()=>{
      const rad=await ny();viewer=coach;
      const {acceptPlanActionMedKvittering,rejectPlanActionMedKvittering}=await import('../../src/lib/agents/actions');
      assert.deepEqual(await rejectPlanActionMedKvittering(rad.id),{ok:true});
      const before=await db.planAction.findUniqueOrThrow({where:{id:rad.id}});
      const receipt=await acceptPlanActionMedKvittering(rad.id);
      assert.ok(!receipt.ok);assert.equal(receipt.kode,'ALLEREDE_BEHANDLET');
      assert.deepEqual(await db.planAction.findUniqueOrThrow({where:{id:rad.id}}),before);
      await valg('a',false);
      await assert.rejects(()=>acceptPlanActionMedKvittering(rad.id),/forbidden/);
      await valg('a',true);
    });
    await t.test('observation question receipt records the action without deciding or changing training',async()=>{
      const rad=await ny();viewer=coach;
      try {
        assert.deepEqual(await beslutning(coach,rad.id,'QUESTION','Syntetisk spørsmål'),{status:'UNCHANGED',applied:false,questionRecorded:true});
        assert.equal((await db.planAction.findUniqueOrThrow({where:{id:rad.id}})).status,'PENDING');
        assert.equal(await db.notification.count(),1);assert.equal(await db.agentRun.count(),0);
      } finally {await db.notification.deleteMany();}
    });
    await t.test('forespørsel er kun internt varsel og trekk blokkerer gjentakelse',async()=>{
      const rad=await ny();viewer=coach;
      await requestMoreInfo(rad.id,'Hvilken økt gjelder dette?');
      assert.equal(await db.notification.count({where:{type:'approval_question'}}),1);
      assert.equal((await db.planAction.findUniqueOrThrow({where:{id:rad.id}})).status,'PENDING');
      await valg('a',false);await assert.rejects(()=>requestMoreInfo(rad.id,'En gang til?'),/forbidden/);
      assert.equal(await db.notification.count({where:{type:'approval_question'}}),1);
    });
    await t.test('ansvarlig ADMIN har bare samme gruppes uttrykkelige ja, ingen global overstyring',async()=>{
      const rad=await ny();await sql.query(`UPDATE users SET role='ADMIN' WHERE id='coach-a'`);
      const aktor={id:'coach-a',role:'ADMIN'};
      assert.equal((await les(aktor)).pendingCount,1);
      await valg('a',false);await valg('b',true);
      await assert.rejects(()=>beslutning(aktor,rad.id,'ACCEPTED'),/forbidden/);
      await valg('a',true);
      assert.equal((await beslutning(aktor,rad.id,'REJECTED','Ikke nå')).status,'REJECTED');
      await sql.query(`UPDATE users SET role='COACH' WHERE id='coach-a'`);
    });
    const ventPaaLaas = async (query: string) => {
      for(let forsok=0;forsok<100;forsok++) {
        const vent=await admin.query(`SELECT 1 FROM pg_stat_activity WHERE datname='coach_lock_tests' AND wait_event_type='Lock' AND query LIKE $1`,[query]);
        if(vent.rowCount) return;
        await new Promise(resolve=>setTimeout(resolve,20));
      }
      throw Error('Testen observerte ikke forventet databaselås');
    };
    await t.test('samtidig trekk venter på pågående beslutning og stopper neste behandling',async()=>{
      const rad=await ny();
      await sql.query('BEGIN');await sql.query('SELECT id FROM plan_actions WHERE id=$1 FOR UPDATE',[rad.id]);
      const paagaar=beslutning(coach,rad.id,'ACCEPTED');
      try {
        await ventPaaLaas('%SELECT id FROM plan_actions%FOR UPDATE%');
        const trekk=valg('a',false);
        await ventPaaLaas('%pg_advisory_xact_lock%');
        await sql.query('COMMIT');
        assert.equal((await paagaar).status,'ACCEPTED');assert.deepEqual(await trekk,{ok:true});
        await assert.rejects(()=>beslutning(coach,rad.id,'REJECTED'),/forbidden/);
      } finally { await sql.query('ROLLBACK'); await paagaar.catch(()=>undefined); }
    });
    await t.test('endret ruting mens beslutningen venter gir avslag etter radlåsen',async()=>{
      const rad=await ny();
      await sql.query('BEGIN');await sql.query('SELECT id FROM plan_actions WHERE id=$1 FOR UPDATE',[rad.id]);
      const paagaar=beslutning(coach,rad.id,'ACCEPTED');
      const avslag=assert.rejects(()=>paagaar,/forbidden/);
      try {
        await ventPaaLaas('%SELECT id FROM plan_actions%FOR UPDATE%');
        await sql.query(`UPDATE plan_actions SET suggestion=jsonb_set(suggestion,'{deling,gruppeId}','"b"') WHERE id=$1`,[rad.id]);
        await sql.query('COMMIT');await avslag;
        assert.equal((await db.planAction.findUniqueOrThrow({where:{id:rad.id}})).status,'PENDING');
        assert.equal(await db.agentRun.count(),0);
      } finally { await sql.query('ROLLBACK'); await paagaar.catch(()=>undefined); }
    });
  } finally {
    await db.$disconnect();await sql.end();await admin.query(`DROP SCHEMA "${schema}" CASCADE`);await admin.end();
  }
});
