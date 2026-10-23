/** Intern driftskontroll. Bare aggregerte tellinger, ingen profiler eller fritekst.
 * Kjør med eksisterende miljøfil via Node --env-file; kopier aldri miljøfiler.
 * Krever eksplisitt forventet Supabase-prosjekt eller localhost. Ingen DB-skriving.
 */
import { Client } from "pg";
import { writeFile } from "node:fs/promises";
import { isAbsolute } from "node:path";
import { KANONISKE_GRUPPER } from "../src/lib/domain/grupper";

let steg = "miljøkontroll";
async function main() {
  const output = process.argv[2];
  const expected = process.env.COACH_EXPECTED_PROJECT;
  const connection = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!output || !isAbsolute(output) || !connection || !expected) throw new Error("Mangler rapportsti eller miljøbekreftelse");
  const url = new URL(connection);
  const isLocal = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  const isProject = url.hostname === `db.${expected}.supabase.co` ||
    (url.hostname.endsWith(".pooler.supabase.com") && decodeURIComponent(url.username) === `postgres.${expected}`);
  if (!(expected === "local" ? isLocal : isProject)) throw new Error("Feil databasemål");
  const client = new Client({ connectionString: connection, connectionTimeoutMillis: 10000 });
  // Intervaller hindrer at små tellinger skrives ut. Rapporten er fortsatt intern,
  // ikke et løfte om anonymitet ved kombinasjon med andre opplysninger.
  const band = (n: number) => n < 10 ? "0–9" : `${Math.floor(n / 10) * 10}–${Math.floor(n / 10) * 10 + 9}`;
  steg = "tilkobling";
  await client.connect();
  try {
    await client.query("BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY");
    await client.query("SET LOCAL statement_timeout = '20000ms'");
    const checks = [
      ["aktive-profiler", `SELECT count(*)::int n FROM users WHERE role = 'PLAYER' AND "deletedAt" IS NULL`],
      ["workbench-gjennomfort", `SELECT count(*)::int n FROM workbench_sessions WHERE status='COMPLETED' AND "isTemplate"=false AND "hiddenByPlayer"=false AND "needsPlayerApproval"=false AND ("approvalStatus" IS NULL OR "approvalStatus" NOT IN ('PENDING','REJECTED'))`],
      ["workbench-faktisk-tid", `SELECT count(*)::int n FROM workbench_sessions WHERE status='COMPLETED' AND "actualMinutes" IS NOT NULL AND "actualMinutes">=0 AND "isTemplate"=false AND "hiddenByPlayer"=false AND "needsPlayerApproval"=false AND ("approvalStatus" IS NULL OR "approvalStatus" NOT IN ('PENDING','REJECTED'))`],
      ["workbench-migrerte", `SELECT count(*)::int n FROM workbench_sessions WHERE "migrertFraTrainingPlanSessionId" IS NOT NULL`],
      ["eldre-planokter", `SELECT count(*)::int n FROM training_plan_sessions`],
      ["treningslogger", `SELECT count(*)::int n FROM training_logs`],
      ["testresultater", `SELECT count(*)::int n FROM test_results`],
      ["testresultater-med-protokoll", `SELECT count(*)::int n FROM test_results r JOIN test_definitions t ON t.id=r."testId" WHERE t.protocol IS NOT NULL AND t.protocol != 'null'::jsonb`],
      ["trackman-okter", `SELECT count(*)::int n FROM trackman_sessions`],
      ["trackman-bekreftet-malretning", `SELECT count(*)::int n FROM trackman_sessions WHERE "targetLineStatus"='CONFIRMED'`],
      ["runder", `SELECT count(*)::int n FROM rounds WHERE "playStatus"='COMPLETED' AND "partialSave"=false`],
      ["runder-med-metode", `SELECT count(*)::int n FROM rounds WHERE "playStatus"='COMPLETED' AND "partialSave"=false AND "sgReferenceSetId" IS NOT NULL AND "benchmarkLevelSnapshot" IS NOT NULL AND "sgEngineVersion" IS NOT NULL`],
      ["delingshistorikk", `SELECT count(*)::int n FROM delings_samtykker`],
      ["planevalueringer", `SELECT count(*)::int n FROM plan_effectiveness`],
    ] as const;
    const tellinger: Record<string, string> = {};
    for (const [key, sql] of checks) {
      steg = key;
      const result = await client.query<{ n: number }>(sql);
      tellinger[key] = band(result.rows[0].n);
    }
    // Bare kjente organisatoriske slugs, aldri frie gruppenavn som kan ha navn på barn.
    steg = "grupperegister";
    const grupper = await client.query<{ slug: string; managedByAkGolf: boolean; arkivert: boolean; n: number }>(
      `SELECT g.slug, g."managedByAkGolf", (g."arkivertAt" IS NOT NULL) arkivert,
        count(m.id)::int n FROM groups g LEFT JOIN group_members m ON m."groupId"=g.id AND m.role='PLAYER' AND m."endedAt" IS NULL
       WHERE g.slug = ANY($1::text[]) GROUP BY g.id`, [KANONISKE_GRUPPER.map(g => g.slug)]);
    await client.query("ROLLBACK");
    steg = "lagring";
    await writeFile(output, JSON.stringify({ generatedAt: new Date().toISOString(),
      classification: "intern-driftsrapport-ikke-anonymt-publiseringsgrunnlag", readOnly: true,
      tellinger, grupper: grupper.rows.map(g => ({ slug: g.slug, managedByAkGolf: g.managedByAkGolf, arkivert: g.arkivert, medlemskap: band(g.n) })),
      begrensninger: ["Tellinger er ikke unike treningshendelser eller gyldig samtykke.", "Ingen personrader eller nye modelluttrekk er lest.", "Intervaller er ikke bevis på anonymisering.", "Testprotokoll, TrackMan-mål og reell plan/test/turneringskobling krever videre feltkontroll."] }, null, 2), { mode: 0o600 });
    console.log("Intern dekningsrapport lagret. Ingen profildata skrevet ut.");
  } finally { await client.end(); }
}
main().catch(() => { console.error(`Dekningskontrollen stoppet ved ${steg}. Ingen rå databasefeil logges.`); process.exitCode = 1; });
