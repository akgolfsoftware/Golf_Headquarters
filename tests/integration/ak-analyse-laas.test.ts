/** Ekte låser mot egen, lokal Postgres. Ingen appkontoer, eksterne kall eller produksjonsdata. */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { Client } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { laas, databasetid, laasGruppemedlemskap, laasBrukere, laasForesattRelasjon } from "../../src/lib/deling/ak-analyse-laas";

const connection = process.env.COACH_LOCK_TEST_DATABASE_URL;
if (!connection) throw Error("COACH_LOCK_TEST_DATABASE_URL må peke på den separate testdatabasen");
const target = new URL(connection);
if (target.hostname !== "127.0.0.1" || target.port !== "55922" || target.pathname !== "/coach_lock_tests") {
  throw Error("Bare egen lokal coach_lock_tests på 127.0.0.1:55922 er tillatt");
}

test("AK-analyse: faktiske radlåser mot samtidige tilgangsendringer", async t => {
  const schema = `coach_lock_${randomUUID().replaceAll("-", "")}`;
  const admin = new Client({ connectionString: connection });
  await admin.connect();
  await admin.query(`CREATE SCHEMA "${schema}"`);
  const options = `-c search_path=${schema}`;
  const writer = new Client({ connectionString: connection, options });
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: connection, options }) });
  await writer.connect();
  try {
    await writer.query(`
      CREATE TABLE groups (id text PRIMARY KEY, "arkivertAt" timestamptz, "coachId" text);
      CREATE TABLE users (id text PRIMARY KEY, "deletedAt" timestamptz, "dateOfBirth" date);
      CREATE TABLE group_members (id text PRIMARY KEY, "groupId" text REFERENCES groups(id),
        "userId" text REFERENCES users(id), "endedAt" timestamptz, role text);
      CREATE TABLE parent_relations (id text PRIMARY KEY, "parentId" text, "childId" text, approved boolean);
      INSERT INTO groups VALUES ('g', NULL, 'c');
      INSERT INTO users VALUES ('p', NULL, '2014-01-01'), ('c', NULL, '1980-01-01'), ('parent', NULL, '1980-01-01'), ('new', NULL, '1980-01-01');
      INSERT INTO group_members VALUES ('m', 'g', 'p', NULL, 'PLAYER'), ('mc', 'g', 'c', NULL, 'COACH');
      INSERT INTO parent_relations VALUES ('r', 'parent', 'p', true);
    `);
    const endringer = [
      ["arkivering", `UPDATE groups SET "arkivertAt" = clock_timestamp() WHERE id = 'g'`],
      ["ny hovedtrener", `UPDATE groups SET "coachId" = 'new' WHERE id = 'g'`],
      ["utmelding", `UPDATE group_members SET "endedAt" = clock_timestamp() WHERE id = 'm'`],
      ["trenerrolle", `UPDATE group_members SET role = 'PLAYER' WHERE id = 'mc'`],
      ["kontosletting", `UPDATE users SET "deletedAt" = clock_timestamp() WHERE id = 'p'`],
      ["aldersgrunnlag", `UPDATE users SET "dateOfBirth" = '1980-01-01' WHERE id = 'p'`],
      ["foresattmyndighet", `UPDATE parent_relations SET approved = false WHERE id = 'r'`],
    ];
    for (const [navn, sql] of endringer) {
      await t.test(`${navn} må vente til beskyttet lesing er avsluttet`, async () => {
        const klar = Promise.withResolvers<void>();
        const slipp = Promise.withResolvers<void>();
        const lesing = db.$transaction(async tx => {
          await laas(tx, "g");
          const medlemmer = await laasGruppemedlemskap(tx, "g");
          await laasBrukere(tx, [...medlemmer.map(m => m.userId), "parent"]);
          await laasForesattRelasjon(tx, "parent", "p");
          assert.ok((await databasetid(tx)) instanceof Date);
          klar.resolve();
          await slipp.promise;
        }, { timeout: 10_000 });
        // Dersom selve SQL-en feiler, må testen feile i stedet for å vente for alltid.
        void lesing.catch(klar.reject);
        try {
          await klar.promise;
          await writer.query("BEGIN");
          await writer.query("SET LOCAL lock_timeout = '200ms'");
          await assert.rejects(writer.query(sql), (e: { code?: string }) => e.code === "55P03");
        } finally {
          await writer.query("ROLLBACK");
          slipp.resolve();
          await lesing;
        }
        // Samme vanlige UPDATE virker etterpå, uten egen advisory-lås i skriveren.
        await writer.query("BEGIN");
        try { assert.equal((await writer.query(sql)).rowCount, 1); }
        finally { await writer.query("ROLLBACK"); }
      });
    }
    await t.test("en fullført utmelding faller ut av neste låste utvalg", async () => {
      await writer.query(`UPDATE group_members SET "endedAt" = clock_timestamp() WHERE id = 'm'`);
      await db.$transaction(async tx => {
        await laas(tx, "g");
        assert.deepEqual((await laasGruppemedlemskap(tx, "g")).map(m => m.userId), ["c"]);
      });
      await writer.query(`UPDATE group_members SET "endedAt" = NULL WHERE id = 'm'`);
    });
    await t.test("en ny innmelding utvider ikke det allerede låste utvalget", async () => {
      await db.$transaction(async tx => {
        await laas(tx, "g");
        const utvalg = await laasGruppemedlemskap(tx, "g");
        await laasBrukere(tx, utvalg.map(m => m.userId));
        await writer.query(`INSERT INTO group_members VALUES ('mn', 'g', 'new', NULL, 'PLAYER')`);
        assert.deepEqual(utvalg.map(m => m.userId), ["p", "c"]);
      });
      await db.$transaction(async tx => {
        assert.equal((await laasGruppemedlemskap(tx, "g")).some(m => m.userId === "new"), true);
      });
    });
  } finally {
    await db.$disconnect();
    await writer.end();
    await admin.query(`DROP SCHEMA "${schema}" CASCADE`);
    await admin.end();
  }
});
