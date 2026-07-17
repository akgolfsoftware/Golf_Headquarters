/**
 * /admin/tester/benchmarks — Fasiter (DataGolf-autosync). v2-port 16. juli 2026.
 *
 * Coach-side som viser nivåstigene i NGF-testbatteriet, synk-status per test
 * (AUTO / FØLGER / REFERANSE), og ventende justeringer som krever godkjenning
 * (drift over 3 %-grensen fra mandags-cronen). Manuell "Kjør synk nå"-knapp
 * bruker samme motor som cronen.
 *
 * Server Component. Auth via requirePortalUser (COACH/ADMIN), som /admin/tester.
 */

import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { readSyncState, type ProtocolSyncState } from "@/lib/admin/benchmark-sync-schema";
import { syncModeFor } from "@/lib/admin/benchmark-sync";
import {
  AdminBenchmarksV2,
  type AdminBenchmarksV2Data,
  type BenchmarksPendingRad,
  type BenchmarksRad,
} from "@/components/admin/v2/AdminBenchmarksV2";
import {
  approveBenchmarkPending,
  rejectBenchmarkPending,
  runBenchmarkSyncNow,
} from "./actions";

export const dynamic = "force-dynamic";

type Row = { id: string; name: string; state: ProtocolSyncState };

function fmt(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(1).replace(".", ",");
}

function fmtDate(iso: string | undefined): string {
  if (!iso) return "aldri";
  return new Date(iso).toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

export default async function BenchmarksAdminPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const defs = await prisma.testDefinition.findMany({
    select: { id: true, name: true, protocol: true },
    orderBy: { name: "asc" },
  });
  const rows: Row[] = defs
    .map((d) => ({ id: d.id, name: d.name, state: readSyncState(d.protocol) }))
    .filter((r): r is Row => r.state.benchmarks !== null && r.state.key !== null);

  const pendingRows = rows.filter((r) => r.state.pending);
  const lastRun = rows
    .map((r) => r.state.sync?.lastRunAt)
    .filter((x): x is string => Boolean(x))
    .sort()
    .at(-1);

  const ventende: BenchmarksPendingRad[] = pendingRows
    .map(({ id, name, state }) => {
      const { benchmarks, pending } = state;
      if (!benchmarks || !pending) return null;
      return {
        id,
        navn: name,
        endringPct: fmt(pending.maxChangePct),
        årsak: pending.reason,
        nivaer: benchmarks.levels.map((l) => {
          const next = pending.proposedLevels[l.id];
          return {
            id: l.id,
            label: l.label,
            verdi: fmt(l.value),
            nesteVerdi: next != null ? fmt(next) : null,
            endret: next != null && next !== l.value,
          };
        }),
      };
    })
    .filter((r): r is BenchmarksPendingRad => r !== null);

  const alle: BenchmarksRad[] = rows
    .map(({ id, name, state }) => {
      const bm = state.benchmarks;
      if (!bm || !state.key) return null;
      return {
        id,
        navn: name,
        mode: syncModeFor(state.key),
        kilde: bm.source,
        verdier: bm.levels.map((l) => fmt(l.value)).join(" · "),
      };
    })
    .filter((r): r is BenchmarksRad => r !== null);

  const data: AdminBenchmarksV2Data = {
    sisteKjoring: fmtDate(lastRun),
    ventende,
    alle,
  };

  return (
    <AdminBenchmarksV2
      data={data}
      onApprove={approveBenchmarkPending}
      onReject={rejectBenchmarkPending}
      onSyncNow={runBenchmarkSyncNow}
    />
  );
}
