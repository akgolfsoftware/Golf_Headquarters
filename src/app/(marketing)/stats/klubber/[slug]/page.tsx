/**
 * /stats/klubber/[slug] — Klubb-detalj (design 22 — detalj)
 *
 * Datakilde: SEED_KLUBBER + aggregert spillerdata fra DB.
 * ISR 1 time.
 */

import "./../klubber.css";
import "../../stats.css";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SEED_KLUBBER } from "../page";
import { StatsEyebrow } from "@/components/stats/eyebrow";
import { Reveal } from "@/components/stats/reveal";
import { CountUp } from "@/components/stats/count-up";
import { StatsBtn } from "@/components/stats/btn";

export const revalidate = 3600;

// ---------------------------------------------------------------------------
// Static params
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return SEED_KLUBBER.map((k) => ({ slug: k.slug }));
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const klubb = SEED_KLUBBER.find((k) => k.slug === slug);
  if (!klubb) return { title: "Klubb ikke funnet" };

  return {
    title: `${klubb.navn}: Klubbstatistikk | AK Golf Stats`,
    description: `${klubb.spillere} spillere, ${klubb.pro} pro, ${klubb.junior} junior. ${klubb.turneringer} turneringer arrangert av ${klubb.navn}.`,
    alternates: { canonical: `https://akgolf.no/stats/klubber/${slug}` },
    openGraph: {
      title: `${klubb.navn} | AK Golf Stats`,
      description: `${klubb.spillere} spillere · ${klubb.turneringer} turneringer`,
      url: `https://akgolf.no/stats/klubber/${slug}`,
    },
  };
}

// ---------------------------------------------------------------------------
// Seed spillere per klubb (topp 20 etter snittscore)
// ---------------------------------------------------------------------------

const SPILLERE_PER_KLUBB: Record<
  string,
  { navn: string; tier: string; snitt: number; antall: number }[]
> = {
  "oslo-gk": [
    { navn: "Anders Halvorsen", tier: "Amateur",  snitt: 68.5, antall: 28 },
    { navn: "Viggo Halvorsen",  tier: "Pro PGA",   snitt: 70.9, antall: 12 },
    { navn: "Sofie Næss",       tier: "Junior",    snitt: 73.4, antall: 32 },
    { navn: "Petter Hovland",   tier: "Junior",    snitt: 74.2, antall: 18 },
  ],
  "baerum-gk": [
    { navn: "Kristoffer Vangen",  tier: "Pro",     snitt: 70.4, antall: 22 },
    { navn: "Marius Larsen",      tier: "Junior",  snitt: 72.8, antall: 28 },
    { navn: "Maria Olsen",        tier: "Junior",  snitt: 72.4, antall: 24 },
    { navn: "Fredrik Hovland",    tier: "Amateur", snitt: 71.2, antall: 29 },
    { navn: "Kris Andersen",      tier: "Amateur", snitt: 72.1, antall: 31 },
  ],
  "gfgk": [
    { navn: "Petter Hagen",     tier: "Junior",  snitt: 74.1, antall: 24 },
    { navn: "Andreas Mæhlum",   tier: "College", snitt: 71.4, antall: 19 },
  ],
  "stavanger-gk": [
    { navn: "Selma Halland",    tier: "Pro",     snitt: 70.1, antall: 26 },
    { navn: "Petter Hovland",   tier: "Junior",  snitt: 73.5, antall: 22 },
  ],
};

// ---------------------------------------------------------------------------
// Distribusjon-data (statisk illustrasjon)
// ---------------------------------------------------------------------------

const DONUT_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--secondary))", "hsl(var(--muted-foreground))"];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function KlubbDetaljPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const klubb = SEED_KLUBBER.find((k) => k.slug === slug);
  if (!klubb) notFound();

  // DB-turneringer der location matcher
  const turneringer = await prisma.tournament.findMany({
    where: {
      location: { contains: klubb.kommune, mode: "insensitive" },
      mergedIntoId: null,
    },
    orderBy: { startDate: "desc" },
    take: 5,
    select: { id: true, name: true, startDate: true, status: true, norskeAntall: true },
  });

  const spillere = SPILLERE_PER_KLUBB[slug] ?? [];

  const fordeling = [
    { label: "Pro",     n: klubb.pro,            color: DONUT_COLORS[0] },
    { label: "College", n: klubb.college,         color: DONUT_COLORS[1] },
    { label: "Junior",  n: klubb.junior,          color: DONUT_COLORS[2] },
    {
      label: "Amatør",
      n: Math.max(0, klubb.spillere - klubb.pro - klubb.college - klubb.junior),
      color: DONUT_COLORS[3],
    },
  ].filter((f) => f.n > 0);

  return (
    <div className="klubber-page bg-background text-foreground">
      {/* ── Hero ── */}
      <section className="klubber-hero">
        <Reveal>
          <Link href="/stats/klubber" className="breadcrumb">
            ← Klubbdatabase
          </Link>
          <StatsEyebrow>
            {klubb.kommune.toUpperCase()} · {klubb.region.toUpperCase()}
          </StatsEyebrow>
          <h1>{klubb.navn}</h1>
        </Reveal>
      </section>

      {/* ── KPI Strip ── */}
      <Reveal>
        <div className="klubber-kpi-strip cols-4">
          <div className="klubber-kpi">
            <div className="klubber-kpi-eyebrow">Spillere</div>
            <div className="klubber-kpi-value">
              <CountUp value={klubb.spillere} />
            </div>
            <div className="klubber-kpi-sub">registrert</div>
          </div>
          <div className="klubber-kpi">
            <div className="klubber-kpi-eyebrow">Pro</div>
            <div className="klubber-kpi-value">{klubb.pro}</div>
            <div className="klubber-kpi-sub">proffspillere</div>
          </div>
          <div className="klubber-kpi">
            <div className="klubber-kpi-eyebrow">College</div>
            <div className="klubber-kpi-value">{klubb.college}</div>
            <div className="klubber-kpi-sub">college-commits</div>
          </div>
          <div className="klubber-kpi">
            <div className="klubber-kpi-eyebrow">Turneringer</div>
            <div className="klubber-kpi-value">
              <CountUp value={klubb.turneringer} />
            </div>
            <div className="klubber-kpi-sub">arrangert</div>
          </div>
        </div>
      </Reveal>

      {/* ── Spillertabell ── */}
      {spillere.length > 0 && (
        <section className="klubber-section klubber-section-divider">
          <Reveal>
            <div className="klubber-section-head">
              <div>
                <StatsEyebrow>Spillerne våre</StatsEyebrow>
                <h2>
                  Topp spillere etter{" "}
                  <em className="italic-accent">snittscore</em>.
                </h2>
              </div>
            </div>
          </Reveal>
          <Reveal delay={60}>
            <table className="klubber-dtable">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Spiller</th>
                  <th>Kategori</th>
                  <th className="num">Snitt</th>
                  <th className="num">Runder</th>
                </tr>
              </thead>
              <tbody>
                {spillere.map((s, i) => (
                  <tr key={s.navn}>
                    <td
                      className="mono"
                      style={{
                        color:
                          i < 3 ? "var(--primary)" : "var(--muted-foreground)",
                        fontWeight: i < 3 ? 600 : 400,
                      }}
                    >
                      {i + 1}
                    </td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{s.navn}</span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: "var(--muted-foreground)",
                          background: "var(--secondary)",
                          padding: "2px 8px",
                          borderRadius: 4,
                        }}
                      >
                        {s.tier}
                      </span>
                    </td>
                    <td
                      className="num"
                      style={{
                        color: i < 3 ? "var(--primary)" : "inherit",
                        fontWeight: i < 3 ? 600 : 500,
                      }}
                    >
                      {s.snitt.toFixed(1)}
                    </td>
                    <td className="num">{s.antall}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </section>
      )}

      {/* ── Distribusjon + turneringer ── */}
      <section className="klubber-section klubber-section-divider">
        <div className="klubber-grid-2">
          {/* Spiller-distribusjon */}
          <Reveal>
            <div>
              <StatsEyebrow>Distribusjon</StatsEyebrow>
              <h2 style={{ marginTop: 12, marginBottom: 24 }}>
                Spiller-<em className="italic-accent">profil</em>.
              </h2>
              <div
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  padding: 28,
                }}
              >
                <div className="klubber-donut-legend">
                  {fordeling.map((f) => (
                    <div key={f.label} className="klubber-donut-legend-row">
                      <span>
                        <span
                          className="klubber-donut-swatch"
                          style={{ background: f.color }}
                        />
                        {f.label}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontWeight: 500,
                          fontSize: 14,
                        }}
                      >
                        {f.n}
                      </span>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: "1px dashed var(--border)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.12em",
                    color: "var(--muted-foreground)",
                  }}
                >
                  {klubb.spillere} SPILLERE TOTALT
                </div>
              </div>
            </div>
          </Reveal>

          {/* Turneringer */}
          <Reveal delay={100}>
            <div>
              <StatsEyebrow>Turneringer</StatsEyebrow>
              <h2 style={{ marginTop: 12, marginBottom: 24 }}>
                Siste <em className="italic-accent">aktivitet</em>.
              </h2>
              {turneringer.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {turneringer.map((t) => (
                    <div
                      key={t.id}
                      style={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius)",
                        padding: "14px 18px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 10,
                            color: "var(--muted-foreground)",
                            marginTop: 4,
                          }}
                        >
                          {t.startDate.toLocaleDateString("nb-NO", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    padding: 32,
                    textAlign: "center",
                    color: "var(--muted-foreground)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    letterSpacing: "0.08em",
                  }}
                >
                  {klubb.turneringer} turneringer registrert på denne banen.
                  <br />
                  Data synkes løpende.
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Mersalg ── */}
      <div className="klubber-mersalg">
        <Reveal>
          <StatsEyebrow tone="lime">PlayerHQ</StatsEyebrow>
          <h2>
            Spill for{" "}
            <em className="italic-accent" style={{ color: "var(--accent)" }}>
              {klubb.navn}
            </em>
            .
          </h2>
          <p>
            Logg runder og hev klubbens snitt. Sammenlign deg med de beste fra
            din klubb.
          </p>
          <div className="klubber-mersalg-ctas">
            <Link href="/auth/signup">
              <StatsBtn variant="outline" icon="ArrowRight">
                Start gratis
              </StatsBtn>
            </Link>
            <Link href="/stats/klubber">
              <StatsBtn variant="ghost" icon="ArrowRight">
                Alle klubber
              </StatsBtn>
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
