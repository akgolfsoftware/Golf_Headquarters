"use client";

/**
 * PlayerHQ · Statistikk · Drill-down per disiplin (/portal/statistikk… — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * T.* only. Lys PlayerHQ.
 */

import Link from "next/link";
import {
  Kort,
  Caps,
  Tittel,
  TallHero,
  Trend,
  TomTilstand,
  CTAPill,
  DataTabell,
  type DataTabellColumn,
  T,
  fmtSg,
  HjelpTips,
} from "@/components/v2";

export interface StatMetrikkTrend {
  punkter: number[];
  yMin: number;
  yMax: number;
}

export interface StatMetrikkDrillRad {
  navn: string;
  antall: number;
  tidLabel: string; // "4,5 t"
  andelPct: number; // 0–100
}

export interface StatMetrikkUkeRad {
  label: string;
  runder: number;
  sg: number | null;
}

export interface StatistikkMetrikkV2Data {
  kind: "pyramid" | "sg";
  slugLabel: string; // "FYS" / "SG-TEE"
  tittel: string; // "Fysisk"
  em: string; // "trening"
  underLabel: string; // "Treningstimer · siste 30 d"
  harData: boolean;
  /** Hovedtall (snitt/sum siste 30 d) — ferdig formatert MED enhet i unit-feltet. */
  hovedVerdi: string;
  hovedEnhet: string; // "t" / "SG/runde"
  /** Delta vs forrige 30 d — null når SG-baseline er ny (ingen forrige periode). */
  deltaLabel: string | null;
  deltaDir: "up" | "down";
  deltaSub: string; // "vs forrige 30 d" / "ny baseline — første 30 d med data"
  /** vs kategori-snitt (A1-referanse, statisk proxy til ekte benchmark finnes). */
  benchmarkDiffLabel: string;
  benchmarkPositiv: boolean;
  benchmarkSnittLabel: string; // "Snitt A1 = 12,0 t (referanse)"
  /** Tredje flis: Total tid 90 d (pyramid) eller Beste 90 d (SG). */
  tredjeLabel: string;
  tredjeVerdi: string;
  tredjeSub: string;
  trend: StatMetrikkTrend;
  drillTopp: StatMetrikkDrillRad[];
  sgUker: StatMetrikkUkeRad[];
  fokusHref: string;
  emptyTekst: string;
  emptyCtaHref: string;
  emptyCtaTekst: string;
}

const DRILL_COLS: DataTabellColumn[] = [
  { key: "navn", label: "Drill" },
  { key: "antall", label: "Antall", mono: true, align: "right", sortable: true },
  { key: "tid", label: "Tid", mono: true, align: "right" },
  { key: "andel", label: "Andel", mono: true, align: "right", sortable: true },
];

const UKE_COLS: DataTabellColumn[] = [
  { key: "periode", label: "Periode" },
  { key: "runder", label: "Runder", mono: true, align: "right" },
  { key: "sg", label: "SG snitt (slag)", delta: true, align: "right" },
];

export function StatistikkMetrikkV2({ data }: { data: StatistikkMetrikkV2Data }) {
  const hjelpNokkel = data.kind === "sg" ? ("sgOmrade" as const) : ("pyramideAkse" as const);

  return (
    <>
      {/* Topptekst */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
        <div>
          <Caps>PlayerHQ · Statistikk · {data.slugLabel}</Caps>
          <div style={{ marginTop: 6 }}>
            <Tittel em={data.em}>{data.tittel}</Tittel>
          </div>
          <p style={{ fontFamily: T.ui, fontSize: 13, color: T.mut, margin: "8px 0 0" }}>{data.underLabel}</p>
        </div>
        <span style={{ fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut, border: `1px solid ${T.border}`, borderRadius: 9999, padding: "5px 12px" }}>
          Siste 90 d
        </span>
      </div>

      {!data.harData ? (
        <Kort>
          <TomTilstand icon="bar-chart" title={`${data.tittel} · ingen historikk`} sub={data.emptyTekst} />
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Link href={data.emptyCtaHref} style={{ textDecoration: "none" }}>
              <CTAPill icon="arrow-right">{data.emptyCtaTekst}</CTAPill>
            </Link>
          </div>
        </Kort>
      ) : (
        <>
          {/* Hovedtall-rad */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: T.gap }}>
            <Kort tint>
              <TallHero
                label="Snitt 30 d"
                value={data.hovedVerdi}
                unit={data.hovedEnhet}
                delta={data.deltaLabel ?? undefined}
                dir={data.deltaDir}
                sub={data.deltaSub}
                size={46}
                accent
                hjelp={hjelpNokkel}
              />
            </Kort>
            <Kort>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Caps size={9}>Mot kategori-snitt</Caps>
                <HjelpTips k="kategoriSnitt" size={11} />
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 12 }}>
                <span style={{ fontFamily: T.mono, fontSize: 30, fontWeight: 700, color: data.benchmarkPositiv ? T.up : T.down, fontVariantNumeric: "tabular-nums" }}>
                  {data.benchmarkDiffLabel}
                </span>
              </div>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, marginTop: 10 }}>{data.benchmarkSnittLabel}</span>
            </Kort>
            <Kort>
              <Caps size={9}>{data.tredjeLabel}</Caps>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 12 }}>
                <span style={{ fontFamily: T.mono, fontSize: 30, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>
                  {data.tredjeVerdi}
                </span>
              </div>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, marginTop: 10 }}>{data.tredjeSub}</span>
            </Kort>
          </div>

          {/* Trend 90 d */}
          <Kort eyebrow="Utvikling · siste 90 d">
            {data.trend.punkter.length === 0 ? (
              <TomTilstand icon="line-chart" title="Ingen datapunkter" sub="Trenden tegnes når det finnes logget aktivitet i perioden." />
            ) : (
              <Trend
                series={data.trend.punkter}
                yMin={data.trend.yMin}
                yMax={data.trend.yMax}
                baseline={data.kind === "sg" ? 0 : null}
                fmt={data.kind === "sg" ? fmtSg : (v) => `${Math.round(v)} t`}
                xLabels={["90 d", "60 d", "30 d", "i dag"]}
                height={120}
              />
            )}
          </Kort>

          {/* Topp 5 drills (kun pyramide) */}
          {data.kind === "pyramid" && (
            <Kort eyebrow={`Topp 5 drills · mest tid siste 90 d`}>
              {data.drillTopp.length === 0 ? (
                <TomTilstand icon="dumbbell" title="Ingen drills logget" sub="Ingen drills logget for denne disiplinen ennå." />
              ) : (
                <DataTabell
                  columns={DRILL_COLS}
                  rows={data.drillTopp.map((d) => ({
                    navn: d.navn,
                    antall: d.antall,
                    tid: d.tidLabel,
                    andel: `${Math.round(d.andelPct)} %`,
                  }))}
                  sortKey="andel"
                  sortDir="desc"
                  mobilKort
                />
              )}
            </Kort>
          )}

          {/* SG per uke (kun SG) */}
          {data.kind === "sg" && (
            <Kort eyebrow="SG-utvikling per periode · siste 90 d">
              <DataTabell
                columns={UKE_COLS}
                rows={data.sgUker.map((u) => ({
                  periode: u.label,
                  runder: u.runder,
                  sg: u.sg,
                }))}
                sortKey="periode"
                sortDir="asc"
                mobilKort
              />
            </Kort>
          )}
        </>
      )}

      {/* Coach-CTA */}
      <Kort>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
          <div style={{ minWidth: 220, flex: 1 }}>
            <Caps size={9}>Be coachen om mer fokus</Caps>
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg, marginTop: 8 }}>
              Vil du jobbe mer med {data.em.toLowerCase()}?
            </div>
            <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.55, margin: "6px 0 0" }}>
              Send en melding til coach Anders Kristiansen og be ham legge mer av denne disiplinen inn i neste plan.
            </p>
          </div>
          <Link href={data.fokusHref} style={{ textDecoration: "none" }}>
            <CTAPill icon="message-circle">Be om mer fokus</CTAPill>
          </Link>
        </div>
      </Kort>
    </>
  );
}
