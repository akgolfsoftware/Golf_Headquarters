/** Faktisk registrering og migrasjon mot egen lokal testdatabase, aldri appdata. */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { mock, test } from "node:test";
import { Client } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { frysKontoAvtale } from "../../src/lib/gdpr/kontoavtale/dokumenter";
import { syntetiskKontoAvtale, syntetiskKontoSvar } from "../fixtures/kontoavtale";

const connection = process.env.COACH_LOCK_TEST_DATABASE_URL;
if (!connection) throw Error("Eksplisitt lokal COACH_LOCK_TEST_DATABASE_URL kreves");
const target = new URL(connection);
if (target.hostname !== "127.0.0.1" || target.port !== "55922" || target.pathname !== "/coach_lock_tests") {
  throw Error("Bare egen lokal coach_lock_tests på 127.0.0.1:55922 er tillatt");
}

const schema = `konto_test_${randomUUID().replaceAll("-", "")}`;
const rolle = `${schema}_klient`;
const options = `-c search_path=${schema}`;
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: connection, options }, { schema }) });
let pakke = structuredClone(syntetiskKontoAvtale);
mock.module("../../src/lib/prisma", { namedExports: { prisma: db } });
mock.module("../../src/lib/gdpr/kontoavtale/dokumenter", { namedExports: {
  frysKontoAvtale, hentGjeldendeKontoAvtale: () => pakke,
} });

test("kontoaksept: migrasjon, registrering, historikk og isolasjon i Postgres", async t => {
  const admin = new Client({ connectionString: connection });
  const sql = new Client({ connectionString: connection, options });
  await admin.connect();
  await admin.query(`CREATE SCHEMA "${schema}"`);
  await sql.connect();
  try {
    await sql.query(`CREATE TYPE "UserRole" AS ENUM ('PLAYER', 'COACH', 'ADMIN', 'PARENT');
      CREATE TABLE users (id text PRIMARY KEY, role "UserRole" NOT NULL DEFAULT 'PLAYER',
      "deletedAt" timestamptz, "dateOfBirth" timestamptz, "requiresGuardianConsent" boolean NOT NULL DEFAULT false);
      INSERT INTO users (id, "dateOfBirth") VALUES ('syntetisk-a', '1984-01-01'), ('syntetisk-b', '1984-01-01');`);
    const migrasjon = readFileSync("prisma/migrations/20261023083000_konto_avtale_aksepter/migration.sql", "utf8");
    await sql.query(migrasjon);
    await sql.query(migrasjon); // additiv oppskrift tåler et nytt forsøk uten omskriving
    const { registrerEgenKontoAvtale } = await import("../../src/lib/gdpr/kontoavtale/register");

    await t.test("ti samtidige forsøk gir én uendret kvittering med databaseklokke", async () => {
      const fra = new Date();
      const svar = await Promise.all(Array.from({ length: 10 }, () => registrerEgenKontoAvtale("syntetisk-a", syntetiskKontoSvar)));
      assert.deepEqual(svar, Array.from({ length: 10 }, () => ({ ok: true })));
      const rader = await db.kontoAvtaleAksept.findMany();
      assert.equal(rader.length, 1);
      assert.equal(rader[0].userId, "syntetisk-a");
      assert.deepEqual(rader[0].dokumenter, pakke);
      assert.ok(rader[0].createdAt >= fra && rader[0].createdAt <= new Date());
      const kopi = rader[0];
      await registrerEgenKontoAvtale("syntetisk-a", syntetiskKontoSvar);
      assert.deepEqual(await db.kontoAvtaleAksept.findMany(), [kopi]);
    });
    await t.test("ny versjon gir ny rad; gammel versjon med endret tekst avvises", async () => {
      pakke.vilkar.tekst = "Endret syntetisk tekst";
      assert.equal((await registrerEgenKontoAvtale("syntetisk-a", syntetiskKontoSvar)).ok, false);
      assert.equal(await db.kontoAvtaleAksept.count(), 1);
      pakke.versjon = "test-pakke-2";
      assert.deepEqual(await registrerEgenKontoAvtale("syntetisk-a", { ...syntetiskKontoSvar, pakkeVersjon: pakke.versjon }), { ok: true });
      assert.equal(await db.kontoAvtaleAksept.count(), 2);
      pakke = structuredClone(syntetiskKontoAvtale);
    });
    await t.test("rå UPDATE kan ikke endre historikk", async () => {
      await assert.rejects(sql.query(`UPDATE konto_avtale_aksepter SET "dokumentHash" = repeat('b', 64)`), /kan ikke omskrives/);
      assert.equal((await db.kontoAvtaleAksept.findFirstOrThrow({ where: { pakkeVersjon: pakke.versjon } })).dokumentHash, frysKontoAvtale(pakke).dokumentHash);
    });
    await t.test("manglende, slettet, ADMIN og mindreårig konto avvises på faktisk serverlesing", async () => {
      assert.equal((await registrerEgenKontoAvtale("finnes-ikke", syntetiskKontoSvar)).ok, false);
      for (const endring of [
        `"deletedAt" = clock_timestamp()`, `role = 'ADMIN'`, `"dateOfBirth" = '2014-01-01'`,
        `"dateOfBirth" = NULL`, `"requiresGuardianConsent" = true`,
      ]) {
        await sql.query(`UPDATE users SET ${endring} WHERE id = 'syntetisk-b'`);
        assert.equal((await registrerEgenKontoAvtale("syntetisk-b", syntetiskKontoSvar)).ok, false);
        await sql.query(`UPDATE users SET "deletedAt" = NULL, role = 'PLAYER', "dateOfBirth" = '1984-01-01', "requiresGuardianConsent" = false WHERE id = 'syntetisk-b'`);
      }
      assert.equal(await db.kontoAvtaleAksept.count({ where: { userId: "syntetisk-b" } }), 0);
    });
    await t.test("RLS avviser klientlesing og skriving selv med tabellprivilegier", async () => {
      await admin.query(`CREATE ROLE "${rolle}" NOLOGIN`);
      await sql.query(`GRANT USAGE ON SCHEMA "${schema}" TO "${rolle}";
        GRANT SELECT, INSERT, UPDATE, DELETE ON konto_avtale_aksepter TO "${rolle}";
        SET ROLE "${rolle}";`);
      try {
        assert.equal((await sql.query("SELECT * FROM konto_avtale_aksepter")).rowCount, 0);
        await assert.rejects(sql.query(`INSERT INTO konto_avtale_aksepter (id, "userId", "pakkeVersjon", "dokumentHash", dokumenter)
          VALUES ('forbudt', 'syntetisk-a', 'annen', repeat('a', 64), '{}')`), /row-level security/);
        assert.equal((await sql.query("DELETE FROM konto_avtale_aksepter")).rowCount, 0);
      } finally { await sql.query("RESET ROLE"); }
      assert.equal(await db.kontoAvtaleAksept.count(), 2);
    });
    await t.test("fysisk sletting av egen syntetisk konto fjerner tilhørende kvitteringer", async () => {
      await sql.query("DELETE FROM users WHERE id = 'syntetisk-a'");
      assert.equal(await db.kontoAvtaleAksept.count(), 0);
    });
  } finally {
    await db.$disconnect();
    await sql.end();
    await admin.query(`DROP SCHEMA "${schema}" CASCADE`);
    await admin.query(`DROP ROLE IF EXISTS "${rolle}"`);
    await admin.end();
  }
});
