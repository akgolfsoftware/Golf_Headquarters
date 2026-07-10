/**
 * /stats/verktoy — hub (design 26)
 *
 * Liste over 5 kalkulatorer som kort. Statisk, ISR 24t.
 */

import "../stats.css";
import type { Metadata } from "next";
import Link from "next/link";
import { Gauge, Target, LineChart, Sparkles, Crosshair } from "lucide-react";
import { StatsEyebrow } from "@/components/stats/eyebrow";
import { Reveal } from "@/components/stats/reveal";
import { StatsBtn } from "@/components/stats/btn";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Golf-verktøy | AK Golf Stats",
  description:
    "Score til HCP, Tour-ekvivalent, WHS-kalkulator, SG-estimator og avstandskonverter. Gratis verktøy fra AK Golf.",
  alternates: { canonical: "https://akgolf.no/stats/verktoy" },
  openGraph: {
    title: "Golf-verktøy | AK Golf Stats",
    description: "5 gratis verktøy: Score-til-HCP, Tour-ekvivalent, WHS, SG-estimator, avstand.",
    url: "https://akgolf.no/stats/verktoy",
  },
};

const TOOLS = [
  {
    id: "score-til-hcp",
    navn: "Score til HCP",
    desc: "Hvilken HCP har du basert på snittscoren din? Broadie-basert estimat.",
    icon: Gauge,
    farge: "var(--s-primary)",
  },
  {
    id: "tour-ekvivalent",
    navn: "Tour-ekvivalent",
    desc: "Hva tilsvarer scoren din på en PGA Tour-bane med slope 145?",
    icon: Target,
    farge: "var(--s-primary)",
  },
  {
    id: "whs-kalkulator",
    navn: "WHS-kalkulator",
    desc: "Full WHS handicap fra dine 8 beste runder av siste 20. Ekte NHF-metode.",
    icon: LineChart,
    farge: "var(--s-primary)",
  },
  {
    id: "sg-estimator",
    navn: "SG-estimator",
    desc: "Estimert SG-fordeling fra snittscoren din, basert på Broadie-tabell.",
    icon: Sparkles,
    farge: "var(--s-primary)",
  },
  {
    id: "avstand",
    navn: "Avstand",
    desc: "Yards ↔ meter konverter, kontekstualisert for ditt nivå.",
    icon: Crosshair,
    farge: "var(--s-primary)",
  },
] as const;

export default function VerktoyHubPage() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="stats-hero" style={{ paddingBottom: 40 }}>
        <Reveal>
          <StatsEyebrow>AK Golf Stats · Verktøy</StatsEyebrow>
          <h1 className="font-display">
            Beregn det du{" "}
            <em className="stats-italic-accent">lurer på</em>.
          </h1>
          <p className="stats-hero-sub" style={{ maxWidth: 580 }}>
            Score til HCP, Tour-ekvivalent, WHS, SG-estimator. Alt gratis, alt nøyaktig.
          </p>
        </Reveal>
      </section>

      {/* Verktøy-grid */}
      <section className="stats-section stats-section-divider">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
        >
          {TOOLS.map((t, i) => {
            const Icon = t.icon;
            return (
              <Reveal key={t.id} delay={i * 60}>
                <Link
                  href={`/stats/verktoy/${t.id}`}
                  style={{ textDecoration: "none", color: "inherit", display: "block" }}
                >
                  <div
                    className="stats-norske-card"
                    style={{
                      minHeight: 200,
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: "var(--s-secondary)",
                        display: "grid",
                        placeItems: "center",
                        color: t.farge,
                      }}
                    >
                      <Icon size={22} strokeWidth={1.75} />
                    </div>
                    <div>
                      <div
                        className="font-display"
                        style={{ fontWeight: 600, fontSize: 22, lineHeight: 1.1 }}
                      >
                        {t.navn}
                      </div>
                      <p style={{ fontSize: 14, color: "var(--s-muted-fg)", marginTop: 8, lineHeight: 1.5 }}>
                        {t.desc}
                      </p>
                    </div>
                    <div
                      style={{
                        marginTop: "auto",
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "var(--s-primary)",
                        fontWeight: 600,
                      }}
                    >
                      PRØV →
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Mersalg */}
      <div className="stats-mersalg-wrap">
        <div className="stats-mersalg">
          <div>
            <StatsEyebrow tone="lime">Vil du mer?</StatsEyebrow>
            <h2>
              Spor SG-en din{" "}
              <em className="stats-italic-accent">automatisk</em>.
            </h2>
            <p>
              Med PlayerHQ PRO logges SG automatisk fra Trackman. Ingen kalkulator nødvendig. Treneren din ser det samme som deg.
            </p>
            <div className="stats-mersalg-ctas">
              <Link href="/portal/meg/abonnement">
                <StatsBtn variant="primary" size="md" icon="ArrowRight">
                  Kom i gang
                </StatsBtn>
              </Link>
              <Link href="/stats/sg-sammenlign">
                <StatsBtn variant="outline" size="md">
                  Prøv SG-sammenligning
                </StatsBtn>
              </Link>
            </div>
          </div>
          <div className="stats-mersalg-card">
            <h4>Verktøy-pakken i PlayerHQ PRO</h4>
            <ul>
              <li>Automatisk SG-tracking</li>
              <li>Ukentlig SG-rapport</li>
              <li>WHS beregnes automatisk</li>
              <li>AI-kalibrering av baner</li>
            </ul>
            <div className="stats-mersalg-price">
              <strong>299 kr / mnd</strong> · avbryt når som helst
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
