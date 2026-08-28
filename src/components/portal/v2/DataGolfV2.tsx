"use client";
import { TL } from "@/lib/v2/train-lock";
/**
 * PlayerHQ DataGolf — Paper-fasit playerhq-datagolf.html (deg mot touren).
 * Ekte SG vs PGA Tour-baseline. T.* only. Tom = registrer runde / se analyse.
 */

import Link from "next/link";
import type { DataGolfData, DataGolfKategori } from "@/lib/portal-stats/datagolf-data";
import { fmtSg, Caps, Kort, KpiFlis, TomTilstand, HjelpTips, CTAPill, Trend } from "@/components/v2";
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
    return <div style={{ flex: 1, height: 10, borderRadius: 9999, background: TL.hair }} />;
  }
  const halv = Math.min(48, (Math.abs(v) / max) * 48);
  const neg = v < 0;
  return (
    <div style={{ flex: 1, height: 10, borderRadius: 9999, background: TL.hair, position: "relative" }}>
      <span style={{ position: "absolute", left: "50%", top: -3, bottom: -3, width: 1, background: TL.hair }} />
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          ...(neg ? { right: "50%" } : { left: "50%" }),
          width: halv + "%",
          background: neg ? TL.danger : TL.ok,
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
    <div style={{ padding: "11px 0", borderBottom: last ? "none" : `1px solid ${TL.hair}` }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
        <span style={{ fontFamily: TL.font.mono, fontSize: 12, fontVariantNumeric: "tabular-nums", color: TL.text }}>{k.code}</span>
        <span style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute }}>{k.name}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {rows.map((r) => (
          <div key={r.l} style={{ display: "grid", gridTemplateColumns: "70px minmax(0,1fr) 58px", gap: 8, alignItems: "center", minHeight: 32 }}>
            <span style={{ fontFamily: TL.font.mono, fontSize: 12, color: TL.mute }}>{r.l}</span>
            <SgBar v={r.v} max={max} />
            <span
              style={{
                textAlign: "right",
                fontFamily: TL.font.mono,
                fontSize: 13,
                color: r.v == null ? TL.mute : r.v >= 0 ? TL.ok : TL.danger,
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
    // "MANGLER_REF" (T6): SG-grunnlaget finnes (f.eks. fra SG-broen) — det
    // eneste som mangler er valget av referansespiller. Samme skjelett som
    // helt tom, men med riktig budskap og én vei videre.
    const manglerRef = data.tilstand === "MANGLER_REF";
    return (
      <div data-paper-slug="playerhq-datagolf" data-paper-wave-g="datagolf" data-paper-portal-datagolf style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720, margin: "0 auto", width: "100%" }}>
        <div data-paper-pattern-topp>
          <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text }}>Deg mot touren</h1>
          <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>
            DataGolf · PGA Tour-baseline{navn ? ` · ${navn}` : ""}
          </span>
        </div>
        <div className="grid grid-cols-3" style={{ gap: 8 }}>
          <KpiFlis label="Gap" value="—" instant />
          <KpiFlis label="Kategorier" value="—" instant />
          <KpiFlis label="Status" value={manglerRef ? "Klar" : "Ingen data"} instant />
        </div>
        <Kort>
          {manglerRef ? (
            <TomTilstand
              icon="bar-chart"
              title="Tallene dine er klare"
              sub="SG-grunnlaget ditt er registrert — velg en referansespiller for å se gap mot touren per kategori."
            />
          ) : (
            <TomTilstand
              icon="bar-chart"
              title="Ingen sammenligning ennå"
              sub="Registrer SG på runder — da fylles gap mot touren per kategori."
            />
          )}
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <Link href={manglerRef ? "/stats/sg-sammenlign/start" : "/portal/runde/live"} style={{ textDecoration: "none", display: "block" }}>
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "10px 16px",
                borderRadius: 12, background: TL.fill, color: TL.onFill, fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600, minHeight: 48,
              }}>{manglerRef ? "Velg referansespiller" : "Start live-føring"}
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
    <div data-paper-slug="playerhq-datagolf" data-paper-portal-datagolf style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720, margin: "0 auto", width: "100%" }}>
      {/* Hode — fasit: h1 «Deg mot touren», sub DataGolf · baseline · navn */}
      <div data-paper-pattern-topp>
        <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text }}>Deg mot touren</h1>
        <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>
          DataGolf · PGA Tour-baseline{navn ? ` · ${navn}` : ""}
        </span>
      </div>

      {/* Fasit: .merknad — serif på myk flate */}
      <p style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, lineHeight: 1.6, margin: 0, background: TL.dock, borderRadius: 8, padding: "8px 12px" }}>
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
              fontFamily: TL.font.mono,
              fontSize: 40,
              fontWeight: 600,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
              color: posisjon == null ? TL.mute : posisjon >= 0 ? TL.ok : TL.danger,
            }}
          >
            {posisjon != null ? fmtSg(posisjon) : "—"}
          </span>
          <span style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute }}> slag/runde</span>
        </div>
        <p style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, margin: "6px 0 0" }}>
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
        <Kort style={{ borderLeft: `3px solid ${TL.viz.target}` }}>
          <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.text, lineHeight: 1.6, margin: 0 }}>
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
          <div style={{ marginTop: 10, fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute }}>
            {data.gapDelta != null && data.gapDelta >= 0
              ? `Gapet har krympet ${sg(Math.abs(data.gapDelta))} slag siden forrige sammenligning.`
              : `Basert på ${data.antallSnapshots} registrerte sammenligninger.`}
          </div>
        </Kort>
      )}
    </div>
  );
}
