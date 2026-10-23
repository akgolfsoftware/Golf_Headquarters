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
const schema = `profil_bevis_test_${randomUUID().replaceAll("-", "")}`;
const options = `-c search_path=${schema}`;
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: connection, options }, { schema }) });
mock.module("../../src/lib/prisma", { namedExports: { prisma: db } });

test("Profilbevis: identisk delingsgrunnlag før og etter modellarbeid", async t => {
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
    const { hentMedAkProfilBevis: hent, brukMedSammeAkProfilBevis: bruk } = await import('../../src/lib/deling/ak-profil-mellomlagring');
    const { settAkProfilValg: sett } = await import('../../src/lib/deling/ak-profil-valg');
    const jobb = { gruppeId: 'a', coachId: 'coach-a' };
    const valg = (gitt: boolean, gruppeId = 'a', spillerId = 'p', aktor = {id:'p',role:'PLAYER'}) => sett(aktor, spillerId, {gruppeId,gitt,tekstVersjon:AK_PROFIL_VERSJON});
    const les = () => hent(jobb,'p',async(tx,where) => (await tx.user.findFirstOrThrow({where,select:{name:true}})).name);
    const skriv = async (proof: unknown, job = jobb, player = 'p') => bruk(job,player,proof,async tx => {
      await tx.notification.create({data:{userId:player,type:'TEST',title:'Syntetisk'}}); return true;
    });
    await t.test('no sharing, private, WANG, TN and external groups have no proof',async()=>{
      assert.equal(await les(),null);
      for(const gruppeId of ['wang','tn','external']) assert.equal(await hent({...jobb,gruppeId},'p',async()=>true),null);
      assert.equal(await hent(jobb,'private',async()=>true),null);
    });
    await t.test('same current basis permits transaction-scoped read and write',async()=>{
      assert.deepEqual(await valg(true),{ok:true});
      const snapshot=await les();assert.ok(snapshot);assert.equal(snapshot.verdi,'Syntetisk spiller');
      assert.equal(JSON.stringify(snapshot.bevis).includes('1984'),false);
      assert.equal(JSON.stringify(snapshot.bevis).includes('Syntetisk'),false);
      assert.deepEqual(await skriv(snapshot.bevis),{verdi:true});
      assert.equal(await skriv({...snapshot.bevis,gruppeId:'b'}),null);
      assert.equal(await skriv(snapshot.bevis,{gruppeId:'b',coachId:'coach-b'}),null);
      assert.equal(await skriv(snapshot.bevis,jobb,'private'),null);
    });
    await t.test('revoke and regrant never revives old snapshot even with same text version',async()=>{
      const old=await les();assert.ok(old);await valg(false);
      assert.equal(await skriv(old.bevis),null);await valg(true);
      assert.equal(await skriv(old.bevis),null);
      const fresh=await les();assert.ok(fresh);assert.notEqual(fresh.bevis.fingeravtrykk,old.bevis.fingeravtrykk);
      assert.deepEqual(await skriv(fresh.bevis),{verdi:true});
    });
    await t.test('end and rejoin on the same membership row invalidates old basis',async()=>{
      const old=await les();assert.ok(old);
      await sql.query(`UPDATE group_members SET "endedAt"=now() WHERE id='pa'`);
      assert.equal(await skriv(old.bevis),null);
      await sql.query(`UPDATE group_members SET "endedAt"=NULL WHERE id='pa'`);
      assert.equal(await skriv(old.bevis),null);assert.ok(await les());
    });
    await t.test('archive and restore cannot revive a cached basis',async()=>{
      const old=await les();assert.ok(old);
      await sql.query(`UPDATE groups SET "arkivertAt"=now() WHERE id='a'`);
      assert.equal(await skriv(old.bevis),null);
      await sql.query(`UPDATE groups SET "arkivertAt"=NULL WHERE id='a'`);
      assert.equal(await skriv(old.bevis),null);assert.ok(await les());
    });
    await t.test('responsible coach and current role are enforced for ADMIN too',async()=>{
      const old=await les();assert.ok(old);
      assert.equal(await hent({...jobb,coachId:'admin'},'p',async()=>true),null);
      await sql.query(`UPDATE groups SET "coachId"='admin' WHERE id='a'`);
      assert.equal(await skriv(old.bevis),null);
      const adminJob={...jobb,coachId:'admin'};
      const current=await hent(adminJob,'p',async()=>true);assert.ok(current);
      assert.deepEqual(await skriv(current.bevis,adminJob),{verdi:true});
      await sql.query(`UPDATE users SET role='PLAYER' WHERE id='admin'`);
      assert.equal(await skriv(current.bevis,adminJob),null);
      await sql.query(`UPDATE users SET role='ADMIN' WHERE id='admin'`);
      assert.equal(await skriv(current.bevis,adminJob),null);
      await sql.query(`UPDATE groups SET "coachId"='coach-a' WHERE id='a'`);
      assert.equal(await skriv(old.bevis),null);
    });
    await t.test('guardian revoke and restore invalidates the same-row basis',async()=>{
      assert.deepEqual(await valg(true,'a','child',{id:'parent',role:'PARENT'}),{ok:true});
      const snapshot=await hent(jobb,'child',async()=>true);assert.ok(snapshot);
      await sql.query(`UPDATE parent_relations SET approved=false WHERE id='parent-child'`);
      assert.equal(await skriv(snapshot.bevis,jobb,'child'),null);
      await sql.query(`UPDATE parent_relations SET approved=true WHERE id='parent-child'`);
      assert.equal(await skriv(snapshot.bevis,jobb,'child'),null);
      assert.ok(await hent(jobb,'child',async()=>true));
    });
    await t.test('profile alteration and restoration also requires fresh capture',async()=>{
      const snapshot=await les();assert.ok(snapshot);
      await sql.query(`UPDATE users SET "deletedAt"=now() WHERE id='p'`);
      assert.equal(await skriv(snapshot.bevis),null);
      await sql.query(`UPDATE users SET "deletedAt"=NULL WHERE id='p'`);
      assert.equal(await skriv(snapshot.bevis),null);assert.ok(await les());
    });
    await t.test('failed mutation rolls back and cannot be reported as accepted',async()=>{
      const snapshot=await les();assert.ok(snapshot);const count=await db.notification.count();
      await assert.rejects(bruk(jobb,'p',snapshot.bevis,async tx=>{
        await tx.notification.create({data:{userId:'p',type:'TEST',title:'Syntetisk'}});
        throw Error('synthetic-rollback');
      }),/synthetic-rollback/);
      assert.equal(await db.notification.count(),count);
    });
    await t.test('no lock remains between capture and model work; retraction completes',async()=>{
      const snapshot=await les();assert.ok(snapshot);
      assert.deepEqual(await valg(false),{ok:true});assert.equal(await skriv(snapshot.bevis),null);
      await valg(true);
    });
    await t.test('decision holds sharing lock through mutation; next decision after revoke is denied',async()=>{
      const snapshot=await les();assert.ok(snapshot);
      const started=Promise.withResolvers<void>(),release=Promise.withResolvers<void>();
      const decision=bruk(jobb,'p',snapshot.bevis,async tx=>{
        started.resolve();await release.promise;
        await tx.notification.create({data:{userId:'p',type:'TEST',title:'Syntetisk'}});return true;
      });
      await started.promise;let revoked=false;
      const revoke=valg(false).then(r=>{revoked=true;return r;});
      try {await new Promise(r=>setTimeout(r,120));assert.equal(revoked,false);}
      finally {release.resolve();}
      assert.deepEqual(await decision,{verdi:true});assert.deepEqual(await revoke,{ok:true});
      assert.equal(await skriv(snapshot.bevis),null);
    });
  } finally {
    await db.$disconnect(); await sql.end(); await admin.query(`DROP SCHEMA "${schema}" CASCADE`); await admin.end();
  }
});
