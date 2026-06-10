/**
 * Manuell kjøring av benchmark-autosync (samme motor som mandags-cronen).
 * Første kjøring kalibrerer baseline; senere kjøringer måler drift.
 *
 * Kjør: npx tsx scripts/run-benchmark-sync.ts
 */

import "./_env";

async function main() {
  const { runBenchmarkSync } = await import("@/lib/admin/benchmark-sync");
  const summary = await runBenchmarkSync();
  console.log(`Kjørt: ${summary.ranAt}`);
  for (const r of summary.results) {
    console.log(
      `  ${r.label}: ${r.status}` +
        (r.maxChangePct != null ? ` (${r.maxChangePct.toFixed(2)} %)` : "") +
        (r.detail ? ` — ${r.detail}` : ""),
    );
  }
  console.log(`  Referanse-tester (statiske): ${summary.staticCount}`);
  console.log(`  Telegram: ${summary.telegram}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
