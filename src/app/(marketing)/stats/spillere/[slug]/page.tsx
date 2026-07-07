/**
 * /stats/spillere/[slug] — Spillerprofil
 *
 * Editorial spillerprofil à la basketball-reference.com.
 * Tabs: Resultater · Trend · Sammenlign · Stats
 * URL-baserte tabs for SEO (?tab=resultater).
 *
 * ISR: 1 time revalidate. 404 hvis slug ikke finnes.
 */

import "./profil.css";
import "../spillere.css";
import "../../../stats/stats.css";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Mail, ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StatsEyebrow } from "@/components/stats/eyebrow";
import { StatsInitialAvatar } from "@/components/stats/stats-initial-avatar";
import { StatsTrendGraf } from "@/components/stats/stats-trend-graf";

export const revalidate = 3600;

// ---------------------------------------------------------------------------
// Typer
// ---------------------------------------------------------------------------

type RundeBlogg = {
  n: number;
  score: number;
  par?: string | number;
};

type SpillerData = NonNullable<Awaited<ReturnType<typeof hentSpiller>>>;
type Entry = SpillerData["entries"][number];

// ---------------------------------------------------------------------------
// Data-henting
// ---------------------------------------------------------------------------

async function hentSpiller(slug: string) {
  return prisma.publicPlayer.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      birthYear: true,
      tier: true,
      bio: true,
      photoUrl: true,
      country: true,
      entries: {
        orderBy: { tournament: { startDate: "desc" } },
        select: {
          id: true,
          status: true,
          position: true,
          scoreToPar: true,
          totalScore: true,
          rounds: true,
          tournament: {
            select: {
              id: true,
              name: true,
              shortName: true,
              slug: true,
              startDate: true,
              tour: true,
              location: true,
            },
          },
        },
      },
    },
  });
}

// ---------------------------------------------------------------------------
// Hjelpefunksjoner
// ---------------------------------------------------------------------------

function parseKlubb(bio: string | null): string | null {
  if (!bio) return null;
  const match = bio.match(/[Kk]lubb:\s*([^\n.]+)/);
  if (match) return match[1].trim();
  return null;
}

function parseUniversity(bio: string | null): string | null {
  if (!bio) return null;
  const match = bio.match(/[Uu]niversity:?\s*([^\n.,]+)/);
  if (match) return match[1].trim();
  const match2 = bio.match(/[Cc]ollege:?\s*([^\n.,]+)/);
  if (match2) return match2[1].trim();
  return null;
}

function formaterDatoKort(d: Date): string {
  return new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "long",
  }).format(d);
}

function formaterTierLabel(tier: string): string {
  switch (tier) {
    case "amateur":  return "Amateur";
    case "junior":   return "Junior";
    case "pro-pga":  return "PGA Pro";
    case "pro-dp":   return "DP World Pro";
    case "pro-lpga": return "LPGA Pro";
    case "college":  return "College";
    default:         return tier.charAt(0).toUpperCase() + tier.slice(1);
  }
}

function tierBadgeCls(tier: string): string {
  switch (tier) {
    case "pro-pga":  return "stats-tier-badge stats-tier-pro-pga";
    case "pro-dp":
    case "pro-lpga": return "stats-tier-badge stats-tier-pro";
    case "college":  return "stats-tier-badge stats-tier-college";
    case "junior":   return "stats-tier-badge stats-tier-junior";
    default:         return "stats-tier-badge stats-tier-amateur";
  }
}

function formaterTour(tour: string | null): string {
  if (!tour) return "—";
  const map: Record<string, string> = {
    pga: "PGA Tour",
    opp: "PGA Tour · Opposite Field",
    dp: "DP World Tour",
    lpga: "LPGA",
    "korn-ferry": "Korn Ferry",
    challenge: "Challenge Tour",
    "amateur-no": "Norsk amatør",
    "junior-no": "Norsk junior",
    college: "NCAA",
    srixon: "Srixon",
    olyo: "OLYO",
    ngc: "Norges Cup",
    ostlandstour: "Østlandstour",
    wagr: "WAGR",
  };
  return map[tour] ?? tour;
}

function parseRunder(rounds: unknown): { n: number; score: number }[] {
  if (!rounds || !Array.isArray(rounds)) return [];
  return (rounds as RundeBlogg[])
    .filter((r) => typeof r.score === "number")
    .sort((a, b) => a.n - b.n)
    .map((r) => ({ n: r.n, score: r.score }));
}

function formaterPosisjon(position: number | null, status: string): string {
  if (status === "CUT")      return "CUT";
  if (status === "WITHDREW") return "WD";
  if (status === "DNF")      return "DNF";
  if (position === null)     return "—";
  if (position === 1)        return "1.";
  return `${position}.`;
}

function erTopp10(position: number | null, status: string): boolean {
  return status === "FINISHED" && position !== null && position <= 10;
}

function formaterScoreToPar(s: number | null): string {
  if (s === null) return "—";
  if (s === 0) return "E";
  return s > 0 ? `+${s}` : `${s}`;
}

/** Beregn snitt scoreToPar og runder per år */
function beregnePerAar(entries: Entry[]): {
  aar: number;
  snitt: number;
  snittStr: string;
  antall: number;
  beste: number | null;
  tourer: string;
}[] {
  const map: Record<
    number,
    { scores: number[]; tourer: Set<string>; beste: number | null }
  > = {};
  for (const e of entries) {
    if (e.scoreToPar === null) continue;
    const aar = new Date(e.tournament.startDate).getFullYear();
    if (!map[aar]) map[aar] = { scores: [], tourer: new Set(), beste: null };
    map[aar].scores.push(e.scoreToPar);
    if (e.tournament.tour) map[aar].tourer.add(formaterTour(e.tournament.tour));
    if (e.totalScore !== null) {
      if (map[aar].beste === null || e.totalScore < map[aar].beste!) {
        map[aar].beste = e.totalScore;
      }
    }
  }
  return Object.entries(map)
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([aar, { scores, tourer, beste }]) => {
      const snitt =
        Math.round(
          (scores.reduce((a, b) => a + b, 0) / scores.length) * 10,
        ) / 10;
      return {
        aar: Number(aar),
        snitt,
        snittStr: formaterScoreToPar(snitt),
        antall: scores.length,
        beste,
        tourer: Array.from(tourer).slice(0, 3).join(", "),
      };
    });
}

/** Generer AI-stil sammendrag fra data */
function genererSammendrag(
  navn: string,
  tier: string,
  perAar: ReturnType<typeof beregnePerAar>,
  antallTurneringer: number,
): string {
  if (perAar.length === 0) {
    return `${navn} er registrert i den norske golfdatabasen med ${antallTurneringer} turneringer. Mer data vil vises etter hvert som resultater registreres.`;
  }

  const sisteAar = perAar[0];
  const tierTekst =
    tier === "pro-pga"
      ? "en av Norges fremste profesjonelle golfspillere"
      : tier === "college"
      ? "en norsk collegegolfspiller"
      : tier === "junior"
      ? "et norsk juniortalent"
      : "en norsk amatørgolfspiller";

  if (perAar.length >= 2) {
    const nestSiste = perAar[1];
    const diff = sisteAar.snitt - nestSiste.snitt;
    const trend =
      diff < -0.5
        ? `Med en forbedring på ${Math.abs(diff).toFixed(1)} strokes fra ${nestSiste.aar} til ${sisteAar.aar}`
        : diff > 0.5
        ? `Etter en noe utfordrende sesong i ${sisteAar.aar}`
        : `Med stabile prestasjoner`;
    return `${navn} er ${tierTekst} med ${antallTurneringer} registrerte turneringer i databasen vår. ${trend} (${formaterScoreToPar(sisteAar.snitt)} snitt over ${sisteAar.antall} runder) viser ${navn} en solid karrierekurve i norsk golf.`;
  }

  return `${navn} er ${tierTekst} med ${antallTurneringer} registrerte turneringer. I ${sisteAar.aar} hadde ${navn} et snitt på ${formaterScoreToPar(sisteAar.snitt)} over ${sisteAar.antall} runder, en prestasjon som plasserer spilleren godt i det norske feltet.`;
}

// Tour-chips tilgjengelig
const TOUR_CHIPS = [
  { id: "alle",        label: "Alle" },
  { id: "pga",         label: "PGA Tour" },
  { id: "srixon",      label: "Srixon" },
  { id: "olyo",        label: "OLYO" },
  { id: "ngc",         label: "NGC" },
  { id: "ostlandstour",label: "Østlands" },
  { id: "college",     label: "NCAA" },
  { id: "wagr",        label: "WAGR" },
];

// Tab-definisjon
const TABS = [
  { id: "resultater", label: "Resultater" },
  { id: "trend",      label: "Trend" },
  { id: "sammenlign", label: "Sammenlign" },
  { id: "stats",      label: "Stats" },
];

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const spiller = await prisma.publicPlayer.findUnique({
    where: { slug },
    select: { name: true, birthYear: true, bio: true, tier: true },
  });
  if (!spiller) return { title: "Spiller ikke funnet" };

  const tittel = spiller.birthYear
    ? `${spiller.name} (f. ${spiller.birthYear}): AK Golf Stats`
    : `${spiller.name}: AK Golf Stats`;
  const tier = formaterTierLabel(spiller.tier);
  const beskrivelse =
    spiller.bio ??
    `${spiller.name} er en norsk ${tier.toLowerCase()}-golfer. Se komplette turneringsresultater og statistikk på AK Golf Stats.`;

  return {
    title: tittel,
    description: beskrivelse,
    alternates: { canonical: `https://akgolf.no/stats/spillere/${slug}` },
    openGraph: {
      title: tittel,
      description: beskrivelse,
      url: `https://akgolf.no/stats/spillere/${slug}`,
      type: "profile",
    },
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function SpillerProfilPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const activeTab   = typeof sp.tab  === "string" ? sp.tab  : "resultater";
  const activeTour  = typeof sp.tour === "string" ? sp.tour : "alle";

  const spiller = await hentSpiller(slug);
  if (!spiller) notFound();

  const spillerData = spiller as NonNullable<typeof spiller>;
  const klubb       = parseKlubb(spillerData.bio);
  const university  = parseUniversity(spillerData.bio);
  const entries     = spillerData.entries;
  const perAar      = beregnePerAar(entries);
  const antallTurneringer = entries.length;
  const antallRunder = entries.reduce(
    (sum, e) => sum + (parseRunder(e.rounds).length || 0),
    0,
  );

  // Beste score (laveste totalScore)
  const alleTotalScores = entries
    .filter((e) => e.totalScore !== null)
    .map((e) => ({ score: e.totalScore as number, aar: new Date(e.tournament.startDate).getFullYear() }));
  const besteScore =
    alleTotalScores.length > 0
      ? alleTotalScores.reduce((a, b) => (b.score < a.score ? b : a))
      : null;

  const alder = spillerData.birthYear
    ? new Date().getFullYear() - spillerData.birthYear
    : null;

  // Filtrer entries for aktiv tour
  const filtrerteEntries =
    activeTour === "alle"
      ? entries
      : entries.filter((e) => e.tournament.tour === activeTour);

  // Grupper per år
  const entriesPerAar: Record<number, Entry[]> = {};
  for (const e of filtrerteEntries) {
    const y = new Date(e.tournament.startDate).getFullYear();
    if (!entriesPerAar[y]) entriesPerAar[y] = [];
    entriesPerAar[y].push(e);
  }
  const sorterteAar = Object.keys(entriesPerAar)
    .map(Number)
    .sort((a, b) => b - a);

  // Sammendrag
  const sammendrag = genererSammendrag(
    spillerData.name,
    spillerData.tier,
    perAar,
    antallTurneringer,
  );

  // Build tab URL
  function tabUrl(tabId: string): string {
    const base = `/stats/spillere/${slug}`;
    const s = new URLSearchParams();
    if (tabId !== "resultater") s.set("tab", tabId);
    if (tabId === "resultater" && activeTour !== "alle") s.set("tour", activeTour);
    return s.toString() ? `${base}?${s.toString()}` : base;
  }
  function tourUrl(tourId: string): string {
    const s = new URLSearchParams();
    if (activeTab !== "resultater") s.set("tab", activeTab);
    if (tourId !== "alle") s.set("tour", tourId);
    return s.toString() ? `/stats/spillere/${slug}?${s.toString()}` : `/stats/spillere/${slug}`;
  }

  return (
    <div className="bg-background text-foreground">
      {/* BREADCRUMB */}
      <div className="border-b border-border" style={{ background: "var(--s-secondary)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "10px 64px" }}>
          <Link
            href="/stats/spillere"
            className="inline-flex items-center gap-1 text-sm"
            style={{ color: "var(--s-muted-fg)" }}
          >
            <ChevronLeft style={{ width: 16, height: 16 }} />
            Norske spillere
          </Link>
        </div>
      </div>

      {/* HERO */}
      <section className="profil-hero">
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="profil-hero-top">
            {/* Initial-glyph 96px */}
            <StatsInitialAvatar name={spillerData.name} size="xl" />

            {/* Info */}
            <div className="profil-hero-info">
              <StatsEyebrow tone="default">
                Norsk golf · {formaterTierLabel(spillerData.tier)}
              </StatsEyebrow>
              <h1 className="profil-hero-name">{spillerData.name}</h1>
              <div className="profil-hero-sub">
                {alder && <span>{alder} år</span>}
                {alder && (klubb || spillerData.tier) && (
                  <span className="profil-hero-dot">·</span>
                )}
                {klubb && <span>{klubb}</span>}
                {klubb && (
                  <span className="profil-hero-dot">·</span>
                )}
                <span className={tierBadgeCls(spillerData.tier)}>
                  {formaterTierLabel(spillerData.tier)}
                </span>
              </div>

              {/* Tag-row */}
              <div className="profil-hero-tags">
                {spillerData.birthYear && (
                  <span className="profil-tag">f. {spillerData.birthYear}</span>
                )}
                {university && (
                  <span className="profil-tag">{university}</span>
                )}
                {spillerData.tier.startsWith("pro") && perAar.length > 0 && (
                  <span className="profil-tag">
                    Aktiv siden {Math.min(...perAar.map((p) => p.aar))}
                  </span>
                )}
                {spillerData.country && spillerData.country !== "NO" && (
                  <span className="profil-tag">{spillerData.country}</span>
                )}
              </div>
            </div>
          </div>

          {/* KPI-strip */}
          <div className="profil-kpi-strip">
            <div className="profil-kpi">
              <div className="profil-kpi-eyebrow">Turneringer</div>
              <div className="profil-kpi-val">{antallTurneringer}</div>
            </div>
            <div className="profil-kpi">
              <div className="profil-kpi-eyebrow">Runder</div>
              <div className="profil-kpi-val">{antallRunder}</div>
            </div>
            <div className="profil-kpi">
              <div className="profil-kpi-eyebrow">Beste runde</div>
              <div className="profil-kpi-val">
                {besteScore !== null ? (
                  <>
                    {besteScore.score}
                    <span className="unit">({besteScore.aar})</span>
                  </>
                ) : "—"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TAB-BAR — sticky */}
      <div className="profil-tabs-wrap">
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <nav className="stats-tabs" role="tablist" aria-label="Profil-seksjoner">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={tabUrl(tab.id)}
                  role="tab"
                  aria-selected={isActive}
                  className={`stats-tab${isActive ? " stats-tab-active" : ""}`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* TAB-INNHOLD */}
      <div className="profil-tab-content">
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>

          {/* ── TAB: RESULTATER ── */}
          {activeTab === "resultater" && (
            <div id="tabpanel-resultater" role="tabpanel" aria-labelledby="tab-resultater">
              {/* Tour-chips */}
              <div className="profil-tour-chips">
                {TOUR_CHIPS.map((tc) => {
                  const isActive = activeTour === tc.id;
                  return (
                    <Link
                      key={tc.id}
                      href={tourUrl(tc.id)}
                      className={`profil-tour-chip${isActive ? " active" : ""}`}
                      aria-pressed={isActive}
                    >
                      {tc.label}
                    </Link>
                  );
                })}
              </div>

              {filtrerteEntries.length === 0 ? (
                <div className="profil-no-data">
                  Ingen resultater for valgt tour-filter.
                </div>
              ) : (
                <div className="profil-result-list">
                  {sorterteAar.map((aar) => (
                    <div key={aar}>
                      <div className="profil-year-group-header">{aar}</div>
                      {entriesPerAar[aar].map((e) => {
                        const runder   = parseRunder(e.rounds);
                        const isTopp10 = erTopp10(e.position, e.status);
                        const startDate = new Date(e.tournament.startDate);

                        return (
                          <div
                            key={e.id}
                            className={`profil-result-card${isTopp10 ? " topp10" : ""}`}
                          >
                            <div className="profil-result-meta">
                              {formaterDatoKort(startDate).toUpperCase()} ·{" "}
                              {formaterTour(e.tournament.tour ?? null).toUpperCase()}
                            </div>
                            <div className="profil-result-title">
                              {e.tournament.shortName ?? e.tournament.name}
                            </div>
                            {e.tournament.location && (
                              <div className="profil-result-sted">
                                {e.tournament.location}
                              </div>
                            )}

                            <div className="profil-result-scores">
                              {/* Rundescorer */}
                              {runder.map((r) => (
                                <div key={r.n} className="profil-round-score">
                                  <span className="profil-round-label">R{r.n}</span>
                                  <span className="profil-round-val">{r.score}</span>
                                </div>
                              ))}

                              <div className="profil-result-spacer" />

                              {/* Total + posisjon */}
                              <div className="profil-result-total-group">
                                <div className="profil-result-total">
                                  <span className="profil-result-total-label">Total</span>
                                  <span className="profil-result-total-val">
                                    {e.totalScore ?? formaterScoreToPar(e.scoreToPar)}
                                  </span>
                                </div>
                                <div className="profil-result-pos">
                                  <span className="profil-result-pos-label">Pos.</span>
                                  <span
                                    className={`profil-result-pos-val${
                                      isTopp10 ? " topp10-pos" : ""
                                    }${
                                      e.status === "CUT" || e.status === "WITHDREW"
                                        ? " cut"
                                        : ""
                                    }`}
                                  >
                                    {formaterPosisjon(e.position, e.status)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: TREND ── */}
          {activeTab === "trend" && (
            <div id="tabpanel-trend" role="tabpanel" aria-labelledby="tab-trend">
              {perAar.length === 0 ? (
                <div className="profil-no-data">
                  Ikke nok data for å vise trend ennå.
                </div>
              ) : (
                <div className="profil-trend-wrap">
                  {/* Linjegraf */}
                  <div className="profil-chart-card">
                    <div className="profil-chart-title">
                      Snittscore per år · Lavere = bedre
                    </div>
                    <StatsTrendGraf
                      data={perAar.map((p) => ({
                        aar: p.aar,
                        snitt: p.snitt,
                        antall: p.antall,
                      }))}
                      height={260}
                    />
                  </div>

                  {/* Per år-tabell */}
                  <table className="profil-trend-table" aria-label="Statistikk per år">
                    <thead>
                      <tr>
                        <th>År</th>
                        <th className="num">Runder</th>
                        <th className="num">Snitt</th>
                        <th className="num">Beste</th>
                        <th>Tourer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {perAar.map((rad) => (
                        <tr key={rad.aar}>
                          <td>{rad.aar}</td>
                          <td className="num">{rad.antall}</td>
                          <td
                            className={`num ${
                              rad.snitt < 0
                                ? "positive"
                                : rad.snitt > 0
                                ? "negative"
                                : "muted"
                            }`}
                          >
                            {rad.snittStr}
                          </td>
                          <td className="num positive">
                            {rad.beste ?? "—"}
                          </td>
                          <td className="muted">{rad.tourer || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: SAMMENLIGN ── */}
          {activeTab === "sammenlign" && (
            <div
              id="tabpanel-sammenlign"
              role="tabpanel"
              aria-labelledby="tab-sammenlign"
              className="profil-sammenlign-wrap"
            >
              <h2>
                Sammenlign{" "}
                <em className="stats-italic-accent">{spillerData.name}</em>{" "}
                med en annen norsk spiller
              </h2>
              <p>
                Velg en annen norsk spiller for å se side-by-side statistikk og
                snittscore over tid.
              </p>
              <form method="GET" action="/stats/sammenlign-spillere">
                <input type="hidden" name="a" value={spillerData.slug} />
                <input
                  type="text"
                  name="b"
                  placeholder="Søk norsk spiller…"
                  className="profil-sammenlign-searchbox"
                  aria-label="Søk etter spiller for sammenligning"
                />
                <div style={{ marginTop: 16 }}>
                  <button
                    type="submit"
                    className="stats-btn stats-btn-primary stats-btn-md"
                  >
                    Sammenlign
                    <ArrowRight style={{ width: 16, height: 16 }} />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── TAB: STATS ── */}
          {activeTab === "stats" && (
            <div id="tabpanel-stats" role="tabpanel" aria-labelledby="tab-stats">
              <div className="profil-stats-grid">
                {/* Beste snitt */}
                {perAar.length > 0 && (
                  <div className="profil-stats-card">
                    <div className="profil-stats-eyebrow">
                      Beste snitt-sesong
                    </div>
                    <div
                      className="profil-stats-big"
                      style={{
                        color:
                          perAar[perAar.length - 1].snitt <= 0
                            ? "var(--s-primary)"
                            : "var(--s-fg)",
                      }}
                    >
                      {perAar.reduce((best, cur) =>
                        cur.snitt < best.snitt ? cur : best,
                      ).snittStr}
                    </div>
                    <div className="profil-stats-sub">
                      {perAar.reduce((best, cur) =>
                        cur.snitt < best.snitt ? cur : best,
                      ).aar}{" "}
                      ·{" "}
                      {
                        perAar.reduce((best, cur) =>
                          cur.snitt < best.snitt ? cur : best,
                        ).antall
                      }{" "}
                      runder
                    </div>
                  </div>
                )}

                {/* Totalt antall turneringer */}
                <div className="profil-stats-card">
                  <div className="profil-stats-eyebrow">Turneringer totalt</div>
                  <div className="profil-stats-big">{antallTurneringer}</div>
                  <div className="profil-stats-sub">
                    {antallRunder} runder totalt
                  </div>
                </div>

                {/* Topp-10-plasseringer */}
                {(() => {
                  const topp10Count = entries.filter((e) =>
                    erTopp10(e.position, e.status),
                  ).length;
                  return (
                    <div className="profil-stats-card">
                      <div className="profil-stats-eyebrow">Topp-10-plasseringer</div>
                      <div className="profil-stats-big">{topp10Count}</div>
                      <div className="profil-stats-sub">
                        {antallTurneringer > 0
                          ? `${((topp10Count / antallTurneringer) * 100).toFixed(0)} % av turneringer`
                          : "—"}
                      </div>
                    </div>
                  );
                })()}

                {/* CUT-rate */}
                {(() => {
                  const cutCount = entries.filter(
                    (e) => e.status === "CUT",
                  ).length;
                  const finished = entries.filter(
                    (e) => e.status === "FINISHED",
                  ).length;
                  return (
                    <div className="profil-stats-card">
                      <div className="profil-stats-eyebrow">Fullførte runder</div>
                      <div className="profil-stats-big">{finished}</div>
                      <div className="profil-stats-sub">
                        {cutCount} missed cut
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* "SPILLEREN I ÉN SETNING" */}
      <section className="profil-sammendrag-section">
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="profil-sammendrag-inner">
            <div className="profil-sammendrag-divider-top" />
            <p className="profil-sammendrag-text">{sammendrag}</p>
            <div className="profil-sammendrag-divider-bottom" />
            <div className="profil-sammendrag-credit">
              AK Golf Stats · Oppdatert {new Date().toLocaleDateString("nb-NO", { month: "long", year: "numeric" })}
            </div>
          </div>
        </div>
      </section>

      {/* MERSALG-BÅND */}
      <section className="stats-mersalg-wrap">
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="stats-mersalg">
            <div>
              <StatsEyebrow tone="lime">Din egen utvikling</StatsEyebrow>
              <h2>
                Vil{" "}
                <em style={{ fontStyle: "italic", color: "var(--s-accent)" }}>
                  du
                </em>{" "}
                ha en slik profil?
              </h2>
              <p>
                Hvis du spiller på en av tourerne vi tracker, har du sannsynligvis allerede én.
                Vil du følge utvikling, mål og runder over tid: det er PlayerHQ.
              </p>
              <div className="stats-mersalg-ctas">
                <Link
                  href="/playerhq"
                  className="stats-btn stats-btn-outline stats-btn-md"
                  style={{ gap: 8 }}
                >
                  Prøv PlayerHQ gratis
                  <ArrowRight style={{ width: 16, height: 16 }} className="stats-btn-icon" />
                </Link>
              </div>
            </div>
            <div className="stats-mersalg-card">
              <h4>I PlayerHQ kan du</h4>
              <ul>
                <li>Logg og analyser dine egne runder</li>
                <li>Se Strokes Gained-utvikling over tid</li>
                <li>AI-coach-analyser basert på ditt spill</li>
                <li>Se din profil og sammenlign med andre</li>
              </ul>
              <div className="stats-mersalg-price">
                Fra <strong>299 kr/mnd</strong> · Gratis de første 30 dagene
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GDPR-STRØK */}
      <div className="profil-gdpr-strip">
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <p className="profil-gdpr-text">
            Resultater hentet fra offentlige turneringer ·{" "}
            Sist oppdatert: {new Date().toLocaleDateString("nb-NO", { month: "long", year: "numeric" })}
          </p>
          <a
            href={`mailto:akgolfgroup@gmail.com?subject=${encodeURIComponent(
              `GDPR slett: ${spillerData.name}`,
            )}&body=${encodeURIComponent(
              `Hei,\n\nJeg ønsker å få slettet all informasjon om meg fra AK Golf Stats-databasen.\n\nNavn: ${spillerData.name}\nURL: https://akgolf.no/stats/spillere/${spillerData.slug}\n\nMvh`,
            )}`}
            className="profil-gdpr-link inline-flex items-center gap-1"
          >
            <Mail style={{ width: 14, height: 14 }} />
            Er dette deg? Be om sletting →
          </a>
        </div>
      </div>
    </div>
  );
}
