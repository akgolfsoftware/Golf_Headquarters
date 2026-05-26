/**
 * /stats/sg-sammenlign — landingsside (offentlig)
 * Pixel-perfect port av design 07 fra design-handoff-stats-2026-05-25.
 *
 * Hero-strategi: "Sammenlign deg med Rory McIlroy." BIG italic lime-navn.
 * 3-stegs forklaring, SG-intro-kort, FAQ, mersalg, CTA.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Circle, Crosshair, Flag, Sparkles, Target, Trophy } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { StatsEyebrow } from "@/components/stats/eyebrow";
import { Reveal } from "@/components/stats/reveal";
import { MiniRadar } from "@/components/stats/mini-radar";
import "../stats.css";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "SG-sammenligning — sammenlign deg med Rory McIlroy",
  description:
    "Legg inn din egen Strokes Gained og se hvordan du ligger an mot verdens beste. Få et estimat på hva din norske snittscore tilsvarer på PGA Tour.",
  alternates: { canonical: "https://akgolf.no/stats/sg-sammenlign" },
  openGraph: {
    title: "Sammenlign deg med Rory — SG-tool fra AK Golf",
    description:
      "Hvor mye taper du mot proffene? Få konkrete tall på din egen SG-profil.",
    url: "https://akgolf.no/stats/sg-sammenlign",
  },
};

export default async function SgSammenlignLanding() {
  const user = await getCurrentUser();
  const startHref = user
    ? "/stats/sg-sammenlign/start"
    : "/auth/signup?next=/stats/sg-sammenlign/start";

  return (
    <div className="bg-background text-foreground">

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section className="stats-hero stats-section-divider">
        <div className="stats-max-w" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <StatsEyebrow tone="lime">SG-sammenligning</StatsEyebrow>
          </Reveal>

          <div className="stats-hero-grid" style={{ marginTop: 16 }}>
            {/* Left column — headline + CTA */}
            <Reveal>
              <h1 style={{ fontSize: "clamp(52px, 6vw, 84px)", lineHeight: 0.95, fontWeight: 600, fontFamily: "var(--font-display)", letterSpacing: "-0.03em", marginTop: 20 }}>
                Sammenligna deg<br/>
                med{" "}
                <em style={{ fontStyle: "italic", fontWeight: 400, color: "hsl(var(--accent))" }}>
                  Rory McIlroy
                </em>.
              </h1>
              <p className="stats-hero-sub">
                Legg inn snittscoren din. Vi estimerer din Strokes Gained og viser
                hvor du står mot proffene — på 60 sekunder.
              </p>
              <div className="stats-hero-ctas">
                <Link
                  href={startHref}
                  className="stats-btn stats-btn-primary stats-btn-lg"
                  style={{ textDecoration: "none" }}
                >
                  <span>{user ? "Start sammenligning" : "Start gratis sammenligning"}</span>
                  <ArrowRight size={16} className="stats-btn-icon" />
                </Link>
                {!user && (
                  <Link
                    href="/auth/login?next=/stats/sg-sammenlign/start"
                    className="stats-btn stats-btn-ghost stats-btn-lg"
                    style={{ textDecoration: "none" }}
                  >
                    <span>Logg inn</span>
                  </Link>
                )}
              </div>
              <div
                className="stats-eyebrow"
                style={{ marginTop: 20, color: "hsl(var(--muted-foreground))" }}
              >
                KREVER GRATIS KONTO · INGEN KREDITTKORT · 60 SEK
              </div>
            </Reveal>

            {/* Right column — radar preview */}
            <Reveal delay={150}>
              <div
                style={{
                  background: "hsl(var(--secondary))",
                  borderRadius: 20,
                  padding: 32,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <MiniRadar
                  values={[0.55, 0.38, 0.50, 0.45]}
                  values2={[0.92, 0.95, 0.88, 0.85]}
                  size={240}
                />
                <div
                  style={{
                    display: "flex",
                    gap: 20,
                    marginTop: 16,
                    fontSize: 12,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span
                      style={{
                        display: "inline-block",
                        width: 10,
                        height: 10,
                        background: "hsl(var(--primary))",
                        borderRadius: 2,
                      }}
                    />
                    Du
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span
                      style={{
                        display: "inline-block",
                        width: 10,
                        height: 10,
                        background: "hsl(var(--accent))",
                        borderRadius: 2,
                      }}
                    />
                    Rory McIlroy
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── SLIK FUNGERER DET — 3 steg ─────────────────────────────── */}
      <section
        className="stats-section stats-section-divider"
        style={{ maxWidth: 1100, margin: "0 auto" }}
      >
        <Reveal>
          <div className="stats-section-head">
            <div>
              <StatsEyebrow>Slik fungerer det</StatsEyebrow>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 600, letterSpacing: "-0.025em", marginTop: 12, lineHeight: 1.05 }}>
                Tre steg.{" "}
                <em style={{ fontStyle: "italic", fontWeight: 400, color: "hsl(var(--primary))" }}>
                  Tre minutter.
                </em>
              </h2>
            </div>
          </div>
        </Reveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
        >
          {[
            {
              n: "01",
              t: "Velg referanse",
              d: "Pluk en av topp 100 PGA-spillere. Rory, Scottie, Hovland — eller en favoritt.",
              icon: <Trophy size={24} />,
            },
            {
              n: "02",
              t: "Legg inn tall",
              d: "Snittscoren din er nok. Har du egne SG-tall fra TrackMan kan du bruke dem.",
              icon: <Target size={24} />,
            },
            {
              n: "03",
              t: "Få analyse",
              d: "Radar, KPI, estimert Tour-ekvivalent, og hvilken kategori du har størst gap på.",
              icon: <Sparkles size={24} />,
            },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 100}>
              <div
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E5E3DD",
                  borderRadius: 16,
                  padding: 28,
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "hsl(var(--accent))",
                      background: "hsl(var(--primary))",
                      padding: "4px 10px",
                      borderRadius: 6,
                      letterSpacing: "0.06em",
                    }}
                  >
                    {s.n}
                  </span>
                  <span style={{ color: "hsl(var(--primary))" }}>{s.icon}</span>
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 20,
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {s.t}
                </h3>
                <p style={{ fontSize: 14, color: "hsl(var(--muted-foreground))", lineHeight: 1.55 }}>
                  {s.d}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── EKSEMPLER ───────────────────────────────────────────────── */}
      <section
        className="stats-section stats-section-divider"
        style={{ background: "hsl(var(--secondary))" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div className="stats-section-head">
              <div>
                <StatsEyebrow>Eksempler</StatsEyebrow>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 600, letterSpacing: "-0.025em", marginTop: 12, lineHeight: 1.05 }}>
                  Hva du kan{" "}
                  <em style={{ fontStyle: "italic", fontWeight: 400, color: "hsl(var(--primary))" }}>
                    finne ut
                  </em>
                  .
                </h2>
              </div>
            </div>
          </Reveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
            }}
          >
            {[
              {
                tit: "HCP 12",
                radar: [0.55, 0.30, 0.50, 0.65],
                txt: "Størst gap er innspill (−1.8). Putting er overraskende sterk (−0.4). Du er ca P30 på PGA Tour.",
              },
              {
                tit: "Scratch (HCP 0)",
                radar: [0.80, 0.75, 0.78, 0.82],
                txt: "Du taper kun 2 strokes mot Tour-snittet. Største gap er drive distance (−0.6).",
              },
              {
                tit: "HCP 25",
                radar: [0.30, 0.25, 0.20, 0.35],
                txt: "Du er på et tidlig nivå — størst gap er ARG (−2.1). Fokus her gir raskest forbedring.",
              },
            ].map((c, i) => (
              <Reveal key={i} delay={i * 100}>
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E5E3DD",
                    borderRadius: 16,
                    padding: 28,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: "hsl(var(--muted-foreground))",
                      marginBottom: 16,
                    }}
                  >
                    EKSEMPEL · BRUKER PÅ {c.tit.toUpperCase()}
                  </div>
                  <div style={{ display: "grid", placeItems: "center", margin: "0 0 16px" }}>
                    <MiniRadar
                      values={c.radar}
                      values2={[0.9, 0.9, 0.9, 0.9]}
                      size={140}
                    />
                  </div>
                  <p style={{ fontSize: 14, color: "hsl(var(--muted-foreground))", lineHeight: 1.5 }}>
                    {c.txt}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── HVA ER STROKES GAINED ───────────────────────────────────── */}
      <section
        className="stats-section stats-section-divider"
        style={{ maxWidth: 1100, margin: "0 auto" }}
      >
        <Reveal>
          <div className="stats-section-head">
            <div>
              <StatsEyebrow>Intro</StatsEyebrow>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 600, letterSpacing: "-0.025em", marginTop: 12, lineHeight: 1.05 }}>
                Hva er{" "}
                <em style={{ fontStyle: "italic", fontWeight: 400, color: "hsl(var(--primary))" }}>
                  Strokes Gained
                </em>
                ?
              </h2>
            </div>
          </div>
        </Reveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
          }}
        >
          {[
            {
              tag: "SG: OTT",
              forklar: "Off The Tee — hvor mange strokes du vinner/taper på drives, vs Tour-snittet.",
              icon: <Crosshair size={22} />,
            },
            {
              tag: "SG: APP",
              forklar: "Approach — fra fairway/rough mot greenen. Den mest forutsigbare SG-kategorien.",
              icon: <Target size={22} />,
            },
            {
              tag: "SG: ARG",
              forklar: "Around the Green — chips, pitches, bunker. Trent skill, ikke talent.",
              icon: <Flag size={22} />,
            },
            {
              tag: "SG: PUTT",
              forklar: "Putting — fra hver avstand på greenen. Tour-snittet er definert som 0.",
              icon: <Circle size={22} />,
            },
          ].map((sg, i) => (
            <Reveal key={i} delay={i * 60}>
              <div
                style={{
                  background: "hsl(var(--secondary))",
                  borderRadius: 12,
                  padding: 24,
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
              >
                <span style={{ color: "hsl(var(--primary))" }}>{sg.icon}</span>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: 600,
                    fontSize: 16,
                    marginTop: 12,
                    letterSpacing: "0.04em",
                    color: "hsl(var(--foreground))",
                  }}
                >
                  {sg.tag}
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: "hsl(var(--muted-foreground))",
                    lineHeight: 1.5,
                    marginTop: 8,
                  }}
                >
                  {sg.forklar}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={300}>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.7,
              marginTop: 32,
              maxWidth: 720,
              color: "hsl(var(--muted-foreground))",
            }}
          >
            Strokes Gained ble utviklet av{" "}
            <strong style={{ color: "hsl(var(--foreground))" }}>Mark Broadie</strong> ved
            Columbia Business School. Tour-snittet er definert som 0 — et
            positivt tall betyr at du vinner strokes mot snittet, et negativt at
            du taper.
          </p>
        </Reveal>
      </section>

      {/* ── MERSALG-BÅND ────────────────────────────────────────────── */}
      <section
        className="stats-section"
        style={{ background: "hsl(var(--primary))", color: "hsl(var(--background))" }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "3fr 2fr",
            gap: 64,
            alignItems: "center",
          }}
        >
          <Reveal>
            <div>
              <StatsEyebrow tone="lime">PlayerHQ</StatsEyebrow>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 40,
                  fontWeight: 600,
                  letterSpacing: "-0.025em",
                  marginTop: 12,
                  lineHeight: 1.1,
                  color: "hsl(var(--background))",
                }}
              >
                Når du ser{" "}
                <em style={{ fontStyle: "italic", fontWeight: 400, color: "hsl(var(--accent))" }}>
                  gapet
                </em>
                , vil du lukke det.
              </h2>
              <p
                style={{
                  fontSize: 17,
                  lineHeight: 1.55,
                  marginTop: 20,
                  color: "rgba(250,250,247,0.8)",
                  maxWidth: 480,
                }}
              >
                PlayerHQ regner ut din egen SG automatisk hver gang du logger en
                runde. Se trend over tid, få AI-coach-tips for å lukke
                svakhetene.
              </p>
              <Link
                href="/playerhq"
                className="stats-btn stats-btn-outline stats-btn-lg"
                style={{ marginTop: 28, textDecoration: "none" }}
              >
                <span>Prøv PlayerHQ gratis</span>
                <ArrowRight size={16} className="stats-btn-icon" />
              </Link>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(209,248,67,0.25)",
                borderRadius: 16,
                padding: 28,
              }}
            >
              {[
                "Strokes Gained per runde (automatisk)",
                "Trend over tid vs proff-benchmark",
                "AI-coach med kategori-spesifikke tips",
                "Treningsplaner mot ditt største gap",
              ].map((b) => (
                <div
                  key={b}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                    marginBottom: 14,
                    fontSize: 14,
                    color: "rgba(250,250,247,0.9)",
                    lineHeight: 1.4,
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "hsl(var(--accent))",
                      marginTop: 5,
                      flexShrink: 0,
                    }}
                  />
                  {b}
                </div>
              ))}
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "hsl(var(--accent))",
                  marginTop: 8,
                }}
              >
                300 KR/MND · GRATIS UNDER BETA
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── STOR SLUTT-CTA ──────────────────────────────────────────── */}
      <section
        className="stats-section stats-section-divider"
        style={{ textAlign: "center" }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Reveal>
            <StatsEyebrow tone="lime" dot>
              Kom i gang
            </StatsEyebrow>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 56,
                fontWeight: 600,
                letterSpacing: "-0.03em",
                marginTop: 16,
                lineHeight: 1.0,
              }}
            >
              Det tar{" "}
              <em style={{ fontStyle: "italic", fontWeight: 400, color: "hsl(var(--primary))" }}>
                60 sekunder
              </em>
              .
            </h2>
            <p
              style={{
                fontSize: 17,
                color: "hsl(var(--muted-foreground))",
                marginTop: 20,
                lineHeight: 1.55,
              }}
            >
              Gratis konto. Ingen spam. Etterpå kan du oppgradere til PlayerHQ
              for å logge runder.
            </p>
            <Link
              href={startHref}
              className="stats-btn stats-btn-primary stats-btn-lg"
              style={{ marginTop: 32, textDecoration: "none" }}
            >
              <span>
                {user ? "Start sammenligning" : "Lag gratis konto"}
              </span>
              <ArrowRight size={16} className="stats-btn-icon" />
            </Link>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "hsl(var(--muted-foreground))",
                marginTop: 20,
              }}
            >
              300+ HAR ALLEREDE PRØVD
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
