/**
 * /stats/turneringer — Turneringsoversikt
 *
 * Athletic/DataGolf-stil. Data-tett grid med tour-filter og tidsfilter.
 * ISR revalidate 3600 (1 time). Server Component — ingen "use client".
 */

import "../stats.css";

import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronLeft,
  CalendarRange,
  MapPin,
  Trophy,
  Globe,
} from "lucide-react";
import {
  hentTurneringerForListe,
  hentTurneringCounts,
  hentNorskeDenneUka,
  type TurneringListeRad,
  type TourFilter,
  type TidFilter,
} from "@/lib/stats/turnering-queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Turneringer — AK Golf Stats",
  description:
    "PGA, DP World, Korn Ferry, norske amatør- og junior-turneringer. Live-data, norske spillere fremhevet.",
  alternates: { canonical: "https://akgolf.no/stats/turneringer" },
  openGraph: {
    title: "Turneringer — AK Golf Stats",
    description:
      "Alle golftturneringer samlet. Norske deltakere fremhevet på tvers av PGA Tour, DP World Tour, Korn Ferry og norske tourer.",
    url: "https://akgolf.no/stats/turneringer",
    type: "website",
  },
};

// ---------------------------------------------------------------------------
// Konstanter
// ---------------------------------------------------------------------------

const TOUR_LABELS: Record<TourFilter, string> = {
  alle: "Alle",
  pga: "PGA Tour",
  euro: "DP World",
  kft: "Korn Ferry",
  lpga: "LPGA",
  let: "LET",
  challenge: "Challenge",
  norge: "Norge",
  junior: "Junior",
  college: "College",
};

const TOUR_KEYS: TourFilter[] = [
  "alle",
  "pga",
  "euro",
  "kft",
  "lpga",
  "let",
  "challenge",
  "norge",
  "junior",
  "college",
];

const TID_LABELS: Record<TidFilter, string> = {
  uke: "Denne uken",
  kommende: "Kommende",
  avsluttede: "Avsluttede",
};

const TID_KEYS: TidFilter[] = ["uke", "kommende", "avsluttede"];

// ---------------------------------------------------------------------------
// Hjelpefunksjoner
// ---------------------------------------------------------------------------

function formaterDatoSpenn(start: Date, slutt: Date | null): string {
  const startFmt = start.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
  });
  if (!slutt) return startFmt;
  const sluttFmt = slutt.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
  });
  if (startFmt === sluttFmt) return startFmt;
  return `${startFmt} – ${sluttFmt}`;
}

function formaterPremie(purseUsd: number): string {
  if (purseUsd >= 1_000_000) {
    const millioner = purseUsd / 1_000_000;
    return `$${millioner % 1 === 0 ? millioner.toFixed(0) : millioner.toFixed(1)}M`;
  }
  if (purseUsd >= 1_000) {
    return `$${(purseUsd / 1_000).toFixed(0)}K`;
  }
  return `$${purseUsd.toLocaleString("nb-NO")}`;
}

function erLive(status: string | null): boolean {
  return status === "IN_PROGRESS";
}

function tourEtikett(tour: string | null): string {
  if (!tour) return "Tour";
  const MAP: Record<string, string> = {
    pga: "PGA TOUR",
    dp: "DP WORLD",
    "dp-world": "DP WORLD",
    "korn-ferry": "KORN FERRY",
    lpga: "LPGA",
    let: "LET",
    challenge: "CHALLENGE",
    "amateur-no": "NORSK AMATØR",
    "junior-no": "JUNIOR",
    college: "COLLEGE",
  };
  return MAP[tour.toLowerCase()] ?? tour.toUpperCase();
}

function validerTour(raw: string | undefined): TourFilter {
  const GYLDIGE: TourFilter[] = [
    "alle", "pga", "euro", "kft", "lpga", "let",
    "challenge", "norge", "junior", "college",
  ];
  return GYLDIGE.includes(raw as TourFilter) ? (raw as TourFilter) : "alle";
}

function validerTid(raw: string | undefined): TidFilter {
  const GYLDIGE: TidFilter[] = ["uke", "kommende", "avsluttede"];
  return GYLDIGE.includes(raw as TidFilter) ? (raw as TidFilter) : "uke";
}

function buildUrl(
  overrides: Partial<{ tour: TourFilter; tid: TidFilter }>,
  currentTour: TourFilter,
  currentTid: TidFilter
): string {
  const tour = overrides.tour ?? currentTour;
  const tid = overrides.tid ?? currentTid;
  const params = new URLSearchParams();
  if (tour !== "alle") params.set("tour", tour);
  if (tid !== "uke") params.set("tid", tid);
  const qs = params.toString();
  return `/stats/turneringer${qs ? `?${qs}` : ""}`;
}

// ---------------------------------------------------------------------------
// TurneringKort — inline Server Component
// ---------------------------------------------------------------------------

function TurneringKort({ t }: { t: TurneringListeRad }) {
  const live = erLive(t.status);
  const href = t.slug ? `/stats/turneringer/${t.slug}` : "#";

  return (
    <Link
      href={href}
      aria-label={`Se detaljer for ${t.name}`}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        background: "var(--s-card)",
        border: "1px solid var(--s-border)",
        borderRadius: "var(--s-r-lg)",
        padding: 20,
        textDecoration: "none",
        color: "inherit",
        transition: "border-color 0.18s, box-shadow 0.18s, transform 0.18s",
        cursor: t.slug ? "pointer" : "default",
      }}
      className="turnering-kort"
    >
      {/* Eyebrow + live-badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--s-muted-fg)",
            fontWeight: 500,
          }}
        >
          {tourEtikett(t.tour)}
        </span>
        {live && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontFamily: "var(--font-mono)",
              fontSize: 9.5,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#2EA66B",
              fontWeight: 600,
            }}
            className="turnering-live-badge"
          >
            LIVE
          </span>
        )}
      </div>

      {/* Turnerings-navn */}
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 17,
          fontWeight: 600,
          letterSpacing: "-0.015em",
          lineHeight: 1.25,
          color: "var(--s-fg)",
        }}
      >
        {t.shortName ?? t.name}
      </div>

      {/* Dato + lokasjon */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "var(--font-mono)",
            fontSize: 11.5,
            color: "var(--s-muted-fg)",
          }}
        >
          <CalendarRange size={13} strokeWidth={1.75} />
          <span style={{ fontVariantNumeric: "tabular-nums" }}>
            {formaterDatoSpenn(t.startDate, t.endDate)}
          </span>
        </div>
        {t.location && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "var(--font-mono)",
              fontSize: 11.5,
              color: "var(--s-muted-fg)",
            }}
          >
            <MapPin size={13} strokeWidth={1.75} />
            <span>{t.location}</span>
          </div>
        )}
      </div>

      {/* Premiepott */}
      {t.purseUsd !== null && t.purseUsd > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "var(--font-mono)",
            fontSize: 11.5,
            color: "var(--s-muted-fg)",
          }}
        >
          <Trophy size={13} strokeWidth={1.75} />
          <span>{formaterPremie(t.purseUsd)}</span>
        </div>
      )}

      {/* Norske badge */}
      {t.norskeAntall > 0 && (
        <div style={{ marginTop: "auto", paddingTop: 8 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              background: "var(--s-accent)",
              color: "var(--s-accent-fg)",
              borderRadius: 999,
              padding: "3px 10px",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.06em",
            }}
          >
            🇳🇴 {t.norskeAntall} norsk{t.norskeAntall === 1 ? "" : "e"}
          </span>
        </div>
      )}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type Props = { searchParams: Promise<{ tour?: string; tid?: string }> };

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function TurneringerPage({ searchParams }: Props) {
  const params = await searchParams;
  const tour = validerTour(params.tour);
  const tid = validerTid(params.tid);

  const [turneringer, counts, norskeDenneUka] = await Promise.all([
    hentTurneringerForListe(tour, tid),
    hentTurneringCounts(),
    tid === "uke" ? hentNorskeDenneUka() : Promise.resolve([]),
  ]);

  const totaltNorske = norskeDenneUka.reduce(
    (sum, t) => sum + t.spillere.length,
    0
  );
  const antallTurneringerMedNorske = norskeDenneUka.length;

  const harData = turneringer.length > 0;
  const harNoenTurneringer = counts.alle > 0;

  return (
    <div
      style={{
        background: "var(--s-bg)",
        color: "var(--s-fg)",
        minHeight: "100vh",
      }}
    >
      {/* BREADCRUMB-BAR */}
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
          href="/stats"
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
          <ChevronLeft size={14} />
          Tilbake til Stats
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
          AK GOLF STATS · TURNERINGER
        </span>
      </div>

      {/* HERO */}
      <section
        style={{
          padding: "72px 64px 48px",
          borderBottom: "1px solid var(--s-border)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Bakgrunn-dekor */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            right: -64,
            bottom: -80,
            color: "var(--s-primary)",
            opacity: 0.04,
            pointerEvents: "none",
          }}
        >
          <Globe size={320} strokeWidth={0.5} />
        </div>

        <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative" }}>
          {/* Eyebrow */}
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              fontWeight: 500,
              color: "var(--s-primary)",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 2,
                background: "var(--s-accent)",
                display: "inline-block",
              }}
            />
            AK Golf Stats · Turneringer
          </div>

          {/* Overskrift */}
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(44px, 5vw, 72px)",
              fontWeight: 600,
              letterSpacing: "-0.035em",
              lineHeight: 0.96,
              margin: 0,
              textWrap: "balance",
            }}
          >
            TURNERINGER
          </h1>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(20px, 2.5vw, 32px)",
              fontWeight: 400,
              color: "var(--s-muted-fg)",
              margin: "12px 0 0",
              fontStyle: "italic",
              letterSpacing: "-0.02em",
            }}
          >
            Hele oversikten.
          </p>
          <p
            style={{
              fontSize: 16,
              color: "var(--s-muted-fg)",
              margin: "16px 0 0",
              maxWidth: 560,
              lineHeight: 1.55,
            }}
          >
            Alle tourer. Norske spillere fremhevet.
          </p>
        </div>
      </section>

      {/* NORSKE DENNE UKA — widget */}
      {tid === "uke" && totaltNorske > 0 && (
        <div
          style={{
            background: "var(--s-accent)",
            color: "var(--s-accent-fg)",
            padding: "14px 64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12.5,
              fontWeight: 600,
              letterSpacing: "0.04em",
            }}
          >
            🇳🇴{" "}
            {totaltNorske} norske spiller{totaltNorske === 1 ? "" : "e"} i
            aksjon denne uken på {antallTurneringerMedNorske} turnering
            {antallTurneringerMedNorske === 1 ? "" : "er"}
          </span>
          <Link
            href="/stats/norske"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--s-accent-fg)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              letterSpacing: "0.06em",
            }}
          >
            Se alle norske spillere →
          </Link>
        </div>
      )}

      {/* FILTER + GRID */}
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 64px 96px" }}>

        {/* Tour-filter (pill-tabs) */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
            }}
            role="group"
            aria-label="Filtrer etter tour"
          >
            {TOUR_KEYS.map((key) => {
              const isActive = tour === key;
              const count = counts[key] ?? 0;
              return (
                <Link
                  key={key}
                  href={buildUrl({ tour: key }, tour, tid)}
                  aria-pressed={isActive}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 999,
                    fontFamily: "var(--font-sans)",
                    fontSize: 13,
                    fontWeight: 500,
                    textDecoration: "none",
                    border: "1px solid",
                    transition: "all 0.15s",
                    background: isActive ? "var(--s-primary)" : "var(--s-card)",
                    borderColor: isActive
                      ? "var(--s-primary)"
                      : "var(--s-border)",
                    color: isActive ? "var(--s-accent)" : "var(--s-fg)",
                    cursor: "pointer",
                  }}
                >
                  {TOUR_LABELS[key]}
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      fontVariantNumeric: "tabular-nums",
                      opacity: isActive ? 0.8 : 0.6,
                    }}
                  >
                    {count}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Tidsfilter (tab-bar) */}
        <div
          style={{
            display: "flex",
            gap: 0,
            marginBottom: 32,
            borderBottom: "1px solid var(--s-border)",
          }}
          role="group"
          aria-label="Tidsfilter"
        >
          {TID_KEYS.map((key) => {
            const isActive = tid === key;
            return (
              <Link
                key={key}
                href={buildUrl({ tid: key }, tour, tid)}
                aria-selected={isActive}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 16px",
                  fontSize: 13.5,
                  fontWeight: isActive ? 600 : 500,
                  textDecoration: "none",
                  color: isActive ? "var(--s-primary)" : "var(--s-muted-fg)",
                  borderBottom: isActive
                    ? "2px solid var(--s-primary)"
                    : "2px solid transparent",
                  marginBottom: -1,
                  transition: "color 0.15s, border-color 0.15s",
                }}
              >
                {TID_LABELS[key]}
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    fontVariantNumeric: "tabular-nums",
                    background: isActive ? "var(--s-accent)" : "var(--s-muted)",
                    color: isActive ? "var(--s-accent-fg)" : "var(--s-muted-fg)",
                    padding: "1px 6px",
                    borderRadius: 4,
                    fontWeight: 600,
                  }}
                >
                  {counts.alle}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Tom-tilstand: database er tom */}
        {!harNoenTurneringer && (
          <div
            style={{
              textAlign: "center",
              padding: "80px 32px",
              color: "var(--s-muted-fg)",
            }}
          >
            <Globe
              size={48}
              strokeWidth={1}
              style={{ margin: "0 auto 24px", display: "block", color: "var(--s-border)" }}
            />
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 20,
                fontWeight: 600,
                color: "var(--s-fg)",
                margin: "0 0 8px",
              }}
            >
              Turneringsdata synkes snart.
            </p>
            <p style={{ fontSize: 14, margin: 0 }}>Kom tilbake om litt.</p>
          </div>
        )}

        {/* Tom-tilstand: filter gir ingen treff */}
        {harNoenTurneringer && !harData && (
          <div
            style={{
              textAlign: "center",
              padding: "80px 32px",
              color: "var(--s-muted-fg)",
            }}
          >
            <CalendarRange
              size={40}
              strokeWidth={1.25}
              style={{ margin: "0 auto 20px", display: "block", color: "var(--s-border)" }}
            />
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 18,
                fontWeight: 600,
                color: "var(--s-fg)",
                margin: "0 0 8px",
              }}
            >
              Ingen turneringer i denne perioden.
            </p>
            <p style={{ fontSize: 14, margin: 0 }}>
              Datakilder oppdateres daglig kl. 06:00.
            </p>
          </div>
        )}

        {/* Turneringsgrid */}
        {harData && (
          <>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--s-muted-fg)",
                marginBottom: 16,
              }}
            >
              {turneringer.length} turnering{turneringer.length === 1 ? "" : "er"}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 16,
              }}
              className="turneringer-grid"
            >
              {turneringer.map((t) => (
                <TurneringKort key={t.id} t={t} />
              ))}
            </div>
          </>
        )}
      </main>

      <style>{`
        .turnering-kort:hover {
          border-color: var(--s-primary) !important;
          transform: translateY(-2px);
          box-shadow: var(--s-shadow-hover);
        }
        .turnering-live-badge::before {
          content: '';
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #2EA66B;
          display: inline-block;
          animation: stats-pulse 2s infinite;
        }
        @media (max-width: 900px) {
          .turneringer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 600px) {
          .turneringer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
