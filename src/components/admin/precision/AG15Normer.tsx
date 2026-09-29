"use client";

/**
 * AG-15 Tester › Normer (fasiter) i Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/agencyos/screens/AG-15.jsx fane «Nivåstiger» og AG-mer.jsx).
 *
 * Tegningen viser nivåstigen per protokoll. Koden har i tillegg DataGolf-
 * autosynken (ventende justeringer som coach godkjenner eller avviser, og
 * «Kjør synk nå»). Den delen er ikke tegnet i 7d7c2994 og er tegnet i natt som
 * AG-15-NORMER — Anders må se den (port 7). Data og handlinger er uendret fra
 * benchmarks/page.tsx og benchmarks/actions.ts.
 */
import { useTransition } from "react";
import { RefreshCw, Target, TriangleAlert, Check, X, ChevronLeft } from "lucide-react";
import { Sidehode, TomTilstand, StatusPille, Meta, Knapp, KnappLenke } from "@/components/precision/pa";
import { Tabell, InlineVarsel, KortHode, Kort, type Kolonne } from "@/components/precision/pa-a5";
import type { AdminBenchmarksV2Data, BenchmarksPendingRad, BenchmarksRad, SyncMode } from "@/components/admin/v2/AdminBenchmarksV2";
import "@/styles/precision-a5.css";

const MODUS: Record<SyncMode, string> = { auto: "Auto", follow: "Følger driver", static: "Referanse" };

export type AG15NormerProps = {
  data: AdminBenchmarksV2Data;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onSyncNow: () => Promise<void>;
};

function Ventende({ rad, onApprove, onReject }: { rad: BenchmarksPendingRad; onApprove: (id: string) => Promise<void>; onReject: (id: string) => Promise<void> }) {
  const [pending, start] = useTransition();
  return <Kort>
    <KortHode tittel={rad.navn} aside={<StatusPille tone="warn">{rad.endringPct} % endring</StatusPille>} />
    <InlineVarsel tone="warn" tittel="Venter på godkjenning.">{rad.årsak}</InlineVarsel>
    <div role="table" aria-label={`Foreslåtte nivåer for ${rad.navn}`}>
      {rad.nivaer.map((n, i) => <div role="row" key={n.id} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto auto auto", columnGap: 12, alignItems: "center", minHeight: 44, borderTop: i ? "1px solid var(--border-hairline)" : "none" }}>
        <span role="cell" style={{ font: "500 14px/1.3 var(--font-sans)", minWidth: 0, overflowWrap: "anywhere" }}>{n.label}</span>
        <span role="cell" style={{ font: "500 13px/1 var(--font-mono)", color: "var(--text-secondary)", textAlign: "right" }}>{n.verdi}</span>
        <span role="cell" aria-hidden style={{ color: "var(--text-muted)" }}>→</span>
        <span role="cell" style={{ font: `${n.endret ? 700 : 500} 13px/1 var(--font-mono)`, textAlign: "right" }}>{n.nesteVerdi ?? "—"}</span>
      </div>)}
    </div>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Knapp icon={Check} iconName="check" disabled={pending} onClick={() => start(() => onApprove(rad.id))}>Godkjenn</Knapp>
      <Knapp variant="ghost" icon={X} iconName="x" disabled={pending} onClick={() => start(() => onReject(rad.id))}>Avvis og behold dagens</Knapp>
    </div>
  </Kort>;
}

export function AG15Normer({ data, onApprove, onReject, onSyncNow }: AG15NormerProps) {
  const [syncer, startSync] = useTransition();
  const ingen = data.ventende.length === 0 && data.alle.length === 0;
  type Rad = BenchmarksRad;
  const cols: Kolonne<Rad>[] = [
    { key: "navn", label: "Test", render: (r) => r.navn },
    { key: "mode", label: "Synk", render: (r) => <StatusPille tone={r.mode === "static" ? "neutral" : "ok"}>{MODUS[r.mode]}</StatusPille> },
    { key: "kilde", label: "Kilde", mono: true, render: (r) => r.kilde },
    { key: "verdier", label: "Nivåer", mono: true, align: "right", render: (r) => r.verdier },
  ];
  return <div className="pa-side">
    <KnappLenke href="/admin/tester" variant="ghost" size="sm" icon={ChevronLeft} iconName="chevron-left">Tester</KnappLenke>
    <Sidehode kicker="Tester · normer" title="Normer og nivåstiger"
      sub="Nivåene per test, hentet fra DataGolf hver mandag kl. 08:00. Endringer under 3 % skrives automatisk. Større utslag venter her på godkjenning." />
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      <Knapp variant="secondary" icon={RefreshCw} iconName="refresh-cw" loading={syncer} loadingText="Synker …" onClick={() => startSync(onSyncNow)}>Kjør synk nå</Knapp>
      <StatusPille tone={data.ventende.length > 0 ? "warn" : "ok"}>{data.ventende.length > 0 ? `${data.ventende.length} venter` : "I synk"}</StatusPille>
      <Meta>SISTE KJØRING {data.sisteKjoring.toUpperCase()}</Meta>
    </div>
    {ingen && <TomTilstand icon={Target} title="Ingen normer ennå" text="Kjør synk for å hente nivåene fra DataGolf, eller legg til tester." />}
    {data.ventende.map((r) => <Ventende key={r.id} rad={r} onApprove={onApprove} onReject={onReject} />)}
    {data.alle.length > 0 && <>
      <Meta>TESTER MED NORM · {data.alle.length}</Meta>
      <Tabell columns={cols} rows={data.alle} />
      <Meta>{data.alle.length} TESTER MED NORM · {data.ventende.length} VENTER GODKJENNING · POWERED BY DATA GOLF</Meta>
    </>}
    {data.ventende.length > 0 && <Meta><TriangleAlert size={12} aria-hidden style={{ verticalAlign: "-2px", marginRight: 4 }} />AVVIST FORSLAG KOMMER IKKE TILBAKE FØR DATAGOLF ENDRER SEG PÅ NYTT</Meta>}
  </div>;
}
