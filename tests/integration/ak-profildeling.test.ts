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
    const { medAkProfiler } = await import('../../src/lib/deling/ak-profil-lesing');
    const { settAkProfilValg, hentAkProfilValg } = await import('../../src/lib/deling/ak-profil-valg');
    const { medAkProfilHandling } = await import('../../src/lib/deling/ak-profil-handling');
    const { buildWriteTools } = await import('../../src/lib/caddie/tools/write');
    const { executeApprovedTool } = await import('../../src/lib/caddie/approval-executor');
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
    await t.test('gruppegrunnlag kan bestilles for hele stallen uten å inkludere andre mottakere', async () => {
      for (const viewer of [a, adminViewer]) {
        const grunnlag = await medAkProfiler(viewer, async (_tx, _scope, g) => g, 'les', { medGrunnlag: true });
        assert.deepEqual(grunnlag?.map(g => [g.spillerId, g.gruppeId]), [['p', 'a']]);
        assert.match(grunnlag![0].fingeravtrykk, /^[a-f0-9]{64}$/);
      }
      assert.equal(await medAkProfiler(a, async () => true, 'les', { gruppeId: '', medGrunnlag: true }), null);
    });
    await t.test('helsetrekk venter på profillesing; neste lesing mister detaljinnsyn', async () => {
      await sql.query(`CREATE TABLE helse_samtykker (id text PRIMARY KEY, "userId" text REFERENCES users(id),
        type text NOT NULL, gitt boolean NOT NULL, "tekstVersjon" text NOT NULL,
        "gittAvUserId" text NOT NULL, "gittAvRolle" text NOT NULL, "createdAt" timestamptz NOT NULL DEFAULT now())`);
      const { registrerHelseSamtykke, hentSamtykkeStatus } = await import('../../src/lib/health/samtykke');
      const valg = { userId: 'p', gittAvUserId: 'p', gittAvRolle: 'SELV' as const };
      await registrerHelseSamtykke({ ...valg, type: 'MANUELL_HELSE', gitt: true });
      await registrerHelseSamtykke({ ...valg, type: 'COACH_INNSYN', gitt: true });
      await registrerHelseSamtykke({ ...valg, type: 'COACH_DETALJ', gitt: true });
      const klar = Promise.withResolvers<void>(), slipp = Promise.withResolvers<void>();
      const lesing = medAkProfiler(a, async tx => {
        const status = await hentSamtykkeStatus('p', tx);
        klar.resolve(); await slipp.promise;
        return status.coachDetalj;
      });
      void lesing.catch(klar.reject); await klar.promise;
      let ferdig = false;
      const trekk = registrerHelseSamtykke({ ...valg, type: 'COACH_DETALJ', gitt: false }).then(() => { ferdig = true; });
      try { await new Promise(r => setTimeout(r, 120)); assert.equal(ferdig, false); }
      finally { slipp.resolve(); }
      assert.equal(await lesing, true); await trekk;
      assert.equal(await medAkProfiler(a, async tx => (await hentSamtykkeStatus('p', tx)).coachDetalj), false);
      assert.equal(await db.helseSamtykke.count(), 4, 'gammel historikk beholdes');
      await assert.rejects(registrerHelseSamtykke({ ...valg, userId: 'child', type: 'COACH_INNSYN', gitt: true }), /foresatt/);
      assert.equal(await db.helseSamtykke.count(), 4, 'nektet barns samtykke rulles tilbake');
    });
    await t.test('Samtaler leser bare egne direkte tråder, notater og ferdige videoer, også for ADMIN', async () => {
      await sql.query(`CREATE TABLE coaching_sessions (id text PRIMARY KEY, "userId" text, "coachId" text,
        kind text, messages jsonb, "updatedAt" timestamptz DEFAULT '2026-01-01');
        CREATE TABLE coach_notes (id text PRIMARY KEY, "playerId" text, "coachId" text, content text,
          "isPrivate" boolean, "updatedAt" timestamptz DEFAULT '2026-01-01');
        CREATE TABLE session_videos (id text PRIMARY KEY, "playerId" text, "coachId" text,
          title text, status text, "createdAt" timestamptz DEFAULT '2026-01-01');
        INSERT INTO coaching_sessions (id, "userId", "coachId", kind, messages) VALUES
          ('a-direct','p','coach-a','DIRECT','[{"content":"syntetisk hemmelig tekst"},{}]'),
          ('admin-direct','p','admin','DIRECT','[{}]'),
          ('b-direct','p','coach-b','DIRECT','[{}]'),
          ('a-ai','p','coach-a','AI','[{}]'), ('admin-ai','p','admin','AI','[{}]'),
          ('a-live','p','coach-a','LIVE','[{}]'), ('admin-live','p','admin','LIVE','[{}]'),
          ('other-player','private','coach-a','DIRECT','[{}]'),
          ('a-malformed','p','coach-a','DIRECT','{}');
        INSERT INTO coach_notes (id, "playerId", "coachId", content, "isPrivate", "updatedAt") VALUES
          ('a-note','p','coach-a','Eget syntetisk notat',true,'2026-01-01'),
          ('admin-note','p','admin','Eget administratornotat',true,'2026-01-01'),
          ('b-note','p','coach-b','Andre treneres notat',false,'2026-02-01'),
          ('b-private','p','coach-b','Andre treneres private notat',true,'2026-03-01'),
          ('private-note','private','coach-a','Annen spiller',true,'2026-04-01');
        INSERT INTO session_videos (id, "playerId", "coachId", title, status) VALUES
          ('a-video','p','coach-a','Egen video','READY'),
          ('admin-video','p','admin','Egen adminvideo','READY'),
          ('b-video','p','coach-b','Annen trener','READY'),
          ('a-failed','p','coach-a','Feilet','FAILED'),
          ('admin-pending','p','admin','Behandles','PROCESSING'),
          ('private-video','private','coach-a','Annen spiller','READY');`);
      // Private Caddie-/spilleropptakstabeller finnes ikke: et overskuddsoppslag ville feilet.
      const { lastSpiller360Samtaler } = await import('../../src/lib/admin-spiller/spiller360-samtaler-data');
      const trener = await lastSpiller360Samtaler(a, 'p');
      assert.deepEqual(trener?.traader.map(v => [v.id, v.antall]), [['a-direct', 2], ['a-malformed', 0]]);
      assert.equal(trener?.notat?.tekst, 'Eget syntetisk notat');
      assert.deepEqual(trener?.videoer.map(v => v.id), ['a-video']);
      const administrator = await lastSpiller360Samtaler(adminViewer, 'p');
      assert.deepEqual(administrator?.traader.map(v => [v.id, v.antall]), [['admin-direct', 1]]);
      assert.equal(administrator?.notat?.tekst, 'Eget administratornotat');
      assert.deepEqual(administrator?.videoer.map(v => v.id), ['admin-video']);
      assert.deepEqual(Object.keys(trener!).sort(), ['notat', 'traader', 'videoer']);
      assert.ok(!JSON.stringify(trener).includes('syntetisk hemmelig tekst'));
      assert.deepEqual(await lastSpiller360Samtaler({ id: 'assistant', role: 'COACH' }, 'p'),
        { traader: [], notat: null, videoer: [] });
      assert.equal(await lastSpiller360Samtaler(b, 'p'), null);
      assert.equal(await lastSpiller360Samtaler(a, 'private'), null);
      await settAkProfilValg(selv, 'p', svar(false));
      assert.equal(await lastSpiller360Samtaler(a, 'p'), null);
      assert.equal(await lastSpiller360Samtaler(adminViewer, 'p'), null);
      await settAkProfilValg(selv, 'p', svar(true));
      assert.equal((await lastSpiller360Samtaler(a, 'p'))?.notat?.tekst, 'Eget syntetisk notat');
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
    await t.test('handlingsrett må gjelde samme delende gruppe, assistentens leserett er utilstrekkelig', async () => {
      await settAkProfilValg(selv, 'p', svar(true));
      const assistant = { id: 'assistant', role: 'COACH' };
      assert.deepEqual(await les(assistant), ['p']);
      await assert.rejects(medAkProfilHandling(assistant, 'p', async () => true), /ikke tilgang/);
      await sql.query(`INSERT INTO group_members (id,"groupId","userId",role) VALUES ('assistant-b','b','assistant','COACH')`);
      await assert.rejects(medAkProfilHandling(assistant, 'p', async () => true), /ikke tilgang/);
      await settAkProfilValg(selv, 'p', svar(true, 'b'));
      assert.equal(await medAkProfilHandling(assistant, 'p', async () => true), true);
      await settAkProfilValg(selv, 'p', svar(false, 'b'));
    });
    await t.test('ekte forslagsverktøy gir bare utkast; trekk stopper både nytt forslag og gammelt godkjent utkast', async () => {
      const tools = buildWriteTools(adminViewer);
      const input = { playerId: 'p', subject: 'Syntetisk golf', body: 'Syntetisk trening' };
      const options = { toolCallId: 'syntetisk-kall', messages: [] };
      const draft = await tools.draftPlayerMessage.execute!(input, options);
      assert.equal(JSON.stringify(draft).includes('"needsApproval":true'), true);
      assert.equal(await db.notification.count(), 0);
      await settAkProfilValg(selv, 'p', svar(false));
      const denied = await tools.draftPlayerMessage.execute!(input, options);
      assert.equal(JSON.stringify(denied).includes('"ok":false'), true);
      for (const [tool, args] of [
        ['draftPlayerMessage', input], ['draftPlayerNote', { playerId: 'p', note: 'Syntetisk notat' }],
        ['draftPlanAdjustment', { playerId: 'p', change: 'Syntetisk justering' }],
        ['reengageInactivePlayer', { spillerId: 'p', foreslattMelding: 'Syntetisk oppfølging' }],
      ] as const) await assert.rejects(executeApprovedTool(tool, args, 'admin'), /ikke tilgang/);
      assert.equal(await db.notification.count(), 0);
      await settAkProfilValg(selv, 'p', svar(true));
      const result = await executeApprovedTool('draftPlayerMessage', input, 'admin');
      assert.equal(result.status, 'queued');
      assert.equal(await db.notification.count(), 1);
      await sql.query(`UPDATE users SET role='PLAYER' WHERE id='admin'`);
      await assert.rejects(executeApprovedTool('draftPlayerMessage', input, 'admin'), /ikke tilgang/);
      await sql.query(`UPDATE users SET role='ADMIN' WHERE id='admin'`);
      assert.equal(await db.notification.count(), 1);
      // Samme executor brukes av COACH-dashboardet og ADMIN-chatten.
      await executeApprovedTool('draftPlayerMessage', input, 'coach-a');
      assert.equal(await db.notification.count(), 2);
      for (const actorId of ['coach-b', 'assistant', 'parent', 'p']) {
        await assert.rejects(executeApprovedTool('draftPlayerMessage', input, actorId), /ikke tilgang/);
      }
      assert.equal(await db.notification.count(), 2);
    });
    await t.test('trekk venter på pågående DB-handling; neste handling avvises og feilet handling rulles tilbake', async () => {
      const klar = Promise.withResolvers<void>(), slipp = Promise.withResolvers<void>();
      const handling = medAkProfilHandling(adminViewer, 'p', async tx => {
        await tx.notification.create({ data: { userId: 'p', type: 'NOTE', title: 'Syntetisk' } });
        klar.resolve(); await slipp.promise; return true;
      });
      void handling.catch(klar.reject); await klar.promise;
      let ferdig = false;
      const trekk = settAkProfilValg(selv, 'p', svar(false)).then(r => { ferdig = true; return r; });
      try { await new Promise(r => setTimeout(r, 120)); assert.equal(ferdig, false); }
      finally { slipp.resolve(); }
      assert.equal(await handling, true); assert.deepEqual(await trekk, { ok: true });
      await assert.rejects(medAkProfilHandling(adminViewer, 'p', async () => true), /ikke tilgang/);
      await settAkProfilValg(selv, 'p', svar(true));
      const count = await db.notification.count();
      await assert.rejects(medAkProfilHandling(adminViewer, 'p', async tx => {
        await tx.notification.create({ data: { userId: 'p', type: 'NOTE', title: 'Syntetisk feil' } });
        throw Error('syntetisk rollback');
      }), /syntetisk rollback/);
      assert.equal(await db.notification.count(), count);
      await settAkProfilValg(selv, 'p', svar(false));
    });
    await t.test('nye ja oppgraderer aldri gammel analysehistorikk og audit inneholder ikke profilinnhold', async () => {
      assert.equal(await db.delingsSamtykke.count({ where: { scope: 'AK_GOLF_GRUPPEANALYSE', gitt: true } }), 1);
      const audits = await db.auditLog.findMany();
      assert.ok(audits.length > 0);
      assert.equal(audits.every(a => a.action.startsWith('deling.ak-profil.') || a.action.startsWith('helse.samtykke.')), true);
      assert.equal(JSON.stringify(audits).includes('Syntetisk'), false);
    });
  } finally {
    await db.$disconnect(); await sql.end(); await admin.query(`DROP SCHEMA "${schema}" CASCADE`); await admin.end();
  }
});
