/**
 * /stats/pga — PGA Tour Stats Hub
 *
 * Pixel-perfect port of Claude Design bundle (pga.jsx, components.jsx).
 * Datakilde: PgaPlayerSeason — synket ukentlig fra DataGolf.
 *
 * ISR med 1 times revalidate.
 */

import "./pga.css";

import type { Metadata } from "next";
import Link from "next/link";
import {
  getPgaTopN,
  getPgaTourAverage,
  type PgaStatCategory,
} from "@/lib/stats/pga-sync";

import { StatsIcon } from "@/components/stats/icon";
import { FlagGlyph } from "@/components/stats/flag-glyph";
import { StatsEyebrow } from "@/components/stats/eyebrow";
import { Reveal } from "@/components/stats/reveal";
import { CountUp } from "@/components/stats/count-up";
import { SparkBars } from "@/components/stats/spark-bars";
import { StatsBtn } from "@/components/stats/btn";
import { PuttPreview, type PuttRow } from "@/components/stats/putt-preview";

// ─── ISR ────────────────────────────────────────────────────────────────────
export const revalidate = 3600;

// ─── Metadata ───────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "PGA Tour Stats — hva er snittet egentlig?",
  description:
    "Interaktiv PGA Tour-statistikk: drive distance, fairway %, GIR, putts, scoring og Strokes Gained. Sammenlign deg selv med proffene. Gratis fra AK Golf.",
  alternates: { canonical: "https://akgolf.no/stats/pga" },
  openGraph: {
    title: "PGA Tour Stats — interaktiv playground",
    description:
      "Hva slår en proff langt? Hvor mange GIR? Sammenlign deg med toppen.",
    url: "https://akgolf.no/stats/pga",
  },
};

// ─── Types ───────────────────────────────────────────────────────────────────

type TopRow = {
  dgPlayerId: number;
  playerName: string;
  country: string | null;
} & Record<string, unknown>;

type KategoriConfig = {
  slug: string;
  navn: string;
  undertittel: string;
  icon: Parameters<typeof StatsIcon>[0]["name"];
  stat: PgaStatCategory;
  format: (v: number) => string;
  enhet: string;
  reverse?: boolean;
  decimals?: number;
};

type SgRow = {
  name: string;
  initials: string;
  country: string;
  value: number;
  sgOTT: number;
  sgAPP: number;
  sgPUT: number;
};

// ─── Config ──────────────────────────────────────────────────────────────────

const KATEGORIER: KategoriConfig[] = [
  {
    slug: "drive-distance",
    navn: "Drive Distance",
    undertittel: "Snittlengde per drive",
    icon: "Crosshair",
    stat: "driveDist",
    format: (v) => v.toFixed(1),
    enhet: "yds",
    decimals: 1,
  },
  {
    slug: "fairway-pct",
    navn: "Fairway-treff",
    undertittel: "Andel fairways truffet",
    icon: "Target",
    stat: "fairwayPct",
    format: (v) => v.toFixed(1),
    enhet: "%",
    decimals: 1,
  },
  {
    slug: "gir-pct",
    navn: "Greens in Regulation",
    undertittel: "Innspill på green",
    icon: "Flag",
    stat: "girPct",
    format: (v) => v.toFixed(1),
    enhet: "%",
    decimals: 1,
  },
  {
    slug: "putts-per-round",
    navn: "Putter per runde",
    undertittel: "Lavere er bedre",
    icon: "Circle",
    stat: "puttsPerRound",
    format: (v) => v.toFixed(1),
    enhet: "",
    reverse: true,
    decimals: 1,
  },
  {
    slug: "scoring-avg",
    navn: "Scoring Average",
    undertittel: "Lavere er bedre",
    icon: "LineChart",
    stat: "avgScore",
    format: (v) => v.toFixed(2),
    enhet: "",
    reverse: true,
    decimals: 2,
  },
];

const TOUR = "pga";
const YEAR = new Date().getUTCFullYear();

// Putt distribution — Broadie-estimater (DataGolf eksponerer ikke endpoint)
const PUTT_DATA: PuttRow[] = [
  { d: "1m",  tour: 99, amateur: 87 },
  { d: "2m",  tour: 87, amateur: 58 },
  { d: "3m",  tour: 48, amateur: 24 },
  { d: "5m",  tour: 28, amateur: 11 },
  { d: "8m",  tour: 15, amateur: 5  },
  { d: "12m", tour: 8,  amateur: 2  },
];

// ─── Data fetching ────────────────────────────────────────────────────────────

async function hentKategoriData() {
  return Promise.all(
    KATEGORIER.map(async (k) => {
      const [avg, topp3] = await Promise.all([
        getPgaTourAverage(k.stat, { tour: TOUR, year: YEAR }),
        getPgaTopN(k.stat, { tour: TOUR, year: YEAR, limit: 3 }),
      ]);
      return { config: k, avg, topp3: topp3 as unknown as TopRow[] };
    }),
  );
}

async function hentSgLeaderboard(): Promise<SgRow[]> {
  const rows = await getPgaTopN("sgTotal", { tour: TOUR, year: YEAR, limit: 10 });

  return (rows as unknown as TopRow[]).map((r) => {
    const name = r.playerName;
    const parts = name.split(" ");
    const initials =
      parts.length >= 2
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : name.slice(0, 2).toUpperCase();
    return {
      name,
      initials,
      country: (r.country as string) ?? "no",
      value: (r.sgTotal as number) ?? 0,
      sgOTT: (r.sgOtt as number) ?? 0,
      sgAPP: (r.sgApp as number) ?? 0,
      sgPUT: 0, // sgPut not in schema — omit
    };
  });
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function PgaStatsHub() {
  const [kategorier, sgRows] = await Promise.all([
    hentKategoriData(),
    hentSgLeaderboard(),
  ]);

  const totalSpillere = kategorier[0]?.avg?.count ?? 0;
  const harData = totalSpillere > 0;

  // KPI strip values
  const driveAvg = kategorier.find((k) => k.config.stat === "driveDist")?.avg?.average ?? null;
  const fairwayAvg = kategorier.find((k) => k.config.stat === "fairwayPct")?.avg?.average ?? null;
  const girAvg = kategorier.find((k) => k.config.stat === "girPct")?.avg?.average ?? null;
  const putterAvg = kategorier.find((k) => k.config.stat === "puttsPerRound")?.avg?.average ?? null;

  // Drive category for featured bento (sparkline + topp3)
  const driveData = kategorier.find((k) => k.config.stat === "driveDist");
  const fairwayData = kategorier.find((k) => k.config.stat === "fairwayPct");
  const girData = kategorier.find((k) => k.config.stat === "girPct");
  const putterData = kategorier.find((k) => k.config.stat === "puttsPerRound");
  const scoringData = kategorier.find((k) => k.config.stat === "avgScore");

  // Mock sparkline data for drive distribution (top 5 representative values)
  const DRIVE_SPARKLINE = [248, 270, 285, 297, 318, 332];
  const topSgValue = sgRows[0]?.value ?? 2.34;

  return (
    <div className="pga-page bg-background text-foreground">

      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section className="pga-hero">
        <Reveal>
          <Link href="/stats" className="breadcrumb">
            <StatsIcon name="ChevronLeft" size={16} />
            AK Golf Stats
          </Link>
          <div style={{ marginTop: 24 }}>
            <StatsEyebrow>PGA Tour · Statistikk</StatsEyebrow>
          </div>
          <h1>
            Hva er <em className="italic-accent">snittet</em> egentlig?
          </h1>
          <p className="hero-sub">
            Alt fra drive distance til putter per runde — hentet rett fra DataGolf,
            vektet mot Tour-snittet. Lek deg gjennom seks kategorier.
          </p>
          <div style={{ display: "flex", gap: 20, marginTop: 28, alignItems: "center", flexWrap: "wrap" }}>
            <div className="mini-mono">{harData ? totalSpillere : "—"} SPILLERE</div>
            <span className="mini-mono" style={{ color: "var(--border)" }}>·</span>
            <div className="mini-mono">SESONG {YEAR}</div>
            <span className="mini-mono" style={{ color: "var(--border)" }}>·</span>
            <div className="mini-mono">OPPDATERT MANDAGER</div>
          </div>
        </Reveal>
      </section>

      {/* ─── KPI STRIP ────────────────────────────────────────────────── */}
      <div className="pga-kpi-strip">
        <div className="pga-kpi">
          <div className="pga-kpi-eyebrow">Lengde</div>
          <div className="pga-kpi-value">
            {driveAvg !== null ? (
              <CountUp value={driveAvg} decimals={0} />
            ) : (
              <span>—</span>
            )}
            {driveAvg !== null && <span className="unit">yds</span>}
          </div>
          <div className="pga-kpi-sub">Snitt drive</div>
        </div>
        <div className="pga-kpi">
          <div className="pga-kpi-eyebrow">Presisjon</div>
          <div className="pga-kpi-value">
            {fairwayAvg !== null ? (
              <CountUp value={fairwayAvg} decimals={1} />
            ) : (
              <span>—</span>
            )}
            {fairwayAvg !== null && <span className="unit">%</span>}
          </div>
          <div className="pga-kpi-sub">Fairway-treff</div>
        </div>
        <div className="pga-kpi">
          <div className="pga-kpi-eyebrow">Green</div>
          <div className="pga-kpi-value">
            {girAvg !== null ? (
              <CountUp value={girAvg} decimals={1} />
            ) : (
              <span>—</span>
            )}
            {girAvg !== null && <span className="unit">%</span>}
          </div>
          <div className="pga-kpi-sub">GIR</div>
        </div>
        <div className="pga-kpi">
          <div className="pga-kpi-eyebrow">Putter</div>
          <div className="pga-kpi-value">
            {putterAvg !== null ? (
              <CountUp value={putterAvg} decimals={1} />
            ) : (
              <span>—</span>
            )}
          </div>
          <div className="pga-kpi-sub">Per runde</div>
        </div>
      </div>

      {/* ─── BENTO GRID ───────────────────────────────────────────────── */}
      <section className="pga-section">
        <Reveal>
          <div className="pga-section-head">
            <div>
              <StatsEyebrow>Kategorier</StatsEyebrow>
              <h2>
                Seks tall som forteller
                <br />
                <em className="italic-accent">alt</em> om en runde.
              </h2>
            </div>
          </div>
        </Reveal>

        {!harData ? (
          <div
            style={{
              borderRadius: 16,
              border: "1px dashed var(--border)",
              background: "var(--card)",
              padding: "64px 32px",
              textAlign: "center",
            }}
          >
            <StatsIcon name="Trophy" size={40} style={{ color: "var(--muted-foreground)", opacity: 0.4 }} />
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, marginTop: 16 }}>
              Data er på vei
            </h2>
            <p style={{ color: "var(--muted-foreground)", fontSize: 14, maxWidth: 400, margin: "8px auto 0" }}>
              Ukentlig sync fra DataGolf starter snart.
            </p>
          </div>
        ) : (
          <div className="bento pga">

            {/* ── Drive Distance — featured span 4 ── */}
            <Reveal className="b-drive">
              <Link href="/stats/pga/drive-distance" style={{ display: "block", height: "100%" }}>
                <div className="bento-card">
                  <div className="bento-arrow">
                    <StatsIcon name="ArrowRight" size={20} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div className="bento-icon">
                        <StatsIcon name="Crosshair" size={22} />
                      </div>
                      <h3>{driveData?.config.navn ?? "Drive Distance"}</h3>
                      <div className="bento-desc">{driveData?.config.undertittel ?? "Snittlengde per drive"}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="mini-mono">TOUR-SNITT</div>
                      <div className="bento-big-number">
                        {driveData?.avg?.average != null ? (
                          <CountUp value={driveData.avg.average} decimals={1} />
                        ) : "—"}
                        <span className="unit">yds</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "end" }}>
                    <div className="topp3">
                      {(driveData?.topp3 ?? []).map((p, i) => (
                        <div className="topp3-row" key={p.dgPlayerId}>
                          <span className="topp3-rank">{i + 1}</span>
                          <span className="topp3-name">
                            <FlagGlyph code={(p.country as string) ?? "no"} size={14} />
                            {p.playerName}
                          </span>
                          <span className="topp3-val">
                            {p.driveDist != null
                              ? (p.driveDist as number).toFixed(1)
                              : "—"}
                            <span className="mini-mono" style={{ marginLeft: 4 }}>yds</span>
                          </span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="mini-mono" style={{ marginBottom: 8 }}>FORDELING · TOPP 5</div>
                      <SparkBars values={DRIVE_SPARKLINE} height={64} highlight={3} />
                    </div>
                  </div>
                </div>
              </Link>
            </Reveal>

            {/* ── Fairway-treff — span 2 ── */}
            <Reveal delay={80} className="b-fairway">
              <Link href="/stats/pga/fairway-pct" style={{ display: "block", height: "100%" }}>
                <div className="bento-card">
                  <div className="bento-arrow"><StatsIcon name="ArrowRight" size={20} /></div>
                  <div className="bento-icon"><StatsIcon name="Target" size={22} /></div>
                  <h3>{fairwayData?.config.navn ?? "Fairway-treff"}</h3>
                  <div className="bento-desc">{fairwayData?.config.undertittel ?? "Andel fairways truffet"}</div>
                  <div className="bento-med-number">
                    {fairwayData?.avg?.average != null ? (
                      <CountUp value={fairwayData.avg.average} decimals={1} />
                    ) : "—"}
                    <span className="unit">%</span>
                  </div>
                  <div className="topp3">
                    {(fairwayData?.topp3 ?? []).map((p, i) => (
                      <div className="topp3-row" key={p.dgPlayerId}>
                        <span className="topp3-rank">{i + 1}</span>
                        <span className="topp3-name">
                          <FlagGlyph code={(p.country as string) ?? "no"} size={14} />
                          {p.playerName}
                        </span>
                        <span className="topp3-val">
                          {p.fairwayPct != null
                            ? (p.fairwayPct as number).toFixed(1)
                            : "—"}
                          <span className="mini-mono" style={{ marginLeft: 4 }}>%</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            </Reveal>

            {/* ── GIR — span 2 ── */}
            <Reveal delay={120} className="b-gir">
              <Link href="/stats/pga/gir-pct" style={{ display: "block", height: "100%" }}>
                <div className="bento-card">
                  <div className="bento-arrow"><StatsIcon name="ArrowRight" size={20} /></div>
                  <div className="bento-icon"><StatsIcon name="Flag" size={22} /></div>
                  <h3>{girData?.config.navn ?? "Greens in Regulation"}</h3>
                  <div className="bento-desc">{girData?.config.undertittel ?? "Innspill på green"}</div>
                  <div className="bento-med-number">
                    {girData?.avg?.average != null ? (
                      <CountUp value={girData.avg.average} decimals={1} />
                    ) : "—"}
                    <span className="unit">%</span>
                  </div>
                  <div className="topp3">
                    {(girData?.topp3 ?? []).map((p, i) => (
                      <div className="topp3-row" key={p.dgPlayerId}>
                        <span className="topp3-rank">{i + 1}</span>
                        <span className="topp3-name">
                          <FlagGlyph code={(p.country as string) ?? "no"} size={14} />
                          {p.playerName}
                        </span>
                        <span className="topp3-val">
                          {p.girPct != null
                            ? (p.girPct as number).toFixed(1)
                            : "—"}
                          <span className="mini-mono" style={{ marginLeft: 4 }}>%</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            </Reveal>

            {/* ── Putter per runde — span 2 ── */}
            <Reveal delay={160} className="b-putter">
              <Link href="/stats/pga/putts-per-round" style={{ display: "block", height: "100%" }}>
                <div className="bento-card">
                  <div className="bento-arrow"><StatsIcon name="ArrowRight" size={20} /></div>
                  <div className="bento-icon"><StatsIcon name="Circle" size={22} /></div>
                  <h3>{putterData?.config.navn ?? "Putter per runde"}</h3>
                  <div className="bento-desc">{putterData?.config.undertittel ?? "Lavere er bedre"}</div>
                  <div className="bento-med-number">
                    {putterData?.avg?.average != null ? (
                      <CountUp value={putterData.avg.average} decimals={1} />
                    ) : "—"}
                  </div>
                  <div className="topp3">
                    {(putterData?.topp3 ?? []).map((p, i) => (
                      <div className="topp3-row" key={p.dgPlayerId}>
                        <span className="topp3-rank">{i + 1}</span>
                        <span className="topp3-name">
                          <FlagGlyph code={(p.country as string) ?? "no"} size={14} />
                          {p.playerName}
                        </span>
                        <span className="topp3-val">
                          {p.puttsPerRound != null
                            ? (p.puttsPerRound as number).toFixed(1)
                            : "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            </Reveal>

            {/* ── Scoring Average — span 2 ── */}
            <Reveal delay={200} className="b-scoring">
              <Link href="/stats/pga/scoring-avg" style={{ display: "block", height: "100%" }}>
                <div className="bento-card">
                  <div className="bento-arrow"><StatsIcon name="ArrowRight" size={20} /></div>
                  <div className="bento-icon"><StatsIcon name="LineChart" size={22} /></div>
                  <h3>{scoringData?.config.navn ?? "Scoring Average"}</h3>
                  <div className="bento-desc">{scoringData?.config.undertittel ?? "Lavere er bedre"}</div>
                  <div className="bento-med-number">
                    {scoringData?.avg?.average != null ? (
                      <CountUp value={scoringData.avg.average} decimals={2} />
                    ) : "—"}
                  </div>
                  <div className="topp3">
                    {(scoringData?.topp3 ?? []).map((p, i) => (
                      <div className="topp3-row" key={p.dgPlayerId}>
                        <span className="topp3-rank">{i + 1}</span>
                        <span className="topp3-name">
                          <FlagGlyph code={(p.country as string) ?? "no"} size={14} />
                          {p.playerName}
                        </span>
                        <span className="topp3-val">
                          {p.avgScore != null
                            ? (p.avgScore as number).toFixed(2)
                            : "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            </Reveal>

            {/* ── SG Total — full width span 6 ── */}
            <Reveal delay={240} className="b-sgtotal">
              <Link href="/stats/pga/sg-total" style={{ display: "block", height: "100%" }}>
                <div className="bento-card">
                  <div className="bento-arrow"><StatsIcon name="ArrowRight" size={20} /></div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>
                    <div>
                      <div className="bento-icon"><StatsIcon name="Sparkles" size={22} /></div>
                      <h3>Strokes Gained · Total</h3>
                      <div className="bento-desc">
                        Den enkleste måten å rangere golfere på. Høyere er bedre — vektet mot felt-snittet, ikke par.
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="mini-mono">TOPP 10 · OPPDATERT MANDAG</div>
                      <div className="bento-med-number" style={{ color: "var(--primary)" }}>
                        {sgRows.length > 0 ? (
                          <>+<CountUp value={topSgValue} decimals={2} /></>
                        ) : "—"}
                      </div>
                      <div className="mini-mono" style={{ color: "var(--muted-foreground)" }}>
                        SG/runde · #1
                      </div>
                    </div>
                  </div>

                  <SGLeaderboard rows={sgRows} />
                </div>
              </Link>
            </Reveal>

          </div>
        )}
      </section>

      {/* ─── PUTT EXPLORER TEASER ─────────────────────────────────────── */}
      <section className="pga-section pga-section-divider">
        <Reveal>
          <div className="putt-teaser">
            <div>
              <StatsEyebrow tone="lime">Interaktivt</StatsEyebrow>
              <h2>
                Hva senker snittet
                <br />
                fra <em className="italic-accent">3 meter</em>?
              </h2>
              <p>
                PGA Tour-snittet fra 3 meter er 48 %. Du hadde gjettet høyere, hadde du ikke?
                Putt Explorer lar deg utforske hver avstand, og se hvor amatøren faller bak proffen.
              </p>
              <StatsBtn variant="outline" icon="ArrowRight">
                Lek deg med putt-data
              </StatsBtn>
            </div>
            <div>
              <PuttPreview data={PUTT_DATA} height={220} />
              <div className="putt-legend">
                <span>
                  <span
                    className="putt-legend-dot"
                    style={{ background: "var(--accent)" }}
                  />
                  PGA Tour
                </span>
                <span>
                  <span
                    className="putt-legend-dot"
                    style={{ background: "rgba(209, 248, 67, 0.25)" }}
                  />
                  Amatør hcp 10
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── MERSALG ──────────────────────────────────────────────────── */}
      <section className="pga-section pga-section-divider">
        <Reveal>
          <div className="pga-mersalg">
            <div className="mersalg-bg-glyph" aria-hidden>
              <StatsIcon name="LineChart" size={420} stroke={1} />
            </div>
            <div>
              <StatsEyebrow tone="lime">Din egen statistikk</StatsEyebrow>
              <h2>
                Lurer du på
                <br />
                hvordan <em className="italic-accent">du</em> ligger an?
              </h2>
              <p>
                PlayerHQ regner ut din egen Strokes Gained fra hvert scorekort. Du ser hvor strokene tapes —
                drive, innspill, putt — og hvor du står mot Tour-snittet over tid.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link
                  href="/portal"
                  className="stats-btn stats-btn-primary stats-btn-md"
                >
                  <span>Prøv gratis</span>
                  <StatsIcon name="ArrowRight" size={16} className="stats-btn-icon" />
                </Link>
                <Link
                  href="/stats/sg-sammenlign"
                  className="stats-btn stats-btn-outline stats-btn-md"
                >
                  <span>Sammenlign uten konto</span>
                  <StatsIcon name="ArrowRight" size={16} className="stats-btn-icon" />
                </Link>
              </div>
            </div>

            <div className="mersalg-card">
              <h4>Du vs Tour</h4>
              <DuVsTour />
              <div className="mersalg-price">
                <strong>300 kr/mnd</strong> · gratis under beta
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── FOOTER NUDGE ─────────────────────────────────────────────── */}
      <div className="pga-footer-nudge">
        <Reveal>
          <p style={{ fontSize: 14, color: "var(--muted-foreground)" }}>
            Vil du legge inn dine egne SG-tall?{" "}
            <Link
              href="/stats/sg-sammenlign"
              style={{
                color: "var(--primary)",
                fontWeight: 500,
                textDecoration: "underline",
                textUnderlineOffset: 4,
              }}
            >
              Prøv sammenligningsverktøyet
            </Link>
          </p>
        </Reveal>
      </div>

    </div>
  );
}

// ─── SGLeaderboard ─────────────────────────────────────────────────────────
// Server component — no interactive sorting (static render)

function SGLeaderboard({ rows }: { rows: SgRow[] }) {
  if (rows.length === 0) return null;

  return (
    <div className="lb" onClick={(e) => e.preventDefault()}>
      <div className="lb-row lb-head">
        <span>#</span>
        <span />
        <span>SPILLER</span>
        <span style={{ textAlign: "right" }}>SG TOTAL</span>
        <span style={{ textAlign: "right" }}>OFF TEE</span>
        <span style={{ textAlign: "right" }}>APPROACH</span>
        <span style={{ textAlign: "right" }}>PUTTING</span>
      </div>
      {rows.map((r, i) => (
        <div className="lb-row" key={r.name}>
          <span className="lb-rank">{i + 1}</span>
          <FlagGlyph code={r.country} size={16} />
          <span className="lb-name">
            <span className="lb-avatar">{r.initials}</span>
            {r.name}
          </span>
          <span className="lb-chip" style={{ textAlign: "right" }}>
            +{r.value.toFixed(2)}
          </span>
          <span className="lb-val pos" style={{ textAlign: "right" }}>
            {r.sgOTT >= 0 ? "+" : ""}{r.sgOTT.toFixed(2)}
          </span>
          <span className="lb-val pos" style={{ textAlign: "right" }}>
            {r.sgAPP >= 0 ? "+" : ""}{r.sgAPP.toFixed(2)}
          </span>
          <span className="lb-val" style={{ textAlign: "right", color: "var(--muted-foreground)" }}>
            —
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── DuVsTour ──────────────────────────────────────────────────────────────
// Static SG comparison strip — illustrative values

function DuVsTour() {
  const rows: { label: string; du: number }[] = [
    { label: "Off the tee",   du: -0.42 },
    { label: "Approach",      du: -0.91 },
    { label: "Around green",  du: -0.28 },
    { label: "Putting",       du: -0.65 },
  ];
  const total = 2.5;

  return (
    <div className="du-vs-tour">
      {rows.map((r) => {
        const duPos = 50 + (r.du / total) * 50;
        const barLeft = Math.min(duPos, 50);
        const barRight = 100 - Math.max(duPos, 50);
        return (
          <div key={r.label}>
            <div className="du-vs-row-label">
              <span style={{ color: "var(--accent)" }}>{r.label}</span>
              <span style={{ color: "hsl(var(--background))" }}>{r.du.toFixed(2)}</span>
            </div>
            <div className="du-vs-track">
              <div className="du-vs-center" />
              <div
                className="du-vs-bar"
                style={{ left: `${barLeft}%`, right: `${barRight}%` }}
              />
              <div
                className="du-vs-dot"
                style={{ left: `${duPos}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
