/**
 * RLS-auditskript.
 *
 * Verifiserer at Row-Level Security blokkerer bruker A fra å lese bruker B sine
 * rader på de viktigste bruker-eide tabellene.
 *
 * Krever minst 2 reelle brukere i databasen med data tilknyttet. Hopper over
 * tabeller der ingen testdata finnes.
 *
 * Kjør: `npx tsx scripts/audit-rls.ts`
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { Client } from "pg";

const direct = process.env.DIRECT_URL;
if (!direct) {
  console.error("DIRECT_URL mangler i .env.local");
  process.exit(1);
}

// Tabeller som er bruker-eide (RLS skal blokkere cross-user lesning).
// Globale tabeller (service_types, course_definitions, exercise_definitions)
// utelates — de skal være lesbare for alle innloggede brukere.
const USER_OWNED_TABLES: Array<{ table: string; userIdCol: string }> = [
  { table: "rounds", userIdCol: "userId" },
  { table: "test_results", userIdCol: "userId" },
  { table: "trackman_sessions", userIdCol: "userId" },
  { table: "training_plans", userIdCol: "userId" },
  { table: "goals", userIdCol: "userId" },
  { table: "achievements", userIdCol: "userId" },
  { table: "documents", userIdCol: "userId" },
  { table: "session_requests", userIdCol: "userId" },
  { table: "signals", userIdCol: "userId" },
  { table: "plan_actions", userIdCol: "userId" },
  { table: "subscriptions", userIdCol: "userId" },
  { table: "bookings", userIdCol: "userId" },
];

type AuditResult =
  | { table: string; status: "OK" }
  | { table: string; status: "FAIL"; reason: string }
  | { table: string; status: "SKIP"; reason: string };

const WITH_FIXTURES = process.argv.includes("--with-fixtures");

/**
 * Sett inn én test-rad per bruker for hver tabell vi har testbar fixture for.
 * Returnerer rad-IDs slik at vi kan rydde opp i finally.
 */
async function insertFixtures(
  client: Client,
  userAId: string,
  userBId: string,
): Promise<{ goalIds: string[] }> {
  const ids: { goalIds: string[] } = { goalIds: [] };

  // goals — minst kompleks fixture, har bare title + userId + type
  for (const uid of [userAId, userBId]) {
    const res = await client.query<{ id: string }>(
      `INSERT INTO goals (id, "userId", type, title, status, "createdAt", "updatedAt")
       VALUES (gen_random_uuid()::text, $1, 'FREE_TEXT', $2, 'ACTIVE', NOW(), NOW())
       RETURNING id`,
      [uid, `[audit-rls] test goal for ${uid}`],
    );
    ids.goalIds.push(res.rows[0].id);
  }

  return ids;
}

async function cleanupFixtures(client: Client, ids: { goalIds: string[] }) {
  if (ids.goalIds.length > 0) {
    await client.query(`DELETE FROM goals WHERE id = ANY($1)`, [ids.goalIds]);
  }
}

async function audit(): Promise<AuditResult[]> {
  const client = new Client({ connectionString: direct });
  await client.connect();

  const results: AuditResult[] = [];

  try {
    // Hent to PLAYER-brukere som har authId satt.
    const usersRes = await client.query<{
      id: string;
      authId: string;
      email: string;
    }>(
      `SELECT id, "authId", email
       FROM users
       WHERE role = 'PLAYER' AND "authId" IS NOT NULL
       ORDER BY "createdAt" ASC
       LIMIT 2`,
    );

    if (usersRes.rows.length < 2) {
      console.error(
        `\nTrenger minst 2 PLAYER-brukere i 'users' med authId satt. Fant ${usersRes.rows.length}.`,
      );
      console.error(
        "Tips: opprett to test-brukere via signup-flyt før du kjører auditen.",
      );
      return [];
    }

    const [userA, userB] = usersRes.rows;
    console.log(
      `\nTest-brukere:\n  A: ${userA.email} (${userA.id})\n  B: ${userB.email} (${userB.id})\n`,
    );

    let fixtureIds: { goalIds: string[] } | null = null;
    if (WITH_FIXTURES) {
      console.log("Setter inn audit-fixtures (goals)...");
      fixtureIds = await insertFixtures(client, userA.id, userB.id);
    }

    for (const { table, userIdCol } of USER_OWNED_TABLES) {
      try {
        // 1. Tell rader eid av user A (uten RLS — som superuser)
        const aCount = await client.query<{ count: string }>(
          `SELECT COUNT(*)::text AS count FROM "${table}" WHERE "${userIdCol}" = $1`,
          [userA.id],
        );
        const aRows = Number(aCount.rows[0].count);

        if (aRows === 0) {
          results.push({
            table,
            status: "SKIP",
            reason: `User A har ingen rader i ${table}`,
          });
          continue;
        }

        // 2. Spoofa auth.uid() som user B og prøv å lese user A sine rader.
        //    RLS er aktivert per tabell — sjekk at SET ROLE authenticated +
        //    request.jwt.claims gir 0 rader.
        await client.query("BEGIN");
        await client.query(`SET LOCAL ROLE authenticated`);
        await client.query(
          `SET LOCAL request.jwt.claims = '${JSON.stringify({ sub: userB.authId })}'`,
        );

        const blockedRes = await client.query<{ count: string }>(
          `SELECT COUNT(*)::text AS count FROM "${table}" WHERE "${userIdCol}" = $1`,
          [userA.id],
        );

        await client.query("ROLLBACK");

        const visible = Number(blockedRes.rows[0].count);
        if (visible === 0) {
          results.push({ table, status: "OK" });
        } else {
          results.push({
            table,
            status: "FAIL",
            reason: `User B kunne lese ${visible} av user A sine rader (forventet 0)`,
          });
        }
      } catch (err) {
        await client.query("ROLLBACK").catch(() => {});
        results.push({
          table,
          status: "FAIL",
          reason: err instanceof Error ? err.message : String(err),
        });
      }
    }
    if (fixtureIds) {
      console.log("\nRydder opp audit-fixtures...");
      await cleanupFixtures(client, fixtureIds);
    }
  } finally {
    await client.end();
  }

  return results;
}

async function main() {
  console.log("AK Golf HQ — RLS-audit");
  console.log("=======================");

  const results = await audit();
  if (results.length === 0) {
    process.exit(1);
  }

  let okCount = 0;
  let failCount = 0;
  let skipCount = 0;

  for (const r of results) {
    if (r.status === "OK") {
      console.log(`  OK    ${r.table}`);
      okCount++;
    } else if (r.status === "SKIP") {
      console.log(`  SKIP  ${r.table.padEnd(28)} — ${r.reason}`);
      skipCount++;
    } else {
      console.log(`  FAIL  ${r.table.padEnd(28)} — ${r.reason}`);
      failCount++;
    }
  }

  console.log(
    `\nResultat: ${okCount} OK, ${skipCount} SKIP, ${failCount} FAIL.`,
  );

  if (failCount > 0) {
    console.error("\nRLS-audit feilet. Sjekk policies på tabellene over.");
    process.exit(1);
  }

  if (okCount === 0) {
    console.warn(
      "\nIngen tabeller ble verifisert (alle SKIP). Opprett testdata for begge brukere først.",
    );
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("[audit-rls] FEIL:", err);
  process.exit(1);
});
