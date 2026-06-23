/**
 * /stats/regions — Region-explorer oversikt med Norgeskart
 * Pixel-perfect port av design-brief 25-regions.md
 */

import "../stats.css";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatsEyebrow } from "@/components/stats/eyebrow";
import { Reveal } from "@/components/stats/reveal";
import { CountUp } from "@/components/stats/count-up";
import { StatsBtn } from "@/components/stats/btn";
import { StatsNorgeskartWrapper } from "./norgeskart-wrapper";
import { RegionCards } from "./region-cards";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Regioner: AK Golf Stats",
  description:
    "Norsk golf region for region. Utforsk klubber, spillere og turneringer i Øst, Vest, Midt, Nord og Sør-Norge.",
  alternates: { canonical: "https://akgolf.no/stats/regions" },
  openGraph: {
    title: "Regioner: AK Golf Stats",
    description: "Golf i din region: spillere, klubber og turneringer.",
    url: "https://akgolf.no/stats/regions",
  },
};

// ---------------------------------------------------------------------------
// Static region data (DB aggregering av bio-felt er fremtidig arbeid)
// ---------------------------------------------------------------------------

const REGION_DATA = [
  { slug: "ost",  navn: "Øst-Norge",  klubber: 32, spillere: 687, turneringer: 156, pro: 8  },
  { slug: "vest", navn: "Vest-Norge",  klubber: 24, spillere: 412, turneringer: 98,  pro: 3  },
  { slug: "midt", navn: "Midt-Norge",  klubber: 14, spillere: 198, turneringer: 54,  pro: 1  },
  { slug: "nord", navn: "Nord-Norge",  klubber: 6,  spillere: 67,  turneringer: 18,  pro: 0  },
  { slug: "sor",  navn: "Sør-Norge",   klubber: 12, spillere: 134, turneringer: 42,  pro: 0  },
];

const FAKTA = [
  "Mest pro-spillere kommer fra Øst (8 av 12)",
  "Vest har flest spillere per klubb (17 i snitt)",
  "Sør har høyest snitt-prestasjon på Srixon Tour",
  "Nord-Norge har landets lengste golfdag: midnattssol i juni",
];

// Bane.region lagres som norsk navn ("Øst" | "Vest" | ...) — map til region-slug.
const REGION_NAVN_TIL_SLUG: Record<string, string> = {
  Øst: "ost",
  Vest: "vest",
  Midt: "midt",
  Nord: "nord",
  Sør: "sor",
};

async function hentNorgeTotalt() {
  const [totalSpillere, totalTurneringer, klubbPerRegion] = await Promise.all([
    prisma.publicPlayer.count({ where: { country: "NO", isActive: true } }).catch(() => 0),
    prisma.tournament.count({ where: { country: "NO", status: "COMPLETED" } }).catch(() => 0),
    prisma.bane
      .groupBy({ by: ["region"], _count: { _all: true } })
      .catch(() => [] as Array<{ region: string; _count: { _all: number } }>),
  ]);

  // Ekte klubb-antall per region-slug (tom = tabell mangler / ingen baner).
  const klubberPerSlug: Record<string, number> = {};
  for (const row of klubbPerRegion) {
    const slug = REGION_NAVN_TIL_SLUG[row.region];
    if (slug) klubberPerSlug[slug] = (klubberPerSlug[slug] ?? 0) + row._count._all;
  }
  const totalKlubber = Object.values(klubberPerSlug).reduce((s, n) => s + n, 0);

  return {
    klubber: totalKlubber > 0 ? totalKlubber : 88,
    klubberPerSlug,
    spillere: totalSpillere > 0 ? totalSpillere : 1498,
    pro: 12,
    college: 22,
    turneringer: totalTurneringer > 0 ? totalTurneringer : 287,
  };
}

export default async function RegionsPage() {
  const norge = await hentNorgeTotalt();

  // Overstyr klubb-antallet per region med ekte tall fra banedatabasen når det finnes.
  const regionData = REGION_DATA.map((r) => ({
    ...r,
    klubber: norge.klubberPerSlug[r.slug] ?? r.klubber,
  }));

  return (
    <div>
      {/* ── HERO ── */}
      <section className="stats-hero">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.3fr 1fr",
            gap: 64,
            alignItems: "flex-start",
          }}
        >
          <Reveal>
            <StatsEyebrow>AK Golf Stats · Regioner</StatsEyebrow>
            <h1>
              Norsk golf,{" "}
              <em className="stats-italic-accent">region for region</em>.
            </h1>
            <p className="stats-hero-sub" style={{ maxWidth: 520 }}>
              Velg en region for å utforske klubber, spillere og turneringer.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <StatsNorgeskartWrapper />
          </Reveal>
        </div>
      </section>

      {/* ── KPI NORGE TOTALT ── */}
      <div className="stats-kpi-strip stats-kpi-strip-4">
        <div className="stats-kpi">
          <div className="stats-kpi-eyebrow">Norske golfklubber</div>
          <div className="stats-kpi-value">
            <CountUp value={norge.klubber} />
          </div>
        </div>
        <div className="stats-kpi">
          <div className="stats-kpi-eyebrow">Spillere i databasen</div>
          <div className="stats-kpi-value">
            <CountUp value={norge.spillere} />
          </div>
        </div>
        <div className="stats-kpi">
          <div className="stats-kpi-eyebrow">Norske pro-spillere</div>
          <div className="stats-kpi-value">
            <CountUp value={norge.pro} />
          </div>
        </div>
        <div className="stats-kpi">
          <div className="stats-kpi-eyebrow">Norske i college</div>
          <div className="stats-kpi-value">
            <CountUp value={norge.college} />
          </div>
        </div>
      </div>

      {/* ── 5 REGION-CARDS ── */}
      <section className="stats-section stats-section-divider">
        <Reveal>
          <div className="stats-section-head">
            <div>
              <StatsEyebrow>Regioner</StatsEyebrow>
              <h2>Velg din region.</h2>
            </div>
          </div>
        </Reveal>

        <RegionCards regions={regionData} />
      </section>

      {/* ── "HVEM DOMINERER HVOR?" ── */}
      <section className="stats-section stats-section-divider">
        <Reveal>
          <div className="stats-section-head">
            <div>
              <StatsEyebrow>Fakta</StatsEyebrow>
              <h2>
                Hvem dominerer{" "}
                <em className="stats-italic-accent">hvor</em>?
              </h2>
            </div>
          </div>
        </Reveal>

        <div className="stats-grid-2" style={{ marginTop: 24 }}>
          {FAKTA.map((f, i) => (
            <Reveal key={i} delay={i * 60}>
              <div
                style={{
                  background: "var(--s-card)",
                  border: "1px solid var(--s-border)",
                  borderRadius: "var(--s-r-lg)",
                  padding: 24,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 16,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    background: "var(--s-accent)",
                    flexShrink: 0,
                    marginTop: 6,
                  }}
                />
                <span style={{ fontSize: 15, lineHeight: 1.6 }}>{f}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── MERSALG ── */}
      <div className="stats-mersalg-wrap">
        <Reveal>
          <div className="stats-mersalg" style={{ textAlign: "center", padding: "64px 48px" }}>
            <StatsEyebrow tone="lime">PlayerHQ</StatsEyebrow>
            <h2 style={{ marginTop: 16 }}>
              Logg rundene dine.{" "}
              <em className="stats-italic-accent">Bli synlig.</em>
            </h2>
            <p style={{ marginTop: 16, maxWidth: 480, margin: "16px auto 32px" }}>
              Spillere som logger i PlayerHQ havner automatisk i
              region-statistikken. Bli en del av tallene.
            </p>
            <Link href="/portal">
              <StatsBtn variant="primary" icon="ArrowRight">
                Prøv PlayerHQ gratis
              </StatsBtn>
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
