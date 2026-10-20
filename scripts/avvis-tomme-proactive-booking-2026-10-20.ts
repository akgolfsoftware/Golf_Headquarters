/**
 * A4 (audit 20.10.2026): 24-7-booking-alerts la et PROACTIVE_BOOKING-forslag
 * uten lesbar tekst i godkjenningskøen hvert 20. minutt fra 30.08 til 19.10.2026.
 * Innboksen viste dem som «Forslag fra motoren · —».
 *
 * Skriptet merker dem AVVIST (status REJECTED, rejectReason, decidedAt). Det
 * sletter ingenting. Uten `--kjor` teller det bare og skriver ingenting.
 *
 *   npx tsx scripts/avvis-tomme-proactive-booking-2026-10-20.ts          # tell
 *   npx tsx scripts/avvis-tomme-proactive-booking-2026-10-20.ts --kjor   # merk avvist
 *
 * Kjør mot DIRECT_URL. Krever Anders' ja før `--kjor` mot produksjon.
 */
import "./_env";
import { Client } from "pg";

const WHERE = `"agentName" = '24-7-booking-alerts' AND "actionType" = 'PROACTIVE_BOOKING' AND status = 'PENDING'
  AND coalesce(suggestion->>'forklaring', suggestion->>'detail', suggestion->>'title', suggestion->>'tittel', '') = ''`;
const GRUNN = "Tomt forslag fra 24-7-booking-alerts (audit 20.10.2026, A4). Ryddet av scripts/avvis-tomme-proactive-booking-2026-10-20.ts.";

async function main() {
  const kjor = process.argv.includes("--kjor");
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL mangler");
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    const { rows } = await client.query(`SELECT count(*)::int AS n, min("createdAt") AS forste, max("createdAt") AS siste FROM plan_actions WHERE ${WHERE};`);
    const { n, forste, siste } = rows[0];
    console.log(`Tomme PROACTIVE_BOOKING-forslag som venter: ${n}${n ? ` (${forste?.toISOString()} – ${siste?.toISOString()})` : ""}.`);
    if (!kjor) {
      console.log("Tørrkjøring. Legg til --kjor for å merke dem avvist.");
      return;
    }
    const res = await client.query(
      `UPDATE plan_actions SET status = 'REJECTED', "rejectReason" = $1, "decidedAt" = now(), "updatedAt" = now() WHERE ${WHERE};`,
      [GRUNN],
    );
    console.log(`Merket ${res.rowCount} forslag som avvist. Ingenting slettet.`);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
