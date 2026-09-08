/**
 * Manuell kjøring av tak-pakke-synk.
 *
 *   npx tsx scripts/sync-datagolf-tak.ts
 */
import "./_env";
import { config } from "dotenv";

if (!process.env.DATAGOLF_API_KEY || !process.env.DATABASE_URL) {
  config({ path: "../akgolf-hq/.env.local" });
}

async function main() {
  const { syncDatagolfTak } = await import("@/lib/datagolf/tak-sync");
  const result = await syncDatagolfTak();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
