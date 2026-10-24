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
const schema = `ukegrunnlag_test_${randomUUID().replaceAll("-", "")}`;
const options = `-c search_path=${schema}`;
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: connection, options }, { schema }) });
// Same SQL projection/locks as production; only the upstream namespace is
// replaced by a controlled stand-in in this random local synthetic schema.
mock.module("../../src/lib/profil-kobling/niva-kilde", { namedExports: {
  nivaProfilFunksjon: Prisma.raw(`"${schema}".player_profile_for_user`),
  nivaKoblinger: Prisma.raw(`"${schema}".profile_links`),
} });
mock.module("../../src/lib/prisma", { namedExports: { prisma: db } });

test("Ukegrunnlag: tilgang og planendringer gjennom ekte SQL", async t => {
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
    await sql.query(await readFile(new URL('../fixtures/coach-week-facilities.sql',import.meta.url),'utf8'));
    await sql.query(await readFile(new URL('../fixtures/coach-week-level.sql',import.meta.url),'utf8'));
    const { hentAkUkegrunnlag: hent, brukSammeAkUkegrunnlag: bruk } = await import('../../src/lib/deling/ak-ukegrunnlag');
    const { settAkProfilValg: sett } = await import('../../src/lib/deling/ak-profil-valg');
    const jobb = { gruppeId: 'a', coachId: 'coach-a' };
    const uke = '2026-10-26';
    const valg = (gitt: boolean) => sett({ id:'p',role:'PLAYER' },'p',{gruppeId:'a',gitt,tekstVersjon:AK_PROFIL_VERSJON});
    const les = () => hent(jobb,'p',uke);
    type Captured = NonNullable<Awaited<ReturnType<typeof les>>>;
    const skriv = (grunnlag: Captured) => bruk(jobb,'p',grunnlag.deling,grunnlag.databevis, async tx => {
      await tx.notification.create({data:{userId:'p',type:'TEST',title:'Syntetisk'}}); return true;
    });
    await t.test('no sharing means no weekly inputs; private/WANG/TN remain separated',async()=>{
      assert.equal(await les(),null);await valg(true);
      for(const gruppeId of ['wang','tn','external']) assert.equal(await hent({...jobb,gruppeId},'p',uke),null);
      assert.equal(await hent(jobb,'private',uke),null);
      assert.equal(await hent({...jobb,coachId:'admin'},'p',uke),null);
    });
    await t.test('same access and data allow a transaction-scoped callback',async()=>{
      const basis=await les();assert.ok(basis);assert.equal(basis.planId,'plan');
      assert.deepEqual(basis.budsjett,{TEK:3});assert.equal(basis.modell.context.completedSessions,1);
      assert.deepEqual(basis.modell.context.sgWeaknesses,['PUTT']);
      assert.deepEqual(await skriv(basis),{verdi:true});
      assert.ok(!JSON.stringify(basis.modell).includes('coach-a'));
      assert.ok(!JSON.stringify(basis.modell).includes('1984'));
    });
    const aar=Number(new Intl.DateTimeFormat('en-GB',{year:'numeric',timeZone:'Europe/Oslo'}).format(new Date()));
    const resultat=(scores:number[],year=aar,klasse='G19')=>({start_date:`${year}-06-01`,year,klasse,plassering:1,
      total_score:scores.reduce((a,b)=>a+b,0),runder:scores.map((score,i)=>({runde:i+1,score})),
      turnering:'Syntetisk privat turneringsnavn',tournament_id:987654});
    const profil={person:{name:'Syntetisk privat profilnavn',birth_year:2009},golf_id:['syntetisk-medlemsnummer'],
      turneringer:[resultat([72,76]),resultat([40],aar,'G19N'),resultat([95],aar-1)]};
    const kilde=async()=>{
      await sql.query(`INSERT INTO profile_links (hq_user_id,status) VALUES ('p','confirmed')`);
      await sql.query(`INSERT INTO profile_niva_fixture VALUES ('p',$1)`,[JSON.stringify(profil)]);
    };
    const ryddNiva=async()=>{await sql.query(`DELETE FROM profile_links; DELETE FROM profile_niva_fixture; UPDATE users SET hcp=NULL WHERE id='p'`);};
    await t.test('confirmed gross results drive A–K; identity and raw scores never enter model fields',async()=>{
      await kilde();await sql.query(`UPDATE users SET hcp=30 WHERE id='p'`);
      try {
        const basis=await les();assert.ok(basis);
        assert.deepEqual(basis.niva,{kategori:'D',kilde:'BRUTTO_TURNERING',aar,runder:2,bruttoSnitt:74,hcp:30});
        assert.equal(basis.modell.category,'D');assert.equal(basis.modell.categorySource,'BRUTTO_TURNERING');
        for(const privateValue of ['Syntetisk privat profilnavn','syntetisk-medlemsnummer','Syntetisk privat turneringsnavn','987654']) {
          assert.ok(!JSON.stringify(basis).includes(privateValue));
        }
        assert.ok(!JSON.stringify(basis.modell).includes('bruttoSnitt'));
        assert.ok(!JSON.stringify(basis.modell).includes('hcp'));
      } finally {await ryddNiva();}
    });
    await t.test('unconfirmed and other player results cannot replace explicitly labelled HCP estimate',async()=>{
      await sql.query(`INSERT INTO profile_links (hq_user_id,status) VALUES ('p','pending'),('private','confirmed'); UPDATE users SET hcp=12 WHERE id='p'`);
      await sql.query(`INSERT INTO profile_niva_fixture VALUES ('p',$1),('private',$1)`,[JSON.stringify(profil)]);
      try {
        const basis=await les();assert.ok(basis);assert.equal(basis.niva.kilde,'HCP_ESTIMAT');
        assert.equal(basis.niva.bruttoSnitt,null);assert.equal(basis.niva.runder,0);
        await sql.query(`UPDATE users SET hcp=NULL WHERE id='p'`);
        assert.equal((await les())?.niva.kilde,'UKJENT');
      } finally {await ryddNiva();}
    });
    await t.test('changed result content and revoked/reconfirmed links invalidate previous basis',async()=>{
      await kilde();
      try {
        let basis=await les();assert.ok(basis);
        await sql.query(`UPDATE profile_niva_fixture SET profile=$1 WHERE user_id='p'`,[JSON.stringify({...profil,turneringer:[resultat([80])]})]);
        assert.equal(await skriv(basis),null);basis=await les();assert.ok(basis);
        await sql.query(`UPDATE profile_links SET status='revoked' WHERE hq_user_id='p'`);
        assert.equal(await skriv(basis),null);
        await sql.query(`UPDATE profile_links SET status='confirmed' WHERE hq_user_id='p'`);
        assert.equal(await skriv(basis),null);assert.ok(await les());
      } finally {await ryddNiva();}
    });
    await t.test('malformed or unavailable source stops instead of silently falling back to HCP',async()=>{
      await kilde();await sql.query(`UPDATE users SET hcp=12 WHERE id='p'`);
      try {
        for(const malformed of [{turneringer:[{year:aar}]},{turneringer:[['start_date','year','klasse','plassering','total_score','runder']]},{turneringer:[{...resultat([72]),runder:[{runde:1}]}]},
          {turneringer:[{...resultat([72]),runder:[{runde:1,score:'72'}]}]}]) {
          await sql.query(`UPDATE profile_niva_fixture SET profile=$1 WHERE user_id='p'`,[JSON.stringify(malformed)]);
          assert.equal(await les(),null);
        }
        await sql.query(`ALTER FUNCTION player_profile_for_user(text,boolean) RENAME TO unavailable_profile`);
        try {await assert.rejects(les());}
        finally {await sql.query(`ALTER FUNCTION unavailable_profile(text,boolean) RENAME TO player_profile_for_user`);}
      } finally {await ryddNiva();}
    });
    await t.test('facility additions, edits, restoration and deletion invalidate the captured state',async()=>{
      let basis=await les();assert.ok(basis);assert.deepEqual(basis.fasiliteter,[]);
      await sql.query(`INSERT INTO player_facilities (id,"userId",name,capabilities) VALUES ('f','p','Syntetisk sted',ARRAY['RADAR'])`);
      assert.equal(await skriv(basis),null);basis=await les();assert.ok(basis);
      assert.deepEqual(basis.fasiliteter,[{capabilities:['RADAR'],type:null,isIndoor:false,rangeLengdeM:null,maksPuttLengdeM:null}]);
      await sql.query(`UPDATE player_facilities SET capabilities=ARRAY['BUNKER'] WHERE id='f'`);
      assert.equal(await skriv(basis),null);
      await sql.query(`UPDATE player_facilities SET capabilities=ARRAY['RADAR'] WHERE id='f'`);
      assert.equal(await skriv(basis),null);basis=await les();assert.ok(basis);
      await sql.query(`DELETE FROM player_facilities WHERE id='f'`);assert.equal(await skriv(basis),null);
    });
    await t.test('other player facilities neither enter the basis nor invalidate it',async()=>{
      const basis=await les();assert.ok(basis);
      await sql.query(`INSERT INTO player_facilities (id,"userId",name,capabilities) VALUES ('outside-f','private','Syntetisk privat sted',ARRAY['RADAR','BUNKER'])`);
      assert.deepEqual((await les())?.fasiliteter,[]);assert.deepEqual(await skriv(basis),{verdi:true});
    });
    await t.test('edited and restored budget is still a new row version',async()=>{
      const basis=await les();assert.ok(basis);
      await sql.query(`UPDATE period_blocks SET "weeklySessionBudget"='{"TEK":4}' WHERE id='period'`);
      assert.equal(await skriv(basis),null);
      await sql.query(`UPDATE period_blocks SET "weeklySessionBudget"='{"TEK":3}' WHERE id='period'`);
      assert.equal(await skriv(basis),null);assert.ok(await les());
    });
    await t.test('session insert, status change and weekly plan additions invalidate old basis',async()=>{
      let basis=await les();assert.ok(basis);
      await sql.query(`INSERT INTO training_sessions_v2 VALUES ('new','p','COMPLETED','2026-10-23')`);
      assert.equal(await skriv(basis),null);basis=await les();assert.ok(basis);
      await sql.query(`UPDATE training_sessions_v2 SET status='COMPLETED' WHERE id='planned'`);
      assert.equal(await skriv(basis),null);basis=await les();assert.ok(basis);
      await sql.query(`INSERT INTO training_plan_sessions VALUES ('plan-session','plan','2026-10-28')`);
      assert.equal(await skriv(basis),null);
    });
    await t.test('other player changes do not invalidate this player snapshot',async()=>{
      const basis=await les();assert.ok(basis);
      await sql.query(`UPDATE training_sessions_v2 SET status='PLANNED' WHERE id='outside'`);
      assert.deepEqual(await skriv(basis),{verdi:true});
    });
    await t.test('month and ISO week overrides are flagged and invalidate old basis',async()=>{
      let basis=await les();assert.ok(basis);assert.equal(basis.harManedsEllerUkevalg,false);
      await sql.query(`INSERT INTO month_plans VALUES ('month','p',2026,10)`);
      assert.equal(await skriv(basis),null);basis=await les();assert.ok(basis);assert.equal(basis.harManedsEllerUkevalg,true);
      await sql.query(`INSERT INTO week_plans VALUES ('week','p',2026,44)`);
      assert.equal(await skriv(basis),null);
    });
    await t.test('nearest manual/catalog event wins; withdrawals and estimated WAGR dates are excluded',async()=>{
      await sql.query(`INSERT INTO tournaments VALUES ('catalog','2026-11-12');
        INSERT INTO wagr_plan_events VALUES ('estimated','2026-10-27',true);
        INSERT INTO tournament_entries (id,"userId","tournamentId") VALUES ('catalog-entry','p','catalog');
        INSERT INTO tournament_entries (id,"userId","manualDate") VALUES ('manual','p','2026-10-29');
        INSERT INTO tournament_entries (id,"userId","wagrPlanEventId") VALUES ('estimate','p','estimated');`);
      const basis=await les();assert.ok(basis);assert.equal(basis.modell.context.daysUntilTournament,3);
      await sql.query(`UPDATE tournament_entries SET "entryStatus"='WITHDRAWN' WHERE id='manual'`);
      assert.equal(await skriv(basis),null);
      const fresh=await les();assert.ok(fresh);assert.equal(fresh.modell.context.daysUntilTournament,17);
      await sql.query(`UPDATE tournaments SET "startDate"='2026-11-10' WHERE id='catalog'`);
      assert.equal(await skriv(fresh),null);
    });
    await t.test('ambiguity, wrong plan owner, dates and foreign period fail closed',async()=>{
      const basis=await les();assert.ok(basis);
      await sql.query(`INSERT INTO training_plans (id,"userId","createdById","isActive") VALUES ('second','p','coach-a',true)`);
      assert.equal(await les(),null);assert.equal(await skriv(basis),null);
      await sql.query(`DELETE FROM training_plans WHERE id='second'; UPDATE training_plans SET "createdById"='coach-b'`);
      assert.equal(await les(),null);
      await sql.query(`UPDATE training_plans SET "createdById"='coach-a',"endDate"='2026-10-27'`);assert.equal(await les(),null);
      await sql.query(`UPDATE training_plans SET "endDate"=NULL; UPDATE period_blocks SET "sourceGroupId"='b'`);
      assert.equal(await les(),null);
      await sql.query(`UPDATE period_blocks SET "sourceGroupId"='a'`);
      assert.ok(await les());
    });
    await t.test('revoke and regrant never legitimize the previous data snapshot',async()=>{
      const basis=await les();assert.ok(basis);await valg(false);assert.equal(await skriv(basis),null);
      await valg(true);assert.equal(await skriv(basis),null);
    });
    await t.test('callback failure rolls back all changes',async()=>{
      const basis=await les();assert.ok(basis);const before=await db.notification.count();
      await assert.rejects(bruk(jobb,'p',basis.deling,basis.databevis,async tx=>{
        await tx.notification.create({data:{userId:'p',type:'TEST',title:'Syntetisk'}});throw Error('rollback');
      }),/rollback/);assert.equal(await db.notification.count(),before);
    });
    await t.test('capture releases locks and subsequent comparison keeps READ COMMITTED freshness',async()=>{
      const basis=await les();assert.ok(basis);
      await sql.query(`UPDATE period_blocks SET "weeklySessionBudget"='{"TEK":5}' WHERE id='period'`);
      assert.equal(await skriv(basis),null);
      const fresh=await les();assert.ok(fresh);
      const isolation=await bruk(jobb,'p',fresh.deling,fresh.databevis,async tx=>tx.$queryRaw`SHOW transaction_isolation`);
      assert.deepEqual(isolation,{verdi:[{transaction_isolation:'read committed'}]});
    });
    await t.test('plan changed while comparison waits for its lock is rejected',async()=>{
      const basis=await les();assert.ok(basis);
      await sql.query('BEGIN');
      await sql.query(`UPDATE training_plans SET "endDate"='2026-12-31' WHERE id='plan'`);
      let finished=false;
      const decision=skriv(basis).then(r=>{finished=true;return r;});
      try {await new Promise(r=>setTimeout(r,120));assert.equal(finished,false);}
      finally {await sql.query('COMMIT');}
      assert.equal(await decision,null);
    });
    await t.test('retraction committed while capture waits for group lock cannot leak old basis',async()=>{
      const { laas } = await import('../../src/lib/deling/ak-analyse-laas');
      const started=Promise.withResolvers<void>(), release=Promise.withResolvers<void>();
      const holding=db.$transaction(async tx=>{
        await laas(tx,'a');started.resolve();await release.promise;
        await tx.$executeRaw`INSERT INTO delings_samtykker (id,"userId",scope,"mottakerGruppeId",gitt,"tekstVersjon","gittAvUserId","gittAvRolle")
          VALUES ('synthetic-retraction','p','AK_GOLF_COACHINGPROFIL','a',false,${AK_PROFIL_VERSJON},'p','SPILLER')`;
      });
      await started.promise;let finished=false;
      const capture=les().then(r=>{finished=true;return r;});
      try {await new Promise(r=>setTimeout(r,120));assert.equal(finished,false);}
      finally {release.resolve();}
      await holding;assert.equal(await capture,null);
    });

  } finally {
    await db.$disconnect(); await sql.end(); await admin.query(`DROP SCHEMA "${schema}" CASCADE`); await admin.end();
  }
});
