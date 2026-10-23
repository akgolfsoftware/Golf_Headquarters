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
const schema = `profil_test_${randomUUID().replaceAll("-", "")}`;
const options = `-c search_path=${schema}`;
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: connection, options }, { schema }) });
mock.module("../../src/lib/prisma", { namedExports: { prisma: db } });

test("AK-profildeling: faktisk gi, trekk, innsyn og samtidighetsvern", async t => {
  const admin = new Client({ connectionString: connection });
  const sql = new Client({ connectionString: connection, options });
  await admin.connect(); await admin.query(`CREATE SCHEMA "${schema}"`); await sql.connect();
  try {
    await sql.query(`CREATE TYPE "UserRole" AS ENUM ('PLAYER', 'COACH', 'ADMIN', 'PARENT');
      CREATE TYPE "PlayerProgram" AS ENUM ('AK_ACADEMY', 'WANG_TOPPIDRETT', 'WANG_UNG');
      CREATE TABLE users (id text PRIMARY KEY, role "UserRole" NOT NULL DEFAULT 'PLAYER', "deletedAt" timestamptz,
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
    const { medAkProfiler } = await import('../../src/lib/deling/ak-profil-lesing');
    const { settAkProfilValg, hentAkProfilValg } = await import('../../src/lib/deling/ak-profil-valg');
    const a = { id: 'coach-a', role: 'COACH' }, b = { id: 'coach-b', role: 'COACH' };
    const adminViewer = { id: 'admin', role: 'ADMIN' };
    const selv = { id: 'p', role: 'PLAYER' }, barn = { id: 'child', role: 'PLAYER' }, parent = { id: 'parent', role: 'PARENT' };
    const les = (viewer = adminViewer) => medAkProfiler(viewer, async (tx, scope) => (await tx.user.findMany({ where: scope,
      select: { id: true }, orderBy: { id: 'asc' } })).map(p => p.id));
    const svar = (gitt: boolean, gruppeId = 'a') => ({ gruppeId, gitt, tekstVersjon: AK_PROFIL_VERSJON });

    await t.test('ingen ja, gamle analysevalg og privat konto gir ingen profil, også for ADMIN', async () => {
      assert.deepEqual(await les(), []); assert.deepEqual(await les(a), []);
      await db.delingsSamtykke.create({ data: { userId: 'p', scope: 'AK_GOLF_GRUPPEANALYSE', mottakerGruppeId: 'a',
        gitt: true, tekstVersjon: AK_PROFIL_VERSJON, gittAvUserId: 'p', gittAvRolle: 'SELV' } });
      assert.deepEqual(await les(), []);
      assert.equal((await settAkProfilValg({ id: 'private', role: 'PLAYER' }, 'private', svar(true))).ok, false);
    });
    await t.test('eget ja registrerer giver og versjon, men gir bare riktig gruppes trener innsyn', async () => {
      assert.deepEqual(await settAkProfilValg(selv, 'p', svar(true)), { ok: true });
      assert.deepEqual(await les(a), ['p']); assert.deepEqual(await les(), ['p']);
      assert.deepEqual(await les(b), []); assert.deepEqual(await les({ id: 'assistant', role: 'COACH' }), ['p']);
      const rad = await db.delingsSamtykke.findFirstOrThrow({ where: { scope: AK_PROFIL_SCOPE } });
      assert.equal(rad.gittAvUserId, 'p'); assert.equal(rad.mottakerUserId, null); assert.equal(rad.tekstVersjon, AK_PROFIL_VERSJON);
      const valg = await hentAkProfilValg('p');
      assert.deepEqual(valg.map(v => v.gruppeId), ['a', 'b']);
      assert.equal(valg.find(v => v.gruppeId === 'a')?.deler, true);
    });
    await t.test('ADMIN, feil forelder, klientidentitet og gammel versjon kan ikke gi på vegne av andre', async () => {
      const antall = await db.delingsSamtykke.count();
      assert.equal((await settAkProfilValg(adminViewer, 'p', svar(true))).ok, false);
      assert.equal((await settAkProfilValg(parent, 'p', svar(true))).ok, false);
      assert.equal((await settAkProfilValg(selv, 'p', { ...svar(true), spillerId: 'child' })).ok, false);
      assert.equal((await settAkProfilValg(selv, 'p', { ...svar(true), tekstVersjon: 'gammel' })).ok, false);
      assert.equal(await db.delingsSamtykke.count(), antall);
    });
    await t.test('WANG, TN og ikke-AK-gruppe får ikke dette jaet', async () => {
      for (const gruppe of ['wang', 'tn', 'external']) assert.equal((await settAkProfilValg(selv, 'p', svar(true, gruppe))).ok, false);
    });
    await t.test('barn krever godkjent foresatt, barnet kan trekke selv', async () => {
      assert.equal((await settAkProfilValg(barn, 'child', svar(true))).ok, false);
      assert.deepEqual(await settAkProfilValg(parent, 'child', svar(true)), { ok: true });
      assert.deepEqual(await les(a), ['child', 'p']);
      await sql.query(`UPDATE parent_relations SET approved=false WHERE id='parent-child'`);
      assert.deepEqual(await les(a), ['p']);
      assert.equal((await hentAkProfilValg('child'))[0].harLagretJa, true);
      assert.deepEqual(await settAkProfilValg(barn, 'child', svar(false)), { ok: true });
      await sql.query(`UPDATE parent_relations SET approved=true WHERE id='parent-child'`);
      assert.deepEqual(await les(a), ['p']);
    });
    await t.test('utmelding og arkivering fjerner innsyn; trekk virker også etterpå', async () => {
      await sql.query(`UPDATE group_members SET "endedAt"=now() WHERE id='pa'`);
      assert.deepEqual(await les(a), []); assert.deepEqual(await les(), []);
      assert.deepEqual(await settAkProfilValg(selv, 'p', svar(false)), { ok: true });
      assert.equal((await settAkProfilValg(selv, 'p', svar(true))).ok, false);
      await sql.query(`UPDATE group_members SET "endedAt"=NULL WHERE id='pa'`);
      assert.deepEqual(await les(a), []);
      await settAkProfilValg(selv, 'p', svar(true));
      await sql.query(`UPDATE groups SET "arkivertAt"=now() WHERE id='a'`);
      assert.deepEqual(await les(), []);
      assert.deepEqual(await settAkProfilValg(selv, 'p', svar(false)), { ok: true });
      await sql.query(`UPDATE groups SET "arkivertAt"=NULL WHERE id='a'`);
    });
    await t.test('fersk kontorolle, sletting og 16-årsgrense styrer', async () => {
      await settAkProfilValg(selv, 'p', svar(true));
      await sql.query(`UPDATE users SET role='PLAYER' WHERE id='admin'`);
      assert.equal(await les(), null);
      await sql.query(`UPDATE users SET role='ADMIN' WHERE id='admin'; UPDATE users SET "deletedAt"=now() WHERE id='p'`);
      assert.deepEqual(await les(a), []);
      await sql.query(`UPDATE users SET "deletedAt"=NULL WHERE id='p'; UPDATE users SET "dateOfBirth"='2000-01-01', "requiresGuardianConsent"=true WHERE id='child'`);
      assert.equal((await settAkProfilValg(parent, 'child', svar(true))).ok, false);
      assert.equal((await settAkProfilValg(barn, 'child', svar(true))).ok, false);
      await sql.query(`UPDATE users SET "dateOfBirth"='2013-01-01', "requiresGuardianConsent"=false WHERE id='child'`);
    });
    await t.test('trekk venter på pågående beskyttet lesing og stopper neste oppslag', async () => {
      const klar = Promise.withResolvers<void>(), slipp = Promise.withResolvers<void>();
      const lesing = medAkProfiler(a, async (tx, scope) => {
        const ids = await tx.user.findMany({ where: scope, select: { id: true } });
        klar.resolve(); await slipp.promise; return ids.map(p => p.id);
      });
      void lesing.catch(klar.reject);
      await klar.promise;
      let ferdig = false;
      const trekk = settAkProfilValg(selv, 'p', svar(false)).then(r => { ferdig = true; return r; });
      try {
        await new Promise(r => setTimeout(r, 120));
        assert.equal(ferdig, false);
      } finally { slipp.resolve(); }
      assert.deepEqual(await lesing, ['p']);
      assert.deepEqual(await trekk, { ok: true });
      assert.deepEqual(await les(a), []);
    });
    for (const [navn, endring] of [
      ['arkivering', `UPDATE groups SET "arkivertAt"=now() WHERE id='a'`],
      ['utmelding', `UPDATE group_members SET "endedAt"=now() WHERE id='pa'`],
      ['aktørrolle', `UPDATE users SET role='PLAYER' WHERE id='coach-a'`],
      ['foreldrerett', `UPDATE parent_relations SET approved=false WHERE id='parent-child'`],
    ]) {
      await t.test(`${navn} kan ikke endres under beskyttet datalesing`, async () => {
        const klar = Promise.withResolvers<void>(), slipp = Promise.withResolvers<void>();
        const lesing = medAkProfiler(a, async () => { klar.resolve(); await slipp.promise; return true; });
        void lesing.catch(klar.reject);
        try {
          await klar.promise; await sql.query('BEGIN'); await sql.query("SET LOCAL lock_timeout='150ms'");
          await assert.rejects(sql.query(endring), /lock timeout/);
        } finally { await sql.query('ROLLBACK'); slipp.resolve(); }
        assert.equal(await lesing, true);
      });
    }
    await t.test('feilet audit ruller tilbake ja; feilet lesing frigjør låsene', async () => {
      const antall = await db.delingsSamtykke.count();
      await sql.query(`ALTER TABLE audit_logs ADD CONSTRAINT synthetic_audit_failure CHECK (action <> 'deling.ak-profil.gitt') NOT VALID`);
      try {
        await assert.rejects(settAkProfilValg(selv, 'p', svar(true)));
        assert.equal(await db.delingsSamtykke.count(), antall);
        assert.deepEqual(await les(a), []);
      } finally { await sql.query('ALTER TABLE audit_logs DROP CONSTRAINT synthetic_audit_failure'); }
      await assert.rejects(medAkProfiler(a, async () => { throw Error('syntetisk lesefeil'); }), /syntetisk lesefeil/);
      assert.deepEqual(await settAkProfilValg(selv, 'p', svar(true)), { ok: true });
      assert.deepEqual(await les(a), ['p']);
      await settAkProfilValg(selv, 'p', svar(false));
    });
    await t.test('nye ja oppgraderer aldri gammel analysehistorikk og audit inneholder ikke profilinnhold', async () => {
      assert.equal(await db.delingsSamtykke.count({ where: { scope: 'AK_GOLF_GRUPPEANALYSE', gitt: true } }), 1);
      const audits = await db.auditLog.findMany();
      assert.ok(audits.length > 0);
      assert.equal(audits.every(a => a.action.startsWith('deling.ak-profil.')), true);
      assert.equal(JSON.stringify(audits).includes('Syntetisk'), false);
    });
  } finally {
    await db.$disconnect(); await sql.end(); await admin.query(`DROP SCHEMA "${schema}" CASCADE`); await admin.end();
  }
});
