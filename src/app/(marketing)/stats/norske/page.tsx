/**
 * /stats/norske — Norske i aksjon
 * Server Component, ISR revalidate 1800 (30 min).
 * Viser alle norske PublicPlayerEntry for turneringer som pågår eller starter
 * innen 7 dager, gruppert per turnering.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Flag, Calendar, MapPin, ExternalLink, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import "../stats.css";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Norske i aksjon — AK Golf Stats",
  description:
    "Alle norske golfspillere i aksjon denne uken — live-posisjoner, resultater og turneringsoversikt.",
  alternates: { canonical: "https://akgolf.no/stats/norske" },
};

// ---------- Formatfunksjoner ----------

function formaterScore(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  if (n === 0) return "E";
  return n < 0 ? `${n}` : `+${n}`;
}

function formaterPos(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return `T-${n}`;
}

function formaterTour(t: string | null | undefined): string {
  const labels: Record<string, string> = {
    pga: "PGA TOUR",
    dp: "DP WORLD TOUR",
    "korn-ferry": "KORN FERRY",
    lpga: "LPGA",
    let: "LET",
    challenge: "CHALLENGE TOUR",
    "amateur-no": "NORSK AMATØR",
    "junior-no": "JUNIOR",
    srixon: "SRIXON TOUR",
    olyo: "OLYO",
    ngc: "NGC",
    college: "COLLEGE",
  };
  if (!t) return "TOUR";
  return labels[t] ?? t.toUpperCase();
}

function formaterDatoRange(start: Date, end: Date | null): string {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const startStr = start.toLocaleDateString("nb-NO", opts);
  if (!end) return startStr;
  // Samme måned: "12–16 jun"
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    const startDay = start.getDate();
    const endStr = end.toLocaleDateString("nb-NO", opts);
    return `${startDay}–${endStr}`;
  }
  return `${startStr} – ${end.toLocaleDateString("nb-NO", opts)}`;
}

function parseRounds(rounds: unknown): number[] {
  if (!rounds) return [];
  if (Array.isArray(rounds)) {
    return rounds.filter((r): r is number => typeof r === "number");
  }
  if (typeof rounds === "string") {
    try {
      const parsed: unknown = JSON.parse(rounds);
      if (Array.isArray(parsed)) {
        return parsed.filter((r): r is number => typeof r === "number");
      }
    } catch {
      // ugyldig JSON — returner tom array
    }
  }
  return [];
}

// ---------- Dataspørring ----------

type TurnGruppe = {
  turnering: {
    id: string;
    name: string;
    slug: string | null;
    tour: string | null;
    status: string | null;
    startDate: Date;
    endDate: Date | null;
    location: string | null;
    officialUrl: string | null;
  };
  spillere: Array<{
    id: string;
    name: string;
    slug: string;
    position: number | null;
    scoreToPar: number | null;
    status: string;
    rounds: number[];
  }>;
};

async function hentNorskeEntries(): Promise<TurnGruppe[]> {
  const iDag = new Date();
  iDag.setHours(0, 0, 0, 0);
  const om7dager = new Date(iDag.getTime() + 7 * 24 * 60 * 60 * 1000);

  try {
    const entries = await prisma.publicPlayerEntry.findMany({
      where: {
        player: { country: "NO" },
        tournament: {
          OR: [
            { status: "IN_PROGRESS" },
            {
              startDate: { gte: iDag, lte: om7dager },
              status: "UPCOMING",
            },
          ],
        },
      },
      include: {
        player: {
          select: { id: true, name: true, slug: true, tier: true },
        },
        tournament: {
          select: {
            id: true,
            name: true,
            slug: true,
            tour: true,
            status: true,
            startDate: true,
            endDate: true,
            location: true,
            officialUrl: true,
          },
        },
      },
      orderBy: [{ position: "asc" }],
      take: 200,
    });

    // Grupper etter turnering
    const gruppeMap = new Map<string, TurnGruppe>();

    for (const entry of entries) {
      const tId = entry.tournament.id;
      if (!gruppeMap.has(tId)) {
        gruppeMap.set(tId, {
          turnering: entry.tournament,
          spillere: [],
        });
      }
      gruppeMap.get(tId)!.spillere.push({
        id: entry.id,
        name: entry.player.name,
        slug: entry.player.slug,
        position: entry.position,
        scoreToPar: entry.scoreToPar,
        status: entry.status,
        rounds: parseRounds(entry.rounds),
      });
    }

    const grupper = Array.from(gruppeMap.values());

    // Sorter: IN_PROGRESS øverst, deretter UPCOMING etter startDate
    grupper.sort((a, b) => {
      const aLive = a.turnering.status === "IN_PROGRESS";
      const bLive = b.turnering.status === "IN_PROGRESS";
      if (aLive && !bLive) return -1;
      if (!aLive && bLive) return 1;
      return a.turnering.startDate.getTime() - b.turnering.startDate.getTime();
    });

    return grupper;
  } catch {
    return [];
  }
}

// ---------- Side ----------

export default async function NorskePage() {
  const grupper = await hentNorskeEntries();

  const antallSpillere = new Set(
    grupper.flatMap((g) => g.spillere.map((s) => s.slug))
  ).size;
  const antallTurneringer = grupper.length;
  const antallLiveNaa = grupper.filter(
    (g) => g.turnering.status === "IN_PROGRESS"
  ).length;

  return (
    <main style={{ background: "var(--s-bg)", minHeight: "100vh", color: "var(--s-fg)" }}>

      {/* Breadcrumb-bar */}
      <div
        style={{
          padding: "12px 32px",
          borderBottom: "1px solid #E5E3DD",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
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
          <ChevronLeft size={14} /> Tilbake til Stats
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
          AK GOLF STATS · NORSKE
        </span>
      </div>

      {/* Hero */}
      <section
        style={{
          padding: "72px 64px 48px",
          borderBottom: "1px solid var(--s-border)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--s-muted-fg)",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 20,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 2,
              background: "var(--s-accent)",
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          DENNE UKEN
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(40px, 5vw, 56px)",
            fontWeight: 600,
            letterSpacing: "-0.03em",
            lineHeight: 1.0,
            margin: "0 0 16px",
          }}
        >
          Norske{" "}
          <em style={{ fontStyle: "italic", fontWeight: 400, color: "var(--s-primary)" }}>
            i aksjon.
          </em>
        </h1>
        <p
          style={{
            fontSize: 17,
            color: "var(--s-muted-fg)",
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          {antallSpillere > 0
            ? `${antallSpillere} spiller${antallSpillere !== 1 ? "e" : ""} på ${antallTurneringer} turnering${antallTurneringer !== 1 ? "er" : ""}.`
            : "Ingen norske spillere i aksjon denne uken."}
        </p>
      </section>

      {/* KPI-strip */}
      <div className="stats-kpi-strip">
        <div className="stats-kpi">
          <div className="stats-kpi-eyebrow">
            <Users size={12} /> NORSKE
          </div>
          <div className="stats-kpi-value">{antallSpillere}</div>
          <div className="stats-kpi-sub">spillere i aksjon</div>
        </div>
        <div className="stats-kpi">
          <div className="stats-kpi-eyebrow">
            <Flag size={12} /> TURNERINGER
          </div>
          <div className="stats-kpi-value">{antallTurneringer}</div>
          <div className="stats-kpi-sub">denne uken</div>
        </div>
        <div
          className="stats-kpi"
          style={
            antallLiveNaa > 0
              ? { background: "var(--s-accent)", color: "var(--s-accent-fg)" }
              : undefined
          }
        >
          <div
            className="stats-kpi-eyebrow"
            style={
              antallLiveNaa > 0
                ? { color: "var(--s-accent-fg)" }
                : undefined
            }
          >
            LIVE NÅ
          </div>
          <div className="stats-kpi-value">{antallLiveNaa}</div>
          <div
            className="stats-kpi-sub"
            style={
              antallLiveNaa > 0
                ? { color: "var(--s-accent-fg)" }
                : undefined
            }
          >
            {antallLiveNaa === 1 ? "turnering pågår" : "turneringer pågår"}
          </div>
        </div>
      </div>

      {/* Innhold */}
      <div style={{ padding: "64px" }}>
        {grupper.length === 0 ? (
          /* Tom tilstand */
          <div
            style={{
              textAlign: "center",
              padding: "80px 32px",
              background: "var(--s-card)",
              borderRadius: "var(--s-r-lg)",
              border: "1px solid var(--s-border)",
            }}
          >
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
              INGEN AKTIVE SPILLERE
            </div>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 22,
                fontWeight: 600,
                margin: "0 0 8px",
              }}
            >
              Ingen norske spillere i aksjon denne uken.
            </p>
            <p style={{ color: "var(--s-muted-fg)", fontSize: 14, margin: "0 0 32px" }}>
              Neste oppdatering kl. 06:00 — kom tilbake da!
            </p>
            <Link
              href="/stats/turneringer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                color: "var(--s-primary)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Se alle turneringer <ExternalLink size={12} />
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            {grupper.map((gruppe) => (
              <TurnGruppeKort key={gruppe.turnering.id} gruppe={gruppe} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

// ---------- TurnGruppeKort ----------

function TurnGruppeKort({ gruppe }: { gruppe: TurnGruppe }) {
  const erLive = gruppe.turnering.status === "IN_PROGRESS";

  return (
    <section
      style={{
        background: "var(--s-card)",
        border: "1px solid var(--s-border)",
        borderRadius: "var(--s-r-lg)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 24px 16px",
          borderBottom: "1px solid var(--s-border)",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          {/* Live-badge eller Kommende-badge */}
          {erLive ? (
            <span className="stats-live-badge">LIVE</span>
          ) : (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontFamily: "var(--font-mono)",
                fontSize: 9.5,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--s-muted-fg)",
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "var(--s-muted-fg)",
                  display: "inline-block",
                }}
              />
              KOMMENDE
            </span>
          )}

          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 20,
              fontWeight: 600,
              margin: 0,
              letterSpacing: "-0.015em",
            }}
          >
            🇳🇴{" "}
            {gruppe.turnering.slug ? (
              <Link
                href={`/stats/turneringer/${gruppe.turnering.slug}`}
                style={{ color: "inherit", textDecoration: "none" }}
              >
                {gruppe.turnering.name}
              </Link>
            ) : (
              gruppe.turnering.name
            )}
          </h2>
        </div>

        {/* Sub-header: tour · sted · datoer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.08em",
            color: "var(--s-muted-fg)",
          }}
        >
          {gruppe.turnering.tour && (
            <span
              style={{
                background: "var(--s-secondary)",
                padding: "2px 8px",
                borderRadius: 4,
                color: "var(--s-primary)",
                fontWeight: 600,
              }}
            >
              {formaterTour(gruppe.turnering.tour)}
            </span>
          )}
          {gruppe.turnering.location && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <MapPin size={10} />
              {gruppe.turnering.location}
            </span>
          )}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Calendar size={10} />
            {formaterDatoRange(gruppe.turnering.startDate, gruppe.turnering.endDate)}
          </span>
        </div>
      </div>

      {/* Innhold — tabell for LIVE, chips for UPCOMING */}
      <div style={{ padding: "0" }}>
        {erLive ? (
          <LeaderboardTabell spillere={gruppe.spillere} />
        ) : (
          <KommendeSpillerListe spillere={gruppe.spillere} />
        )}
      </div>

      {/* Footer-lenke */}
      <div
        style={{
          padding: "14px 24px",
          borderTop: "1px solid var(--s-border)",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        {gruppe.turnering.slug ? (
          <Link
            href={`/stats/turneringer/${gruppe.turnering.slug}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              letterSpacing: "0.08em",
              color: "var(--s-primary)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Se full leaderboard <ExternalLink size={11} />
          </Link>
        ) : gruppe.turnering.officialUrl ? (
          <a
            href={gruppe.turnering.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              letterSpacing: "0.08em",
              color: "var(--s-primary)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Se turnering <ExternalLink size={11} />
          </a>
        ) : (
          <Link
            href="/stats/turneringer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              letterSpacing: "0.08em",
              color: "var(--s-muted-fg)",
              textDecoration: "none",
            }}
          >
            Se alle turneringer <ExternalLink size={11} />
          </Link>
        )}
      </div>
    </section>
  );
}

// ---------- Leaderboard-tabell (IN_PROGRESS) ----------

type SpillerRad = {
  id: string;
  name: string;
  slug: string;
  position: number | null;
  scoreToPar: number | null;
  status: string;
  rounds: number[];
};

function LeaderboardTabell({ spillere }: { spillere: SpillerRad[] }) {
  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        fontFamily: "var(--font-mono)",
        fontSize: 13,
      }}
    >
      <thead>
        <tr
          style={{
            background: "var(--s-secondary)",
            borderBottom: "1px solid var(--s-border)",
          }}
        >
          <th
            style={{
              padding: "10px 24px",
              textAlign: "left",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--s-muted-fg)",
              fontWeight: 500,
              width: 64,
            }}
          >
            POS
          </th>
          <th
            style={{
              padding: "10px 16px",
              textAlign: "left",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--s-muted-fg)",
              fontWeight: 500,
            }}
          >
            SPILLER
          </th>
          <th
            style={{
              padding: "10px 16px",
              textAlign: "right",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--s-muted-fg)",
              fontWeight: 500,
              width: 80,
            }}
          >
            SCORE
          </th>
          <th
            style={{
              padding: "10px 24px 10px 16px",
              textAlign: "right",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--s-muted-fg)",
              fontWeight: 500,
            }}
          >
            RUNDER
          </th>
        </tr>
      </thead>
      <tbody>
        {spillere.map((spiller, i) => {
          const score = formaterScore(spiller.scoreToPar);
          const underPar =
            spiller.scoreToPar !== null &&
            spiller.scoreToPar !== undefined &&
            spiller.scoreToPar < 0;
          const isEven =
            spiller.scoreToPar !== null &&
            spiller.scoreToPar !== undefined &&
            spiller.scoreToPar === 0;

          return (
            <tr
              key={spiller.id}
              style={{
                borderBottom:
                  i < spillere.length - 1
                    ? "1px solid var(--s-border)"
                    : undefined,
              }}
            >
              {/* Posisjon */}
              <td
                style={{
                  padding: "14px 24px",
                  fontVariantNumeric: "tabular-nums",
                  fontWeight: 600,
                  color:
                    (spiller.position ?? 99) <= 3
                      ? "var(--s-primary)"
                      : "var(--s-muted-fg)",
                }}
              >
                {formaterPos(spiller.position)}
              </td>

              {/* Spillernavn */}
              <td style={{ padding: "14px 16px" }}>
                <Link
                  href={`/stats/spillere/${spiller.slug}`}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 500,
                    fontSize: 14,
                    color: "var(--s-fg)",
                    textDecoration: "none",
                  }}
                >
                  {spiller.name}
                </Link>
              </td>

              {/* Score */}
              <td style={{ padding: "14px 16px", textAlign: "right" }}>
                <span
                  style={{
                    display: "inline-block",
                    fontVariantNumeric: "tabular-nums",
                    fontWeight: 600,
                    fontSize: 13,
                    padding: "2px 8px",
                    borderRadius: 4,
                    background: underPar
                      ? "var(--s-accent)"
                      : isEven
                        ? "var(--s-secondary)"
                        : "var(--s-secondary)",
                    color: underPar ? "var(--s-accent-fg)" : "var(--s-fg)",
                  }}
                >
                  {score}
                </span>
              </td>

              {/* Runder */}
              <td
                style={{
                  padding: "14px 24px 14px 16px",
                  textAlign: "right",
                  color: "var(--s-muted-fg)",
                  fontSize: 12,
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "0.04em",
                }}
              >
                {spiller.rounds.length > 0
                  ? spiller.rounds.join("-")
                  : "—"}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ---------- Kommende spillerliste (UPCOMING) ----------

function KommendeSpillerListe({ spillere }: { spillere: SpillerRad[] }) {
  return (
    <div
      style={{
        padding: "16px 24px",
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      {spillere.map((spiller) => (
        <Link
          key={spiller.id}
          href={`/stats/spillere/${spiller.slug}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "6px 12px",
            borderRadius: 999,
            background: "var(--s-secondary)",
            border: "1px solid var(--s-border)",
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            fontWeight: 500,
            color: "var(--s-fg)",
            textDecoration: "none",
            transition: "all 0.15s ease",
          }}
        >
          {spiller.name}
        </Link>
      ))}
    </div>
  );
}
