"use client";

/**
 * AgencyOS v2 — Talent · WAGR-benchmark (`/admin/talent/wagr-benchmark`,
 * AgencyOS Bølge 3.23, 2026-07-14). Port fra `(legacy)/talent/wagr-
 * benchmark/page.tsx` + `wagr-delete-button.tsx` — samme `WagrSnapshot`-
 * datamodell (topp 5 globalt + topp 5 norske), samme `slettWagrSnapshot`
 * server-action (delt fra `wagr-import/actions`, uendret).
 */

import Link from "next/link";
import { useState, useTransition } from "react";
import { Caps, Tittel, Kort, Icon, T } from "@/components/v2";

const KATEGORI_INFO: Record<string, { tier: string; pts: string }> = {
  A: { tier: "OWGR Top 150", pts: "≥1500" },
  B: { tier: "OWGR Top 400", pts: "≥1100" },
  C: { tier: "OWGR Top 700", pts: "≥900" },
  D: { tier: "Am. World 100", pts: "≥700" },
  E: { tier: "Am. Europa 300", pts: "≥400" },
  F: { tier: "Junior WORLD", pts: "≥220" },
  G: { tier: "Junior EUROPE", pts: "≥100" },
  H: { tier: "Junior Nasjonal", pts: "≥50" },
  I: { tier: "Junior Region/Klubb", pts: "<50" },
};

export interface WagrSnapshotRowV2 {
  id: string;
  wagrPlayerSlug: string;
  fullName: string;
  country: string;
  rank: number;
  moveDelta: number | null;
  ptsAvg: number;
  ngfCategory: string | null;
}

function RenderMoveV2({ delta }: { delta: number | null }) {
  if (delta === null || delta === 0) return <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>—</span>;
  const opp = delta > 0;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: T.mono, fontSize: 11, color: opp ? T.lime : T.down }}>
      <Icon name={opp ? "trending-up" : "trending-down"} size={12} />{Math.abs(delta)}
    </span>
  );
}

function WagrDeleteButtonV2({ snapshotId, fullName, slettWagrSnapshot }: { snapshotId: string; fullName: string; slettWagrSnapshot: (id: string) => Promise<void> }) {
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState(false);

  function slett() {
    if (!confirm(`Slette WAGR-snapshot for «${fullName}»?`)) return;
    setFeil(false);
    startTransition(async () => {
      try {
        await slettWagrSnapshot(snapshotId);
      } catch {
        setFeil(true);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={slett}
      disabled={pending}
      aria-label={`Slett ${fullName}`}
      title={feil ? "Kunne ikke slette — prøv igjen" : "Slett snapshot"}
      style={{ display: "grid", placeItems: "center", width: 28, height: 28, borderRadius: 8, border: `1px solid ${feil ? T.down : T.border}`, background: "transparent", color: feil ? T.down : T.mut, cursor: pending ? "default" : "pointer", opacity: pending ? 0.5 : 1 }}
    >
      <Icon name={pending ? "loader" : "trash"} size={13} style={pending ? { animation: "v2spin3 1s linear infinite" } : undefined} />
    </button>
  );
}

function PlayerTableV2({ rows, slettWagrSnapshot }: { rows: WagrSnapshotRowV2[]; slettWagrSnapshot: (id: string) => Promise<void> }) {
  return (
    <div style={{ borderRadius: T.rCard, border: `1px solid ${T.border}`, overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", minWidth: 620, borderCollapse: "collapse", fontFamily: T.ui, fontSize: 13 }}>
          <thead>
            <tr style={{ background: T.panel2, textAlign: "left" }}>
              {["Rank", "Move", "Land", "Spiller", "Pts Avg", "NGF-kat", "WAGR", "Slett"].map((h) => (
                <th key={h} style={{ padding: "10px 14px" }}><Caps size={9}>{h}</Caps></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} style={{ borderTop: `1px solid ${T.border}` }}>
                <td style={{ padding: "12px 14px", fontFamily: T.mono, color: T.fg }}>{r.rank}</td>
                <td style={{ padding: "12px 14px" }}><RenderMoveV2 delta={r.moveDelta} /></td>
                <td style={{ padding: "12px 14px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, borderRadius: 6, border: `1px solid ${T.border}`, background: T.panel2, padding: "2px 8px", fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", color: T.mut }}>
                    <Icon name="flag" size={10} />{r.country}
                  </span>
                </td>
                <td style={{ padding: "12px 14px", fontWeight: 600, color: T.fg }}>{r.fullName}</td>
                <td style={{ padding: "12px 14px", fontFamily: T.mono, textAlign: "right" }}>{r.ptsAvg.toFixed(2)}</td>
                <td style={{ padding: "12px 14px", textAlign: "center" }}>
                  {r.ngfCategory && (
                    <span style={{ display: "inline-flex", width: 28, height: 28, alignItems: "center", justifyContent: "center", borderRadius: 9999, background: `color-mix(in srgb, ${T.lime} 12%, transparent)`, fontFamily: T.disp, fontWeight: 700, fontSize: 14, color: T.lime }}>{r.ngfCategory}</span>
                  )}
                </td>
                <td style={{ padding: "12px 14px", textAlign: "right" }}>
                  <a href={`https://www.wagr.com/playerprofile/${r.wagrPlayerSlug}`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: T.mono, fontSize: 11, color: T.mut, textDecoration: "none" }}>
                    Åpne<Icon name="external-link" size={11} />
                  </a>
                </td>
                <td style={{ padding: "12px 14px", textAlign: "right" }}>
                  <WagrDeleteButtonV2 snapshotId={r.id} fullName={r.fullName} slettWagrSnapshot={slettWagrSnapshot} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminWagrBenchmarkV2({
  globale,
  norske,
  snapshotDatoTekst,
  snapshotUke,
  slettWagrSnapshot,
}: {
  globale: WagrSnapshotRowV2[];
  norske: WagrSnapshotRowV2[];
  snapshotDatoTekst: string;
  snapshotUke: { uke: number; aar: number };
  slettWagrSnapshot: (id: string) => Promise<void>;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <style>{"@keyframes v2spin3{to{transform:rotate(360deg)}}"}</style>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
        <div>
          <Caps size={9}>AgencyOS · Talent · WAGR-benchmark</Caps>
          <Tittel em="verdens beste">Kalibrer mot</Tittel>
          <p style={{ marginTop: 6, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Snapshot fra wagr.com · uke {snapshotUke.uke}/{snapshotUke.aar}. NGF-kategori (A-L) beregnes fra Pts Avg.</p>
        </div>
        <Link href="/admin/talent/wagr-import" style={{ display: "inline-flex", flex: "none", alignItems: "center", gap: 6, borderRadius: 9999, background: T.lime, padding: "10px 18px", fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.onLime, textDecoration: "none" }}>
          <Icon name="plus" size={14} />Importer spiller
        </Link>
      </div>

      <Kort>
        <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>NGF-kategori-skala</div>
        <p style={{ marginTop: 4, fontFamily: T.ui, fontSize: 11.5, color: T.mut }}>Power-skalaen fra Øyvind Rojahn (NGF) kalibrert mot WAGR Pts Avg.</p>
        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
          {Object.entries(KATEGORI_INFO).map(([kat, info]) => (
            <div key={kat} style={{ borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, padding: 12 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg }}>{kat}</span>
                <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut }}>{info.pts}</span>
              </div>
              <div style={{ marginTop: 4, fontFamily: T.ui, fontSize: 11, color: T.mut }}>{info.tier}</div>
            </div>
          ))}
        </div>
      </Kort>

      <div>
        <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 18, color: T.fg }}>Topp 5 menn — globalt</div>
        <p style={{ marginTop: 2, marginBottom: 12, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Verdens beste amatører. Setter taket på Pts Avg-skalaen.</p>
        {globale.length === 0 ? (
          <Kort>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "36px 16px", textAlign: "center" }}>
              <Icon name="trophy" size={26} style={{ color: T.mut }} />
              <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14, color: T.fg }}>Ingen data</div>
              <p style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>Kjør seed-script: npx tsx scripts/seed-wagr-benchmark.ts</p>
            </div>
          </Kort>
        ) : <PlayerTableV2 rows={globale} slettWagrSnapshot={slettWagrSnapshot} />}
      </div>

      <div>
        <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 18, color: T.fg }}>Topp 5 norske gutter</div>
        <p style={{ marginTop: 2, marginBottom: 12, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Setter floor for elite-junior i AK Golf-systemet. Norsk gull-standard = ~1000 Pts Avg (Mjaaseth).</p>
        {norske.length === 0 ? (
          <Kort>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "36px 16px", textAlign: "center" }}>
              <Icon name="trophy" size={26} style={{ color: T.mut }} />
              <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14, color: T.fg }}>Ingen norske spillere</div>
              <p style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>Kjør seed-script eller bruk Importer-knappen for å legge til.</p>
            </div>
          </Kort>
        ) : <PlayerTableV2 rows={norske} slettWagrSnapshot={slettWagrSnapshot} />}
      </div>

      <p style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut }}>
        Snapshot tatt {snapshotDatoTekst}. Oppdateres manuelt ved behov. Auto-sync via cron kommer i Sprint J.
      </p>
    </div>
  );
}

