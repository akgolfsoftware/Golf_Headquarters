/**
 * /stats/baner — Banedatabase (design 13)
 * Pixel-perfect port av design-handoff-stats-2026-05-25/project/js/pages-c.jsx (Banedatabase)
 *
 * Data: ekte Prisma-queries via src/lib/stats/bane-queries.ts
 * ISR 1 time.
 */

import "./baner.css";
import "../stats.css";
import type { Metadata } from "next";
import Link from "next/link";
import { StatsEyebrow } from "@/components/stats/eyebrow";
import { Reveal } from "@/components/stats/reveal";
import { CountUp } from "@/components/stats/count-up";
import { StatsBtn } from "@/components/stats/btn";
import { BanedatabaseKlient } from "./bane-klient";
import {
  hentAlleBaner,
  hentBanedatabaseStats,
} from "@/lib/stats/bane-queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Banedatabase — alle norske golfbaner | AK Golf Stats",
  description:
    "Vanskelighetsgrad, slope, course rating og ekte turneringsstatistikk fra 50+ norske golfbaner. Finn din bane og se hvem som dominerer.",
  alternates: { canonical: "https://akgolf.no/stats/baner" },
  openGraph: {
    title: "Banedatabase — alle norske golfbaner | AK Golf Stats",
    description:
      "Slope, CR, turneringsdata og score-distribusjon for norske golfbaner.",
    url: "https://akgolf.no/stats/baner",
  },
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function BanedatabasePage() {
  // Tabell eksisterer ikke før migrasjonen er deployet — fallback til tomme arrays
  const [stats, baner] = await Promise.all([
    hentBanedatabaseStats().catch(() => ({
      totalBaner: 0,
      totalTurneringer: 0,
      totalSpillere: 0,
    })),
    hentAlleBaner().catch(() => []),
  ]);

  return (
    <div className="baner-page bg-background text-foreground">
      {/* ── Hero ── */}
      <section className="baner-hero">
        <Reveal>
          <Link href="/stats" className="breadcrumb">
            ← AK Golf Stats
          </Link>
          <StatsEyebrow>AK Golf Stats · Baner</StatsEyebrow>
          <h1>
            Alle <em className="italic-accent">norske</em> golfbaner.
          </h1>
          <p className="baner-hero-sub">
            Vanskelighetsgrad, slope, course rating + vår statistikk fra ekte
            turneringer på hver bane.
          </p>
        </Reveal>
      </section>

      {/* ── KPI Strip ── */}
      <Reveal>
        <div className="baner-kpi-strip">
          <div className="baner-kpi">
            <div className="baner-kpi-eyebrow">Baner</div>
            <div className="baner-kpi-value">
              <CountUp value={stats.totalBaner} />
            </div>
            <div className="baner-kpi-sub">i databasen</div>
          </div>
          <div className="baner-kpi">
            <div className="baner-kpi-eyebrow">Turneringer</div>
            <div className="baner-kpi-value">
              <CountUp value={stats.totalTurneringer} />
            </div>
            <div className="baner-kpi-sub">arrangert her</div>
          </div>
          <div className="baner-kpi">
            <div className="baner-kpi-eyebrow">Spillere</div>
            <div className="baner-kpi-value">
              <CountUp value={stats.totalSpillere} />
            </div>
            <div className="baner-kpi-sub">har spilt her</div>
          </div>
        </div>
      </Reveal>

      {/* ── Søk + grid (klient-komponent) ── */}
      <section className="baner-section baner-section-divider">
        <BanedatabaseKlient baner={baner} />
      </section>

      {/* ── Mersalg ── */}
      <div className="baner-mersalg">
        <Reveal>
          <StatsEyebrow tone="lime">PlayerHQ</StatsEyebrow>
          <h2>
            Spill smarter på{" "}
            <em className="italic-accent" style={{ color: "var(--accent)" }}>
              din bane
            </em>
            .
          </h2>
          <p>
            Logg runder, mål Strokes Gained og se nøyaktig hvilke hull du taper
            strokes på. Automatisk baneanalyse inkludert.
          </p>
          <div className="baner-mersalg-ctas">
            <Link href="/auth/signup">
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
