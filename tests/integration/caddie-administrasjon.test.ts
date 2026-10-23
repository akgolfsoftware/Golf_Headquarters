/** Faktiske Prisma-filtre mot isolert Postgres; bare syntetiske konto-ID-er. */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mock, test } from "node:test";
import { Client } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

const connection = process.env.COACH_LOCK_TEST_DATABASE_URL;
if (!connection) throw Error("Eksplisitt lokal COACH_LOCK_TEST_DATABASE_URL kreves");
const target = new URL(connection);
if (target.hostname !== "127.0.0.1" || target.port !== "55922" || target.pathname !== "/coach_lock_tests") {
  throw Error("Bare egen lokal coach_lock_tests på 127.0.0.1:55922 er tillatt");
}
const schema = `administrasjon_test_${randomUUID().replaceAll("-", "")}`;
const options = `-c search_path=${schema}`;
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: connection, options }, { schema }) });
mock.module("../../src/lib/prisma", { namedExports: { prisma: db } });

// Kollisjonsalgoritmen har egne tester; her prøves faktisk transaksjon og tilgang.
mock.module("../../src/lib/booking/kollisjonsvern", { namedExports: {
  sjekkKollisjon: async () => ({ plassNr: 1 }), erKollisjonsfeil: () => false, kollisjonsmelding: () => "Kollisjon",
} });
test("Caddie administrasjon: ekte rolle, rettighetsfilter, låser og rollback", async t => {
  const admin = new Client({ connectionString: connection });
  const sql = new Client({ connectionString: connection, options });
  await admin.connect(); await admin.query(`CREATE SCHEMA "${schema}"`); await sql.connect();
  try {
    await sql.query(`CREATE TYPE "UserRole" AS ENUM ('PLAYER','COACH','ADMIN','PARENT');
      CREATE TYPE "PlayerProgram" AS ENUM ('AK_ACADEMY','PLATFORM_ONLY','WANG_UNG','WANG_TOPPIDRETT');
      CREATE TABLE users (id text PRIMARY KEY, name text DEFAULT 'Syntetisk', role "UserRole" NOT NULL DEFAULT 'PLAYER', "deletedAt" timestamptz);
      CREATE TABLE groups (id text PRIMARY KEY, "coachId" text, "managedByAkGolf" boolean DEFAULT true, "arkivertAt" timestamptz, program "PlayerProgram", slug text);
      CREATE TABLE group_members (id text PRIMARY KEY, "groupId" text REFERENCES groups(id), "userId" text REFERENCES users(id), role text DEFAULT 'PLAYER', "endedAt" timestamptz);
      CREATE TABLE player_enrollments (id text PRIMARY KEY, "userId" text REFERENCES users(id), "coachId" text, program "PlayerProgram" DEFAULT 'AK_ACADEMY', "endedAt" timestamptz);
      CREATE TABLE payments (id text PRIMARY KEY, "userId" text REFERENCES users(id), status text DEFAULT 'PENDING', type text DEFAULT 'BOOKING',
        "amountOre" integer DEFAULT 100, currency text DEFAULT 'nok', description text, "createdAt" timestamptz DEFAULT now());
      CREATE TABLE service_types (id text PRIMARY KEY, slug text UNIQUE, name text DEFAULT 'Golf', "durationMin" integer DEFAULT 60,
        "priceOre" integer DEFAULT 100, "coachUserId" text);
      CREATE TABLE locations (id text PRIMARY KEY, name text DEFAULT 'Syntetisk bane');
      CREATE TYPE "BookingStatus" AS ENUM ('PENDING','CONFIRMED','CANCELLED','COMPLETED','NO_SHOW');
      CREATE TABLE bookings (id text PRIMARY KEY, "userId" text, "serviceTypeId" text, "locationId" text, "startAt" timestamptz,
        "endAt" timestamptz, status "BookingStatus", notes text, "priceOre" integer, "coachId" text, "plassNr" integer, "giftCardOre" integer DEFAULT 0, "createdAt" timestamptz DEFAULT now(), "updatedAt" timestamptz);
      CREATE TABLE notifications (id text PRIMARY KEY, "userId" text REFERENCES users(id), type text NOT NULL, title text NOT NULL,
        body text, link text, "readAt" timestamptz, "groupKey" text, count integer NOT NULL DEFAULT 1, "createdAt" timestamptz DEFAULT now());
      INSERT INTO users (id,role) VALUES ('admin','ADMIN'),('coach-a','COACH'),('coach-b','COACH'),('assistant','COACH'),('parent','PARENT');
      INSERT INTO users (id) VALUES ('p'),('lead'),('other'),('group-player'),('wang-player'),('tn-player');
      INSERT INTO player_enrollments (id,"userId","coachId") VALUES ('own','p','coach-a'),('other','other','coach-b');
      INSERT INTO groups (id,"coachId",program,slug) VALUES ('a','coach-a',null,'a'),('b','coach-b',null,'b'),
        ('wang','coach-a','WANG_TOPPIDRETT','wang'),('tn','coach-a',null,'team-norway');
      INSERT INTO group_members (id,"groupId","userId",role) VALUES ('gp','a','group-player','PLAYER'),('assist','a','assistant','ASSISTANT'),
        ('wp','wang','wang-player','PLAYER'),('tp','tn','tn-player','PLAYER');
      INSERT INTO payments (id,"userId") VALUES ('invoice','p');
      INSERT INTO service_types (id,slug,"coachUserId") VALUES ('service','golf','coach-a');
      INSERT INTO locations (id) VALUES ('location');`);
    const { medCaddieAdministrasjon: gate } = await import('../../src/lib/caddie/administrativ-tilgang');
    const { buildWriteTools: build } = await import('../../src/lib/caddie/tools/write');
    const { executeApprovedTool: execute } = await import('../../src/lib/caddie/approval-executor');
    const booking = { playerId: 'p', startAt: '2026-10-24T10:00Z', serviceTypeSlug: 'golf', locationId: 'location' };
    const opts = { toolCallId: 'synthetic', messages: [] };
    const bookingGate = (actor: string, id: string) => gate(actor, { type: 'booking', id }, async () => true);
    await t.test('eksisterende egen kunde og lead fungerer; annen kunde, assistent og organisasjonsgruppe avvises', async () => {
      for (const id of ['p','lead','group-player']) assert.equal(await bookingGate('coach-a',id),true);
      for (const id of ['other','wang-player','tn-player']) await assert.rejects(bookingGate('coach-a',id),/ikke tilgang/);
      await assert.rejects(bookingGate('assistant','group-player'),/ikke tilgang/);
      assert.equal(await bookingGate('admin','other'),true);
      await assert.rejects(bookingGate('parent','p'),/ikke tilgang/);
    });
    await t.test('gammelt ADMIN-verktøy og godkjenning bruker nåværende rolle', async () => {
      const tools = build({ id: 'admin', role: 'ADMIN' });
      await sql.query(`UPDATE users SET role='COACH' WHERE id='admin'`);
      assert.match(JSON.stringify(await tools.draftInvoiceReminder.execute!({ invoiceId:'invoice' },opts)),/"ok":false/);
      await assert.rejects(execute('draftInvoiceReminder',{ invoiceId:'invoice' },'admin'),/ikke tilgang/);
      await assert.rejects(execute('draftBookingProposal',booking,'admin'),/ikke tilgang/);
      assert.equal(await db.notification.count(),0); assert.equal(await db.booking.count(),0);
      await sql.query(`UPDATE users SET role='ADMIN' WHERE id='admin'`);
    });
    await t.test('bookingforslag skriver ikke; godkjent booking og varsel lagres sammen uten profildeling', async () => {
      const tools = build({ id:'coach-a',role:'COACH' });
      assert.match(JSON.stringify(await tools.draftBookingProposal.execute!(booking,opts)),/"needsApproval":true/);
      assert.equal(await db.booking.count(),0); assert.equal(await db.notification.count(),0);
      assert.equal((await execute('draftBookingProposal',booking,'coach-a')).status,'booking-created');
      assert.equal(await db.booking.count(),1); assert.equal(await db.notification.count(),1);
    });
    await t.test('varselfeil ruller tilbake bookingen, ingen halvferdig handling', async () => {
      await sql.query(`ALTER TABLE notifications ADD CONSTRAINT synthetic_failure CHECK (type <> 'BOOKING') NOT VALID`);
      await assert.rejects(execute('draftBookingProposal',booking,'coach-a'));
      assert.equal(await db.booking.count(),1); assert.equal(await db.notification.count(),1);
      await sql.query(`ALTER TABLE notifications DROP CONSTRAINT synthetic_failure`);
    });
    await t.test('endret kundeansvar, sletting og feil kontorolle stopper neste handling', async () => {
      await sql.query(`UPDATE player_enrollments SET "coachId"='coach-b' WHERE id='own'`);
      await assert.rejects(execute('draftBookingProposal',booking,'coach-a'),/ikke tilgang/);
      await sql.query(`UPDATE player_enrollments SET "coachId"='coach-a' WHERE id='own'; UPDATE users SET "deletedAt"=now() WHERE id='p'`);
      await assert.rejects(execute('draftBookingProposal',booking,'admin'),/ikke tilgang/);
      await sql.query(`UPDATE users SET "deletedAt"=null WHERE id='p'; UPDATE users SET role='PLAYER' WHERE id='coach-a'`);
      await assert.rejects(execute('draftBookingProposal',booking,'coach-a'),/ikke tilgang/);
      await sql.query(`UPDATE users SET role='COACH' WHERE id='coach-a'`);
      assert.equal(await db.booking.count(),1);
    });
    await t.test('betalt/refundert faktura gir ingen påminnelse; ubetalt krever fersk ADMIN', async () => {
      for (const status of ['SUCCEEDED','REFUNDED']) {
        await sql.query(`UPDATE payments SET status=$1 WHERE id='invoice'`,[status]);
        assert.equal((await execute('draftInvoiceReminder',{ invoiceId:'invoice' },'admin')).status,'skipped');
      }
      assert.equal(await db.notification.count(),1);
      await sql.query(`UPDATE payments SET status='PENDING' WHERE id='invoice'`);
      await execute('draftInvoiceReminder',{ invoiceId:'invoice' },'admin');
      assert.equal(await db.notification.count(),2);
    });
    await t.test('rolleendring venter på pågående databasehandling', async () => {
      let release!: () => void; let entered!: () => void;
      const held = new Promise<void>(resolve => { release=resolve; });
      const inside = new Promise<void>(resolve => { entered=resolve; });
      const running = gate('admin',{ type:'faktura',id:'invoice' },async () => { entered(); await held; return true; });
      await inside;
      let changed=false;
      const change = sql.query(`UPDATE users SET role='COACH' WHERE id='admin'; UPDATE payments SET status='SUCCEEDED' WHERE id='invoice'`).then(() => { changed=true; });
      try { await new Promise(resolve => setTimeout(resolve,100)); assert.equal(changed,false); }
      finally { release(); }
      assert.equal(await running,true); await change;
      await assert.rejects(execute('draftInvoiceReminder',{ invoiceId:'invoice' },'admin'),/ikke tilgang/);
      await sql.query(`UPDATE users SET role='ADMIN' WHERE id='admin'`);
      assert.equal((await execute('draftInvoiceReminder',{ invoiceId:'invoice' },'admin')).status,'skipped');
    });
    await t.test('betalingsstatus er låst til den pågående vurderingen er ferdig', async () => {
      let release!: () => void; let entered!: () => void;
      const held = new Promise<void>(resolve => { release=resolve; });
      const inside = new Promise<void>(resolve => { entered=resolve; });
      const running = gate('admin',{ type:'faktura',id:'invoice' },async () => { entered(); await held; });
      await inside;
      let changed=false;
      const change=sql.query(`UPDATE payments SET status='REFUNDED' WHERE id='invoice'`).then(() => { changed=true; });
      try { await new Promise(resolve => setTimeout(resolve,100)); assert.equal(changed,false); }
      finally { release(); }
      await running; await change;
      assert.equal((await execute('draftInvoiceReminder',{ invoiceId:'invoice' },'admin')).status,'skipped');
    });

  } finally {
    await db.$disconnect(); await sql.end();
    await admin.query(`DROP SCHEMA "${schema}" CASCADE`); await admin.end();
  }
});
