/**
 * Prøver låsen på wagr_reference_plans som Supabase-klienten ville gjort det: utlogget (anon),
 * innlogget spiller og innlogget trener. Alt skjer i én transaksjon som rulles tilbake, så ingen
 * rader blir liggende. Med --med-oppretting kjøres migration.sql først i samme transaksjon
 * (prøv låsen før tabellen finnes i produksjon).
 *
 *   npx tsx scripts/sjekk-wagr-reference-plans-rls-2026-10-20.ts [--med-oppretting]
 */
import "./_env";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Client } from "pg";

type Resultat = { navn: string; ok: boolean; detalj: string };

async function main() {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL mangler");
  const client = new Client({ connectionString: url });
  await client.connect();
  const res: Resultat[] = [];
  const sjekk = (navn: string, ok: boolean, detalj = "") => res.push({ navn, ok, detalj });
  try {
    await client.query("BEGIN");
    if (process.argv.includes("--med-oppretting")) {
      await client.query(
        readFileSync(join(__dirname, "..", "prisma/migrations/20261020140000_wagr_reference_plans/migration.sql"), "utf-8"),
      );
    }
    const trener = await client.query(
      `SELECT "authId" FROM "users" WHERE "role" = 'COACH' AND "deletedAt" IS NULL AND "authId" ~ '^[0-9a-f-]{36}$'
         AND lower("email") NOT LIKE 'demo%' LIMIT 1`,
    );
    const spiller = await client.query(
      `SELECT u."authId" FROM "users" u WHERE u."role" = 'PLAYER' AND u."deletedAt" IS NULL AND u."authId" ~ '^[0-9a-f-]{36}$'
         AND NOT EXISTS (SELECT 1 FROM "group_members" gm WHERE gm."userId" = u."id" AND gm."role" IN ('COACH','ASSISTANT') AND gm."endedAt" IS NULL)
       LIMIT 1`,
    );
    if (!trener.rowCount || !spiller.rowCount) throw new Error("Fant ikke testkontoer (trener og spiller)");

    const somRolle = async (rolle: "anon" | "authenticated", authId: string | null) => {
      await client.query(`SET LOCAL ROLE ${rolle}`);
      await client.query(`SELECT set_config('request.jwt.claims', $1, true)`, [
        JSON.stringify(authId ? { sub: authId, role: rolle } : { role: rolle }),
      ]);
    };
    const forsok = async (sql: string, params: unknown[] = []) => {
      await client.query("SAVEPOINT s");
      try {
        const r = await client.query(sql, params);
        await client.query("RELEASE SAVEPOINT s");
        return { feil: null as string | null, rader: r.rowCount ?? 0, rows: r.rows };
      } catch (e) {
        await client.query("ROLLBACK TO SAVEPOINT s");
        return { feil: (e as Error).message, rader: 0, rows: [] };
      }
    };
    const INN = `INSERT INTO "wagr_reference_plans" ("wagrPlayerId","season","playerName","events","updatedByName")
                 VALUES (999999001, 2027, 'Test', '[1,2]'::jsonb, 'Forfalsket') RETURNING "updatedByName", "updatedByUserId"`;

    await somRolle("anon", null);
    sjekk("utlogget kan ikke lese", !!(await forsok(`SELECT 1 FROM "wagr_reference_plans"`)).feil);
    sjekk("utlogget kan ikke skrive", !!(await forsok(INN)).feil);
    await client.query("RESET ROLE");

    await somRolle("authenticated", spiller.rows[0].authId);
    const sl = await forsok(`SELECT 1 FROM "wagr_reference_plans"`);
    sjekk("spiller ser ingen planer", !sl.feil && sl.rader === 0, sl.feil ?? `${sl.rader} rader`);
    sjekk("spiller kan ikke skrive", !!(await forsok(INN)).feil);
    await client.query("RESET ROLE");

    await somRolle("authenticated", trener.rows[0].authId);
    const ti = await forsok(INN);
    sjekk("trener kan lagre", !ti.feil && ti.rader === 1, ti.feil ?? "");
    sjekk("navnet settes av databasen", !ti.feil && ti.rows[0]?.updatedByName !== "Forfalsket" && !!ti.rows[0]?.updatedByUserId);
    const tu = await forsok(
      `INSERT INTO "wagr_reference_plans" ("wagrPlayerId","season","playerName","events") VALUES (999999001, 2027, 'Test', '[3]'::jsonb)
       ON CONFLICT ("wagrPlayerId","season") DO UPDATE SET "events" = EXCLUDED."events" RETURNING "events"`,
    );
    sjekk("trener kan oppdatere (upsert)", !tu.feil && JSON.stringify(tu.rows[0]?.events) === "[3]", tu.feil ?? "");
    const ts = await forsok(`SELECT "events" FROM "wagr_reference_plans" WHERE "wagrPlayerId" = 999999001`);
    sjekk("trener kan lese", !ts.feil && ts.rader === 1, ts.feil ?? "");
    sjekk("trener kan ikke slette", !!(await forsok(`DELETE FROM "wagr_reference_plans" WHERE "wagrPlayerId" = 999999001`)).feil
      || (await forsok(`SELECT 1 FROM "wagr_reference_plans" WHERE "wagrPlayerId" = 999999001`)).rader === 1);
    sjekk("events må være en liste", !!(await forsok(
      `UPDATE "wagr_reference_plans" SET "events" = '{"a":1}'::jsonb WHERE "wagrPlayerId" = 999999001`)).feil);
    await client.query("RESET ROLE");
  } finally {
    await client.query("ROLLBACK").catch(() => {});
    await client.end();
  }
  console.table(res.map((r) => ({ sjekk: r.navn, resultat: r.ok ? "OK" : "FEIL", detalj: r.detalj })));
  if (res.some((r) => !r.ok)) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
