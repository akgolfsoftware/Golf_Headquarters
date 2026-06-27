/**
 * /turneringer/[slug] — turneringsdetalj (design 28)
 *
 * Pixel-perfect forbedring av eksisterende side:
 *   - Hero med status-pille, bane-info, purse og live-badge
 *   - KPI-strip (deltakere, norske, korteste runde, cut-linje)
 *   - "Norske i aksjon"-fremtredende kort
 *   - Full tabular leaderboard
 *   - Editorial "om turneringen"
 *   - Historiske vinnere (stub)
 *
 * ISR 15 min.
 */

import "../../stats/stats.css";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Star,
  Trophy,
} from "lucide-react";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { FlagGlyph } from "@/components/stats/flag-glyph";
import { Reveal } from "@/components/stats/reveal";
import { CountUp } from "@/components/stats/count-up";
import { StatsEyebrow } from "@/components/stats/eyebrow";
import { MersalgBanner } from "@/components/turneringer/mersalg-banner";
import { LiveRefresher } from "@/components/turneringer/live-refresher";

// Live-turneringer oppdateres av cron hvert 10. min — 2 min ISR holder
// siden fersk uten å hamre databasen.
export const revalidate = 120;

// Per-runde-data lagret som JSON-blob på PublicPlayerEntry. Valideres ved read.
const RoundsSchema = z
  .object({
    thru: z.number().nullable().optional(),
    round: z.number().nullable().optional(),
  })
  .nullable();

function parseRounds(raw: unknown): { thru: number | null; round: number | null } {
  const parsed = RoundsSchema.safeParse(raw);
  if (!parsed.success || !parsed.data) return { thru: null, round: null };
  return {
    thru: parsed.data.thru ?? null,
    round: parsed.data.round ?? null,
  };
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const t = await prisma.tournament.findUnique({ where: { slug } });
  if (!t) return { title: "Turnering ikke funnet | AK Golf" };
  return {
    title: `${t.name}: turneringsoversikt | AK Golf`,
    description: `Følg ${t.name} live. Norske spillere, leaderboard, info og resultater. Oppdatert automatisk.`,
    alternates: { canonical: `https://akgolf.no/turneringer/${slug}` },
    openGraph: {
      title: `${t.name} | AK Golf`,
      description: `Live oversikt over norske spillere i ${t.name}`,
      url: `https://akgolf.no/turneringer/${slug}`,
      type: "website",
    },
  };
}

export default async function TurneringDetalj({ params }: Props) {
  const { slug } = await params;

  const t = await prisma.tournament.findUnique({
    where: { slug },
    include: {
      publicEntries: {
        include: {
          player: {
            select: {
              id: true,
              name: true,
              slug: true,
              country: true,
              tier: true,
              photoUrl: true,
            },
          },
        },
        orderBy: [{ position: "asc" }, { player: { name: "asc" } }],
      },
      leaderboardSnap: { select: { fetchedAt: true } },
      mergedInto: { select: { slug: true } },
    },
  });

  if (!t) notFound();
  // Dublett merget inn i en kanonisk turnering → send dit
  if (t.mergedIntoId && t.mergedInto?.slug) {
    redirect(`/turneringer/${t.mergedInto.slug}`);
  }

  const norske = t.publicEntries.filter((e) => e.player.country === "NO");
  const alle = t.publicEntries;
  const erLive = t.status === "IN_PROGRESS";
  const erFerdig = t.status === "COMPLETED";
  const erKommende = t.status === "UPCOMING";

  // Ekte KPI-er beregnet fra feltet (ingen placeholder-tall)
  const medScore = alle.filter((e) => e.scoreToPar !== null);
  const lederToPar =
    medScore.length > 0
      ? Math.min(...medScore.map((e) => e.scoreToPar as number))
      : null;
  const naavarendeRunde = alle.reduce<number | null>((maks, e) => {
    const r = parseRounds(e.rounds).round;
    if (r === null) return maks;
    return maks === null ? r : Math.max(maks, r);
  }, null);

  const tourLabel = formaterTour(t.tour);
  const datoStr = formaterDato(t.startDate, t.endDate);

  // Beregn hvilke posisjoner som er delt (T-prefix brukes kun ved delt posisjon)
  const positionCounts: Record<number, number> = {};
  for (const e of alle) {
    if (e.position !== null) positionCounts[e.position] = (positionCounts[e.position] ?? 0) + 1;
  }
  const tiedPositions = new Set(
    Object.entries(positionCounts)
      .filter(([, count]) => count > 1)
      .map(([pos]) => Number(pos)),
  );

  return (
    <div className="bg-background text-foreground">
      {/* SEO JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: tilJsonLd(t) }}
      />

      {/* Auto-refresh kun når turneringen er live */}
      {erLive && <LiveRefresher />}

      {/* Hero */}
      <section
        className="stats-hero"
        style={{ paddingBottom: 40, borderBottom: "1px solid var(--s-border)" }}
      >
        <Reveal>
          <Link
            href="/turneringer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--s-muted-fg)",
              textDecoration: "none",
              marginBottom: 20,
            }}
          >
            <ArrowLeft size={12} strokeWidth={2} />
            Alle turneringer
          </Link>

          <div
            style={{
              marginTop: 8,
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--s-muted-fg)",
            }}
          >
            {tourLabel} · {datoStr.toUpperCase()}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginTop: 16,
              gap: 24,
              flexWrap: "wrap",
            }}
          >
            <h1
              className="font-display"
              style={{
                fontSize: "clamp(32px, 5vw, 56px)",
                lineHeight: 1.0,
                fontWeight: 600,
                letterSpacing: "-0.03em",
              }}
            >
              {t.name}
            </h1>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              {t.location && (
                <div style={{ color: "var(--s-muted-fg)", fontSize: 15, display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                  <MapPin size={14} strokeWidth={1.75} />
                  {t.location}
                </div>
              )}
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, marginTop: 4 }}>
                {t.officialUrl ? (
                  <a
                    href={t.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--s-primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}
                  >
                    Offisiell side <ExternalLink size={12} strokeWidth={1.75} />
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          {/* Status-piller */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 20, flexWrap: "wrap" }}>
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
            {erFerdig && (
              <span
                style={{
                  background: "var(--s-secondary)",
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
            {erKommende && (
              <span
                style={{
                  background: "var(--s-secondary)",
                  color: "var(--s-primary)",
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
            {t.winnerName && erFerdig && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "4px 14px",
                  borderRadius: 4,
                  border: "1px solid rgba(0,88,64,0.3)",
                  background: "rgba(0,88,64,0.05)",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                <Trophy size={13} strokeWidth={2} style={{ color: "var(--s-primary)" }} />
                Vinner: <strong>{t.winnerName}</strong>
              </span>
            )}
          </div>
        </Reveal>
      </section>

      {/* KPI-strip */}
      <Reveal>
        <div
          className="stats-kpi-strip"
          style={{
            gridTemplateColumns: "repeat(4, 1fr)",
            borderRadius: 0,
          }}
        >
          <div className="stats-kpi">
            <div className="stats-kpi-eyebrow">Deltakere</div>
            <div className="stats-kpi-value">
              <CountUp value={alle.length} />
            </div>
          </div>
          <div className="stats-kpi">
            <div className="stats-kpi-eyebrow">Norske</div>
            <div className="stats-kpi-value" style={{ color: "var(--s-primary)" }}>
              <CountUp value={norske.length} />
            </div>
          </div>
          <div className="stats-kpi">
            <div className="stats-kpi-eyebrow">
              {erFerdig ? "Vinnerscore" : "Leder"}
            </div>
            <div className="stats-kpi-value font-mono" style={{ fontSize: 32, marginTop: 8 }}>
              {lederToPar !== null ? formaterToPar(lederToPar) : "—"}
            </div>
            <div className="stats-kpi-sub">
              {lederToPar !== null
                ? erFerdig
                  ? "Sluttresultat"
                  : "Beste score to par"
                : "Ikke startet"}
            </div>
          </div>
          <div className="stats-kpi">
            <div className="stats-kpi-eyebrow">Runde</div>
            <div className="stats-kpi-value font-mono" style={{ fontSize: 32, marginTop: 8 }}>
              {naavarendeRunde !== null ? `R${naavarendeRunde}` : "—"}
            </div>
            <div className="stats-kpi-sub">
              {erLive
                ? "Pågår nå"
                : erFerdig
                  ? "Fullført"
                  : "Ikke startet"}
            </div>
          </div>
        </div>
      </Reveal>

      {/* Norske i aksjon */}
      {norske.length > 0 && (
        <section className="stats-section stats-section-divider">
          <Reveal>
            <div className="stats-section-head">
              <div>
                <StatsEyebrow>Norske i aksjon</StatsEyebrow>
                <h2 className="font-display">
                  Hvem{" "}
                  <em className="stats-italic-accent">spiller</em>{" "}
                  for Norge?
                </h2>
              </div>
            </div>
          </Reveal>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 16,
            }}
          >
            {norske.map((e, i) => (
              <Reveal key={e.id} delay={i * 80}>
                <div
                  style={{
                    background: "rgba(209,248,67,0.10)",
                    border: "1px solid var(--s-accent)",
                    borderRadius: "var(--s-r-lg)",
                    padding: 28,
                  }}
                >
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <FlagGlyph code="no" size={18} />
                    <div
                      className="font-display"
                      style={{ fontSize: 22, fontWeight: 600 }}
                    >
                      {e.player.name}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 32, marginTop: 20 }}>
                    {erLive && e.position && (
                      <>
                        <div>
                          <div
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: 10,
                              letterSpacing: "0.14em",
                              textTransform: "uppercase",
                              color: "var(--s-muted-fg)",
                            }}
                          >
                            Posisjon
                          </div>
                          <div
                            className="font-mono"
                            style={{ fontSize: 28, fontWeight: 500, marginTop: 4, color: "var(--s-primary)" }}
                          >
                            {e.position !== null
                              ? tiedPositions.has(e.position)
                                ? `T${e.position}`
                                : `${e.position}`
                              : "—"}
                          </div>
                        </div>
                        {e.scoreToPar !== null && (
                          <div>
                            <div
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: 10,
                                letterSpacing: "0.14em",
                                textTransform: "uppercase",
                                color: "var(--s-muted-fg)",
                              }}
                            >
                              Score to par
                            </div>
                            <div
                              className="font-mono"
                              style={{
                                fontSize: 28,
                                fontWeight: 500,
                                marginTop: 4,
                                color: e.scoreToPar < 0 ? "var(--s-primary)" : e.scoreToPar > 0 ? "hsl(var(--destructive))" : "var(--s-fg)",
                              }}
                            >
                              {e.scoreToPar > 0 ? `+${e.scoreToPar}` : e.scoreToPar === 0 ? "E" : e.scoreToPar}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    <div>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          color: "var(--s-muted-fg)",
                        }}
                      >
                        {formaterTier(e.player.tier)}
                      </div>
                      {e.status === "CUT" && (
                        <div
                          style={{
                            marginTop: 4,
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            fontWeight: 600,
                            color: "var(--s-muted-fg)",
                            background: "var(--s-secondary)",
                            padding: "2px 8px",
                            borderRadius: 4,
                            display: "inline-block",
                            textTransform: "uppercase",
                          }}
                        >
                          Cut
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Full leaderboard */}
      {alle.length > 0 && (
        <section className="stats-section stats-section-divider">
          <Reveal>
            <div className="stats-section-head">
              <div>
                <StatsEyebrow>Leaderboard</StatsEyebrow>
                <h2 className="font-display">
                  Hele <em className="stats-italic-accent">feltet</em>:{" "}
                  {alle.length} spillere.
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
                  Sist oppdatert {NB_TIME.format(t.leaderboardSnap.fetchedAt)}
                </div>
              )}
            </div>
          </Reveal>
          <Reveal delay={60}>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--s-border)" }}>
                    <th style={{ padding: "10px 0", textAlign: "left", fontWeight: 500, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--s-muted-fg)", paddingRight: 16 }}>Pos</th>
                    <th style={{ padding: "10px 0", textAlign: "left", fontWeight: 500, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--s-muted-fg)", paddingRight: 16 }}>Spiller</th>
                    <th style={{ padding: "10px 0", textAlign: "left", fontWeight: 500, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--s-muted-fg)", paddingRight: 16 }}>Land</th>
                    {erLive && (
                      <th style={{ padding: "10px 0", textAlign: "right", fontWeight: 500, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--s-muted-fg)" }}>To par</th>
                    )}
                    {erLive && (
                      <th style={{ padding: "10px 0 10px 16px", textAlign: "right", fontWeight: 500, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--s-muted-fg)" }}>Thru</th>
                    )}
                    <th style={{ padding: "10px 0", textAlign: "right", fontWeight: 500, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--s-muted-fg)" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {alle.map((e, i) => (
                    <tr
                      key={e.id}
                      style={{
                        borderBottom: "1px dashed var(--s-border)",
                        background: e.player.country === "NO" ? "rgba(209,248,67,0.06)" : "transparent",
                      }}
                    >
                      <td style={{ padding: "12px 16px 12px 0", color: i < 3 ? "var(--s-primary)" : "var(--s-muted-fg)", fontWeight: i < 3 ? 600 : 400 }}>
                        {e.position ?? i + 1}
                      </td>
                      <td style={{ padding: "12px 16px 12px 0", fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14 }}>
                        {e.player.name}
                        {e.player.country === "NO" && (
                          <Star
                            className="ml-1.5 inline h-3 w-3 fill-current"
                            style={{ color: "var(--s-primary)" }}
                            strokeWidth={2}
                            aria-hidden
                          />
                        )}
                      </td>
                      <td style={{ padding: "12px 16px 12px 0" }}>
                        <FlagGlyph code={e.player.country?.toLowerCase() ?? "xx"} size={14} />
                      </td>
                      {erLive && (
                        <td
                          style={{
                            padding: "12px 0",
                            textAlign: "right",
                            color: (e.scoreToPar ?? 0) < 0 ? "var(--s-primary)" : (e.scoreToPar ?? 0) > 0 ? "hsl(var(--destructive))" : "var(--s-fg)",
                            fontWeight: 500,
                          }}
                        >
                          {e.scoreToPar !== null
                            ? formaterToPar(e.scoreToPar)
                            : "—"}
                        </td>
                      )}
                      {erLive && (
                        <td style={{ padding: "12px 0 12px 16px", textAlign: "right", color: "var(--s-muted-fg)" }}>
                          {(() => {
                            const r = parseRounds(e.rounds);
                            if (e.status === "CUT") return "—";
                            if (r.thru === null) return "—";
                            if (r.thru >= 18) return "F";
                            return r.thru;
                          })()}
                        </td>
                      )}
                      <td style={{ padding: "12px 0", textAlign: "right" }}>
                        {e.status === "CUT" ? (
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: 10,
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                              color: "var(--s-muted-fg)",
                              background: "var(--s-secondary)",
                              padding: "2px 6px",
                              borderRadius: 3,
                            }}
                          >
                            Cut
                          </span>
                        ) : (
                          <span style={{ color: "var(--s-muted-fg)", fontSize: 11 }}>
                            {formaterTier(e.player.tier)}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </section>
      )}

      {/* Tom-tilstand */}
      {t.publicEntries.length === 0 && (
        <section style={{ padding: "64px", textAlign: "center" }}>
          <Trophy
            style={{ margin: "0 auto 16px", color: "var(--s-muted-fg)", display: "block", opacity: 0.4 }}
            size={40}
            strokeWidth={1.5}
          />
          <h3 className="font-display" style={{ fontSize: 20, fontWeight: 600 }}>
            Deltakerliste oppdateres
          </h3>
          <p style={{ marginTop: 8, fontSize: 14, color: "var(--s-muted-fg)" }}>
            Vi henter felt-listen automatisk så snart turneringen er i gang.
          </p>
        </section>
      )}

      {/* Mersalg */}
      <section style={{ padding: "0 64px 64px" }}>
        <MersalgBanner />
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const NB_DATE = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", year: "numeric" });
const NB_TIME = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

function formaterDato(start: Date, slutt: Date | null): string {
  if (!slutt) return NB_DATE.format(start);
  if (start.toDateString() === slutt.toDateString()) return NB_DATE.format(start);
  return `${NB_DATE.format(start)} – ${NB_DATE.format(slutt)}`;
}

function formaterToPar(n: number): string {
  if (n === 0) return "E";
  return n > 0 ? `+${n}` : String(n);
}

function formaterTour(t: string | null): string {
  switch (t) {
    case "pga": return "PGA Tour";
    case "opp": return "PGA Tour · Opposite Field";
    case "euro": return "DP World Tour";
    case "kft": return "Korn Ferry Tour";
    case "alt": return "Alt-tour";
    case "champ": return "Champions Tour";
    case "lpga": return "LPGA";
    case "let": return "Ladies European Tour";
    case "amateur-no": return "Norge · Amatør";
    case "junior-no": return "Norge · Junior";
    default: return "Turnering";
  }
}

function formaterTier(t: string): string {
  switch (t) {
    case "pro-pga": return "Pro · PGA";
    case "pro-dp": return "Pro · DP World";
    case "pro-lpga": return "Pro · LPGA";
    case "amateur": return "Amatør";
    case "junior": return "Junior";
    case "college": return "College";
    default: return "Pro";
  }
}

type LdTournament = {
  name: string;
  startDate: Date;
  endDate: Date | null;
  location: string | null;
  officialUrl: string | null;
};

function tilJsonLd(t: LdTournament): string {
  // Escape <,>,& slik at DB-sourcede felt (navn/sted) ikke kan bryte ut av
  // <script>-taggen (JSON-LD XSS). \u-escaping er gyldig JSON.
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: t.name,
    startDate: t.startDate.toISOString(),
    endDate: t.endDate?.toISOString(),
    location: t.location ? { "@type": "Place", name: t.location } : undefined,
    url: t.officialUrl ?? undefined,
    sport: "Golf",
  })
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
