/**
 * /stats/spillere — Norsk golf-spillerdatabase
 *
 * FotMob-aktig talent-database med søk, filterpills, kort-grid vs tabell.
 * ISR: 1 time revalidate. Server Component med GET-søk via searchParams.
 */

import "./spillere.css";
import "../../stats/stats.css";

import type { Metadata } from "next";
import Link from "next/link";
import { Search, Users, TrendingUp, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StatsEyebrow } from "@/components/stats/eyebrow";
import { StatsInitialAvatar } from "@/components/stats/stats-initial-avatar";
import { StatsSpillerRad } from "@/components/stats/stats-spiller-rad";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Norsk spillerdatabase: AK Golf Stats",
  description:
    "Søk opp norske golfspillere og se komplette turneringsresultater fra Srixon Tour, OLYO, Norges Cup og Østlandstour 2016–2026. 1 500+ spillere på ett sted.",
  alternates: { canonical: "https://akgolf.no/stats/spillere" },
  openGraph: {
    title: "Norsk spillerdatabase: AK Golf Stats",
    description:
      "1 500+ norske golfspillere. Komplett resultathistorikk fra 10 år med norsk golf.",
    url: "https://akgolf.no/stats/spillere",
    type: "website",
  },
};

// ---------------------------------------------------------------------------
// Typer
// ---------------------------------------------------------------------------

type Spiller = {
  id: string;
  slug: string;
  name: string;
  birthYear: number | null;
  tier: string;
  bio: string | null;
  _count: { entries: number };
};

// ---------------------------------------------------------------------------
// Data-henting
// ---------------------------------------------------------------------------

async function hentSideData(
  q: string | undefined,
  aar: string | undefined,
  tier: string | undefined,
  klubbQ: string | undefined,
  view: string | undefined,
  side: number,
) {
  const PAGE_SIZE = 50;

  const [totalSpillere, totalTurneringer, totalResultater] = await Promise.all([
    prisma.publicPlayer.count({ where: { country: "NO", isActive: true } }),
    prisma.tournament.count({ where: { mergedIntoId: null } }),
    prisma.publicPlayerEntry.count(),
  ]);

  const navnFilter =
    q && q.trim().length > 0
      ? { name: { contains: q.trim(), mode: "insensitive" as const } }
      : {};

  const birthYearFilter =
    aar && /^\d{4}$/.test(aar) ? { birthYear: parseInt(aar, 10) } : {};

  const tierFilter =
    tier && tier !== "alle"
      ? { tier: { in: TIER_MAP[tier] ?? [tier] } }
      : {};

  const spillere = await prisma.publicPlayer.findMany({
    where: {
      country: "NO",
      isActive: true,
      ...navnFilter,
      ...birthYearFilter,
      ...tierFilter,
    },
    orderBy: { name: "asc" },
    take: PAGE_SIZE,
    skip: (side - 1) * PAGE_SIZE,
    select: {
      id: true,
      slug: true,
      name: true,
      birthYear: true,
      tier: true,
      bio: true,
      _count: { select: { entries: true } },
    },
  });

  // Topp 20 (WAGR/entries-sortert) — kun når ingen søk er aktivt
  const harFilter = Boolean(q || aar || (tier && tier !== "alle") || klubbQ);
  let topp20: Spiller[] = [];
  if (!harFilter) {
    topp20 = await prisma.publicPlayer.findMany({
      where: { country: "NO", isActive: true },
      orderBy: [{ tier: "asc" }, { name: "asc" }],
      take: 20,
      select: {
        id: true,
        slug: true,
        name: true,
        birthYear: true,
        tier: true,
        bio: true,
        _count: { select: { entries: true } },
      },
    });
  }

  return {
    totalSpillere,
    totalTurneringer,
    totalResultater,
    spillere,
    topp20,
    harFilter,
    PAGE_SIZE,
  };
}

async function hentAarganger(): Promise<number[]> {
  const rows = await prisma.publicPlayer.findMany({
    where: { country: "NO", isActive: true, birthYear: { not: null } },
    select: { birthYear: true },
    distinct: ["birthYear"],
    orderBy: { birthYear: "desc" },
    take: 10,
  });
  return rows.map((r) => r.birthYear).filter((y): y is number => y !== null);
}

// ---------------------------------------------------------------------------
// Hjelpefunksjoner
// ---------------------------------------------------------------------------

const TIER_MAP: Record<string, string[]> = {
  pro: ["pro-pga", "pro-dp", "pro-lpga", "pro"],
  college: ["college"],
  amateur: ["amateur"],
  junior: ["junior"],
};

function parseKlubb(bio: string | null): string | null {
  if (!bio) return null;
  const match = bio.match(/[Kk]lubb:\s*([^\n.]+)/);
  if (match) return match[1].trim();
  return null;
}

function formaterTierLabel(tier: string): string {
  switch (tier) {
    case "amateur":  return "Amatør";
    case "junior":   return "Junior";
    case "pro-pga":  return "PRO PGA";
    case "pro-dp":   return "DP World";
    case "pro-lpga": return "LPGA";
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

// Manuelt kuraterte "trending"-spillere (oppdateres månedlig)
const TRENDING_SLUGS: string[] = [];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function SpillerdatabasePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q     = typeof params.q    === "string" ? params.q    : undefined;
  const aar   = typeof params.aar  === "string" ? params.aar  : undefined;
  const tier  = typeof params.tier === "string" ? params.tier : undefined;
  const klubbQ= typeof params.klubb=== "string" ? params.klubb: undefined;
  const view  = typeof params.view === "string" ? params.view : "grid";
  const sideRaw = typeof params.side === "string" ? parseInt(params.side, 10) : 1;
  const side  = isNaN(sideRaw) || sideRaw < 1 ? 1 : sideRaw;

  const [
    {
      totalSpillere,
      totalTurneringer,
      totalResultater,
      spillere,
      topp20,
      harFilter,
      PAGE_SIZE,
    },
    aarganger,
  ] = await Promise.all([
    hentSideData(q, aar, tier, klubbQ, view, side),
    hentAarganger(),
  ]);

  // Bygg URL-helpers
  function buildUrl(overrides: Record<string, string | undefined>): string {
    const base: Record<string, string> = {};
    if (q)     base.q     = q;
    if (aar)   base.aar   = aar;
    if (tier)  base.tier  = tier;
    if (klubbQ)base.klubb = klubbQ;
    if (view !== "grid") base.view = view;
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === undefined) delete base[k];
      else base[k] = v;
    });
    const s = new URLSearchParams(base).toString();
    return `/stats/spillere${s ? `?${s}` : ""}`;
  }

  const visGridBtn   = view !== "tabell";
  const visTabell    = view === "tabell";

  const TIER_CHIPS = [
    { id: "alle",    label: "Alle" },
    { id: "pro",     label: "Pro" },
    { id: "college", label: "College" },
    { id: "amateur", label: "Amatør" },
    { id: "junior",  label: "Junior" },
  ];

  return (
    <div className="bg-background text-foreground">
      {/* BREADCRUMB */}
      <div className="border-b border-border" style={{ background: "var(--s-secondary)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "10px 64px" }}>
          <Link
            href="/stats"
            className="inline-flex items-center gap-1 text-sm"
            style={{ color: "var(--s-muted-fg)" }}
          >
            ← AK Golf Stats
          </Link>
        </div>
      </div>

      {/* HERO */}
      <section className="spillere-hero stats-hero">
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <StatsEyebrow tone="default">AK Golf Stats · Norsk golfdatabase</StatsEyebrow>
          <h1>
            Alle norske{" "}
            <em className="stats-italic-accent">golfspillere</em>. Ett sted.
          </h1>
          <p className="spillere-hero-sub">
            1 500+ spillere · 14 000+ turneringsresultater siden 2016 · oppdateres månedlig.
          </p>
        </div>
      </section>

      {/* STATS-STRØK */}
      <div className="spillere-stats-strip" style={{ maxWidth: "none" }}>
        <div style={{ display: "flex", gap: 40, maxWidth: 1280, margin: "0 auto", flexWrap: "wrap" }}>
          <div className="spillere-stat-item">
            <span className="spillere-stat-val">
              {totalSpillere.toLocaleString("nb-NO")}
            </span>
            <span className="spillere-stat-label">Spillere i databasen</span>
          </div>
          <div className="spillere-stat-item">
            <span className="spillere-stat-val">
              {totalTurneringer.toLocaleString("nb-NO")}
            </span>
            <span className="spillere-stat-label">Turneringer totalt</span>
          </div>
          <div className="spillere-stat-item">
            <span className="spillere-stat-val">
              {totalResultater.toLocaleString("nb-NO")}
            </span>
            <span className="spillere-stat-label">Registrerte resultater</span>
          </div>
          <div className="spillere-stat-item">
            <span className="spillere-stat-val">2016</span>
            <span className="spillere-stat-label">Tidligste data</span>
          </div>
        </div>
      </div>

      {/* SØK + FILTER */}
      <section id="søk" className="spillere-search-section">
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          {/* Stor søkeboks */}
          <form method="GET" style={{ maxWidth: 720 }}>
            {aar   && <input type="hidden" name="aar"   value={aar} />}
            {tier  && <input type="hidden" name="tier"  value={tier} />}
            {view !== "grid" && <input type="hidden" name="view" value={view} />}
            <div className="spillere-searchbox-wrap">
              <Search
                className="spillere-search-icon"
                style={{ width: 20, height: 20 }}
              />
              <input
                type="search"
                name="q"
                defaultValue={q ?? ""}
                placeholder="Søk etter navn, for eksempel «Hovland» eller «Bærum GK»…"
                autoComplete="off"
                className="spillere-searchbox"
                aria-label="Søk etter norsk golfspiller"
              />
              <span className="spillere-search-hint">⌘K</span>
            </div>
          </form>

          {/* Filter-strip */}
          <div className="spillere-filter-strip">
            {/* Tier-filter */}
            <div className="spillere-filter-group">
              <span className="spillere-filter-label">Tier</span>
              {TIER_CHIPS.map((chip) => {
                const isActive = chip.id === "alle" ? !tier || tier === "alle" : tier === chip.id;
                return (
                  <Link
                    key={chip.id}
                    href={buildUrl({ tier: chip.id === "alle" ? undefined : chip.id, side: undefined })}
                    className={`spillere-chip${isActive ? " active" : ""}`}
                    aria-pressed={isActive}
                  >
                    {chip.label}
                  </Link>
                );
              })}
            </div>

            {/* Årgangfilter */}
            {aarganger.length > 0 && (
              <div className="spillere-filter-group">
                <span className="spillere-filter-label">Årgang</span>
                <Link
                  href={buildUrl({ aar: undefined, side: undefined })}
                  className={`spillere-chip${!aar ? " active" : ""}`}
                  aria-pressed={!aar}
                >
                  Alle
                </Link>
                {aarganger.map((y) => {
                  const isActive = aar === String(y);
                  return (
                    <Link
                      key={y}
                      href={buildUrl({ aar: String(y), side: undefined })}
                      className={`spillere-chip${isActive ? " active" : ""}`}
                      aria-pressed={isActive}
                    >
                      {y}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* RESULTATER */}
      <section className="spillere-results-section">
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="spillere-results-header">
            <span className="spillere-count-label">
              {harFilter
                ? `${spillere.length} treff${spillere.length === PAGE_SIZE ? ` (side ${side})` : ""}`
                : `Viser ${spillere.length} av ${totalSpillere.toLocaleString("nb-NO")} spillere`}
            </span>

            {/* View-toggle */}
            <div className="spillere-view-toggle" role="group" aria-label="Visningsmodus">
              <Link
                href={buildUrl({ view: "grid" })}
                className={`spillere-view-btn${visGridBtn ? " active" : ""}`}
                aria-pressed={visGridBtn}
              >
                Kort
              </Link>
              <Link
                href={buildUrl({ view: "tabell" })}
                className={`spillere-view-btn${visTabell ? " active" : ""}`}
                aria-pressed={visTabell}
              >
                Tabell
              </Link>
            </div>
          </div>

          {spillere.length === 0 ? (
            <div className="spillere-empty">
              <Users style={{ width: 40, height: 40, color: "var(--s-muted-fg)", margin: "0 auto", display: "block" }} strokeWidth={1.25} />
              <h2>Ingen spillere funnet</h2>
              <p>Prøv et annet søkeord eller fjern filtrene.</p>
              <Link
                href="/stats/spillere"
                className="spillere-chip active"
                style={{ marginTop: 20, display: "inline-flex" }}
              >
                Vis alle spillere
              </Link>
            </div>
          ) : visTabell ? (
            /* TABELL-MODUS */
            <div className="spillere-dtable-wrap">
              <table className="spillere-dtable" aria-label="Spillerliste">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th>Spiller</th>
                    <th>Klubb</th>
                    <th>Tier</th>
                    <th>Årsklasse</th>
                    <th className="num">Beste snitt</th>
                    <th className="num">Turneringer</th>
                    <th className="num"></th>
                  </tr>
                </thead>
                <tbody>
                  {spillere.map((s, i) => {
                    const klubb = parseKlubb(s.bio);
                    return (
                      <StatsSpillerRad
                        key={s.id}
                        rank={(side - 1) * PAGE_SIZE + i + 1}
                        navn={s.name}
                        slug={s.slug}
                        klubb={klubb}
                        tier={s.tier}
                        antallTurneringer={s._count.entries}
                        birthYear={s.birthYear}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* KORT-GRID */
            <div className="spillere-grid">
              {spillere.map((s) => {
                const klubb = parseKlubb(s.bio);
                const alder = s.birthYear ? new Date().getFullYear() - s.birthYear : null;

                return (
                  <Link
                    key={s.id}
                    href={`/stats/spillere/${s.slug}`}
                    className="spillere-card"
                    aria-label={`Se profil for ${s.name}`}
                  >
                    {/* Hode */}
                    <div className="spillere-card-head">
                      <StatsInitialAvatar name={s.name} size="sm" />
                      <div className="spillere-card-info">
                        <div className="spillere-card-name">{s.name}</div>
                        <div className="spillere-card-meta">
                          {[alder ? `${alder} år` : null, klubb]
                            .filter(Boolean)
                            .join(" · ")}
                        </div>
                      </div>
                    </div>

                    {/* Tier-chip */}
                    <div className="spillere-card-chips">
                      <span className={tierBadgeCls(s.tier)}>
                        {formaterTierLabel(s.tier)}
                      </span>
                      {s.birthYear && (
                        <span
                          className="stats-tier-badge stats-tier-amateur"
                          style={{ background: "transparent", border: "1px solid var(--s-border)" }}
                        >
                          {s.birthYear}
                        </span>
                      )}
                    </div>

                    {/* KPI */}
                    <div className="spillere-card-kpi">
                      <div className="spillere-card-kpi-item">
                        <span className="spillere-card-kpi-label">Turneringer</span>
                        <span className="spillere-card-kpi-val">{s._count.entries}</span>
                      </div>
                      <div className="spillere-card-kpi-item right">
                        <span className="spillere-card-kpi-label">Se profil</span>
                        <span className="spillere-card-arrow">→</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Paginering */}
          {spillere.length === PAGE_SIZE && (
            <div style={{ display: "flex", gap: 8, marginTop: 32, justifyContent: "center" }}>
              {side > 1 && (
                <Link href={buildUrl({ side: String(side - 1) })} className="spillere-chip">
                  ← Forrige
                </Link>
              )}
              <span className="spillere-chip active" aria-current="page">
                Side {side}
              </span>
              <Link href={buildUrl({ side: String(side + 1) })} className="spillere-chip">
                Neste →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* TOPP-20 MODUL — kun uten aktiv søk */}
      {!harFilter && topp20.length > 0 && (
        <section className="spillere-topp20-section">
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div className="stats-section-head">
              <div>
                <StatsEyebrow tone="default">
                  <TrendingUp style={{ width: 12, height: 12 }} />
                  Akkurat nå
                </StatsEyebrow>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 600, letterSpacing: "-0.025em", marginTop: 12 }}>
                  Topp 20{" "}
                  <em className="stats-italic-accent">norske spillere</em>
                </h2>
              </div>
              <Link href="/stats/spillere?view=tabell" className="stats-section-head-link">
                Se full tabell →
              </Link>
            </div>

            <div className="spillere-dtable-wrap">
              <table className="spillere-dtable" aria-label="Topp 20 norske spillere">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th>Spiller</th>
                    <th>Klubb</th>
                    <th>Tier</th>
                    <th>Årsklasse</th>
                    <th className="num">Turneringer</th>
                    <th className="num"></th>
                  </tr>
                </thead>
                <tbody>
                  {topp20.map((s, i) => {
                    const klubb = parseKlubb(s.bio);
                    return (
                      <StatsSpillerRad
                        key={s.id}
                        rank={i + 1}
                        navn={s.name}
                        slug={s.slug}
                        klubb={klubb}
                        tier={s.tier}
                        antallTurneringer={s._count.entries}
                        birthYear={s.birthYear}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* TALENT PÅ VEI OPP */}
      {!harFilter && TRENDING_SLUGS.length > 0 && (
        <section className="spillere-talent-section">
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div className="stats-section-head">
              <div>
                <StatsEyebrow tone="default">Talent</StatsEyebrow>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 600, letterSpacing: "-0.025em", marginTop: 12 }}>
                  Spillere vi{" "}
                  <em className="stats-italic-accent">følger med på</em>.
                </h2>
              </div>
            </div>
            <div className="spillere-talent-grid">
              {/* Trendings vises her når TRENDING_SLUGS er fylt ut */}
            </div>
          </div>
        </section>
      )}

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
                være i databasen?
              </h2>
              <p>
                Spiller du Srixon Tour, OLYO eller Norges Cup? Du er sannsynligvis allerede her.
                Spillere som vil logge egne runder og se sin egen SG-profil over tid, gjør det i PlayerHQ.
              </p>
              <div className="stats-mersalg-ctas">
                <a
                  href="#søk"
                  className="stats-btn stats-btn-outline stats-btn-md"
                >
                  Sjekk om jeg er her
                </a>
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
              <h4>PlayerHQ inkluderer</h4>
              <ul>
                <li>Logg og analyser dine egne runder</li>
                <li>Se Strokes Gained-utvikling over tid</li>
                <li>AI-coach-analyser basert på ditt spill</li>
                <li>Sammenlign deg med andre norske spillere</li>
              </ul>
              <div className="stats-mersalg-price">
                Fra{" "}
                <strong>300 kr/mnd</strong> · Gratis de første 30 dagene
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PERSONVERN-STRØK */}
      <div className="spillere-gdpr-strip">
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <p className="spillere-gdpr-text">
            Alle resultater her er hentet fra offentlige turneringer publisert av forbundene.
            Er du, eller har du foreldreansvar for, en spiller som ikke ønsker å være i databasen?{" "}
            <a
              href={`mailto:akgolfgroup@gmail.com?subject=${encodeURIComponent("GDPR slett: Spillerprofil")}&body=${encodeURIComponent("Hei,\n\nJeg ønsker å få slettet informasjon fra AK Golf Stats-databasen.\n\nMvh")}`}
              className="spillere-gdpr-link"
            >
              Klikk her for å be om sletting →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
