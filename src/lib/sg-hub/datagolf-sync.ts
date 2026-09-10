/**
 * Oppdaterer proffreferanser fra den dokumenterte approach-skill-kontrakten.
 * Spillernes SG per slag kan ikke skrives som forventede slag igjen i SgBaseline.
 * Beholder cron-kontrakten, men bruker den kanoniske innspill-synken.
 */
import { syncDatagolfTak } from "@/lib/datagolf/tak-sync";

export async function syncDataGolf(): Promise<{ upserted: number }> {
  const result = await syncDatagolfTak();
  return { upserted: result.upserted };
}
