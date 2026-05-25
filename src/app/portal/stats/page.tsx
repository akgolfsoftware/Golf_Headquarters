/**
 * /portal/stats — PlayerHQ bruker dashboard (design 19)
 *
 * Krever requirePortalUser (PLAYER / COACH / ADMIN).
 * Viser:
 *   - Hero med god morgen + brukerens navn
 *   - KPI-strip (snitt 30d, runder, siste runde, beste i 2026)
 *   - Score-trend linjegraf
 *   - SG-profil radar
 *   - AI-insight-cards
 *   - Neste turnering
 *   - Mersalg (GRATIS → PRO)
 */

import "../../(marketing)/stats/stats.css";
import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Zap, Trophy } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { StatsBigRadar } from "@/components/stats/stats-big-radar";
import { StatsTrendGraf } from "@/components/stats/stats-trend-graf";
import { Reveal } from "@/components/stats/reveal";
import { CountUp } from "@/components/stats/count-up";
import { StatsEyebrow } from "@/components/stats/eyebrow";
import { StatsBtn } from "@/components/stats/btn";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Stats-dashboard | PlayerHQ",
  description: "Din personlige golf-statistikk og SG-profil.",
  robots: { index: false },
};

// ---------------------------------------------------------------------------
// Placeholder-data (kobles til ekte data i en fremtidig sprint)
// ---------------------------------------------------------------------------

function hentPlaceholderStats(navn: string) {
  const fornavn = navn.split(" ")[0] ?? "deg";
  return {
    fornavn,
    snittSiste30: 74.2,
    diffForrigeUke: -0.8,
    runderSiste30: 7,
    sisteRunde: { score: 72, tilPar: "E", bane: "Bærum GK", dato: "23. mai" },
    besteIAar: { score: 68, tilPar: -4 },
    scoreTrend: [
      { aar: 2025, snitt: 76.0, antall: 12 },
      { aar: 2026, snitt: 74.2, antall: 7 },
    ],
    sgPerKategori: { ott: -0.8, app: -1.5, arg: -0.6, putt: -0.3 },
    insights: [
      {
        type: "celebrate",
        tittel: "Bedre putting denne uka",
        tekst: "Du hadde 27 putter i siste runde — 1.5 under ditt sesongsnitt.",
      },
      {
        type: "warning",
        tittel: "Innspill er ditt svakeste punkt",
        tekst: "SG: APP på −1.5 per runde. Fokus her vil gi størst effekt.",
      },
      {
        type: "trophy",
        tittel: "Beste 9-hull i 2026",
        tekst: "−3 på fremre ni på Bærum GK. Ny personlig rekord.",
      },
    ],
    nesteTurnering: {
      navn: "Srixon Tour 6",
      bane: "Oslo GK",
      dato: "7. juni",
      paameldte: 42,
      dinRanking: 8,
    },
  };
}

// ---------------------------------------------------------------------------
// Innsikt-kort (Insight card) — farget avhengig av type
// ---------------------------------------------------------------------------

const INSIGHT_ICON = {
  celebrate: Sparkles,
  warning: Zap,
  trophy: Trophy,
} as const;

const INSIGHT_BG = {
  celebrate: "rgba(209,248,67,0.12)",
  warning: "rgba(181,115,23,0.08)",
  trophy: "rgba(0,88,64,0.08)",
} as const;

const INSIGHT_BORDER = {
  celebrate: "rgba(209,248,67,0.4)",
  warning: "rgba(181,115,23,0.3)",
  trophy: "rgba(0,88,64,0.2)",
} as const;

const INSIGHT_ICON_COLOR = {
  celebrate: "var(--s-accent-fg)",
  warning: "#B57317",
  trophy: "var(--s-primary)",
} as const;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function PortalStatsPage() {
  const user = await requirePortalUser();
  const stats = hentPlaceholderStats(user.name ?? "Spiller");
  const erGratis = user.tier === "GRATIS";

  const now = new Date();
  const timer = now.getHours();
  const hilsen =
    timer < 12 ? "God morgen" : timer < 17 ? "God ettermiddag" : "God kveld";

  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section style={{ padding: "48px 64px 32px" }}>
        <Reveal>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 32 }}>
            <div>
              <h1
                className="font-display"
                style={{ fontSize: "clamp(32px, 5vw, 56px)", lineHeight: 1.05, fontWeight: 600, letterSpacing: "-0.03em" }}
              >
                {hilsen},{" "}
                <em style={{ fontStyle: "italic", fontWeight: 400, color: "var(--s-primary)" }}>
                  {stats.fornavn}
                </em>
                .
              </h1>
              <p className="stats-hero-sub" style={{ maxWidth: 560, marginTop: 12 }}>
                Du spilte {stats.runderSiste30} runder siste 30 dager. Snittet ditt{" "}
                {stats.diffForrigeUke < 0 ? "forbedret seg" : "gikk opp"}{" "}
                <strong className="font-mono">
                  {Math.abs(stats.diffForrigeUke).toFixed(1)} strokes
                </strong>{" "}
                mot uka før.
              </p>
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--s-muted-fg)",
                textAlign: "right",
                flexShrink: 0,
              }}
            >
              {now.toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long" }).toUpperCase()}
              <br />
              {now.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
            <Link href="/portal/gjennomfore">
              <StatsBtn variant="primary" icon="ArrowRight" size="md">
                Logg ny runde
              </StatsBtn>
            </Link>
            <Link href="/stats/min-progresjon">
              <StatsBtn variant="secondary" size="md">
                Se min progresjon
              </StatsBtn>
            </Link>
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
            <div className="stats-kpi-eyebrow">Siste 30 dager</div>
            <div className="stats-kpi-value">
              <CountUp value={stats.snittSiste30} decimals={1} />
            </div>
            <div className="stats-kpi-sub" style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span
                style={{
                  color: stats.diffForrigeUke < 0 ? "var(--s-primary)" : "#BE3D3D",
                  fontWeight: 600,
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                }}
              >
                {stats.diffForrigeUke > 0 ? "+" : ""}
                {stats.diffForrigeUke.toFixed(1)}
              </span>{" "}
              fra forrige uke
            </div>
          </div>
          <div className="stats-kpi">
            <div className="stats-kpi-eyebrow">Runder</div>
            <div className="stats-kpi-value">
              <CountUp value={stats.runderSiste30} />
            </div>
            <div className="stats-kpi-sub">siste 30 dager</div>
          </div>
          <div className="stats-kpi">
            <div className="stats-kpi-eyebrow">Siste runde</div>
            <div className="stats-kpi-value">
              {stats.sisteRunde.score}{" "}
              <span style={{ fontSize: 18, color: "var(--s-muted-fg)" }}>
                ({stats.sisteRunde.tilPar})
              </span>
            </div>
            <div className="stats-kpi-sub">
              {stats.sisteRunde.bane} · {stats.sisteRunde.dato}
            </div>
          </div>
          <div className="stats-kpi">
            <div className="stats-kpi-eyebrow">Beste i 2026</div>
            <div className="stats-kpi-value" style={{ color: "var(--s-primary)" }}>
              {stats.besteIAar.score}
            </div>
            <div className="stats-kpi-sub">
              {stats.besteIAar.tilPar < 0 ? stats.besteIAar.tilPar : `+${stats.besteIAar.tilPar}`} til par
            </div>
          </div>
        </div>
      </Reveal>

      {/* Score-trend + SG-radar */}
      <section className="stats-section stats-section-divider">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <Reveal>
            <div
              style={{
                background: "var(--s-card)",
                border: "1px solid var(--s-border)",
                borderRadius: "var(--s-r-lg)",
                padding: 32,
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
                Score-trend · lavere = bedre
              </div>
              <StatsTrendGraf data={stats.scoreTrend} height={220} />
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div
              style={{
                background: "var(--s-card)",
                border: "1px solid var(--s-border)",
                borderRadius: "var(--s-r-lg)",
                padding: 32,
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
                SG-profil · vs Tour-snitt
              </div>
              <StatsBigRadar
                axes={["OTT", "APP", "ARG", "PUTT"]}
                you={[
                  0.5 + stats.sgPerKategori.ott / 4,
                  0.5 + stats.sgPerKategori.app / 4,
                  0.5 + stats.sgPerKategori.arg / 4,
                  0.5 + stats.sgPerKategori.putt / 4,
                ]}
                them={[0.85, 0.85, 0.85, 0.85]}
                youLabel="Du"
                themLabel="Tour-snitt"
              />
              <div
                style={{
                  marginTop: 16,
                  textAlign: "center",
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--s-muted-fg)",
                }}
              >
                Største gap: Innspill (−1.5) ·{" "}
                <Link
                  href="/stats/min-progresjon"
                  style={{ color: "var(--s-primary)", textDecoration: "none" }}
                >
                  Åpne full sammenligning →
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* AI-insights */}
      <section className="stats-section stats-section-divider">
        <Reveal>
          <div className="stats-section-head">
            <div>
              <StatsEyebrow>Insights</StatsEyebrow>
              <h2 className="font-display">
                Tre{" "}
                <em style={{ fontStyle: "italic", fontWeight: 400, color: "var(--s-primary)" }}>
                  observasjoner
                </em>{" "}
                denne uka.
              </h2>
            </div>
          </div>
        </Reveal>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {stats.insights.map((ins, i) => {
            const type = ins.type as "celebrate" | "warning" | "trophy";
            const Icon = INSIGHT_ICON[type];
            return (
              <Reveal key={i} delay={i * 80}>
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    padding: 20,
                    background: INSIGHT_BG[type],
                    border: `1px solid ${INSIGHT_BORDER[type]}`,
                    borderRadius: "var(--s-r-md)",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.6)",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                      color: INSIGHT_ICON_COLOR[type],
                    }}
                  >
                    <Icon size={16} strokeWidth={2} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 600,
                        fontSize: 15,
                        marginBottom: 4,
                      }}
                    >
                      {ins.tittel}
                    </div>
                    <div style={{ fontSize: 14, color: "var(--s-muted-fg)", lineHeight: 1.5 }}>
                      {ins.tekst}
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Neste turnering */}
      <section className="stats-section stats-section-divider">
        <Reveal>
          <div
            style={{
              background: "var(--s-primary)",
              color: "var(--s-bg)",
              borderRadius: "var(--s-r-xl)",
              padding: 40,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24 }}>
              <div>
                <StatsEyebrow tone="lime">Din plan</StatsEyebrow>
                <h2
                  className="font-display"
                  style={{ fontSize: 32, marginTop: 12, color: "var(--s-bg)", lineHeight: 1.1 }}
                >
                  {stats.nesteTurnering.dato} —{" "}
                  <em style={{ color: "var(--s-accent)", fontStyle: "italic", fontWeight: 400 }}>
                    {stats.nesteTurnering.navn}
                  </em>
                </h2>
                <div style={{ marginTop: 12, color: "rgba(250,250,247,0.7)", fontSize: 15 }}>
                  {stats.nesteTurnering.bane} · {stats.nesteTurnering.paameldte} norske påmeldt · Du er #{stats.nesteTurnering.dinRanking} i ranking
                </div>
              </div>
              <Link href="/portal/kalender">
                <StatsBtn variant="outline" size="md">
                  Forberedelse
                </StatsBtn>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Mersalg — kun for GRATIS */}
      {erGratis && (
        <div className="stats-mersalg-wrap">
          <div className="stats-mersalg">
            <div>
              <StatsEyebrow tone="lime">Oppgrader til PRO</StatsEyebrow>
              <h2>
                Automatisk SG-tracking{" "}
                <em className="stats-italic-accent">inkludert</em>.
              </h2>
              <p>
                Med PlayerHQ PRO logges SG automatisk, du får ukentlige AI-analyser og
                ubegrenset sammenligninger mot proffene.
              </p>
              <div className="stats-mersalg-ctas">
                <Link href="/portal/meg/abonnement">
                  <StatsBtn variant="primary" size="md" icon="ArrowRight">
                    Oppgrader nå
                  </StatsBtn>
                </Link>
              </div>
            </div>
            <div className="stats-mersalg-card">
              <h4>Inkludert i PRO · 300 kr/mnd</h4>
              <ul>
                <li>Automatisk SG-tracking</li>
                <li>Ukentlig AI-analyse</li>
                <li>Ubegrenset sammenligninger</li>
                <li>Eksport til PDF / Excel</li>
              </ul>
              <div className="stats-mersalg-price">
                <strong>Avbryt når som helst</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
