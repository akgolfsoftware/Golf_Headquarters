/** Faktiske Prisma-filtre mot isolert Postgres; bare syntetiske konto-ID-er. */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mock, test } from "node:test";
import { Client } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Prisma } from "../../src/generated/prisma/client";

const connection = process.env.COACH_LOCK_TEST_DATABASE_URL;
if (!connection) throw Error("Eksplisitt lokal COACH_LOCK_TEST_DATABASE_URL kreves");
const target = new URL(connection);
if (target.hostname !== "127.0.0.1" || target.port !== "55922" || target.pathname !== "/coach_lock_tests") {
  throw Error("Bare egen lokal coach_lock_tests på 127.0.0.1:55922 er tillatt");
}
const schema = `agency_test_${randomUUID().replaceAll("-", "")}`;
const options = `-c search_path=${schema}`;
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: connection, options }, { schema }) });
mock.module("../../src/lib/prisma", { namedExports: { prisma: db } });

test("C1: gruppe- og mottakergrenser i faktiske SQL-oppslag", async t => {
  const admin = new Client({ connectionString: connection });
  const sql = new Client({ connectionString: connection, options });
  await admin.connect();
  await admin.query(`CREATE SCHEMA "${schema}"`);
  await sql.connect();
  try {
    await sql.query(`CREATE TYPE "UserRole" AS ENUM ('PLAYER', 'COACH', 'ADMIN', 'PARENT');
      CREATE TYPE "PlayerProgram" AS ENUM ('AK_ACADEMY', 'PLATFORM_ONLY', 'WANG_UNG', 'WANG_TOPPIDRETT');
      CREATE TABLE users (id text PRIMARY KEY, role "UserRole" NOT NULL DEFAULT 'PLAYER', "deletedAt" timestamptz);
      CREATE TABLE groups (id text PRIMARY KEY, "coachId" text, "managedByAkGolf" boolean NOT NULL DEFAULT true,
        "arkivertAt" timestamptz, program "PlayerProgram", slug text);
      CREATE TABLE group_members (id text PRIMARY KEY, "groupId" text REFERENCES groups(id), "userId" text REFERENCES users(id),
        role text NOT NULL DEFAULT 'PLAYER', "endedAt" timestamptz);
      CREATE TABLE player_enrollments (id text PRIMARY KEY, "userId" text REFERENCES users(id), "coachId" text,
        program "PlayerProgram" NOT NULL DEFAULT 'AK_ACADEMY', "endedAt" timestamptz);
      INSERT INTO users (id, role) VALUES ('trener-a', 'COACH'), ('trener-b', 'COACH'), ('assistent', 'COACH'), ('admin', 'ADMIN');
      INSERT INTO groups (id, "coachId") VALUES ('aktiv', 'trener-a'), ('arkivert', 'trener-a'), ('ekstern', 'trener-a'),
        ('wang', 'trener-a'), ('wang-annen-skole', 'trener-a'), ('tn', 'trener-a'), ('annen', 'trener-b'), ('medtrener', 'trener-b');
      UPDATE groups SET "arkivertAt" = now() WHERE id = 'arkivert';
      UPDATE groups SET "managedByAkGolf" = false WHERE id IN ('ekstern', 'wang-annen-skole');
      UPDATE groups SET program = 'WANG_TOPPIDRETT' WHERE id IN ('wang', 'wang-annen-skole');
      UPDATE groups SET slug = 'team-norway' WHERE id = 'tn';
      INSERT INTO group_members (id, "groupId", "userId", role) VALUES
        ('assistent-rolle', 'aktiv', 'assistent', 'ASSISTANT'), ('medtrener-rolle', 'medtrener', 'trener-a', 'COACH');`);
    for (const id of ['aktiv', 'arkivert', 'ekstern', 'wang', 'wang-annen-skole', 'tn', 'annen', 'medtrener', 'utmeldt', 'feil-rolle', 'slettet', 'kryssgruppe', 'egen-kunde', 'annen-kunde', 'privat', 'platform']) {
      await sql.query('INSERT INTO users (id) VALUES ($1)', [id]);
    }
    for (const gruppe of ['aktiv', 'arkivert', 'ekstern', 'wang', 'wang-annen-skole', 'tn', 'annen', 'medtrener']) {
      await sql.query('INSERT INTO group_members (id, "groupId", "userId") VALUES ($1, $1, $1)', [gruppe]);
    }
    await sql.query(`INSERT INTO group_members (id, "groupId", "userId", role, "endedAt") VALUES
      ('utmeldt', 'aktiv', 'utmeldt', 'PLAYER', now()), ('feil-rolle', 'aktiv', 'feil-rolle', 'ASSISTANT', null),
      ('slettet', 'aktiv', 'slettet', 'PLAYER', null), ('kryss-avsluttet', 'aktiv', 'kryssgruppe', 'PLAYER', now()),
      ('kryss-aktiv', 'annen', 'kryssgruppe', 'PLAYER', null);
      UPDATE users SET "deletedAt" = now() WHERE id = 'slettet';
      INSERT INTO player_enrollments (id, "userId", "coachId") VALUES
        ('egen-kunde', 'egen-kunde', 'trener-a'), ('annen-kunde', 'annen-kunde', 'trener-b'),
        ('kryssgruppe', 'kryssgruppe', 'trener-a'), ('arkivert', 'arkivert', 'trener-a');
      INSERT INTO player_enrollments (id, "userId", program) VALUES ('platform', 'platform', 'PLATFORM_ONLY');`);
    const { coachedPlayerWhere, coachScopedPlayerWhere, coachSkrivbarPlayerWhere, erCoachetSpiller,
      harCoachTilgangTilSpiller } = await import('../../src/lib/auth/coached');
    const { bookingSpillerWhere, harBookingTilgangTilSpiller } = await import('../../src/lib/auth/booking-spiller-scope');
    const ids = async (where: Prisma.UserWhereInput) => (await db.user.findMany({ where, select: { id: true }, orderBy: { id: 'asc' } })).map(x => x.id);
    const a = { id: 'trener-a', role: 'COACH' };
    const b = { id: 'trener-b', role: 'COACH' };
    const assistant = { id: 'assistent', role: 'COACH' };
    const adminViewer = { id: 'admin', role: 'ADMIN' };

    await t.test('ADMIN og bakgrunnsutvalg stenger enrollment, arkiv, feil rolle, WANG, annen skole og TN', async () => {
      const forventet = ['aktiv', 'annen', 'kryssgruppe', 'medtrener'];
      assert.deepEqual(await ids(coachedPlayerWhere()), forventet);
      assert.deepEqual(await ids(coachScopedPlayerWhere(adminViewer)), forventet);
      assert.deepEqual(await ids(coachSkrivbarPlayerWhere(adminViewer)), forventet);
    });
    await t.test('riktig trener må ha rolle i samme aktive gruppe; annen aktiv gruppe eller enrollment hjelper ikke', async () => {
      assert.deepEqual(await ids(coachScopedPlayerWhere(a)), ['aktiv', 'medtrener']);
      assert.deepEqual(await ids(coachSkrivbarPlayerWhere(a)), ['aktiv', 'medtrener']);
      assert.deepEqual(await ids(coachScopedPlayerWhere(b)), ['annen', 'kryssgruppe', 'medtrener']);
      assert.equal(await harCoachTilgangTilSpiller(a, 'kryssgruppe'), false);
      assert.equal(await harCoachTilgangTilSpiller(a, 'egen-kunde'), false);
    });
    await t.test('assistent kan lese, ikke skrive; utmelding fjerner innsyn på neste oppslag', async () => {
      assert.deepEqual(await ids(coachScopedPlayerWhere(assistant)), ['aktiv']);
      assert.deepEqual(await ids(coachSkrivbarPlayerWhere(assistant)), []);
      await sql.query(`UPDATE group_members SET "endedAt" = now() WHERE id = 'assistent-rolle'`);
      assert.deepEqual(await ids(coachScopedPlayerWhere(assistant)), []);
      await sql.query(`UPDATE group_members SET "endedAt" = null WHERE id = 'assistent-rolle'`);
    });
    await t.test('arkivering og eierskifte gjelder ved neste oppslag', async () => {
      await sql.query(`UPDATE groups SET "arkivertAt" = now() WHERE id = 'aktiv'`);
      assert.equal(await harCoachTilgangTilSpiller(a, 'aktiv'), false);
      assert.equal(await harCoachTilgangTilSpiller(adminViewer, 'aktiv'), false);
      await sql.query(`UPDATE groups SET "arkivertAt" = null, "coachId" = 'trener-b' WHERE id = 'aktiv'`);
      assert.equal(await harCoachTilgangTilSpiller(a, 'aktiv'), false);
      assert.equal(await harCoachTilgangTilSpiller(b, 'aktiv'), true);
      await sql.query(`UPDATE groups SET "coachId" = 'trener-a' WHERE id = 'aktiv'`);
    });
    await t.test('eget coachingtilbud beholdes uten at det åpner profilen', async () => {
      assert.equal(await erCoachetSpiller('egen-kunde'), true);
      assert.equal(await erCoachetSpiller('privat'), false);
      assert.equal(await erCoachetSpiller('platform'), false);
      assert.equal(await harCoachTilgangTilSpiller(a, 'egen-kunde'), false);
    });
    await t.test('bookingutvalg og skrivekontroll samsvarer, uten at andre kunders enrollment blir leads', async () => {
      for (const viewer of [a, b, assistant, adminViewer, { id: 'privat', role: 'PLAYER' }]) {
        const utvalg = new Set(await ids(bookingSpillerWhere(viewer)));
        for (const id of ['aktiv', 'egen-kunde', 'annen-kunde', 'privat', 'platform', 'slettet', 'wang', 'tn', 'mangler']) {
          assert.equal(await harBookingTilgangTilSpiller(viewer, id), utvalg.has(id), `${viewer.id}/${id}`);
        }
      }
      assert.equal(await harBookingTilgangTilSpiller(a, 'egen-kunde'), true);
      assert.equal(await harBookingTilgangTilSpiller(b, 'egen-kunde'), false);
      assert.equal(await harBookingTilgangTilSpiller(a, 'annen-kunde'), false);
      assert.equal(await harBookingTilgangTilSpiller(a, 'privat'), true);
      assert.equal(await harBookingTilgangTilSpiller(assistant, 'aktiv'), false);
      assert.equal(await harBookingTilgangTilSpiller(adminViewer, 'slettet'), false);
    });
  } finally {
    await db.$disconnect();
    await sql.end();
    await admin.query(`DROP SCHEMA "${schema}" CASCADE`);
    await admin.end();
  }
});
