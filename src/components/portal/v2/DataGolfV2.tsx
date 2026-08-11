"use client";

/**
 * PlayerHQ DataGolf — Paper-fasit playerhq-datagolf.html (deg mot touren).
 * Ekte SG vs PGA Tour-baseline. T.* only. Tom = registrer runde / se analyse.
 */

import Link from "next/link";
import type { DataGolfData, DataGolfKategori } from "@/lib/portal-stats/datagolf-data";
import {
  T,
  fmtSg,
  Caps,
  Kort,
  KpiFlis,
  TomTilstand,
  HjelpTips,
  CTAPill,
  Trend,
} from "@/components/v2";

export type DataGolfProps = { data: DataGolfData; spillerNavn?: string };

/* ── Rene hjelpere ─────────────────────────────────────────────────── */

/** SG-verdi → norsk komma-desimal m/ fortegn, «—» for null. */
function sg(v: number | null): string {
  return v == null ? "—" : fmtSg(v);
}

/* Divergerende SG-bar rundt 0-linjen (tour-baseline). Fasit .spor2: positiv
   fylles i up-grønn mot høyre, negativ i dn-rød mot venstre. */
function SgBar({ v, max }: { v: number | null; max: number }) {
  if (v == null) {
    return <div style={{ flex: 1, height: 10, borderRadius: 9999, background: T.track }} />;
  }
  const halv = Math.min(48, (Math.abs(v) / max) * 48);
  const neg = v < 0;
  return (
    <div style={{ flex: 1, height: 10, borderRadius: 9999, background: T.track, position: "relative" }}>
      <span style={{ position: "absolute", left: "50%", top: -3, bottom: -3, width: 1, background: T.borderS }} />
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          ...(neg ? { right: "50%" } : { left: "50%" }),
          width: halv + "%",
          background: neg ? T.down : T.up,
          borderRadius: 9999,
        }}
      />
    </div>
  );
}

/* Én kategori = gruppe m/ Deg · Referanse (fasit-rader: navn 70px, spor, verdi). */
function DGGruppe({ k, max, last }: { k: DataGolfKategori; max: number; last: boolean }) {
  const rows = [
    { l: "Deg", v: k.deg },
    { l: "Referanse", v: k.ref },
  ];
  return (
    <div style={{ padding: "11px 0", borderBottom: last ? "none" : `1px solid ${T.border}` }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
        <span style={{ fontFamily: T.mono, fontSize: 12, fontVariantNumeric: "tabular-nums", color: T.fg }}>{k.code}</span>
        <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>{k.name}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {rows.map((r) => (
          <div key={r.l} style={{ display: "grid", gridTemplateColumns: "70px minmax(0,1fr) 58px", gap: 8, alignItems: "center", minHeight: 32 }}>
            <span style={{ fontFamily: T.mono, fontSize: 12, color: T.mut }}>{r.l}</span>
            <SgBar v={r.v} max={max} />
            <span
              style={{
                textAlign: "right",
                fontFamily: T.mono,
                fontSize: 13,
                color: r.v == null ? T.mut : r.v >= 0 ? T.up : T.down,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {sg(r.v)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function DataGolfV2({ data, spillerNavn }: DataGolfProps) {
  const navn = spillerNavn?.trim();

  if (!data.harData) {
    return (
      <div data-paper-slug="playerhq-datagolf" data-paper-wave-g="datagolf" data-paper-portal-datagolf style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 720, margin: "0 auto", width: "100%" }}>
        <div data-paper-pattern-topp>
          <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 17, fontWeight: 600, color: T.fg }}>Deg mot touren</h1>
          <span style={{ display: "block", fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 2 }}>
            DataGolf · PGA Tour-baseline{navn ? ` · ${navn}` : ""}
          </span>
        </div>
        <div className="grid grid-cols-3" style={{ gap: 8 }}>
          <KpiFlis label="Gap" value="—" instant />
          <KpiFlis label="Kategorier" value="—" instant />
          <KpiFlis label="Status" value="Ingen data" instant />
        </div>
        <Kort>
          <TomTilstand
            icon="bar-chart"
            title="Ingen sammenligning ennå"
            sub="Registrer SG på runder — da fylles gap mot touren per kategori."
          />
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <Link href="/portal/runde/live" style={{ textDecoration: "none", display: "block" }}>
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "10px 16px",
                borderRadius: 12, background: T.cta, color: T.onCta, fontFamily: T.ui, fontSize: 14, fontWeight: 600, minHeight: 48,
              }}>Start live-føring
              </span>
            </Link>
            <Link href="/portal/analysere" style={{ textDecoration: "none", display: "block" }}>
              <CTAPill ghost full icon="bar-chart">
                Se SG-analyse
              </CTAPill>
            </Link>
          </div>
        </Kort>
      </div>
    );
  }

  const refNavn = data.refNavn ?? "Referanse";
  // Barskala: største absoluttverdi blant alle SG-verdier, min 0,5 for luft.
  const alleVerdier = data.kategorier.flatMap((k) => [k.deg, k.ref]).filter((v): v is number => v != null);
  const max = Math.max(0.5, ...alleVerdier.map((v) => Math.abs(v)));

  // Posisjon mot touren (deg − ref). Negativ = bak.
  const posisjon = data.gapTotal != null ? -data.gapTotal : null;

  // Trend over registrerte sammenligninger (kun når ≥2 snapshots) —
  // beholdt utover fasiten (ekte data, ingen fasit-seksjon å speile).
  const harTrend = data.trend.length >= 2;
  const trendLo = harTrend ? Math.min(0, ...data.trend) - 0.4 : 0;
  const trendHi = harTrend ? Math.max(0, ...data.trend) + 0.4 : 0;

  return (
    <div data-paper-slug="playerhq-datagolf" data-paper-portal-datagolf style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 720, margin: "0 auto", width: "100%" }}>
      {/* Hode — fasit: h1 «Deg mot touren», sub DataGolf · baseline · navn */}
      <div data-paper-pattern-topp>
        <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 17, fontWeight: 600, color: T.fg }}>Deg mot touren</h1>
        <span style={{ display: "block", fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 2 }}>
          DataGolf · PGA Tour-baseline{navn ? ` · ${navn}` : ""}
        </span>
      </div>

      {/* Fasit: .merknad — serif på myk flate */}
      <p style={{ fontFamily: T.bodyFont, fontSize: 12, color: T.mut, lineHeight: 1.6, margin: 0, background: T.panel2, borderRadius: 8, padding: "8px 12px" }}>
        Sammenligningen er mot én registrert referansespiller, ikke mot hele tourfeltet.
      </p>

      {/* Hero — fasit: tint-kort, 40px mono-tall tonet up/dn, serif-sub */}
      <Kort tint>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
          <Caps>Deg mot touren · SG total</Caps>
          <HjelpTips k="dataGolfBaseline" size={12} />
        </span>
        <div style={{ marginTop: 10 }}>
          <span
            style={{
              fontFamily: T.mono,
              fontSize: 40,
              fontWeight: 600,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
              color: posisjon == null ? T.mut : posisjon >= 0 ? T.up : T.down,
            }}
          >
            {posisjon != null ? fmtSg(posisjon) : "—"}
          </span>
          <span style={{ fontFamily: T.ui, fontSize: 12, color: T.mut }}> slag/runde</span>
        </div>
        <p style={{ fontFamily: T.bodyFont, fontSize: 12, color: T.mut, margin: "6px 0 0" }}>
          mot {refNavn}
          {data.refAar != null ? ` (${data.refAar})` : ""} · brutto
        </p>
      </Kort>

      {/* Per kategori — fasit-rader: Deg / Referanse, spor m/ nullinje, tonede verdier */}
      <Kort eyebrow="Per kategori · deg vs referanse">
        {data.kategorier.map((k, i) => (
          <DGGruppe key={k.code} k={k} max={max} last={i === data.kategorier.length - 1} />
        ))}
      </Kort>

      {/* Innsikt — fasit: kort m/ info-kant, serif, utledet av de samme tallene */}
      {data.storsteGap && (
        <Kort style={{ borderLeft: `3px solid ${T.info}` }}>
          <p style={{ fontFamily: T.bodyFont, fontSize: 13, color: T.fg, lineHeight: 1.6, margin: 0 }}>
            Størst avstand til referansen er i {data.storsteGap.name.toLowerCase()} ({sg(-data.storsteGap.gap)} slag) — det er der gapet mot touren lukkes raskest.
          </p>
        </Kort>
      )}

      {/* Gap over tid — beholdt utover fasiten (egen datastøtte) */}
      {harTrend && (
        <Kort eyebrow="Gap mot touren · registrerte sammenligninger" action={<Caps size={9}>0-linjen = tour</Caps>}>
          <Trend
            series={data.trend}
            yMin={trendLo}
            yMax={trendHi}
            baseline={0}
            height={92}
            xLabels={data.trendLabels.length ? data.trendLabels : undefined}
          />
          <div style={{ marginTop: 10, fontFamily: T.ui, fontSize: 11.5, color: T.mut }}>
            {data.gapDelta != null && data.gapDelta >= 0
              ? `Gapet har krympet ${sg(Math.abs(data.gapDelta))} slag siden forrige sammenligning.`
              : `Basert på ${data.antallSnapshots} registrerte sammenligninger.`}
          </div>
        </Kort>
      )}
    </div>
  );
}
