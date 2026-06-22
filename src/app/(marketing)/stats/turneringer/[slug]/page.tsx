/**
 * /stats/turneringer/[slug] — Stats-branded turneringsdetalj
 *
 * Seksjoner:
 *   1. Breadcrumb-bar
 *   2. Hero (tour-label, status-pille, navn, bane, purse, live-knapp)
 *   3. KPI-strip (deltakere, norske, purse, status)
 *   4. Norske i aksjon (lime-fremtredende, kun hvis norske finnes)
 *   5. Full leaderboard (tabular, sticky header, maks 50 + se-alle-link)
 *   6. Om banen (kun hvis CourseDefinition finnes)
 *   7. Relaterte turneringer (samme tour, samme år, maks 3)
 *   8. Kontekstuell mersalg
 *
 * ISR: 900 sek (15 min). Full Server Component — ingen "use client".
 */

import "../../stats.css";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink, MapPin, Trophy, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const revalidate = 900;

type Props = { params: Promise<{ slug: string }> };

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const t = await prisma.tournament.findUnique({ where: { slug } });
  if (!t) return { title: "Turnering ikke funnet | AK Golf Stats" };

  const tourLabel = formaterTour(t.tour);
  const description = `Se norske spillere, leaderboard og resultater fra ${t.name}. ${tourLabel} — oppdatert automatisk av AK Golf Stats.`;

  return {
    title: `${t.name} — ${tourLabel} | AK Golf Stats`,
    description,
    alternates: { canonical: `https://akgolf.no/stats/turneringer/${slug}` },
    openGraph: {
      title: `${t.name} | AK Golf Stats`,
      description,
      url: `https://akgolf.no/stats/turneringer/${slug}`,
      type: "website",
    },
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function StatsTurneringDetalj({ params }: Props) {
  const { slug } = await params;

  const t = await prisma.tournament.findUnique({
    where: { slug },
    include: {
      course: {
        select: {
          id: true,
          name: true,
          slope: true,
          rating: true,
          par: true,
        },
      },
      publicEntries: {
        include: {
          player: {
            select: {
              id: true,
              name: true,
              slug: true,
              country: true,
              tier: true,
            },
          },
        },
        orderBy: [{ position: "asc" }, { player: { name: "asc" } }],
      },
      leaderboardSnap: {
        select: { fetchedAt: true },
      },
    },
  });

  if (!t) notFound();

  // Relaterte turneringer — samme tour, samme år, annen ID
  const aarStart = t.startDate
    ? new Date(t.startDate.getFullYear(), 0, 1)
    : null;

  const relaterte = aarStart
    ? await prisma.tournament.findMany({
        where: {
          tour: t.tour ?? undefined,
          id: { not: t.id },
          startDate: { gte: aarStart },
          slug: { not: null },
        },
        orderBy: { startDate: "asc" },
        take: 3,
        select: {
          id: true,
          slug: true,
          name: true,
          startDate: true,
          endDate: true,
          status: true,
          location: true,
        },
      })
    : [];

  const norske = t.publicEntries.filter((e) => e.player.country === "NO");
  const alle = t.publicEntries;
  const visLeaderboard = alle.slice(0, 50);
  const harFlere50 = alle.length > 50;

  const erLive = t.status === "IN_PROGRESS";
  const erFerdig = t.status === "COMPLETED";
  const erKommende = t.status === "UPCOMING";

  const tourLabel = formaterTour(t.tour);
  const datoStr = formaterDato(t.startDate, t.endDate ?? null);

  // KPI-data
  const purseStr = formaterPurse(t.purseUsd ?? null);

  // Pro-tour for mersalg-logikk
  const erProTour =
    t.tour === "pga" ||
    t.tour === "euro" ||
    t.tour === "kft" ||
    t.tour === "lpga" ||
    t.tour === "let" ||
    t.tour === "champ";

  return (
    <div
      style={{
        background: "var(--s-bg)",
        color: "var(--s-fg)",
        minHeight: "100vh",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: tilJsonLd(t) }}
      />

      {/* ── 1. BREADCRUMB-BAR ── */}
      <div
        style={{
          padding: "12px 32px",
          borderBottom: "1px solid var(--s-border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "var(--s-card)",
        }}
      >
        <Link
          href="/stats/turneringer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "hsl(var(--muted-foreground))",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          <ChevronLeft size={14} strokeWidth={2} />
          Turneringer
        </Link>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "hsl(var(--muted-foreground))",
          }}
        >
          AK GOLF STATS · {t.name.toUpperCase()}
        </span>
      </div>

      {/* ── 2. HERO ── */}
      <section
        className="stats-hero compact"
        style={{ borderBottom: "1px solid var(--s-border)" }}
      >
        {/* Tour-label + dato */}
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--s-muted-fg)",
            marginBottom: 16,
          }}
        >
          {tourLabel} · {datoStr.toUpperCase()}
        </div>

        {/* Navn + lokasjon */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <h1
            className="font-display"
            style={{
              fontSize: "clamp(32px, 5vw, 52px)",
              lineHeight: 1.0,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            {t.name}
          </h1>
          {(t.location || t.country) && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "var(--s-muted-fg)",
                fontSize: 14,
                flexShrink: 0,
                paddingTop: 6,
              }}
            >
              <MapPin size={14} strokeWidth={1.75} />
              {[t.location, t.country].filter(Boolean).join(" · ")}
            </div>
          )}
        </div>

        {/* Bane-undertittel (fra CourseDefinition) */}
        {t.course && (
          <div
            style={{
              marginTop: 8,
              fontSize: 15,
              color: "var(--s-muted-fg)",
            }}
          >
            {t.course.name}
          </div>
        )}

        {/* Status-piller + live-knapp */}
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            marginTop: 24,
            flexWrap: "wrap",
          }}
        >
          {/* IN_PROGRESS */}
          {erLive && (
            <span
              style={{
                background: "var(--s-accent)",
                color: "var(--s-accent-fg)",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                padding: "4px 12px",
                borderRadius: 4,
                letterSpacing: "0.12em",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--s-accent-fg)",
                  animation: "stats-pulse 2s infinite",
                }}
              />
              IN PROGRESS
            </span>
          )}
          {/* COMPLETED */}
          {erFerdig && (
            <span
              style={{
                background: "hsl(var(--border))",
                color: "var(--s-muted-fg)",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                padding: "4px 12px",
                borderRadius: 4,
                letterSpacing: "0.12em",
              }}
            >
              FERDIGSPILT
            </span>
          )}
          {/* UPCOMING */}
          {erKommende && (
            <span
              style={{
                background: "hsl(var(--secondary))",
                color: "var(--s-fg)",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                padding: "4px 12px",
                borderRadius: 4,
                letterSpacing: "0.12em",
                fontWeight: 600,
              }}
            >
              KOMMENDE
            </span>
          )}
          {/* Vinner */}
          {t.winnerName && erFerdig && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 14px",
                borderRadius: 4,
                border: "1px solid rgba(0,88,64,0.25)",
                background: "rgba(0,88,64,0.05)",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              <Trophy size={13} strokeWidth={2} style={{ color: "var(--s-primary)" }} />
              Vinner: <strong>{t.winnerName}</strong>
            </span>
          )}
          {/* Offisiell side */}
          {t.officialUrl && (
            <a
              href={t.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--s-primary)",
                textDecoration: "none",
                padding: "4px 12px",
                borderRadius: 4,
                border: "1px solid rgba(0,88,64,0.25)",
                fontWeight: 500,
                letterSpacing: "0.06em",
              }}
            >
              {erLive ? "Følg live" : "Offisiell side"}
              <ExternalLink size={11} strokeWidth={2} />
            </a>
          )}
        </div>
      </section>

      {/* ── 3. KPI-STRIP ── */}
      <div
        className="stats-kpi-strip"
        style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
      >
        <div className="stats-kpi">
          <div className="stats-kpi-eyebrow">Deltakere</div>
          <div className="stats-kpi-value">{alle.length > 0 ? alle.length : "—"}</div>
          <div className="stats-kpi-sub">i feltet</div>
        </div>
        <div className="stats-kpi">
          <div className="stats-kpi-eyebrow">Norske</div>
          <div
            className="stats-kpi-value"
            style={{ color: norske.length > 0 ? "var(--s-primary)" : "var(--s-fg)" }}
          >
            {norske.length}
          </div>
          <div className="stats-kpi-sub">
            {norske.length === 1 ? "spiller" : "spillere"}
          </div>
        </div>
        <div className="stats-kpi">
          <div className="stats-kpi-eyebrow">Purse (USD)</div>
          <div
            className="stats-kpi-value"
            style={{ fontSize: purseStr && purseStr.length > 5 ? 28 : 42 }}
          >
            {purseStr ?? "—"}
          </div>
          <div className="stats-kpi-sub">premiepott</div>
        </div>
        <div className="stats-kpi">
          <div className="stats-kpi-eyebrow">Status</div>
          <div
            className="stats-kpi-value"
            style={{
              fontSize: 22,
              marginTop: 10,
              color: erLive
                ? "var(--s-primary)"
                : erFerdig
                  ? "var(--s-muted-fg)"
                  : "var(--s-fg)",
            }}
          >
            {erLive ? "I GANG" : erFerdig ? "FERDIG" : erKommende ? "KOMMENDE" : "—"}
          </div>
          {t.leaderboardSnap && (
            <div className="stats-kpi-sub" style={{ fontSize: 11 }}>
              Oppdatert {NB_DATE_SHORT.format(t.leaderboardSnap.fetchedAt)}
            </div>
          )}
        </div>
      </div>

      {/* ── 4. NORSKE I AKSJON ── */}
      {norske.length > 0 && (
        <section className="stats-section stats-section-divider">
          {/* Seksjonshode */}
          <div style={{ marginBottom: 32 }}>
            <div className="stats-eyebrow" style={{ color: "var(--s-muted-fg)", marginBottom: 10 }}>
              <span className="stats-eyebrow-dot" />
              Norske i aksjon
            </div>
            <h2
              className="font-display"
              style={{
                fontSize: 32,
                fontWeight: 600,
                letterSpacing: "-0.025em",
                margin: 0,
              }}
            >
              {norske.length === 1
                ? "Én norsk i feltet"
                : `${norske.length} nordmenn i feltet`}
            </h2>
          </div>

          {/* Spillerliste med lime-border */}
          <div
            style={{
              borderLeft: "3px solid var(--s-accent)",
              paddingLeft: 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {norske.map((e) => {
              const runder = parseRounds(e.rounds);
              return (
                <div
                  key={e.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 20px",
                    background: "rgba(209,248,67,0.08)",
                    border: "1px solid rgba(209,248,67,0.35)",
                    borderRadius: "var(--s-r-md)",
                    gap: 16,
                    flexWrap: "wrap",
                  }}
                >
                  {/* Navn */}
                  <div>
                    <div
                      className="font-display"
                      style={{ fontSize: 18, fontWeight: 600 }}
                    >
                      {e.player.name}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "var(--s-muted-fg)",
                        marginTop: 3,
                      }}
                    >
                      {formaterTier(e.player.tier)}
                    </div>
                  </div>

                  {/* Score-data */}
                  <div
                    style={{
                      display: "flex",
                      gap: 24,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    {/* Rundeskårer */}
                    {runder.length > 0 && (
                      <div>
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 10,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "var(--s-muted-fg)",
                            marginBottom: 4,
                          }}
                        >
                          {runder.map((_, i) => `R${i + 1}`).join("  ")}
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 15,
                            fontVariantNumeric: "tabular-nums",
                            display: "flex",
                            gap: 12,
                          }}
                        >
                          {runder.map((r, i) => (
                            <span key={i}>{r}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Score to par */}
                    {e.scoreToPar !== null && (
                      <div>
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 10,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "var(--s-muted-fg)",
                            marginBottom: 4,
                          }}
                        >
                          To par
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 22,
                            fontWeight: 500,
                            color:
                              e.scoreToPar < 0
                                ? "var(--s-primary)"
                                : e.scoreToPar > 0
                                  ? "hsl(var(--destructive))"
                                  : "var(--s-fg)",
                          }}
                        >
                          {formaterScore(e.scoreToPar)}
                        </div>
                      </div>
                    )}

                    {/* Posisjon */}
                    {e.position !== null && (
                      <div>
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 10,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "var(--s-muted-fg)",
                            marginBottom: 4,
                          }}
                        >
                          Posisjon
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 22,
                            fontWeight: 500,
                            color: "var(--s-primary)",
                          }}
                        >
                          {formaterPos(e.position)}
                        </div>
                      </div>
                    )}

                    {/* CUT-badge */}
                    {e.status === "CUT" && (
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: "var(--s-muted-fg)",
                          background: "var(--s-secondary)",
                          padding: "3px 8px",
                          borderRadius: 4,
                        }}
                      >
                        Cut
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Følg live-link hvis offisiell URL */}
          {t.officialUrl && erLive && (
            <div style={{ marginTop: 16 }}>
              <a
                href={t.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  color: "var(--s-primary)",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                Følg live på offisiell side <ExternalLink size={13} strokeWidth={2} />
              </a>
            </div>
          )}
        </section>
      )}

      {/* ── 5. FULL LEADERBOARD ── */}
      {alle.length > 0 && (
        <section className="stats-section stats-section-divider">
          <div className="stats-section-head">
            <div>
              <div
                className="stats-eyebrow"
                style={{ color: "var(--s-muted-fg)", marginBottom: 10 }}
              >
                <span className="stats-eyebrow-dot" />
                Leaderboard
              </div>
              <h2
                className="font-display"
                style={{
                  fontSize: 32,
                  fontWeight: 600,
                  letterSpacing: "-0.025em",
                  margin: 0,
                }}
              >
                {Math.min(alle.length, 50)}{" "}
                <em className="stats-italic-accent">deltakere</em>
                {harFlere50 && ` av ${alle.length}`}
              </h2>
            </div>
            {t.leaderboardSnap && (
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--s-muted-fg)",
                }}
              >
                Sist oppdatert {NB_DATE_SHORT.format(t.leaderboardSnap.fetchedAt)}
              </div>
            )}
            <Link
              href={`/stats/turneringer/${slug}/statistikk`}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--s-primary, #005840)",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              Se statistikk →
            </Link>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontFamily: "var(--font-mono)",
                fontSize: 13,
              }}
            >
              <thead
                style={{
                  position: "sticky",
                  top: 0,
                  background: "var(--s-bg)",
                  zIndex: 2,
                }}
              >
                <tr style={{ borderBottom: "2px solid var(--s-border)" }}>
                  <Th>Pos</Th>
                  <Th align="left" wide>Spiller</Th>
                  <Th>Runder</Th>
                  <Th>Totalt</Th>
                  <Th>To par</Th>
                  <Th>Land</Th>
                </tr>
              </thead>
              <tbody>
                {visLeaderboard.map((e, i) => {
                  const erNorsk = e.player.country === "NO";
                  const runder = parseRounds(e.rounds);
                  return (
                    <tr
                      key={e.id}
                      style={{
                        borderBottom: "1px dashed var(--s-border)",
                        background: erNorsk
                          ? "rgba(209,248,67,0.10)"
                          : "transparent",
                      }}
                    >
                      {/* POS */}
                      <td
                        style={{
                          padding: "12px 12px 12px 0",
                          fontWeight: i < 3 ? 700 : 400,
                          color:
                            i < 3 ? "var(--s-primary)" : "var(--s-muted-fg)",
                          textAlign: "right",
                          paddingRight: 16,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formaterPos(e.position)}
                      </td>

                      {/* SPILLER */}
                      <td
                        style={{
                          padding: "12px 16px 12px 0",
                          fontFamily: "var(--font-sans)",
                          fontWeight: 600,
                          fontSize: 14,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {erNorsk && e.player.slug ? (
                          <Link
                            href={`/stats/spillere/${e.player.slug}`}
                            style={{
                              color: "var(--s-fg)",
                              textDecoration: "none",
                            }}
                          >
                            {e.player.name}
                            <span
                              style={{
                                marginLeft: 6,
                                fontFamily: "var(--font-mono)",
                                fontSize: 9.5,
                                fontWeight: 700,
                                letterSpacing: "0.08em",
                                color: "var(--s-primary)",
                              }}
                            >
                              NOR
                            </span>
                          </Link>
                        ) : (
                          <>
                            {e.player.name}
                            {erNorsk && (
                              <span
                                style={{
                                  marginLeft: 6,
                                  fontFamily: "var(--font-mono)",
                                  fontSize: 9.5,
                                  fontWeight: 700,
                                  letterSpacing: "0.08em",
                                  color: "var(--s-primary)",
                                }}
                              >
                                NOR
                              </span>
                            )}
                          </>
                        )}
                      </td>

                      {/* RUNDER */}
                      <td
                        style={{
                          padding: "12px 16px 12px 0",
                          color: "var(--s-muted-fg)",
                          whiteSpace: "nowrap",
                          fontSize: 12,
                        }}
                      >
                        {runder.length > 0 ? runder.join("  ") : "—"}
                      </td>

                      {/* TOTALT */}
                      <td
                        style={{
                          padding: "12px 16px 12px 0",
                          textAlign: "right",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {e.totalScore ?? "—"}
                      </td>

                      {/* TO PAR */}
                      <td
                        style={{
                          padding: "12px 16px 12px 0",
                          textAlign: "right",
                          fontWeight: 500,
                          color:
                            e.scoreToPar === null
                              ? "var(--s-muted-fg)"
                              : e.scoreToPar < 0
                                ? "var(--s-primary)"
                                : e.scoreToPar > 0
                                  ? "hsl(var(--destructive))"
                                  : "var(--s-fg)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {e.scoreToPar !== null ? formaterScore(e.scoreToPar) : "—"}
                      </td>

                      {/* LAND */}
                      <td
                        style={{
                          padding: "12px 0",
                          color: "var(--s-muted-fg)",
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {e.player.country ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Se alle på DataGolf hvis > 50 og offisiell url finnes */}
          {harFlere50 && t.officialUrl && (
            <div style={{ marginTop: 20, textAlign: "center" }}>
              <a
                href={t.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  color: "var(--s-primary)",
                  textDecoration: "none",
                  fontWeight: 500,
                  padding: "10px 20px",
                  border: "1px solid rgba(0,88,64,0.25)",
                  borderRadius: 999,
                }}
              >
                Se alle {alle.length} deltakere på offisiell side
                <ExternalLink size={13} strokeWidth={2} />
              </a>
            </div>
          )}
        </section>
      )}

      {/* ── 6. OM BANEN ── */}
      {t.course && (
        <section className="stats-section stats-section-divider">
          <div className="stats-eyebrow" style={{ color: "var(--s-muted-fg)", marginBottom: 16 }}>
            <span className="stats-eyebrow-dot" />
            Om banen
          </div>
          <div
            style={{
              background: "var(--s-card)",
              border: "1px solid var(--s-border)",
              borderRadius: "var(--s-r-lg)",
              padding: "28px 32px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 24,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                className="font-display"
                style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}
              >
                {t.course.name}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 24,
                  flexWrap: "wrap",
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--s-muted-fg)",
                }}
              >
                {t.course.slope && (
                  <span>
                    Slope: <strong style={{ color: "var(--s-fg)" }}>{t.course.slope}</strong>
                  </span>
                )}
                {t.course.rating && (
                  <span>
                    CR: <strong style={{ color: "var(--s-fg)" }}>{t.course.rating.toFixed(1)}</strong>
                  </span>
                )}
                {t.course.par && (
                  <span>
                    Par: <strong style={{ color: "var(--s-fg)" }}>{t.course.par}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 7. RELATERTE TURNERINGER ── */}
      {relaterte.length > 0 && (
        <section className="stats-section stats-section-divider">
          <div className="stats-section-head" style={{ marginBottom: 24 }}>
            <div>
              <div
                className="stats-eyebrow"
                style={{ color: "var(--s-muted-fg)", marginBottom: 10 }}
              >
                <span className="stats-eyebrow-dot" />
                {tourLabel} · {t.startDate.getFullYear()}
              </div>
              <h2
                className="font-display"
                style={{
                  fontSize: 28,
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  margin: 0,
                }}
              >
                Relaterte turneringer
              </h2>
            </div>
            <Link
              href="/stats/turneringer"
              className="stats-section-head-link"
            >
              Alle turneringer <ArrowRight size={14} strokeWidth={2} />
            </Link>
          </div>
          <div className="stats-grid-3">
            {relaterte.map((r) => (
              <Link
                key={r.id}
                href={`/stats/turneringer/${r.slug}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  style={{
                    background: "var(--s-card)",
                    border: "1px solid var(--s-border)",
                    borderRadius: "var(--s-r-lg)",
                    padding: "20px 24px",
                    transition: "border-color 0.2s, transform 0.2s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(ev) => {
                    const el = ev.currentTarget as HTMLDivElement;
                    el.style.borderColor = "var(--s-primary)";
                    el.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(ev) => {
                    const el = ev.currentTarget as HTMLDivElement;
                    el.style.borderColor = "var(--s-border)";
                    el.style.transform = "";
                  }}
                >
                  {/* Status-pille */}
                  {r.status && (
                    <div style={{ marginBottom: 10 }}>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 9,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          padding: "2px 8px",
                          borderRadius: 3,
                          background:
                            r.status === "IN_PROGRESS"
                              ? "var(--s-accent)"
                              : "hsl(var(--border))",
                          color:
                            r.status === "IN_PROGRESS"
                              ? "var(--s-accent-fg)"
                              : "var(--s-muted-fg)",
                          fontWeight: 600,
                        }}
                      >
                        {r.status === "IN_PROGRESS"
                          ? "I GANG"
                          : r.status === "COMPLETED"
                            ? "FERDIG"
                            : "KOMMENDE"}
                      </span>
                    </div>
                  )}
                  <div
                    className="font-display"
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      marginBottom: 6,
                      lineHeight: 1.2,
                    }}
                  >
                    {r.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--s-muted-fg)",
                    }}
                  >
                    {formaterDato(r.startDate, r.endDate ?? null)}
                    {r.location && ` · ${r.location}`}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── 8. KONTEKSTUELL MERSALG ── */}
      <section
        style={{
          padding: "64px",
          borderTop: "1px solid var(--s-border)",
        }}
      >
        <div
          style={{
            background: "var(--s-primary)",
            borderRadius: "var(--s-r-2xl)",
            padding: "48px 56px",
            color: "var(--s-bg)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 40,
            flexWrap: "wrap",
          }}
        >
          <div style={{ maxWidth: 560 }}>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--s-accent)",
                marginBottom: 12,
              }}
            >
              PlayerHQ · Spiller-portal
            </div>
            <h2
              className="font-display"
              style={{
                fontSize: "clamp(24px, 3vw, 36px)",
                fontWeight: 600,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                margin: "0 0 16px",
                color: "var(--s-bg)",
              }}
            >
              {erProTour
                ? "Sammenlign deg med spillerne i feltet"
                : "Klar til å spille i lignende turneringer?"}
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.55, color: "rgba(250,250,247,0.78)", margin: 0 }}>
              {erProTour
                ? "Se din SG-profil opp mot spillerne i dette feltet. Finn de eksakte gapene som skiller deg fra toppnivå."
                : "PlayerHQ logger runder, SG-statistikk og gir deg treningsplaner som forbereder deg til konkurranse."}
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {erProTour ? (
              <Link
                href="/stats/sg-sammenlign"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "var(--s-accent)",
                  color: "var(--s-accent-fg)",
                  padding: "13px 24px",
                  borderRadius: 999,
                  fontWeight: 600,
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                SG-sammenligning <ArrowRight size={15} strokeWidth={2.5} />
              </Link>
            ) : (
              <Link
                href="/portal"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "var(--s-accent)",
                  color: "var(--s-accent-fg)",
                  padding: "13px 24px",
                  borderRadius: 999,
                  fontWeight: 600,
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                Kom i gang med PlayerHQ <ArrowRight size={15} strokeWidth={2.5} />
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hjelpekomponent: th-celle
// ---------------------------------------------------------------------------

function Th({
  children,
  align = "right",
  wide = false,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  wide?: boolean;
}) {
  return (
    <th
      style={{
        padding: "10px 0",
        textAlign: align,
        paddingRight: wide ? 0 : 16,
        fontWeight: 500,
        fontSize: 10,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "var(--s-muted-fg)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}

// ---------------------------------------------------------------------------
// Hjelpefunksjoner
// ---------------------------------------------------------------------------

const NB_DATE = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const NB_DATE_SHORT = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function formaterTour(t: string | null): string {
  switch (t) {
    case "pga":     return "PGA Tour";
    case "euro":    return "DP World Tour";
    case "kft":     return "Korn Ferry Tour";
    case "alt":     return "Alt-tour";
    case "champ":   return "Champions Tour";
    case "lpga":    return "LPGA";
    case "let":     return "Ladies European Tour";
    case "amateur-no": return "Norge · Amatør";
    case "junior-no":  return "Norge · Junior";
    default:        return t ?? "Turnering";
  }
}

function formaterDato(start: Date, slutt: Date | null): string {
  if (!slutt) return NB_DATE.format(start);
  if (start.toDateString() === slutt.toDateString()) return NB_DATE.format(start);
  const startStr = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short" }).format(start);
  return `${startStr} – ${NB_DATE.format(slutt)}`;
}

function formaterPurse(usd: number | null): string | null {
  if (!usd) return null;
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(1)}M`;
  return `$${usd.toLocaleString("nb-NO")}`;
}

function formaterScore(n: number | null): string {
  if (n === null) return "—";
  if (n === 0) return "E";
  if (n > 0) return `+${n}`;
  return `${n}`;
}

function formaterPos(n: number | null): string {
  if (n === null) return "—";
  return `T-${n}`;
}

function formaterTier(t: string): string {
  switch (t) {
    case "pro-pga":  return "Pro · PGA";
    case "pro-dp":   return "Pro · DP World";
    case "pro-lpga": return "Pro · LPGA";
    case "amateur":  return "Amatør";
    case "junior":   return "Junior";
    case "college":  return "College";
    default:         return t ?? "Pro";
  }
}

function parseRounds(rounds: unknown): number[] {
  if (!rounds) return [];
  try {
    const arr = typeof rounds === "string" ? JSON.parse(rounds) : rounds;
    if (Array.isArray(arr)) {
      return arr
        .filter((r): r is number => typeof r === "number" && isFinite(r));
    }
  } catch {
    // ugyldig JSON — returner tom array
  }
  return [];
}

// ---------------------------------------------------------------------------
// JSON-LD
// ---------------------------------------------------------------------------

type LdTournament = {
  name: string;
  startDate: Date;
  endDate: Date | null;
  location: string | null;
  officialUrl: string | null;
};

function tilJsonLd(t: LdTournament): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: t.name,
    startDate: t.startDate.toISOString(),
    endDate: t.endDate?.toISOString(),
    location: t.location ? { "@type": "Place", name: t.location } : undefined,
    url: t.officialUrl ?? undefined,
    sport: "Golf",
  });
}
