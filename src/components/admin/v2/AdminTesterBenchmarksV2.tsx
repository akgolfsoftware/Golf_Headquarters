/**
 * AgencyOS v2 — Tester · Fasiter/DataGolf-autosync (`/admin/tester/
 * benchmarks`, AgencyOS Bølge 3.25, 2026-07-14). Port fra `(legacy)/tester/
 * benchmarks/page.tsx` — samme `TestDefinition`-synk-state (AUTO/FØLGER/
 * REFERANSE), samme `approveBenchmarkPending`/`rejectBenchmarkPending`/
 * `runBenchmarkSyncNow`-server-action-kontrakt (bound per rad, uendret).
 * Server-rendret (som legacy — ingen klient-JS trengtes der).
 */

import Link from "next/link";
import { Caps, Tittel, Kort, Knapp, StatusPill, Icon, T } from "@/components/v2";
import type { ProtocolSyncState } from "@/lib/admin/benchmark-sync-schema";

export type SyncMode = "auto" | "follow" | "static";

const MODE_LABEL: Record<SyncMode, string> = { auto: "AUTO", follow: "FØLGER DRIVER", static: "REFERANSE" };

export interface BenchmarkRowV2 {
  id: string;
  name: string;
  state: ProtocolSyncState;
  mode: SyncMode;
}

function fmt(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(1).replace(".", ",");
}

export function AdminTesterBenchmarksV2({
  rows,
  lastRunTekst,
  approveBenchmarkPending,
  rejectBenchmarkPending,
  runBenchmarkSyncNow,
}: {
  rows: BenchmarkRowV2[];
  lastRunTekst: string;
  approveBenchmarkPending: (id: string) => Promise<void>;
  rejectBenchmarkPending: (id: string) => Promise<void>;
  runBenchmarkSyncNow: () => Promise<void>;
}) {
  const pendingRows = rows.filter((r) => r.state.pending);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 960 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 14 }}>
        <div>
          <Link href="/admin/tester" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 8, textDecoration: "none", color: T.mut, fontFamily: T.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            <Icon name="arrow-left" size={12} />Tester
          </Link>
          <Caps size={9}>Tester · Fasiter</Caps>
          <Tittel em="autosync">DataGolf-fasiter —</Tittel>
        </div>
        <form action={runBenchmarkSyncNow}>
          <Knapp icon="refresh-cw" type="submit">Kjør synk nå</Knapp>
        </form>
      </div>

      <p style={{ maxWidth: 640, fontFamily: T.ui, fontSize: 13, lineHeight: 1.6, color: T.mut }}>
        Kjøres automatisk hver mandag kl. 08:00 (norsk sommertid). Endringer under 3 % skrives automatisk — større
        utslag havner her og venter på din godkjenning. Du får Telegram-melding etter hver kjøring. Siste kjøring:{" "}
        <strong style={{ color: T.fg }}>{lastRunTekst}</strong>.
      </p>

      {pendingRows.map(({ id, name, state }) => {
        const { benchmarks, pending } = state;
        if (!benchmarks || !pending) return null;
        return (
          <Kort key={id} style={{ border: `1px solid color-mix(in srgb, ${T.warn} 45%, transparent)` }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
              <Icon name="alert-triangle" size={16} style={{ color: T.warn }} />
              <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>{name}</span>
              <StatusPill tone="warn">Venter godkjenning · {fmt(pending.maxChangePct)} % endring · {pending.reason}</StatusPill>
            </div>
            <table style={{ marginTop: 12, width: "100%", maxWidth: 420, borderCollapse: "collapse", fontFamily: T.ui, fontSize: 13 }}>
              <tbody>
                {benchmarks.levels.map((l) => {
                  const next = pending.proposedLevels[l.id];
                  const changed = next != null && next !== l.value;
                  return (
                    <tr key={l.id} style={{ borderTop: `1px solid ${T.border}` }}>
                      <td style={{ padding: "6px 0", color: T.fg }}>{l.label}</td>
                      <td style={{ padding: "6px 0", textAlign: "right", fontFamily: T.mono, fontWeight: 700, color: T.mut }}>{fmt(l.value)}</td>
                      <td style={{ width: 32, textAlign: "center", fontFamily: T.mono, fontSize: 11, color: T.mut }}>→</td>
                      <td style={{ padding: "6px 0", textAlign: "right", fontFamily: T.mono, fontWeight: 700, color: changed ? T.warn : T.mut }}>{next != null ? fmt(next) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
              <form action={approveBenchmarkPending.bind(null, id)}>
                <Knapp icon="check" type="submit">Godkjenn</Knapp>
              </form>
              <form action={rejectBenchmarkPending.bind(null, id)}>
                <Knapp ghost icon="x" type="submit">Avvis — behold dagens</Knapp>
              </form>
            </div>
          </Kort>
        );
      })}

      <div style={{ borderRadius: T.rCard, border: `1px solid ${T.border}`, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.ui, fontSize: 13 }}>
            <thead>
              <tr style={{ background: T.panel2, textAlign: "left" }}>
                <th style={{ padding: "10px 16px" }}><Caps size={9}>Test</Caps></th>
                <th style={{ padding: "10px 16px" }}><Caps size={9}>Synk</Caps></th>
                <th style={{ padding: "10px 16px" }}><Caps size={9}>Kilde</Caps></th>
                <th style={{ padding: "10px 16px", textAlign: "right" }}><Caps size={9}>PGA topp 40 → Scratch</Caps></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ id, name, state, mode }) => {
                const bm = state.benchmarks;
                if (!bm) return null;
                return (
                  <tr key={id} style={{ borderTop: `1px solid ${T.border}` }}>
                    <td style={{ padding: "10px 16px", fontWeight: 700, color: T.fg }}>{name}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", borderRadius: 4, padding: "2px 7px", fontFamily: T.mono, fontSize: 9, fontWeight: 700, textTransform: "uppercase", background: mode === "static" ? T.panel3 : `color-mix(in srgb, ${T.lime} 12%, transparent)`, color: mode === "static" ? T.mut : T.lime }}>{MODE_LABEL[mode]}</span>
                    </td>
                    <td style={{ padding: "10px 16px", fontFamily: T.mono, fontSize: 11, color: T.mut }}>{bm.source}</td>
                    <td style={{ padding: "10px 16px", textAlign: "right", fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: T.fg }}>{bm.levels.map((l) => fmt(l.value)).join(" · ")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8, borderTop: `1px solid ${T.border}`, background: T.panel2, padding: "10px 16px", fontFamily: T.mono, fontSize: 11, color: T.mut }}>
          <span>{rows.length} tester med fasit · {pendingRows.length} venter godkjenning</span>
          <span style={{ color: T.fg }}>Data powered by DataGolf</span>
        </div>
      </div>
    </div>
  );
}
