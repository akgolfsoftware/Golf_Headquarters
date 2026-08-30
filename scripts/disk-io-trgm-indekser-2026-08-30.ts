/**
 * Disk IO-fiks 30.08.2026 — trigram-indekser for ILIKE-søk.
 *
 * Bakgrunn: Supabase varslet at prosjektet tømmer Disk IO-budsjettet. Målt i
 * `pg_stat_statements` samme dag var to mønstre dominerende:
 *
 *  1. `public_players.name ILIKE '%…%'` uten indeks (seq scan) — kalt 251 656
 *     ganger av scraper-matchingen (`src/lib/scrapers/player-resolve.ts`) og på
 *     hver visning av /stats/spillere og /api/stats/search.
 *  2. `tournaments.location ILIKE '%…%'` uten indeks — 46 492 kall fra
 *     `hentBaneStats` (offentlige banesider).
 *
 * Kodefiksen (fjernet `_count`-aggregatet) er den store; disse indeksene tar
 * resten. Målt etter: 14 743 → 59 blokker for navnesøket, 101 → 18 for location.
 *
 * ALLEREDE KJØRT i produksjon 30.08.2026 via Supabase MCP. Denne fila er en
 * RECORD (jf. .claude/rules/gotchas.md — aldri migrate dev/push/deploy her),
 * og er idempotent hvis den må kjøres på nytt:
 *
 *   npx tsx scripts/disk-io-trgm-indekser-2026-08-30.ts
 */
import { Client } from "pg";

async function main() {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL mangler");

  const client = new Client({ connectionString: url });
  await client.connect();

  try {
    await client.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);

    await client.query(`
      CREATE INDEX IF NOT EXISTS "public_players_name_trgm_idx"
        ON public.public_players USING gin (name gin_trgm_ops);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS "tournaments_location_trgm_idx"
        ON public.tournaments USING gin (location gin_trgm_ops);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS "tournaments_name_trgm_idx"
        ON public.tournaments USING gin (name gin_trgm_ops);
    `);

    await client.query(`ANALYZE public.public_players;`);
    await client.query(`ANALYZE public.tournaments;`);

    console.log("OK: trigram-indekser på plass.");
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
