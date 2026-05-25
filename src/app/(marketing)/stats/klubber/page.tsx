/**
 * /stats/klubber — Klubbdatabase (design 22)
 * Pixel-perfect port av design-handoff-stats-2026-05-25 pages-d.jsx + data.js
 *
 * Data: aggregerer PublicPlayer.bio + seed-klubber.
 * ISR 1 time.
 */

import "./klubber.css";
import "../stats.css";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatsEyebrow } from "@/components/stats/eyebrow";
import { Reveal } from "@/components/stats/reveal";
import { CountUp } from "@/components/stats/count-up";
import { StatsBtn } from "@/components/stats/btn";
import { KlubbdatabaseKlient } from "./klubb-klient";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Klubbdatabase — alle norske golfklubber | AK Golf Stats",
  description:
    "Spillere, pro-talent, juniorprogram og turneringshistorikk for alle norske golfklubber. Finn din klubb og se hvem som dominerer.",
  alternates: { canonical: "https://akgolf.no/stats/klubber" },
  openGraph: {
    title: "Klubbdatabase — alle norske golfklubber | AK Golf Stats",
    description: "Pro-talent, college-commits og turneringsdata per klubb.",
    url: "https://akgolf.no/stats/klubber",
  },
};

// ---------------------------------------------------------------------------
// Seed-data
// ---------------------------------------------------------------------------

export const SEED_KLUBBER = [
  { slug: "oslo-gk",      navn: "Oslo Golfklubb",       kommune: "Oslo",       region: "Øst",  spillere: 112, pro: 3, college: 4, junior: 32, turneringer: 42 },
  { slug: "baerum-gk",    navn: "Bærum Golfklubb",      kommune: "Bærum",      region: "Øst",  spillere: 89,  pro: 1, college: 2, junior: 32, turneringer: 47 },
  { slug: "gfgk",         navn: "Gamle Fredrikstad GK",  kommune: "Fredrikstad",region: "Øst",  spillere: 73,  pro: 0, college: 1, junior: 21, turneringer: 38 },
  { slug: "stavanger-gk", navn: "Stavanger Golfklubb",   kommune: "Stavanger",  region: "Vest", spillere: 58,  pro: 1, college: 2, junior: 18, turneringer: 28 },
  { slug: "kongsberg-gk", navn: "Kongsberg Golfklubb",   kommune: "Kongsberg",  region: "Øst",  spillere: 42,  pro: 0, college: 0, junior: 14, turneringer: 21 },
  { slug: "trondheim-gk", navn: "Trondheim Golfklubb",   kommune: "Trondheim",  region: "Midt", spillere: 39,  pro: 0, college: 1, junior: 11, turneringer: 19 },
  { slug: "bergen-gk",    navn: "Bergen Golfklubb",       kommune: "Bergen",     region: "Vest", spillere: 34,  pro: 0, college: 0, junior: 9,  turneringer: 16 },
  { slug: "larvik-gk",    navn: "Larvik Golfklubb",       kommune: "Larvik",     region: "Sør",  spillere: 28,  pro: 0, college: 0, junior: 7,  turneringer: 14 },
  { slug: "hamar-gk",     navn: "Hamar Golfklubb",        kommune: "Hamar",      region: "Øst",  spillere: 22,  pro: 0, college: 0, junior: 6,  turneringer: 11 },
  { slug: "tonsberg-gk",  navn: "Tønsberg Golfklubb",     kommune: "Tønsberg",   region: "Sør",  spillere: 18,  pro: 0, college: 0, junior: 4,  turneringer: 9  },
];

// ---------------------------------------------------------------------------
// Data-henting
// ---------------------------------------------------------------------------

async function hentKlubbStats() {
  const [totalSpillere, totalTurneringer] = await Promise.all([
    prisma.publicPlayer.count({ where: { isActive: true } }),
    prisma.tournament.count({ where: { mergedIntoId: null } }),
  ]);

  return {
    totalKlubber: SEED_KLUBBER.length,
    totalSpillere,
    totalTurneringer,
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function KlubbdatabasePage() {
  const stats = await hentKlubbStats();

  // Featured cards: flest spillere, mest turneringer, mest pro-talent
  const flestSpillere = [...SEED_KLUBBER].sort((a, b) => b.spillere - a.spillere)[0];
  const mestTurneringer = [...SEED_KLUBBER].sort((a, b) => b.turneringer - a.turneringer)[0];
  const mestPro = [...SEED_KLUBBER].sort((a, b) => b.pro + b.college - (a.pro + a.college))[0];

  return (
    <div className="klubber-page bg-background text-foreground">
      {/* ── Hero ── */}
      <section className="klubber-hero">
        <Reveal>
          <Link href="/stats" className="breadcrumb">
            ← AK Golf Stats
          </Link>
          <StatsEyebrow>AK Golf Stats · Klubber</StatsEyebrow>
          <h1>
            Alle <em className="italic-accent">norske</em> golfklubber.
          </h1>
          <p className="klubber-hero-sub">
            Spillere, pro-talent, juniorprogram og turneringshistorikk for alle
            norske golfklubber i databasen vår.
          </p>
        </Reveal>
      </section>

      {/* ── KPI Strip ── */}
      <Reveal>
        <div className="klubber-kpi-strip">
          <div className="klubber-kpi">
            <div className="klubber-kpi-eyebrow">Klubber</div>
            <div className="klubber-kpi-value">
              <CountUp value={stats.totalKlubber} />
            </div>
            <div className="klubber-kpi-sub">i databasen</div>
          </div>
          <div className="klubber-kpi">
            <div className="klubber-kpi-eyebrow">Spillere</div>
            <div className="klubber-kpi-value">
              <CountUp value={stats.totalSpillere} />
            </div>
            <div className="klubber-kpi-sub">registrert</div>
          </div>
          <div className="klubber-kpi">
            <div className="klubber-kpi-eyebrow">Turneringer</div>
            <div className="klubber-kpi-value">
              <CountUp value={stats.totalTurneringer} />
            </div>
            <div className="klubber-kpi-sub">registrert</div>
          </div>
        </div>
      </Reveal>

      {/* ── Featured cards ── */}
      <section className="klubber-section klubber-section-divider">
        <Reveal>
          <div className="klubber-section-head">
            <div>
              <StatsEyebrow>Fremhevet</StatsEyebrow>
              <h2>
                Tre <em className="italic-accent">ledende</em> klubber.
              </h2>
            </div>
          </div>
        </Reveal>
        <Reveal delay={60}>
          <div className="klubber-featured-grid">
            {[
              {
                k: flestSpillere,
                label: "Flest spillere",
                val: flestSpillere.spillere,
                sub: "registrerte spillere",
              },
              {
                k: mestTurneringer,
                label: "Mest turneringer",
                val: mestTurneringer.turneringer,
                sub: "turneringer arrangert",
              },
              {
                k: mestPro,
                label: "Mest pro-talent",
                val: mestPro.pro + mestPro.college,
                sub: "pro + college-commits",
              },
            ].map(({ k, label, val, sub }) => (
              <Link
                key={k.slug}
                href={`/stats/klubber/${k.slug}`}
                style={{ textDecoration: "none" }}
              >
                <div className="klubber-featured-card">
                  <div className="eyebrow">{label.toUpperCase()}</div>
                  <div className="big">{val}</div>
                  <h3>{k.navn}</h3>
                  <div className="sub">
                    {k.kommune} · {k.region} · {sub}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Reveal>

        {/* Søk + grid (klient) */}
        <KlubbdatabaseKlient klubber={SEED_KLUBBER} />
      </section>

      {/* ── Mersalg ── */}
      <div className="klubber-mersalg">
        <Reveal>
          <StatsEyebrow tone="lime">PlayerHQ</StatsEyebrow>
          <h2>
            Spill for{" "}
            <em className="italic-accent" style={{ color: "var(--accent)" }}>
              din klubb
            </em>
            .
          </h2>
          <p>
            Logg runder og se din klubbs statistikk i sanntid. Sammenlign deg
            med andre spillere på banen din.
          </p>
          <div className="klubber-mersalg-ctas">
            <Link href="/registrer">
              <StatsBtn variant="outline" icon="ArrowRight">
                Start gratis
              </StatsBtn>
            </Link>
            <Link href="/stats">
              <StatsBtn variant="ghost" icon="ArrowRight">
                Utforsk stats
              </StatsBtn>
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
