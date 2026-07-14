/**
 * AgencyOS — Tester · Fasiter/DataGolf-autosync (`/admin/tester/
 * benchmarks`), v2. Port av `(legacy)/tester/benchmarks/page.tsx`
 * (2026-07-14, AgencyOS Bølge 3.25) — synk-state-logikken er uendret.
 * `(legacy)/tester/benchmarks/actions.ts` bor fortsatt der — delt server
 * actions, uendret.
 */

import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { readSyncState } from "@/lib/admin/benchmark-sync-schema";
import { syncModeFor } from "@/lib/admin/benchmark-sync";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminTesterBenchmarksV2, type BenchmarkRowV2 } from "@/components/admin/v2/AdminTesterBenchmarksV2";
import { approveBenchmarkPending, rejectBenchmarkPending, runBenchmarkSyncNow } from "@/app/admin/(legacy)/tester/benchmarks/actions";

export const dynamic = "force-dynamic";

function fmtDate(iso: string | undefined): string {
  if (!iso) return "aldri";
  return new Date(iso).toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

export default async function BenchmarksAdminPage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const defs = await prisma.testDefinition.findMany({
    select: { id: true, name: true, protocol: true },
    orderBy: { name: "asc" },
  });

  const rows: BenchmarkRowV2[] = defs
    .map((d) => {
      const state = readSyncState(d.protocol);
      return { id: d.id, name: d.name, state, mode: state.key ? syncModeFor(state.key) : "static" as const };
    })
    .filter((r) => r.state.benchmarks !== null && r.state.key !== null);

  const lastRun = rows
    .map((r) => r.state.sync?.lastRunAt)
    .filter((x): x is string => Boolean(x))
    .sort()
    .at(-1);

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminTesterBenchmarksV2
        rows={rows}
        lastRunTekst={fmtDate(lastRun)}
        approveBenchmarkPending={approveBenchmarkPending}
        rejectBenchmarkPending={rejectBenchmarkPending}
        runBenchmarkSyncNow={runBenchmarkSyncNow}
      />
    </V2Shell>
  );
}
