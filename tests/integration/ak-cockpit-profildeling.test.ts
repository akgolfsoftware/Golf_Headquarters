/** Faktisk registrering, oppslag og samtidighet mot egen lokal testbase. */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mock, test } from "node:test";
import { Client } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { AK_PROFIL_SCOPE, AK_PROFIL_VERSJON } from "../../src/lib/deling/ak-profil-regler";
const connection = process.env.COACH_LOCK_TEST_DATABASE_URL;
if (!connection) throw Error("Eksplisitt lokal COACH_LOCK_TEST_DATABASE_URL kreves");
const target = new URL(connection);
if (target.hostname !== "127.0.0.1" || target.port !== "55922" || target.pathname !== "/coach_lock_tests") {
  throw Error("Bare egen lokal coach_lock_tests på 127.0.0.1:55922 er tillatt");
}
const schema = `cockpit_test_${randomUUID().replaceAll("-", "")}`;
const options = `-c search_path=${schema}`;
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: connection, options }, { schema }) });
mock.module("../../src/lib/prisma", { namedExports: { prisma: db } });

import { startOfWeek } from "../../src/lib/uke-helpers";

test("Cockpit leser faktiske profil- og turneringsdata bare med fersk AK-deling", async t => {
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

    await sql.query(`ALTER TABLE users ADD COLUMN "createdAt" timestamptz DEFAULT now(),
      ADD COLUMN "lastLoginAt" timestamptz DEFAULT now() - interval '6 days',
      ADD COLUMN "homeClub" text DEFAULT 'Syntetisk klubb', ADD COLUMN phone text;
      CREATE TYPE "SessionStatus" AS ENUM ('PLANNED','COMPLETED','SKIPPED','CANCELLED');
      CREATE TYPE "TournamentEntryStatus" AS ENUM ('PLANNED','CONFIRMED','WITHDRAWN');
      CREATE TABLE training_plans (id text PRIMARY KEY, "userId" text REFERENCES users(id));
      CREATE TABLE training_plan_sessions (id text PRIMARY KEY, "planId" text REFERENCES training_plans(id),
        "scheduledAt" timestamptz, "durationMin" integer, status "SessionStatus");
      CREATE TABLE rounds (id text PRIMARY KEY, "userId" text REFERENCES users(id), "playedAt" timestamptz, "sgTotal" double precision);
      CREATE TABLE course_definitions (id text PRIMARY KEY, name text);
      CREATE TABLE tournaments (id text PRIMARY KEY, name text, "startDate" timestamptz, "endDate" timestamptz, location text, "courseId" text);
      CREATE TABLE tournament_entries (id text PRIMARY KEY, "userId" text REFERENCES users(id), "tournamentId" text,
        "manualName" text, "manualDate" timestamptz, "entryStatus" "TournamentEntryStatus");
      INSERT INTO users (id) VALUES ('hidden'), ('wang-only'), ('tn-only'), ('external-only');
      INSERT INTO group_members (id,"groupId","userId") VALUES ('ha','a','hidden'), ('wo','wang','wang-only'),
        ('to','tn','tn-only'), ('eo','external','external-only');
      UPDATE users SET name='Syntetisk ' || id WHERE role='PLAYER';`);
    const now = new Date();
    const monday = startOfWeek(now);
    const players = ['p','child','private','hidden','wang-only','tn-only','external-only'];
    for (const id of players) {
      await sql.query('INSERT INTO training_plans VALUES ($1,$1)', [id]);
      for (const offset of [-13,-6,0]) {
        const date = new Date(monday.getTime() + offset * 86400000);
        await sql.query('INSERT INTO training_plan_sessions VALUES ($1,$2,$3,60,$4)',
          [`${id}-${offset}`, id, date, offset === 0 ? 'COMPLETED' : 'PLANNED']);
      }
      await sql.query('INSERT INTO rounds VALUES ($1,$1,$2,$3)', [id, now, id === 'p' ? 2 : 99]);
      await sql.query(`INSERT INTO tournament_entries VALUES ($1,$1,NULL,$2,$3,'CONFIRMED')`,
        [id, `Syntetisk turnering ${id}`, new Date(monday.getTime() + 86400000)]);
    }
    const { hentCockpitProfilnokkel } = await import('../../src/lib/agencyos/cockpit-profildata');
    const { lastCockpitTillegg } = await import('../../src/lib/agencyos/cockpit-tillegg');
    const coach = { id: 'coach-a', role: 'COACH' as const };
    const owner = { id: 'admin', role: 'ADMIN' as const };
    async function grant(id='p', group='a', giver=id, role='SELV', version=AK_PROFIL_VERSJON, scope=AK_PROFIL_SCOPE) {
      await db.delingsSamtykke.create({ data: { userId:id, mottakerGruppeId:group, gitt:true,
        gittAvUserId:giver, gittAvRolle:role, tekstVersjon:version, scope } });
    }
    async function expectPlayers(viewer: typeof coach | typeof owner, ids: string[]) {
      const n = await hentCockpitProfilnokkel(viewer, now);
      const d = await lastCockpitTillegg(viewer);
      assert.equal(n.aktiveSpillereCount, ids.length);
      assert.equal(n.nyeSpillereCount, ids.length);
      assert.deepEqual(n.inaktiveSpillere.map(p => p.id).sort(), [...ids].sort());
      assert.equal(n.stallSgAgg._avg.sgTotal, ids.length ? ids.reduce((v,id) => v+(id==='p'?2:99),0)/ids.length : null);
      assert.equal(n.planStatusGrupper.reduce((v,g) => v+g._count._all,0), ids.length*3);
      assert.deepEqual(d.utenforPlan.map(p => p.id).sort(), [...ids].sort());
      assert.deepEqual(d.turneringer.map(e => e.id).sort(), [...ids].sort());
      assert.equal(d.stallensUke.planlagt, ids.length);
      assert.equal(d.stallensUke.gjennomfort, ids.length);
      if (!ids.length) assert.ok(d.etterlevelse.every(w => w.pct===null));
    }
    await t.test('ingen deling gir ingen navn, tellinger, SG eller trening også for ADMIN', async () => {
      await expectPlayers(coach, []); await expectPlayers(owner, []);
    });
    await t.test('gammel versjon og analyse-ja gir ikke profilinnsyn', async () => {
      await grant('p','a','p','SELV','gammel');
      await grant('hidden','a','hidden','SELV',AK_PROFIL_VERSJON,'AK_GOLF_GRUPPEANALYSE');
      await expectPlayers(owner, []);
    });
    await t.test('riktig mottaker får bare eksplisitt delt spiller før summering og radgrense', async () => {
      await grant();
      await expectPlayers(coach, ['p']); await expectPlayers(owner, ['p']);
      await expectPlayers({ id:'coach-b', role:'COACH' }, []);
    });
    await t.test('privat konto, WANG, TN og ekstern gruppe holdes utenfor med lagret ja', async () => {
      for (const [id,group] of [['private','a'],['wang-only','wang'],['tn-only','tn'],['external-only','external']]) await grant(id,group);
      await expectPlayers(owner, ['p']);
    });
    await t.test('trekk skjuler allerede eksisterende økter, resultater og turneringer', async () => {
      await db.delingsSamtykke.updateMany({ where:{ userId:'p',scope:AK_PROFIL_SCOPE }, data:{ gitt:false } });
      await expectPlayers(coach, []); await expectPlayers(owner, []);
      await grant(); await expectPlayers(coach, ['p']);
    });
    await t.test('utmelding og gruppeskifte gir ikke innsyn via andre gruppers medlemskap', async () => {
      await sql.query(`UPDATE group_members SET "endedAt"=now() WHERE id='pa'`);
      await expectPlayers(coach, []); await expectPlayers(owner, []);
      await sql.query(`UPDATE group_members SET "endedAt"=NULL WHERE id='pa'`);
    });
    await t.test('arkivering og endret trener fjerner data for tidligere mottaker', async () => {
      await sql.query(`UPDATE groups SET "arkivertAt"=now() WHERE id='a'`);
      await expectPlayers(owner, []);
      await sql.query(`UPDATE groups SET "arkivertAt"=NULL,"coachId"='coach-b' WHERE id='a'`);
      await expectPlayers(coach, []);
      await sql.query(`UPDATE groups SET "coachId"='coach-a' WHERE id='a'`);
    });
    await t.test('barn krever godkjent foresatt også i tellinger og turneringsoversikt', async () => {
      await grant('child'); await expectPlayers(owner, ['p']);
      await grant('child','a','parent','FORESATT'); await expectPlayers(coach, ['child','p']);
      await sql.query(`UPDATE parent_relations SET approved=false WHERE id='parent-child'`);
      await expectPlayers(owner, ['p']);
    });
    await t.test('slettet aktør gir tomt uten global reserve', async () => {
      await sql.query(`UPDATE users SET "deletedAt"=now() WHERE id='admin'`);
      await expectPlayers(owner, []);
    });
  } finally {
    await db.$disconnect(); await sql.end();
    await admin.query(`DROP SCHEMA "${schema}" CASCADE`); await admin.end();
  }
});
