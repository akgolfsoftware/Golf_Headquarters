"use client";

/**
 * AgencyOS Innsikt · stall — Train-lock (T11, 27.08.2026).
 *
 * Fasit: `AG-12 Innsikt stall.dc.html`. Erstatter `AdminLagSnittV2` (Paper
 * T.*-tokens) på `/admin/lag-snitt` — den gamle ruten flettes inn her og
 * redirecter til `/admin/analyse/stall` (se `(legacy)/lag-snitt/page.tsx`).
 *
 * Tokens: KUN TL (src/lib/v2/train-lock.ts) — se CLAUDE.md invariant 2.
 * Motor: Broadie-SG fra Round (sgOtt/sgApp/sgArg/sgPutt) — samme motor som
 * AG-07, aldri blandet med DataGolf/TrackMan/PEI.
 *
 * Fasiten viser kun mobil (390×844). Denne komponenten er responsiv utover
 * det (samme kortbredde skalerer opp), men uten egen iPad/Mac-fasit portes
 * layoutet 1:1 fra mobil-fasiten på alle bredder — ingen ny struktur oppfunnet.
 *
 * MASTERPLAN 15.8 (31.08.2026): dette er nå den nestede `?visning=trend`
 * under «stall»-fanen på `/admin/analyse` (uendret spørring/innhold —
 * `/admin/analyse/stall` er en ren redirect dit). `somFane` skjuler egen h1
 * («Innsikt») når sidens `AnalyseHode` allerede viser den.
 */

import { TL } from "@/lib/v2/train-lock";

export type InnsiktStallV2Kategori = {
  key: string;
  label: string;
  verdi: string;
  pct: number;
  negativ: boolean;
};

export type InnsiktStallV2Data = {
  ukenummer: number;
  sgUke: string;
  nSpillere: number;
  kategorier: InnsiktStallV2Kategori[];
  harKategoriData: boolean;
  innsiktTekst: string | null;
  trend: number[];
  harTrend: boolean;
};

function CapsLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: TL.vekt.caps,
        letterSpacing: TL.track.capsSm,
        textTransform: "uppercase",
        color: TL.mute,
      }}
    >
      {children}
    </span>
  );
}

function KpiKort({ verdi, label }: { verdi: string; label: string }) {
  return (
    <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: 20 }}>
      <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em", color: TL.text, fontVariantNumeric: "tabular-nums" }}>
        {verdi}
      </div>
      <div style={{ marginTop: 7, fontSize: 9, fontWeight: TL.vekt.caps, letterSpacing: TL.track.capsSm, textTransform: "uppercase", color: TL.mute }}>
        {label}
      </div>
    </div>
  );
}

function KategoriBar({ k }: { k: InnsiktStallV2Kategori }) {
  const barHoyde = Math.max(3, Math.round((Math.min(Math.abs(k.pct), 100) / 100) * 24));
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ height: 48, display: "flex", alignItems: k.negativ ? "flex-start" : "flex-end", justifyContent: "center" }}>
        {!k.negativ && (
          <div style={{ width: 22, height: barHoyde, borderRadius: "4px 4px 0 0", background: TL.text }} />
        )}
      </div>
      <div style={{ height: 1, background: TL.hair }} />
      <div style={{ height: 36, display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
        {k.negativ && (
          <div style={{ width: 22, height: barHoyde, borderRadius: "0 0 4px 4px", background: TL.text, opacity: 0.4 }} />
        )}
      </div>
      <div style={{ marginTop: 4, fontSize: 9, fontWeight: TL.vekt.caps, letterSpacing: TL.track.capsSm, textTransform: "uppercase", color: TL.mute }}>
        {k.label}
      </div>
      <div style={{ marginTop: 2, fontSize: 11, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: TL.text, opacity: k.negativ ? TL.opasitet.negativ : 1 }}>
        {k.verdi}
      </div>
    </div>
  );
}

function TrendSparkline({ verdier }: { verdier: number[] }) {
  const bredde = 318;
  const hoyde = 40;
  const min = Math.min(...verdier);
  const max = Math.max(...verdier);
  const spenn = max - min || 1;
  const punkter = verdier
    .map((v, i) => {
      const x = (i / (verdier.length - 1)) * bredde;
      const y = hoyde - 2 - ((v - min) / spenn) * (hoyde - 4);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const siste = verdier[verdier.length - 1];
  const sisteX = bredde;
  const sisteY = hoyde - 2 - ((siste - min) / spenn) * (hoyde - 4);
  return (
    <svg width="100%" height={hoyde} viewBox={`0 0 ${bredde} ${hoyde}`} preserveAspectRatio="none" fill="none">
      <polyline points={punkter} stroke={TL.text} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={sisteX} cy={sisteY} r={2.5} fill={TL.text} />
    </svg>
  );
}

export function InnsiktStallV2({ data, somFane }: { data: InnsiktStallV2Data; somFane?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 460 }}>
      {!somFane && (
        <div>
          <h1 style={{ margin: 0, fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em", color: TL.text }}>Innsikt</h1>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <KpiKort verdi={data.sgUke} label={`SG stall · uke ${data.ukenummer}`} />
        <KpiKort verdi={String(data.nSpillere)} label="Spillere" />
      </div>

      <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <CapsLabel>SG per kategori · stallen</CapsLabel>
          <span style={{ fontSize: 11, fontWeight: TL.vekt.caps, letterSpacing: TL.track.capsSm, textTransform: "uppercase", color: TL.mute, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
            4 uker
          </span>
        </div>
        {data.harKategoriData ? (
          <>
            <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {data.kategorier.map((k) => (
                <KategoriBar key={k.key} k={k} />
              ))}
            </div>
            {data.innsiktTekst && (
              <div style={{ marginTop: 14, fontSize: 13, fontWeight: 400, color: TL.mute, lineHeight: 1.45 }}>{data.innsiktTekst}</div>
            )}
          </>
        ) : (
          <div style={{ marginTop: 14, fontSize: 13, color: TL.mute, lineHeight: 1.45 }}>
            Ingen runder med SG-fordeling logget de siste 4 ukene ennå.
          </div>
        )}
      </div>

      <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <CapsLabel>SG stall · trend</CapsLabel>
          <span style={{ fontSize: 11, fontWeight: TL.vekt.caps, letterSpacing: TL.track.capsSm, textTransform: "uppercase", color: TL.mute, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
            8 uker
          </span>
        </div>
        {data.harTrend ? (
          <div style={{ marginTop: 16 }}>
            <TrendSparkline verdier={data.trend} />
          </div>
        ) : (
          <div style={{ marginTop: 14, fontSize: 13, color: TL.mute, lineHeight: 1.45 }}>
            For lite ukentlig SG-data ennå til å vise en trend.
          </div>
        )}
      </div>
    </div>
  );
}
