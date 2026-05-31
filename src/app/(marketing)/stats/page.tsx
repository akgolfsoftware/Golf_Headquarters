/**
 * /stats — AK Golf Stats hub-landingsside
 * Pixel-perfect port of design-handoff-stats-2026-05-25/project/js/hub.jsx
 *
 * Seksjoner:
 *   1. HubHero    — editorial hero med Flag-bakgrunns-glyph, grid 1.4fr/1fr
 *   2. KPIStrip   — 3 KPI-blokker med CountUp og live DB-data
 *   3. NorskeIAksjon — 3-kolonne spillerkort-grid
 *   4. HubBento   — 6-kol bento (4+2+2+4 spans)
 *   5. MersalgBand — mørk primary-bakgrunn, Crosshair-glyph, fordeler-card
 *   6. TrenerSteg — 3-stegs storytelling
 *   7. BunnCTA    — sentrert CTA
 */

import "./stats.css";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatsIcon } from "@/components/stats/icon";
import { FlagGlyph } from "@/components/stats/flag-glyph";
import { StatsEyebrow } from "@/components/stats/eyebrow";
import { Reveal } from "@/components/stats/reveal";
import { CountUp } from "@/components/stats/count-up";
import { StatsBtn } from "@/components/stats/btn";
import { SparkBars } from "@/components/stats/spark-bars";
import { MiniRadar } from "@/components/stats/mini-radar";

export const revalidate = 3600; // 1 time

export const metadata: Metadata = {
  title: "AK Golf Stats — gratis statistikk for norsk golf",
  description:
    "Følg norske golfspillere live, utforsk PGA Tour-statistikk og sammenlign din egen Strokes Gained med proffene. Gratis verktøy fra AK Golf — bygget for spillere, foreldre og trenere.",
  alternates: { canonical: "https://akgolf.no/stats" },
  openGraph: {
    title: "AK Golf Stats — gratis statistikk for norsk golf",
    description:
      "Norske spillere i aksjon, PGA Tour-tall, og din egen SG sammenlignet med Rory. Gratis fra AK Golf.",
    url: "https://akgolf.no/stats",
    type: "website",
  },
};

// ---------------------------------------------------------------------------
// Data layer
// ---------------------------------------------------------------------------

async function hentLiveSnapshot() {
  const now = new Date();
  const ukeStart = new Date(now);
  const dayOfWeek = now.getDay();
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  ukeStart.setDate(ukeStart.getDate() - daysSinceMonday);
  ukeStart.setHours(0, 0, 0, 0);

  const ukeSlutt = new Date(ukeStart);
  ukeSlutt.setDate(ukeSlutt.getDate() + 7);

  const [norskeIAksjon, kommendeTurneringer, sisteDataGolfSync] =
    await Promise.all([
      prisma.publicPlayerEntry.count({
        where: {
          player: { country: "NO" },
          tournament: {
            startDate: { lte: ukeSlutt },
            endDate: { gte: now },
          },
        },
      }),
      prisma.tournament.count({
        where: {
          startDate: {
            gte: now,
            lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          },
          mergedIntoId: null,
        },
      }),
      prisma.tournament.findFirst({
        where: { sourceOrigin: "DATAGOLF", lastSyncAt: { not: null } },
        orderBy: { lastSyncAt: "desc" },
        select: { lastSyncAt: true },
      }),
    ]);

  return {
    norskeIAksjon,
    kommendeTurneringer,
    sisteSyncDato: sisteDataGolfSync?.lastSyncAt ?? null,
  };
}

function formaterDatoKort(d: Date | null): string {
  if (!d) return "—";
  const diff = Date.now() - d.getTime();
  const timer = Math.floor(diff / (60 * 60 * 1000));
  if (timer < 1) return "nå nettopp";
  if (timer < 24) return `for ${timer} time${timer === 1 ? "" : "r"} siden`;
  const dager = Math.floor(timer / 24);
  return `for ${dager} dag${dager === 1 ? "" : "er"} siden`;
}

// ---------------------------------------------------------------------------

const TRENER_STEG = [
  {
    n: "01",
    tittel: "Mål svakhet",
    tekst:
      "SG-profilen viser nøyaktig hvor strokene tapes — fra teen, innspillet eller på greenen.",
    icon: "Crosshair" as const,
  },
  {
    n: "02",
    tittel: "Bygg drillen",
    tekst:
      "Coach lager treningsplan målrettet svakheten. Korte økter, ukentlig fokus.",
    icon: "Wrench" as const,
  },
  {
    n: "03",
    tittel: "Følg utvikling",
    tekst:
      "SG-trenden viser om treningen virker. Tall, ikke synsing.",
    icon: "Activity" as const,
  },
];

const PLAYERHQ_FORDELER = [
  "SG-beregning automatisk fra hvert kort",
  "Trenden over hele sesongen, ikke bare siste runde",
  "Sammenlign mot PGA Tour-snitt fra første scorekort",
  "Treningsdagbok med drill-bibliotek",
  "Del med coach — én lenke, full innsikt",
  "Eksporter rådata når du vil. Det er dine tall.",
];

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function StatsLandingPage() {
  const snapshot = await hentLiveSnapshot();
  const sisteSync = formaterDatoKort(snapshot.sisteSyncDato);

  // Ekte DB-tall (ingen fabrikkerte fallback-verdier).
  const norskeIAksjon = snapshot.norskeIAksjon;
  const kommendeTurneringer = snapshot.kommendeTurneringer;

  return (
    <div>
      {/* ── 1. HERO ── */}
      <section className="stats-hero">
        <div className="stats-hero-bg-glyph" aria-hidden="true">
          <StatsIcon name="Flag" size={560} stroke={1} />
        </div>

        <div className="stats-hero-grid">
          <Reveal>
            <StatsEyebrow>AK GOLF STATS</StatsEyebrow>
            <h1>
              All statistikken.
              <br />
              <em className="stats-italic-accent">Gratis.</em> Alltid.
            </h1>
            <p className="stats-hero-sub">
              Live PGA Tour-data, norske spillere over hele verden, og verktøy
              for å sammenligne ditt eget spill mot proffene. Bygget i Norge,
              åpent for alle.
            </p>
            <div className="stats-hero-ctas">
              <Link href="/turneringer">
                <StatsBtn variant="primary" icon="ArrowRight">
                  Se ukens turneringer
                </StatsBtn>
              </Link>
              <Link href="#moduler">
                <StatsBtn variant="ghost" icon="ArrowDown">
                  Utforsk alle verktøy
                </StatsBtn>
              </Link>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="stats-hero-side">
              <div className="stats-hero-side-row">
                <span>Sesong</span>
                <span className="stats-hero-side-val">2026</span>
              </div>
              <div className="stats-hero-side-row">
                <span>Turneringer i DB</span>
                <span className="stats-hero-side-val">
                  {(1175).toLocaleString("nb-NO")}
                </span>
              </div>
              <div className="stats-hero-side-row">
                <span>PGA-spillere</span>
                <span className="stats-hero-side-val">1 299</span>
              </div>
              <div className="stats-hero-side-row">
                <span>Norske spillere</span>
                <span className="stats-hero-side-val">
                  {(2497).toLocaleString("nb-NO")}
                </span>
              </div>
              <div className="stats-hero-side-row">
                <span>Siste sync</span>
                <span className="stats-hero-side-val">{sisteSync}</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 2. KPI STRIP ── */}
      <div className="stats-kpi-strip">
        <div className="stats-kpi">
          <div className="stats-kpi-eyebrow">
            <StatsIcon name="Flag" size={14} />
            Denne uken
          </div>
          <div className="stats-kpi-value">
            <CountUp value={norskeIAksjon} duration={700} />
          </div>
          <div className="stats-kpi-sub">
            norske spillere i aksjon på proffturneringer
          </div>
        </div>

        <div className="stats-kpi">
          <div className="stats-kpi-eyebrow">
            <StatsIcon name="Trophy" size={14} />
            Neste 30 dager
          </div>
          <div className="stats-kpi-value">
            <CountUp value={kommendeTurneringer} duration={700} />
          </div>
          <div className="stats-kpi-sub">
            kommende turneringer å følge med på
          </div>
        </div>

        <div className="stats-kpi">
          <div className="stats-kpi-eyebrow">
            <StatsIcon name="Zap" size={14} />
            Database
          </div>
          <div className="stats-kpi-value" style={{ fontSize: 28, marginTop: 8 }}>
            oppdatert
            <br />
            <span style={{ fontSize: 22, color: "var(--s-muted-fg)" }}>
              {sisteSync}
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. NORSKE I AKSJON ── */}
      <section className="stats-section">
        <Reveal>
          <div className="stats-section-head">
            <div>
              <StatsEyebrow>Denne uken</StatsEyebrow>
              <h2>Norske spillere i aksjon</h2>
            </div>
            <Link href="/stats/spillere" className="stats-section-head-link">
              Se alle {norskeIAksjon} →
            </Link>
          </div>
        </Reveal>

        <Reveal>
          <Link href="/stats/norske" className="stats-norske-card" style={{ display: "block", textDecoration: "none" }}>
            <div className="stats-norske-head">
              <div className="stats-norske-avatar">
                <FlagGlyph code="no" />
              </div>
              <div>
                <div className="stats-norske-name">
                  {norskeIAksjon > 0
                    ? `${norskeIAksjon} norske spillere i aksjon`
                    : "Norske spillere"}
                </div>
                <div className="stats-norske-tour">Live leaderboards — oppdatert automatisk</div>
              </div>
            </div>
            <div className="stats-norske-event">
              Følg norske spillere på PGA Tour, DP World Tour, Korn Ferry, Challenge og LET.
            </div>
            <div className="stats-norske-pos">
              <span className="stats-pos-label">Åpne leaderboard</span>
              <span className="stats-pos-value">→</span>
            </div>
          </Link>
        </Reveal>
      </section>

      {/* ── 4. BENTO ── */}
      <section
        id="moduler"
        className="stats-section stats-section-divider"
      >
        <Reveal>
          <div className="stats-section-head">
            <div>
              <StatsEyebrow>Verktøy</StatsEyebrow>
              <h2>
                Fire moduler.{" "}
                <em className="stats-italic-accent">Én plattform.</em>
              </h2>
            </div>
          </div>
        </Reveal>

        <div className="stats-bento">
          {/* Turneringer — span 4 */}
          <Reveal className="b-turneringer">
            <Link href="/turneringer" style={{ textDecoration: "none" }}>
              <div className="stats-bento-card">
                <div className="stats-bento-arrow">
                  <StatsIcon name="ArrowRight" size={20} />
                </div>
                <div className="stats-bento-icon">
                  <StatsIcon name="Trophy" size={22} />
                </div>
                <h3>Turneringer</h3>
                <div className="stats-bento-desc">
                  PGA Tour, DP World, LET, Korn Ferry og norske amatørtourer i
                  én kalender.
                </div>

                <div className="stats-bento-foot">
                  {(1175).toLocaleString("nb-NO")} TURNERINGER · OPPDATERT
                  DAGLIG
                </div>
              </div>
            </Link>
          </Reveal>

          {/* PGA Stats — span 2 */}
          <Reveal delay={80} className="b-pga">
            <Link href="/stats/pga" style={{ textDecoration: "none" }}>
              <div className="stats-bento-card">
                <div className="stats-bento-arrow">
                  <StatsIcon name="ArrowRight" size={20} />
                </div>
                <div className="stats-bento-icon">
                  <StatsIcon name="LineChart" size={22} />
                </div>
                <h3>PGA Tour Stats</h3>
                <div className="stats-bento-desc">
                  Drive distance, GIR, putter — alt målt mot Tour-snittet.
                </div>

                <div className="stats-drive-bars-wrap">
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--s-muted-fg)",
                      marginBottom: 8,
                    }}
                  >
                    Drive distance · topp 5
                  </div>
                  <SparkBars
                    values={[327, 322, 320, 317, 314]}
                    height={48}
                    highlight={0}
                  />
                </div>

                <div className="stats-bento-foot">
                  1 299 SPILLERE · 6 KATEGORIER
                </div>
              </div>
            </Link>
          </Reveal>

          {/* Norsk spillerbase — span 2 */}
          <Reveal delay={160} className="b-spillere">
            <Link href="/stats/spillere" style={{ textDecoration: "none" }}>
              <div className="stats-bento-card">
                <div className="stats-bento-arrow">
                  <StatsIcon name="ArrowRight" size={20} />
                </div>
                <div className="stats-bento-icon">
                  <StatsIcon name="Users" size={22} />
                </div>
                <h3>Norsk spillerbase</h3>
                <div className="stats-bento-desc">
                  2 500+ norske spillere — proffer, amatører, juniorer.
                  Søkbart.
                </div>

                <div className="stats-avatar-stack">
                  <div className="stats-av">VH</div>
                  <div className="stats-av">KR</div>
                  <div className="stats-av">SH</div>
                  <div className="stats-av">KV</div>
                  <div className="stats-av stats-av-more">+2k</div>
                </div>

                <div className="stats-bento-foot">SØK · FILTER · SAMMENLIGN</div>
              </div>
            </Link>
          </Reveal>

          {/* SG-sammenlign — span 4 */}
          <Reveal delay={240} className="b-sg">
            <Link href="/stats/sg-sammenlign" style={{ textDecoration: "none" }}>
              <div className="stats-bento-card">
                <div className="stats-bento-arrow">
                  <StatsIcon name="ArrowRight" size={20} />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 24,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div className="stats-bento-icon">
                      <StatsIcon name="Crosshair" size={22} />
                    </div>
                    <h3>SG-sammenligning</h3>
                    <div className="stats-bento-desc">
                      Legg inn dine egne tall. Se hvor du står mot Tour-snittet
                      på 4 SG-akser.
                    </div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    <MiniRadar
                      size={140}
                      values={[0.7, 0.55, 0.65, 0.4]}
                      values2={[0.85, 0.85, 0.85, 0.85]}
                    />
                  </div>
                </div>
                <div className="stats-bento-foot">
                  GRATIS · KREVER KONTO · DELBAR
                </div>
              </div>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── 5. MERSALG-BÅND ── */}
      <div className="stats-mersalg-wrap">
        <Reveal>
          <div className="stats-mersalg">
            <div
              className="stats-mersalg-bg-glyph"
              aria-hidden="true"
            >
              <StatsIcon name="Crosshair" size={420} stroke={1} />
            </div>

            <div>
              <StatsEyebrow tone="lime">
                PlayerHQ · Treningsdagbok
              </StatsEyebrow>
              <h2>
                Vil du følge
                <br />
                <em className="stats-italic-accent">dine egne</em> tall?
              </h2>
              <p>
                PlayerHQ regner ut Strokes Gained automatisk fra hvert
                scorekort. Du ser hvor strokene tapes, og om treningen virker.
                Trenden over måneder — ikke synsing.
              </p>
              <div className="stats-mersalg-ctas">
                <Link href="/portal">
                  <StatsBtn variant="primary" icon="ArrowRight">
                    Prøv gratis i 30 dager
                  </StatsBtn>
                </Link>
                <Link href="/priser">
                  <StatsBtn variant="outline" icon={null}>
                    Se priser
                  </StatsBtn>
                </Link>
              </div>
            </div>

            <div className="stats-mersalg-card">
              <h4>Inkludert i abonnement</h4>
              <ul>
                {PLAYERHQ_FORDELER.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
              <div className="stats-mersalg-price">
                <strong>300 kr/mnd</strong> · gratis under beta
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* ── 6. TRENER-STEG ── */}
      <section className="stats-section stats-section-divider">
        <Reveal>
          <div className="stats-section-head">
            <div>
              <StatsEyebrow>Coaching</StatsEyebrow>
              <h2>
                Slik bruker treneren
                <br />
                <em className="stats-italic-accent">tallene</em>.
              </h2>
            </div>
          </div>
        </Reveal>

        <div className="stats-steps">
          {TRENER_STEG.map((s, i) => (
            <Reveal key={s.n} delay={i * 100}>
              <div className="stats-step-card">
                <span className="stats-step-num">{s.n}</span>
                <StatsIcon
                  name={s.icon}
                  size={28}
                  className="stats-step-icon"
                />
                <h3>{s.tittel}</h3>
                <p>{s.tekst}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={300}>
          <div className="stats-coaching-card">
            <div className="stats-coaching-text">
              <strong>Vil du jobbe med en av våre coacher?</strong>
              <br />
              <span className="stats-muted">
                Vi har plass til nye spillere på AK Golf Academy i 2026 —
                junior, amatør og proffspillere.
              </span>
            </div>
            <Link href="/coaching">
              <StatsBtn variant="secondary" icon="ArrowRight">
                Se coaching-tilbud
              </StatsBtn>
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ── 7. BUNN-CTA ── */}
      <section className="stats-bottom-cta">
        <Reveal>
          <StatsEyebrow>Kom i gang</StatsEyebrow>
          <h2>
            Klar for å bli <em className="stats-italic-accent">bedre</em>?
          </h2>
          <div className="stats-bottom-cta-sub">
            Det tar fem minutter å sette opp PlayerHQ. Etter første scorekort
            har du din egen SG-profil.
          </div>
          <div className="stats-bottom-cta-buttons">
            <Link href="/portal">
              <StatsBtn variant="primary" icon="ArrowRight" size="lg">
                Start PlayerHQ gratis
              </StatsBtn>
            </Link>
            <Link href="/turneringer">
              <StatsBtn variant="on-light-outline" icon={null} size="lg">
                Se norske i aksjon
              </StatsBtn>
            </Link>
          </div>
          <div className="stats-bottom-cta-footnote">
            INGEN KREDITTKORT NØDVENDIG · AVSLUTT NÅR DU VIL
          </div>
        </Reveal>
      </section>
    </div>
  );
}
