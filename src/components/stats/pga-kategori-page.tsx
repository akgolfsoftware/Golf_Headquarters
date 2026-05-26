"use client";

/**
 * PgaKategoriDetaljPage — shared template for all 6 PGA category pages.
 *
 * Sections:
 * 1. Hero with editorial headline + 3 KPI boxes
 * 2. Interactive slider block (percentile + nearest pro + histogram)
 * 3. Conditional narrative ("Slik vinner du dette gapet")
 * 4. Top-20 leaderboard
 * 5. Category-specific mersalg band
 * 6. Related categories strip
 *
 * The interactive section is a Client Component (slider, live updates).
 * Import this in each category's page.tsx and pass a KategoriConfig.
 */

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";

import { StatsEyebrow } from "@/components/stats/eyebrow";
import { Reveal } from "@/components/stats/reveal";
import { CountUp } from "@/components/stats/count-up";
import { FlagGlyph } from "@/components/stats/flag-glyph";
import { StatsIcon, type StatsIconName } from "@/components/stats/icon";
import { StatsHistogram, type HistogramBucket } from "@/components/stats/stats-histogram";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface KategoriSpiller {
  navn: string;
  land: string | null;
  verdi: number;
}

export interface RelatertKategori {
  slug: string;
  navn: string;
  icon: StatsIconName;
  snitt: number | null;
  enhet: string;
}

export interface KategoriConfig {
  slug: string;
  noun: string;                // "Drive Distance"
  icon: StatsIconName;
  enhet: string;               // "yds", "%", ""
  reverse: boolean;            // true = lower is better
  sliderMin: number;
  sliderMax: number;
  sliderDefault: number;
  sliderStep: number;
  heroHeadline: React.ReactNode;   // JSX with <em>
  heroSub: string;
  mersalgTekst: string;
  mersalgKort: string[];
  relaterte: RelatertKategori[];
}

export interface KategoriPageProps {
  config: KategoriConfig;
  spillere: KategoriSpiller[];
  tourSnitt: number | null;
  antallSpillere: number;
}

// ─── Histogram helpers ────────────────────────────────────────────────────────

function buildHistogram(
  verdier: number[],
  min: number,
  max: number,
  buckets = 20,
): HistogramBucket[] {
  const step = (max - min) / buckets;
  return Array.from({ length: buckets }, (_, i) => {
    const lo = min + i * step;
    const hi = lo + step;
    const count = verdier.filter((v) => v >= lo && (i === buckets - 1 ? v <= hi : v < hi)).length;
    return { range: `${Math.round(lo)}-${Math.round(hi)}`, count };
  });
}

function computePercentile(
  value: number,
  verdier: number[],
  reverse: boolean,
): number {
  if (verdier.length === 0) return 50;
  const below = reverse
    ? verdier.filter((v) => v > value).length
    : verdier.filter((v) => v < value).length;
  return Math.round((below / verdier.length) * 100);
}

function findHighlightBucket(value: number, buckets: HistogramBucket[], min: number, max: number): number {
  const bucketCount = buckets.length;
  const step = (max - min) / bucketCount;
  const idx = Math.floor((value - min) / step);
  return Math.min(Math.max(idx, 0), bucketCount - 1);
}

function findNearest(value: number, spillere: KategoriSpiller[]): KategoriSpiller | null {
  if (spillere.length === 0) return null;
  return spillere.reduce((best, p) =>
    Math.abs(p.verdi - value) < Math.abs(best.verdi - value) ? p : best,
  spillere[0]);
}

// ─── Narrative helper ─────────────────────────────────────────────────────────

function getNarrative(percentile: number): { headline: string; text: string } {
  if (percentile < 25)
    return {
      headline: "Her er det mest å hente",
      text: "Du er i nederste kvartil på Tour. Drive distance er en av de mest trenbare statistikkene — speed-trening kan gi 15–20 yds på 12 uker.",
    };
  if (percentile < 50)
    return {
      headline: "Du er under snittet",
      text: "Tour-spillere på ditt nivå har 60 % færre 3-putter enn deg fordi de er nærmere etter drive. Speed + presisjon må jobbes parallelt.",
    };
  if (percentile < 75)
    return {
      headline: "Du kvalifiserer for konferansen",
      text: "Du slår langt nok til å spille D1 college-golf i USA. Neste nivå er konsekvent over 290 yds gjennomsnitt.",
    };
  if (percentile < 95)
    return {
      headline: "Du er i toppsjiktet",
      text: "Få amatører presterer så bra. Spørsmålet er om du klarer å holde dette nivået under turneringspress.",
    };
  return {
    headline: "Tour-nivå bekreftet",
    text: "Prestasjonen din er på Tour-spillernes nivå. Spør coachen din om SG-data — det er der gapet sannsynligvis ligger.",
  };
}

function splitHeadline(headline: string): React.ReactNode {
  const words = headline.split(" ");
  if (words.length < 3) return <>{headline}</>;
  const last2 = words.slice(-2).join(" ");
  const rest = words.slice(0, -2).join(" ");
  return (
    <>
      {rest}{" "}
      <em className="italic-accent">{last2}</em>
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PgaKategoriDetaljPage({
  config,
  spillere,
  tourSnitt,
  antallSpillere,
}: KategoriPageProps) {
  const harData = spillere.length > 0;
  const verdier = useMemo(() => spillere.map((s) => s.verdi), [spillere]);
  const topp20 = useMemo(
    () =>
      harData
        ? [...spillere]
            .sort((a, b) => (config.reverse ? a.verdi - b.verdi : b.verdi - a.verdi))
            .slice(0, 20)
        : [],
    [harData, spillere, config.reverse],
  );

  const [value, setValue] = useState(config.sliderDefault);
  const [touched, setTouched] = useState(false);

  const histogram = useMemo(
    () => buildHistogram(verdier, config.sliderMin, config.sliderMax, 20),
    [verdier, config.sliderMin, config.sliderMax],
  );

  const percentile = useMemo(
    () => computePercentile(value, verdier, config.reverse),
    [value, verdier, config.reverse],
  );

  const highlightIndex = useMemo(
    () => findHighlightBucket(value, histogram, config.sliderMin, config.sliderMax),
    [value, histogram, config.sliderMin, config.sliderMax],
  );

  const nearest = useMemo(
    () => findNearest(value, topp20.slice(0, 50)),
    [value, topp20],
  );

  const narrative = getNarrative(percentile);

  function formatVal(v: number): string {
    if (config.enhet === "%") return v.toFixed(1);
    if (config.enhet === "yds") return v.toFixed(0);
    return v.toFixed(1);
  }

  return (
    <>
      {/* ── Hero ── */}
      <section className="kat-hero">
        <Reveal>
          <Link href="/stats/pga" className="kat-breadcrumb">
            <ChevronLeft style={{ width: 14, height: 14 }} />
            PGA Tour Stats
          </Link>
          <div style={{ marginTop: 20 }}>
            <StatsEyebrow dot tone="default">
              <StatsIcon name={config.icon} size={12} />
              PGA TOUR · {config.noun.toUpperCase()}
            </StatsEyebrow>
          </div>
          <h1>{config.heroHeadline}</h1>
          <p className="hero-sub">{config.heroSub}</p>
        </Reveal>

        {harData && tourSnitt !== null && topp20.length > 0 && (
          <Reveal delay={120}>
            <div className="kat-hero-kpis">
              <div className="kat-kpi-main">
                <div className="kat-kpi-label">TOUR-SNITT</div>
                <div className="kat-kpi-big">
                  <CountUp value={tourSnitt} decimals={1} />
                  {config.enhet && (
                    <span className="unit">{config.enhet}</span>
                  )}
                </div>
              </div>

              {topp20[0] && (
                <div className="kat-kpi-side">
                  <div className="kat-kpi-label">TOPP-1</div>
                  <div className="kat-kpi-med">
                    {topp20[0].verdi.toFixed(1)}
                    {config.enhet && (
                      <span className="unit">{config.enhet}</span>
                    )}
                  </div>
                  <div className="kat-kpi-name">{topp20[0].navn}</div>
                </div>
              )}

              <div className="kat-kpi-side">
                <div className="kat-kpi-label">SPILLERE MED DATA</div>
                <div className="kat-kpi-med">
                  <CountUp value={antallSpillere} />
                </div>
              </div>
            </div>
          </Reveal>
        )}
      </section>

      {/* ── Interactive block ── */}
      {harData && (
        <section className="kat-section">
          <Reveal>
            <div className="kat-section-head">
              <div>
                <StatsEyebrow dot tone="default">Interaktivt</StatsEyebrow>
                <h2>
                  Hvor{" "}
                  <em className="italic-accent">står du</em>?
                </h2>
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="kat-interactive">
              <div className="kat-bignum-q">
                Dine {config.noun.toLowerCase()}
              </div>
              <div className="kat-bignum">
                {formatVal(value)}
                {config.enhet && <span className="unit">{config.enhet}</span>}
              </div>

              <div className="kat-slider-wrap">
                <input
                  type="range"
                  className={`kat-range${!touched ? " kat-hint" : ""}`}
                  min={config.sliderMin}
                  max={config.sliderMax}
                  step={config.sliderStep}
                  value={value}
                  onChange={(e) => {
                    setTouched(true);
                    setValue(Number(e.target.value));
                  }}
                />
                <div className="kat-slider-labels">
                  <span>
                    {config.sliderMin}
                    {config.enhet}
                  </span>
                  <span>
                    {config.sliderMax}
                    {config.enhet}
                  </span>
                </div>
              </div>

              <div className="kat-cards-grid">
                <div className="kat-percentile-card">
                  <div className="kat-pe-eyebrow">PERCENTILE</div>
                  <div className="kat-pe-big">P{percentile}</div>
                  <div className="kat-pe-sub">
                    Du{" "}
                    {config.reverse
                      ? percentile >= 50
                        ? "er bedre"
                        : "er svakere"
                      : percentile >= 50
                        ? "slår lenger"
                        : "slår kortere"}{" "}
                    enn {percentile}% av PGA Tour-spillerne.
                  </div>
                </div>

                {nearest && (
                  <div className="kat-nearest-card">
                    <div className="kat-ne-eyebrow">NÆRMESTE PROFF</div>
                    <div className="kat-ne-name">
                      <FlagGlyph code={nearest.land ?? "us"} />
                      {nearest.navn}
                    </div>
                    <div className="kat-ne-val">
                      {formatVal(nearest.verdi)}
                      {config.enhet}
                    </div>
                    <div className="kat-ne-diff">
                      {Math.abs(nearest.verdi - value).toFixed(1)}
                      {config.enhet}{" "}
                      {config.reverse
                        ? nearest.verdi < value
                          ? "bedre"
                          : "svakere"
                        : nearest.verdi > value
                          ? "lenger"
                          : "kortere"}{" "}
                      enn deg
                    </div>
                  </div>
                )}
              </div>

              <div className="kat-histogram-wrap">
                <div className="kat-histogram-eyebrow">
                  FORDELING · {antallSpillere} SPILLERE
                </div>
                <StatsHistogram
                  data={histogram}
                  highlightIndex={highlightIndex}
                  height={160}
                />
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* ── Narrative analysis ── */}
      {harData && (
        <section className="kat-section">
          <div className="kat-narrative-grid">
            <Reveal>
              <div>
                <StatsEyebrow dot tone="default">Din analyse</StatsEyebrow>
                <h2>{splitHeadline(narrative.headline)}</h2>
                <p className="kat-narrative-text">{narrative.text}</p>
                <div style={{ marginTop: 28 }}>
                  <Link
                    href="/playerhq"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      background: "var(--primary)",
                      color: "var(--accent)",
                      padding: "12px 22px",
                      borderRadius: 999,
                      fontSize: 14,
                      fontWeight: 500,
                      textDecoration: "none",
                      transition: "background 0.18s",
                    }}
                  >
                    Få gratis treningsplan i PlayerHQ
                  </Link>
                </div>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="kat-methodology-card">
                <div className="kat-mini-mono">SLIK BEREGNES PERCENTILE</div>
                <ul>
                  <li>
                    <strong>P{percentile}</strong> betyr at du{" "}
                    {config.reverse
                      ? "er bedre"
                      : "presterer bedre"}{" "}
                    enn {percentile}% av spillerne i datasettet vårt.
                  </li>
                  <li style={{ color: "var(--muted-foreground)" }}>
                    Datasett: {antallSpillere} aktive PGA Tour-spillere, sesong
                    2026. Vektet snitt over alle målte runder.
                  </li>
                  <li style={{ color: "var(--muted-foreground)" }}>
                    Krav: minimum 20 målte runder per spiller.
                  </li>
                </ul>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── Topp-20 leaderboard ── */}
      {harData && tourSnitt !== null && (
        <section className="kat-section">
          <Reveal>
            <div className="kat-section-head">
              <div>
                <StatsEyebrow dot tone="default">Topp 20</StatsEyebrow>
                <h2>
                  De som{" "}
                  <em className="italic-accent">
                    {config.reverse ? "gjør det best" : "leder listen"}
                  </em>
                  .
                </h2>
              </div>
              <span className="kat-section-head-link">
                Sesong 2026 →
              </span>
            </div>
          </Reveal>

          <Reveal delay={60}>
            <div style={{ overflowX: "auto" }}>
              <table className="kat-dtable">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th>Spiller</th>
                    <th style={{ width: 80 }}>Land</th>
                    <th className="num">Verdi</th>
                    <th className="num">Vs snitt</th>
                  </tr>
                </thead>
                <tbody>
                  {topp20.map((p, i) => {
                    const diff = config.reverse
                      ? tourSnitt - p.verdi
                      : p.verdi - tourSnitt;
                    const isBetter = diff > 0;
                    return (
                      <tr key={i}>
                        <td className="mono" style={{ color: "var(--muted-foreground)" }}>
                          {i + 1}
                        </td>
                        <td>{p.navn}</td>
                        <td>
                          <FlagGlyph code={p.land ?? "us"} />
                        </td>
                        <td className="num">
                          {p.verdi.toFixed(1)}{" "}
                          {config.enhet && (
                            <span
                              style={{
                                fontSize: 11,
                                color: "var(--muted-foreground)",
                              }}
                            >
                              {config.enhet}
                            </span>
                          )}
                        </td>
                        <td
                          className="num"
                          style={{
                            color: isBetter
                              ? "var(--primary)"
                              : "var(--muted-foreground)",
                          }}
                        >
                          {isBetter ? "+" : ""}
                          {diff.toFixed(1)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="kat-dtable-footnote">KRAV: MIN 20 RUNDER SPILT</div>
          </Reveal>
        </section>
      )}

      {/* ── Mersalg ── */}
      <section className="kat-section">
        <Reveal>
          <div className="kat-mersalg">
            <div>
              <div
                className="stats-eyebrow"
                style={{ color: "var(--accent)" }}
              >
                <span className="stats-eyebrow-dot" style={{ background: "var(--primary)" }} />
                <span>PlayerHQ</span>
              </div>
              <h2>
                Logg din <em className="italic-accent">{config.noun.toLowerCase()}</em>.
              </h2>
              <p>{config.mersalgTekst}</p>
              <Link
                href="/playerhq"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "var(--accent)",
                  color: "hsl(var(--foreground))",
                  padding: "12px 24px",
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Prøv PlayerHQ gratis
              </Link>
            </div>
            <div className="kat-mersalg-card">
              <h4>FUNKSJONER</h4>
              <ul>
                {config.mersalgKort.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Lignende kategorier strip ── */}
      {config.relaterte.length > 0 && (
        <section className="kat-section">
          <Reveal>
            <div style={{ marginBottom: 24 }}>
              <StatsEyebrow dot tone="default">Utforsk mer</StatsEyebrow>
              <h2 style={{ marginTop: 12, fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em" }}>
                Lignende <em className="italic-accent">kategorier</em>.
              </h2>
            </div>
          </Reveal>
          <Reveal delay={60}>
            <div className="kat-strip">
              {config.relaterte.map((kat) => (
                <Link
                  key={kat.slug}
                  href={`/stats/pga/${kat.slug}`}
                  className="kat-strip-card"
                >
                  <div className="kat-strip-icon">
                    <StatsIcon name={kat.icon} size={18} />
                  </div>
                  <div className="kat-strip-name">{kat.navn}</div>
                  {kat.snitt !== null && (
                    <div className="kat-strip-val">
                      {kat.snitt.toFixed(1)}{kat.enhet}
                    </div>
                  )}
                  <div className="kat-strip-cta">Utforsk →</div>
                </Link>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* No-data fallback */}
      {!harData && (
        <section
          style={{
            maxWidth: 960,
            margin: "0 auto",
            padding: "96px 64px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              border: "1px dashed var(--border)",
              borderRadius: 16,
              padding: "64px 32px",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 24,
                fontWeight: 600,
              }}
            >
              Data er på vei
            </h2>
            <p
              style={{
                marginTop: 8,
                fontSize: 14,
                color: "var(--muted-foreground)",
              }}
            >
              Ukentlig sync fra DataGolf starter snart.
            </p>
          </div>
        </section>
      )}
    </>
  );
}
