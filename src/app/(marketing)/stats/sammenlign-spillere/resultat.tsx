"use client";

/**
 * SammenlignResultat — client-side resultat-visning for head-to-head sammenligning.
 * Viser: sticky topp-bar, KPI-strip, linjegraf, beste resultater, summary-card.
 */

import DOMPurify from "dompurify";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/stats/reveal";
import { StatsEyebrow } from "@/components/stats/eyebrow";

type SpillerEntry = {
  id: string;
  status: string;
  position: number | null;
  scoreToPar: number | null;
  totalScore: number | null;
  createdAt: Date;
  tournament: {
    id: string;
    name: string;
    startDate: Date;
    tour: string | null;
    country: string | null;
  };
};

type Spiller = {
  id: string;
  slug: string;
  name: string;
  tier: string;
  birthYear: number | null;
  entries: SpillerEntry[];
} | null;

interface Props {
  spillerA: Spiller;
  spillerB: Spiller;
  slugA: string;
  slugB: string;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function tierBadge(tier: string) {
  const map: Record<string, string> = {
    "pro-pga": "hsl(var(--primary))",
    pro: "hsl(var(--primary))",
    college: "hsl(var(--warning))",
    amateur: "hsl(var(--muted-foreground))",
    junior: "hsl(var(--muted-foreground))",
  };
  return map[tier] ?? "hsl(var(--muted-foreground))";
}

export function SammenlignResultat({ spillerA, spillerB, slugA, slugB }: Props) {
  if (!spillerA || !spillerB) {
    return (
      <section
        style={{
          padding: "64px 40px",
          maxWidth: 900,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <p style={{ color: "hsl(var(--muted-foreground))", fontSize: 15 }}>
          En eller begge spillere ble ikke funnet.{" "}
          <Link href="/stats/sammenlign-spillere" style={{ color: "hsl(var(--primary))" }}>
            Prøv et annet søk.
          </Link>
        </p>
      </section>
    );
  }

  // Build per-year stats from entries
  const years = Array.from({ length: 7 }, (_, i) => 2020 + i);

  function perYearStats(entries: SpillerEntry[]) {
    const map = new Map<number, number[]>();
    for (const e of entries) {
      const yr = new Date(e.tournament.startDate).getFullYear();
      if (e.totalScore && yr >= 2020) {
        if (!map.has(yr)) map.set(yr, []);
        map.get(yr)!.push(e.totalScore);
      }
    }
    return years.map((y) => {
      const scores = map.get(y) ?? [];
      const avg = scores.length
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : null;
      return { year: y, snitt: avg ? Math.round(avg * 10) / 10 : null, antall: scores.length };
    });
  }

  const statsA = perYearStats(spillerA.entries);
  const statsB = perYearStats(spillerB.entries);

  // Chart data
  const chartData = years.map((y, i) => ({
    year: String(y),
    [spillerA.name.split(" ")[0]!]: statsA[i]?.snitt ?? null,
    [spillerB.name.split(" ")[0]!]: statsB[i]?.snitt ?? null,
  }));

  // Aggregate KPIs
  const totaltRunnerA = spillerA.entries.filter((e) => e.status === "FINISHED").length;
  const totaltRunnerB = spillerB.entries.filter((e) => e.status === "FINISHED").length;

  const allScoresA = spillerA.entries.map((e) => e.totalScore).filter(Boolean) as number[];
  const allScoresB = spillerB.entries.map((e) => e.totalScore).filter(Boolean) as number[];

  const snittA = allScoresA.length
    ? Math.round((allScoresA.reduce((a, b) => a + b, 0) / allScoresA.length) * 10) / 10
    : null;
  const snittB = allScoresB.length
    ? Math.round((allScoresB.reduce((a, b) => a + b, 0) / allScoresB.length) * 10) / 10
    : null;

  const besteA = allScoresA.length ? Math.min(...allScoresA) : null;
  const besteB = allScoresB.length ? Math.min(...allScoresB) : null;

  const totalTurnA = spillerA.entries.length;
  const totalTurnB = spillerB.entries.length;

  // Top 5 results per spiller
  const topp5A = [...spillerA.entries]
    .filter((e) => e.position !== null && e.status === "FINISHED")
    .sort((a, b) => (a.position ?? 999) - (b.position ?? 999))
    .slice(0, 5);
  const topp5B = [...spillerB.entries]
    .filter((e) => e.position !== null && e.status === "FINISHED")
    .sort((a, b) => (a.position ?? 999) - (b.position ?? 999))
    .slice(0, 5);

  // Editorial summary
  const summary = buildSummary(spillerA, spillerB, snittA, snittB, besteA, besteB, totaltRunnerA, totaltRunnerB);

  const navnA = spillerA.name.split(" ")[0]!;
  const navnB = spillerB.name.split(" ")[0]!;

  return (
    <div>
      {/* ── STICKY TOPP-BAR ────────────────────────────────────── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "#FFFFFF",
          borderBottom: "1px solid #E5E3DD",
          padding: "12px 40px",
          boxShadow: "0 2px 8px rgba(10,31,23,0.05)",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: 24,
            alignItems: "center",
          }}
        >
          {/* Spiller A */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "hsl(var(--primary))",
                color: "hsl(var(--accent))",
                display: "grid",
                placeItems: "center",
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {initials(spillerA.name)}
            </div>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                {spillerA.name}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "hsl(var(--muted-foreground))",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {spillerA.birthYear ? `f. ${spillerA.birthYear}` : ""} ·{" "}
                <span
                  style={{
                    color: tierBadge(spillerA.tier),
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  {spillerA.tier}
                </span>
              </div>
            </div>
            <Link
              href={`/stats/sammenlign-spillere?a=&b=${slugB}`}
              style={{
                fontSize: 11,
                color: "hsl(var(--primary))",
                marginLeft: 8,
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              bytt →
            </Link>
          </div>

          {/* VS */}
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 22,
              fontStyle: "italic",
              color: "hsl(var(--primary))",
              textAlign: "center",
            }}
          >
            vs
          </div>

          {/* Spiller B */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              justifyContent: "flex-end",
              flexDirection: "row-reverse",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "hsl(var(--accent))",
                color: "hsl(var(--primary))",
                display: "grid",
                placeItems: "center",
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {initials(spillerB.name)}
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                {spillerB.name}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "hsl(var(--muted-foreground))",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {spillerB.birthYear ? `f. ${spillerB.birthYear}` : ""} ·{" "}
                <span
                  style={{
                    color: tierBadge(spillerB.tier),
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  {spillerB.tier}
                </span>
              </div>
            </div>
            <Link
              href={`/stats/sammenlign-spillere?a=${slugA}&b=`}
              style={{
                fontSize: 11,
                color: "hsl(var(--primary))",
                marginRight: 8,
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              ← bytt
            </Link>
          </div>
        </div>
      </div>

      {/* ── KPI-STRIP ─────────────────────────────────────────── */}
      <Reveal>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            borderTop: "1px solid #E5E3DD",
            borderBottom: "1px solid #E5E3DD",
            background: "#FFFFFF",
            maxWidth: "100%",
          }}
        >
          {[
            { lbl: "Totalt runder", a: totaltRunnerA, b: totaltRunnerB, lower: false },
            { lbl: "Snitt 2025–26", a: snittA, b: snittB, lower: true },
            { lbl: "Beste ever", a: besteA, b: besteB, lower: true },
            { lbl: "Turneringer", a: totalTurnA, b: totalTurnB, lower: false },
          ].map((k, i) => {
            const aWins = k.a !== null && k.b !== null && (k.lower ? k.a < k.b : k.a > k.b);
            const bWins = k.a !== null && k.b !== null && (k.lower ? k.b < k.a : k.b > k.a);
            return (
              <div
                key={i}
                style={{
                  padding: "24px 28px",
                  borderRight: i < 3 ? "1px solid #E5E3DD" : "none",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "hsl(var(--muted-foreground))",
                    marginBottom: 12,
                  }}
                >
                  {k.lbl}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "hsl(var(--muted-foreground))",
                        letterSpacing: "0.1em",
                      }}
                    >
                      A:
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 22,
                        fontWeight: 600,
                        color: aWins ? "hsl(var(--primary))" : "hsl(var(--foreground))",
                      }}
                    >
                      {k.a ?? "—"}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "hsl(var(--muted-foreground))",
                        letterSpacing: "0.1em",
                      }}
                    >
                      B:
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 22,
                        fontWeight: 600,
                        color: bWins ? "hsl(var(--primary))" : "hsl(var(--foreground))",
                      }}
                    >
                      {k.b ?? "—"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Reveal>

      {/* ── LINJEGRAF — sesongsnitt ───────────────────────────── */}
      <section
        className="stats-section stats-section-divider"
        style={{ background: "#FFFFFF" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div className="stats-section-head">
              <div>
                <StatsEyebrow>Sesongsnitt</StatsEyebrow>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 28,
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                    marginTop: 10,
                  }}
                >
                  Hvem har{" "}
                  <em style={{ fontStyle: "italic", fontWeight: 400, color: "hsl(var(--primary))" }}>
                    utviklet seg mest
                  </em>
                  ?
                </h2>
              </div>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "hsl(var(--muted-foreground))",
                }}
              >
                LAVERE = BEDRE
              </span>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div
              style={{
                background: "hsl(var(--background))",
                border: "1px solid #E5E3DD",
                borderRadius: 16,
                padding: 32,
              }}
            >
              <ResponsiveContainer width="100%" height={280}>
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid stroke="#F1EEE5" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="year"
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                      fontFamily: "var(--font-mono)",
                    }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={false}
                  />
                  <YAxis
                    reversed
                    domain={["auto", "auto"]}
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                    }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#FFFFFF",
                      border: "1px solid #E5E3DD",
                      borderRadius: 8,
                      fontSize: 12,
                      fontFamily: "var(--font-mono)",
                    }}
                  />
                  <Legend
                    iconType="line"
                    wrapperStyle={{
                      fontSize: 12,
                      fontFamily: "var(--font-mono)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey={navnA}
                    stroke="#005840"
                    strokeWidth={2.5}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey={navnB}
                    stroke="#D1F843"
                    strokeWidth={2.5}
                    strokeDasharray="5 3"
                    dot={{ fill: "hsl(var(--accent))", r: 4 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── BESTE RESULTATER ─────────────────────────────────── */}
      <section className="stats-section stats-section-divider">
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div className="stats-section-head">
              <div>
                <StatsEyebrow>Beste resultater</StatsEyebrow>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 28,
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                    marginTop: 10,
                  }}
                >
                  Topp 5{" "}
                  <em style={{ fontStyle: "italic", fontWeight: 400, color: "hsl(var(--primary))" }}>
                    per spiller
                  </em>
                  .
                </h2>
              </div>
            </div>
          </Reveal>

          <Reveal delay={60}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 24,
              }}
            >
              {/* Spiller A */}
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 16,
                    fontWeight: 600,
                    marginBottom: 12,
                    color: "hsl(var(--primary))",
                  }}
                >
                  {spillerA.name}
                </div>
                {topp5A.length === 0 ? (
                  <p style={{ color: "hsl(var(--muted-foreground))", fontSize: 13 }}>
                    Ingen avsluttede resultater
                  </p>
                ) : (
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: 13,
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          style={{
                            textAlign: "left",
                            padding: "6px 8px",
                            fontFamily: "var(--font-mono)",
                            fontSize: 9,
                            letterSpacing: "0.14em",
                            color: "hsl(var(--muted-foreground))",
                            borderBottom: "1px solid #F1EEE5",
                          }}
                        >
                          TURNERING
                        </th>
                        <th
                          style={{
                            textAlign: "right",
                            padding: "6px 8px",
                            fontFamily: "var(--font-mono)",
                            fontSize: 9,
                            letterSpacing: "0.14em",
                            color: "hsl(var(--muted-foreground))",
                            borderBottom: "1px solid #F1EEE5",
                          }}
                        >
                          POS
                        </th>
                        <th
                          style={{
                            textAlign: "right",
                            padding: "6px 8px",
                            fontFamily: "var(--font-mono)",
                            fontSize: 9,
                            letterSpacing: "0.14em",
                            color: "hsl(var(--muted-foreground))",
                            borderBottom: "1px solid #F1EEE5",
                          }}
                        >
                          SCORE
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {topp5A.map((e, i) => (
                        <tr key={e.id} style={{ borderBottom: "1px solid #F1EEE5" }}>
                          <td style={{ padding: "8px 8px", color: "hsl(var(--foreground))" }}>
                            <div
                              style={{
                                fontFamily: "var(--font-display)",
                                fontWeight: 600,
                                fontSize: 13,
                              }}
                            >
                              {e.tournament.name}
                            </div>
                            <div
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: 10,
                                color: "hsl(var(--muted-foreground))",
                                marginTop: 2,
                              }}
                            >
                              {new Date(e.tournament.startDate).getFullYear()}
                            </div>
                          </td>
                          <td
                            style={{
                              textAlign: "right",
                              fontFamily: "var(--font-mono)",
                              fontSize: 16,
                              fontWeight: 600,
                              padding: "8px 8px",
                              color: i === 0 ? "hsl(var(--primary))" : "hsl(var(--foreground))",
                            }}
                          >
                            T{e.position}
                          </td>
                          <td
                            style={{
                              textAlign: "right",
                              fontFamily: "var(--font-mono)",
                              fontSize: 13,
                              padding: "8px 8px",
                              color: "hsl(var(--muted-foreground))",
                            }}
                          >
                            {e.totalScore ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Spiller B */}
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 16,
                    fontWeight: 600,
                    marginBottom: 12,
                    color: "hsl(var(--primary))",
                  }}
                >
                  {spillerB.name}
                </div>
                {topp5B.length === 0 ? (
                  <p style={{ color: "hsl(var(--muted-foreground))", fontSize: 13 }}>
                    Ingen avsluttede resultater
                  </p>
                ) : (
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: 13,
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          style={{
                            textAlign: "left",
                            padding: "6px 8px",
                            fontFamily: "var(--font-mono)",
                            fontSize: 9,
                            letterSpacing: "0.14em",
                            color: "hsl(var(--muted-foreground))",
                            borderBottom: "1px solid #F1EEE5",
                          }}
                        >
                          TURNERING
                        </th>
                        <th
                          style={{
                            textAlign: "right",
                            padding: "6px 8px",
                            fontFamily: "var(--font-mono)",
                            fontSize: 9,
                            letterSpacing: "0.14em",
                            color: "hsl(var(--muted-foreground))",
                            borderBottom: "1px solid #F1EEE5",
                          }}
                        >
                          POS
                        </th>
                        <th
                          style={{
                            textAlign: "right",
                            padding: "6px 8px",
                            fontFamily: "var(--font-mono)",
                            fontSize: 9,
                            letterSpacing: "0.14em",
                            color: "hsl(var(--muted-foreground))",
                            borderBottom: "1px solid #F1EEE5",
                          }}
                        >
                          SCORE
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {topp5B.map((e, i) => (
                        <tr key={e.id} style={{ borderBottom: "1px solid #F1EEE5" }}>
                          <td style={{ padding: "8px 8px", color: "hsl(var(--foreground))" }}>
                            <div
                              style={{
                                fontFamily: "var(--font-display)",
                                fontWeight: 600,
                                fontSize: 13,
                              }}
                            >
                              {e.tournament.name}
                            </div>
                            <div
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: 10,
                                color: "hsl(var(--muted-foreground))",
                                marginTop: 2,
                              }}
                            >
                              {new Date(e.tournament.startDate).getFullYear()}
                            </div>
                          </td>
                          <td
                            style={{
                              textAlign: "right",
                              fontFamily: "var(--font-mono)",
                              fontSize: 16,
                              fontWeight: 600,
                              padding: "8px 8px",
                              color: i === 0 ? "hsl(var(--primary))" : "hsl(var(--foreground))",
                            }}
                          >
                            T{e.position}
                          </td>
                          <td
                            style={{
                              textAlign: "right",
                              fontFamily: "var(--font-mono)",
                              fontSize: 13,
                              padding: "8px 8px",
                              color: "hsl(var(--muted-foreground))",
                            }}
                          >
                            {e.totalScore ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── EDITORIAL SUMMARY ───────────────────────────────── */}
      {summary && (
        <section
          className="stats-section stats-section-divider"
          style={{ background: "hsl(var(--secondary))" }}
        >
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <Reveal>
              <blockquote
                style={{
                  borderLeft: "3px solid #005840",
                  paddingLeft: 24,
                  margin: 0,
                  fontFamily: "var(--font-display)",
                  fontSize: 20,
                  lineHeight: 1.55,
                  fontStyle: "italic",
                  color: "hsl(var(--foreground))",
                }}
                dangerouslySetInnerHTML={{
                  __html: typeof window !== "undefined"
                    ? DOMPurify.sanitize(summary, { ALLOWED_TAGS: ["em", "strong", "br"] })
                    : summary,
                }}
              />
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "hsl(var(--muted-foreground))",
                  marginTop: 16,
                  paddingLeft: 24,
                }}
              >
                Automatisk oppsummering · AK Golf Stats · mai 2026
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── DEL ───────────────────────────────────────────── */}
      <section className="stats-section stats-section-divider">
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <StatsEyebrow dot>Del denne sammenligningen</StatsEyebrow>
            <p
              style={{
                fontSize: 15,
                color: "hsl(var(--muted-foreground))",
                marginTop: 12,
                marginBottom: 24,
              }}
            >
              Del lenken med venner, foreldre eller coachen din.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `${spillerA.name} vs ${spillerB.name}: se sammenligningen på AK Golf Stats`,
                )}&url=${encodeURIComponent(
                  `https://akgolf.no/stats/sammenlign-spillere?a=${spillerA.slug}&b=${spillerB.slug}`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 18px",
                  background: "hsl(var(--foreground))",
                  color: "hsl(var(--background))",
                  borderRadius: 999,
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Del på X
              </a>
              <Link
                href={`/stats/sammenlign-spillere`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 18px",
                  background: "hsl(var(--secondary))",
                  color: "hsl(var(--primary))",
                  border: "1px solid #E5E3DD",
                  borderRadius: 999,
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Ny sammenligning
                <ArrowRight size={14} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function buildSummary(
  a: NonNullable<Spiller>,
  b: NonNullable<Spiller>,
  snittA: number | null,
  snittB: number | null,
  besteA: number | null,
  besteB: number | null,
  runnerA: number,
  runnerB: number,
): string | null {
  const parts: string[] = [];
  const navnA = a.name.split(" ")[0]!;
  const navnB = b.name.split(" ")[0]!;

  if (snittA !== null && snittB !== null) {
    const bedre = snittA <= snittB ? navnA : navnB;
    const snittBedre = snittA <= snittB ? snittA : snittB;
    const snittDårligere = snittA <= snittB ? snittB : snittA;
    parts.push(
      `<strong>${bedre}</strong> har <strong>bedre snittscore</strong> (${snittBedre} vs ${snittDårligere}).`,
    );
  }

  if (besteA !== null && besteB !== null) {
    const bedre = besteA <= besteB ? navnA : navnB;
    const besteBedre = besteA <= besteB ? besteA : besteB;
    const besteDårligere = besteA <= besteB ? besteB : besteA;
    parts.push(
      `<strong>${bedre}</strong> har <strong>lavere best-ever-score</strong> (${besteBedre} vs ${besteDårligere}).`,
    );
  }

  if (runnerA > 0 || runnerB > 0) {
    const fleire = runnerA >= runnerB ? navnA : navnB;
    parts.push(
      `<strong>${fleire}</strong> har flest avsluttede runder i databasen.`,
    );
  }

  if (a.birthYear && b.birthYear) {
    const diff = Math.abs(a.birthYear - b.birthYear);
    if (diff > 0) {
      parts.push(`Aldersforskjell: ${diff} ${diff === 1 ? "år" : "år"}.`);
    }
  }

  return parts.length ? parts.join(" ") : null;
}
