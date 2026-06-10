/**
 * /admin/tester/benchmarks — Fasiter (DataGolf-autosync).
 *
 * Coach-side som viser nivåstigene i NGF-testbatteriet, synk-status per test
 * (AUTO / FØLGER / REFERANSE), og ventende justeringer som krever godkjenning
 * (drift over 3 %-grensen fra mandags-cronen). Manuell "Kjør synk nå"-knapp
 * bruker samme motor som cronen.
 *
 * Server Component. Auth via requirePortalUser (COACH/ADMIN), som /admin/tester.
 */

import Link from "next/link";
import { ArrowLeft, Check, RefreshCw, TriangleAlert, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { readSyncState, type ProtocolSyncState } from "@/lib/admin/benchmark-sync-schema";
import { syncModeFor } from "@/lib/admin/benchmark-sync";
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

const MODE_LABEL = {
  auto: "AUTO",
  follow: "FØLGER DRIVER",
  static: "REFERANSE",
} as const;

const MODE_CLASS = {
  auto: "bg-primary/10 text-primary",
  follow: "bg-primary/10 text-primary",
  static: "bg-secondary text-muted-foreground",
} as const;

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

  return (
    <div className="mx-auto w-full max-w-[960px]">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link
            href="/admin/tester"
            className="mb-2 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" strokeWidth={2} aria-hidden />
            Tester
          </Link>
          <span className="block font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
            TESTER · FASITER
          </span>
          <h1 className="mt-1 font-display text-[26px] font-bold leading-tight tracking-[-0.02em] text-foreground">
            DataGolf-fasiter — <em className="font-normal italic text-primary">autosync</em>
          </h1>
        </div>
        <form action={runBenchmarkSyncNow}>
          <button
            type="submit"
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-primary bg-primary px-4 font-mono text-[10px] font-extrabold uppercase tracking-[0.1em] text-accent hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RefreshCw className="h-3 w-3" strokeWidth={2} aria-hidden />
            Kjør synk nå
          </button>
        </form>
      </div>

      <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
        Kjøres automatisk hver mandag kl. 08:00 (norsk sommertid). Endringer under 3 % skrives
        automatisk — større utslag havner her og venter på din godkjenning. Du får Telegram-melding
        etter hver kjøring. Siste kjøring: <b className="text-foreground">{fmtDate(lastRun)}</b>.
      </p>

      {/* VENTENDE GODKJENNINGER */}
      {pendingRows.map(({ id, name, state }) => {
        const { benchmarks, pending } = state;
        if (!benchmarks || !pending) return null;
        return (
          <div key={id} className="mb-4 rounded-2xl border border-warning/50 bg-card p-5">
            <div className="flex flex-wrap items-center gap-2">
              <TriangleAlert className="h-4 w-4 text-warning" strokeWidth={2} aria-hidden />
              <span className="font-display text-[15px] font-bold text-foreground">{name}</span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-warning">
                Venter godkjenning · {fmt(pending.maxChangePct)} % endring · {pending.reason}
              </span>
            </div>
            <table className="mt-3 w-full max-w-md border-collapse">
              <tbody>
                {benchmarks.levels.map((l) => {
                  const next = pending.proposedLevels[l.id];
                  const changed = next != null && next !== l.value;
                  return (
                    <tr key={l.id} className="border-t border-border first:border-t-0">
                      <td className="py-1.5 text-[13px] text-foreground">{l.label}</td>
                      <td className="py-1.5 text-right font-mono text-[13px] font-bold tabular-nums text-muted-foreground">
                        {fmt(l.value)}
                      </td>
                      <td className="w-8 text-center font-mono text-[11px] text-muted-foreground">→</td>
                      <td
                        className={
                          changed
                            ? "py-1.5 text-right font-mono text-[13px] font-extrabold tabular-nums text-warning"
                            : "py-1.5 text-right font-mono text-[13px] font-bold tabular-nums text-muted-foreground"
                        }
                      >
                        {next != null ? fmt(next) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="mt-4 flex gap-2">
              <form action={approveBenchmarkPending.bind(null, id)}>
                <button
                  type="submit"
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-primary bg-primary px-4 font-mono text-[10px] font-extrabold uppercase tracking-[0.1em] text-accent hover:opacity-90"
                >
                  <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                  Godkjenn
                </button>
              </form>
              <form action={rejectBenchmarkPending.bind(null, id)}>
                <button
                  type="submit"
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-card px-4 font-mono text-[10px] font-extrabold uppercase tracking-[0.1em] text-foreground hover:bg-secondary"
                >
                  <X className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                  Avvis — behold dagens
                </button>
              </form>
            </div>
          </div>
        );
      })}

      {/* ALLE FASIT-TESTER */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left font-mono text-[10px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground">Test</th>
              <th className="px-4 py-3 text-left font-mono text-[10px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground">Synk</th>
              <th className="px-4 py-3 text-left font-mono text-[10px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground">Kilde</th>
              <th className="px-4 py-3 text-right font-mono text-[10px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground">PGA topp 40 → Scratch</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ id, name, state }) => {
              const bm = state.benchmarks;
              if (!bm || !state.key) return null;
              const mode = syncModeFor(state.key);
              return (
                <tr key={id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-2.5 text-[13px] font-bold text-foreground">{name}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex h-[16px] items-center rounded-[3px] px-1.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.06em] ${MODE_CLASS[mode]}`}>
                      {MODE_LABEL[mode]}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">{bm.source}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-[12px] font-bold tabular-nums text-foreground">
                    {bm.levels.map((l) => fmt(l.value)).join(" · ")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-secondary/40 px-4 py-3 font-mono text-[11px] font-bold tracking-[0.04em] text-muted-foreground">
          <span>
            {rows.length} tester med fasit · {pendingRows.length} venter godkjenning
          </span>
          <span className="text-foreground">Data powered by DataGolf</span>
        </div>
      </div>
    </div>
  );
}
