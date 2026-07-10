/**
 * /stats/sg-sammenlign/resultat/[id] — magazine-spread resultat-side
 * Pixel-perfect port av design 09 fra design-handoff-stats-2026-05-25.
 *
 * Data fra BrukerSammenligning + BrukerSgInput + PgaPlayerSeason.
 * UI: VS-showdown hero, KPI-strip, stor radar, gap-card, tour-ekvivalent,
 *     hva-nå-steg, PlayerHQ-mersalg, del-modul.
 */

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Trophy,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { sammenlignMedReferanse } from "@/lib/stats/sg-estimator";
import { StatsEyebrow } from "@/components/stats/eyebrow";
import { Reveal } from "@/components/stats/reveal";
import { StatsBigRadar } from "@/components/stats/stats-big-radar";
import "../../../stats.css";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

function fmtSg(v: number | null | undefined): string {
  if (v == null) return "—";
  return v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2);
}

const GAP_TEKST: Record<string, string> = {
  ott: "Lengde er synlig, men ikke alltid mest verdifull. SG: OTT er en god start, og speed-trening kan gi 15–20 yds på 12 uker.",
  app: "Innspill er den mest forutsigbare SG-kategorien. Strokene tapt her er strokes du kan vinne tilbake med målrettet trening.",
  arg: "Nærspill er gjort med trening, ikke talent. 30 chips à 10 min hver dag gir raske gevinster.",
  putt: "Putting er det mest tekniske. Speed control fra 5–10m er der amatører taper aller mest strokes.",
};

const GAP_LABEL: Record<string, string> = {
  ott: "Drive (Off The Tee)",
  app: "Innspill (SG: APP)",
  arg: "Nærspill (Around the Green)",
  putt: "Putting",
};

export default async function SgResultatPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login?next=/stats/sg-sammenlign");
  }

  const { id } = await params;

  const sammenligning = await prisma.brukerSammenligning.findFirst({
    where: { id, userId: user.id },
    include: { sgInput: true },
  });

  if (!sammenligning) notFound();

  const ref = await prisma.pgaPlayerSeason.findFirst({
    where: {
      dgPlayerId: sammenligning.refDgPlayerId,
      tour: sammenligning.refTour,
    },
    orderBy: { year: "desc" },
    select: {
      sgOtt: true,
      sgApp: true,
      sgArg: true,
      sgPutt: true,
      sgTotal: true,
      country: true,
      driveDist: true,
    },
  });

  const sg = sammenligning.sgInput;
  const cmp = sammenlignMedReferanse(
    {
      sgOtt: sg.sgOtt,
      sgApp: sg.sgApp,
      sgArg: sg.sgArg,
      sgPutt: sg.sgPutt,
      sgTotal: sg.sgTotal,
    },
    {
      sgOtt: ref?.sgOtt ?? null,
      sgApp: ref?.sgApp ?? null,
      sgArg: ref?.sgArg ?? null,
      sgPutt: ref?.sgPutt ?? null,
      sgTotal: ref?.sgTotal ?? null,
    },
  );

  // For radar: normalize SG values to 0-1 (shift to make all positive)
  const SHIFT = 5;
  const radarYou = [
    ((sg.sgOtt ?? 0) + SHIFT) / 10,
    ((sg.sgApp ?? 0) + SHIFT) / 10,
    ((sg.sgArg ?? 0) + SHIFT) / 10,
    ((sg.sgPutt ?? 0) + SHIFT) / 10,
  ];
  const radarThem = [
    ((ref?.sgOtt ?? 0) + SHIFT) / 10,
    ((ref?.sgApp ?? 0) + SHIFT) / 10,
    ((ref?.sgArg ?? 0) + SHIFT) / 10,
    ((ref?.sgPutt ?? 0) + SHIFT) / 10,
  ];
  const radarYouRaw = [
    sg.sgOtt ?? 0,
    sg.sgApp ?? 0,
    sg.sgArg ?? 0,
    sg.sgPutt ?? 0,
  ];
  const radarThemRaw = [
    ref?.sgOtt ?? 0,
    ref?.sgApp ?? 0,
    ref?.sgArg ?? 0,
    ref?.sgPutt ?? 0,
  ];

  const refEtternavn = sammenligning.refPlayerName.split(" ").at(-1) ?? sammenligning.refPlayerName;

  const storsteGapKat = cmp.storsteGap?.kategori ?? "app";
  const storsteGapDiff = cmp.storsteGap?.diff ?? 0;

  const snittScore = sg.snittScore;
  const createdDate = sammenligning.createdAt
    ? new Intl.DateTimeFormat("nb-NO", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(sammenligning.createdAt))
    : null;

  return (
    <div className="bg-background text-foreground">

      {/* ── BREADCRUMB ────────────────────────────────────────────── */}
      <div style={{ padding: "12px 32px", borderBottom: "1px solid var(--s-border)" }}>
        <Link
          href="/stats/sg-sammenlign"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "hsl(var(--muted-foreground))",
            textDecoration: "none",
          }}
        >
          <ChevronLeft size={14} />
          Tilbake til SG-sammenligning
        </Link>
      </div>

      {/* ── HERO — VS-showdown ───────────────────────────────────── */}
      <section
        style={{
          padding: "56px 40px 48px",
          borderBottom: "1px solid var(--s-border)",
          background: "linear-gradient(180deg, var(--s-bg) 0%, var(--s-secondary) 100%)",
        }}
      >
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <StatsEyebrow tone="lime">Din sammenligning · {sammenligning.refYear}</StatsEyebrow>
            </div>
          </Reveal>

          <Reveal delay={60}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                gap: "clamp(16px, 4vw, 48px)",
                alignItems: "center",
              }}
            >
              {/* Du */}
              <div style={{ textAlign: "right" }}>
                <h1
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(36px, 5vw, 64px)",
                    fontStyle: "italic",
                    fontWeight: 500,
                    lineHeight: 1,
                    color: "hsl(var(--primary))",
                  }}
                >
                  {user.name?.split(" ")[0] ?? "Du"}
                </h1>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "clamp(18px, 2.5vw, 32px)",
                    fontWeight: 500,
                    marginTop: 8,
                    color: "hsl(var(--muted-foreground))",
                  }}
                >
                  SG: {fmtSg(sg.sgTotal)}
                </div>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "hsl(var(--primary))",
                    marginLeft: "auto",
                    marginTop: 12,
                  }}
                />
              </div>

              {/* VS glyph */}
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 28,
                  fontStyle: "italic",
                  color: "hsl(var(--foreground))",
                  background: "hsl(var(--accent))",
                  padding: "12px 20px",
                  borderRadius: 12,
                  textAlign: "center",
                  lineHeight: 1,
                }}
              >
                vs
              </div>

              {/* Ref */}
              <div style={{ textAlign: "left" }}>
                <h1
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(36px, 5vw, 64px)",
                    fontStyle: "italic",
                    fontWeight: 500,
                    lineHeight: 1,
                  }}
                >
                  {refEtternavn}
                </h1>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "clamp(18px, 2.5vw, 32px)",
                    fontWeight: 500,
                    marginTop: 8,
                    color: "hsl(var(--primary))",
                  }}
                >
                  SG: {fmtSg(ref?.sgTotal)}
                </div>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "hsl(var(--accent))",
                    marginTop: 12,
                  }}
                />
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div
              style={{
                textAlign: "center",
                marginTop: 20,
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "hsl(var(--muted-foreground))",
              }}
            >
              SESONG {sammenligning.refYear} · PGA TOUR
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── KPI-STRIP ────────────────────────────────────────────── */}
      <Reveal>
        <div
          className="stats-kpi-strip"
          style={{ gridTemplateColumns: "1fr 1fr 1fr" }}
        >
          <div className="stats-kpi">
            <div className="stats-kpi-eyebrow">Din SG Total</div>
            <div className="stats-kpi-value">{fmtSg(sg.sgTotal)}</div>
            <div className="stats-kpi-sub">per runde, estimert</div>
          </div>
          <div className="stats-kpi">
            <div className="stats-kpi-eyebrow">
              {refEtternavn.toUpperCase()}S SG TOTAL
            </div>
            <div className="stats-kpi-value" style={{ color: "hsl(var(--primary))" }}>
              {fmtSg(ref?.sgTotal)}
            </div>
            <div className="stats-kpi-sub">sesong {sammenligning.refYear}</div>
          </div>
          <div
            className="stats-kpi"
            style={{ background: "hsl(var(--accent))" }}
          >
            <div className="stats-kpi-eyebrow" style={{ color: "hsl(var(--primary))" }}>
              Differanse
            </div>
            <div
              className="stats-kpi-value"
              style={{ color: "hsl(var(--primary))" }}
            >
              {cmp.diff.total !== null
                ? fmtSg(-(Math.abs(cmp.diff.total)))
                : "—"}
            </div>
            <div
              className="stats-kpi-sub"
              style={{ color: "rgba(0,88,64,0.7)" }}
            >
              du må ta inn
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── RADAR CHART ─────────────────────────────────────────── */}
      <section
        className="stats-section stats-section-divider"
        style={{ background: "var(--s-card)" }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center" }}>
              <StatsEyebrow>Visuell sammenligning</StatsEyebrow>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 36,
                  fontWeight: 600,
                  letterSpacing: "-0.025em",
                  marginTop: 12,
                  lineHeight: 1.05,
                }}
              >
                Radar, du{" "}
                <em
                  style={{
                    fontStyle: "italic",
                    fontWeight: 400,
                    color: "hsl(var(--primary))",
                  }}
                >
                  vs
                </em>{" "}
                {refEtternavn}
              </h2>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div
              style={{ display: "grid", placeItems: "center", marginTop: 32 }}
            >
              <StatsBigRadar
                axes={["OTT", "APP", "ARG", "PUTT"]}
                you={radarYou}
                them={radarThem}
                youLabel={user.name?.split(" ")[0] ?? "Du"}
                themLabel={sammenligning.refPlayerName}
                youRaw={radarYouRaw}
                themRaw={radarThemRaw}
              />
              <div
                style={{
                  display: "flex",
                  gap: 24,
                  marginTop: 16,
                  fontSize: 13,
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.04em",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 14,
                      height: 14,
                      background: "hsl(var(--primary))",
                      borderRadius: 3,
                    }}
                  />
                  {user.name?.split(" ")[0] ?? "Du"}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 14,
                      height: 14,
                      background: "hsl(var(--accent))",
                      borderRadius: 3,
                    }}
                  />
                  {sammenligning.refPlayerName}
                </span>
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "hsl(var(--muted-foreground))",
                  marginTop: 12,
                }}
              >
                VERDIER PÅ RADAR ER NORMALISERT · TOOLTIP VISER EKTE SG-VERDIER
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── STØRSTE GAP + TOUR-EKVIVALENT ─────────────────────────── */}
      <section className="stats-section stats-section-divider">
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Reveal>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                alignItems: "stretch",
              }}
            >
              {/* Største gap */}
              <div
                style={{
                  background: "hsl(var(--accent))",
                  color: "hsl(var(--primary))",
                  borderRadius: 16,
                  padding: 40,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  STØRSTE GAP
                </div>
                <div style={{ marginTop: 16 }}>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 26,
                      fontWeight: 600,
                    }}
                  >
                    {GAP_LABEL[storsteGapKat]}{" "}
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 14,
                        opacity: 0.6,
                        fontWeight: 400,
                      }}
                    >
                      SG: {storsteGapKat.toUpperCase()}
                    </span>
                  </h3>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 64,
                      fontWeight: 500,
                      lineHeight: 1,
                      marginTop: 12,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {storsteGapDiff >= 0 ? "−" : "+"}
                    {Math.abs(storsteGapDiff).toFixed(2)}
                  </div>
                  <div style={{ fontSize: 14, marginTop: 8, opacity: 0.7 }}>
                    strokes per runde
                  </div>
                </div>
                <p
                  style={{
                    fontSize: 15,
                    lineHeight: 1.55,
                    marginTop: 24,
                    maxWidth: 360,
                  }}
                >
                  {GAP_TEKST[storsteGapKat]}
                </p>
                <Link
                  href="/playerhq"
                  style={{
                    fontSize: 13,
                    color: "hsl(var(--primary))",
                    fontWeight: 600,
                    marginTop: 24,
                    display: "inline-block",
                    textDecoration: "underline",
                  }}
                >
                  Få drillforslag for SG: {storsteGapKat.toUpperCase()} i
                  PlayerHQ →
                </Link>
              </div>

              {/* Tour-ekvivalent */}
              {snittScore && sammenligning.estPgaTourScore ? (
                <div
                  style={{
                    background: "hsl(var(--secondary))",
                    borderRadius: 16,
                    padding: 40,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "hsl(var(--muted-foreground))",
                    }}
                  >
                    DIN NORSKE SNITTSCORE
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 64,
                      fontWeight: 500,
                      lineHeight: 1,
                      marginTop: 12,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {snittScore.toFixed(1)}
                  </div>
                  <div
                    style={{
                      borderTop: "1px solid var(--s-border)",
                      margin: "28px 0",
                    }}
                  />
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "hsl(var(--primary))",
                    }}
                  >
                    ESTIMERT PÅ PGA TOUR-BANE
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 64,
                      fontWeight: 500,
                      lineHeight: 1,
                      marginTop: 12,
                      color: "hsl(var(--primary))",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {sammenligning.estPgaTourScore.toFixed(1)}
                  </div>
                  {sammenligning.estHcp && (
                    <div
                      style={{
                        fontSize: 14,
                        color: "hsl(var(--muted-foreground))",
                        marginTop: 8,
                      }}
                    >
                      HCP-estimert: {sammenligning.estHcp.toFixed(1)}
                    </div>
                  )}
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.12em",
                      color: "hsl(var(--muted-foreground))",
                      marginTop: 20,
                      lineHeight: 1.5,
                    }}
                  >
                    BEREGNET MED WHS-FORMEL · SLOPE 145, CR 74.5
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    background: "hsl(var(--secondary))",
                    borderRadius: 16,
                    padding: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <p style={{ color: "hsl(var(--muted-foreground))", fontSize: 14, textAlign: "center" }}>
                    Tour-ekvivalent krever at du oppgav en snittscore i onboarding.
                  </p>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── HVA NÅ — 3 veier videre ─────────────────────────────── */}
      <section className="stats-section stats-section-divider">
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Reveal>
            <div className="stats-section-head">
              <div>
                <StatsEyebrow>Hva nå?</StatsEyebrow>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 36,
                    fontWeight: 600,
                    letterSpacing: "-0.025em",
                    marginTop: 12,
                    lineHeight: 1.05,
                  }}
                >
                  Tre{" "}
                  <em
                    style={{
                      fontStyle: "italic",
                      fontWeight: 400,
                      color: "hsl(var(--primary))",
                    }}
                  >
                    veier
                  </em>{" "}
                  videre.
                </h2>
              </div>
            </div>
          </Reveal>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}
          >
            {[
              {
                n: "01",
                t: "Prøv PlayerHQ",
                d: "Få automatisk SG per runde + AI-tips for å lukke gapet.",
                icon: <Sparkles size={24} />,
                href: "/playerhq",
              },
              {
                n: "02",
                t: "Ny sammenligning",
                d: "Velg en annen proff og se forskjellen.",
                icon: <Trophy size={24} />,
                href: "/stats/sg-sammenlign/start",
              },
              {
                n: "03",
                t: "Del",
                d: "Del et screenshot på X eller med vennene dine.",
                icon: <ExternalLink size={24} />,
                href: "#del",
              },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 80}>
                <Link
                  href={s.href}
                  style={{ textDecoration: "none", display: "block" }}
                >
                  <div
                    style={{
                      background: "var(--s-card)",
                      border: "1px solid var(--s-border)",
                      borderRadius: 16,
                      padding: 24,
                      height: "100%",
                      transition: "all 0.2s",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 14,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 12,
                          fontWeight: 600,
                          color: "hsl(var(--accent))",
                          background: "hsl(var(--primary))",
                          padding: "3px 9px",
                          borderRadius: 5,
                        }}
                      >
                        {s.n}
                      </span>
                      <span style={{ color: "hsl(var(--primary))" }}>{s.icon}</span>
                    </div>
                    <h3
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 18,
                        fontWeight: 600,
                        color: "hsl(var(--foreground))",
                      }}
                    >
                      {s.t}
                    </h3>
                    <p
                      style={{
                        fontSize: 13,
                        color: "hsl(var(--muted-foreground))",
                        lineHeight: 1.5,
                        marginTop: 8,
                      }}
                    >
                      {s.d}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLAYERHQ MERSALG ────────────────────────────────────── */}
      <section
        className="stats-section"
        style={{ background: "hsl(var(--primary))", color: "hsl(var(--background))" }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 48,
            alignItems: "center",
          }}
        >
          <div>
            <StatsEyebrow tone="lime">
              <Sparkles size={12} style={{ display: "inline" }} /> Få faktiske tall
            </StatsEyebrow>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 36,
                fontWeight: 600,
                letterSpacing: "-0.025em",
                marginTop: 12,
                color: "hsl(var(--background))",
                lineHeight: 1.1,
              }}
            >
              Vil du følge{" "}
              <em style={{ fontStyle: "italic", fontWeight: 400, color: "hsl(var(--accent))" }}>
                utviklingen
              </em>
              ?
            </h2>
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.55,
                marginTop: 20,
                color: "rgba(250,250,247,0.85)",
                maxWidth: 440,
              }}
            >
              PlayerHQ regner ut din egen Strokes Gained automatisk når du logger
              runder. Du ser om gapet til {refEtternavn} blir mindre over tid.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
              <Link
                href="/playerhq"
                style={{ textDecoration: "none" }}
                className="stats-btn stats-btn-outline stats-btn-lg"
              >
                <span>Prøv PlayerHQ gratis i 30 dager</span>
                <ArrowRight size={15} className="stats-btn-icon" />
              </Link>
              <Link
                href="/stats/sg-sammenlign/start"
                className="stats-btn stats-btn-ghost stats-btn-lg"
                style={{ textDecoration: "none", color: "rgba(250,250,247,0.8)" }}
              >
                <RotateCcw size={15} />
                <span>Ny sammenligning</span>
              </Link>
            </div>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(209,248,67,0.2)",
              borderRadius: 14,
              padding: 24,
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
                  marginBottom: 12,
                  fontSize: 14,
                  color: "rgba(250,250,247,0.88)",
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "hsl(var(--accent))",
                    marginTop: 6,
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
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "hsl(var(--accent))",
                marginTop: 12,
              }}
            >
              300 KR/MND · GRATIS UNDER BETA
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <div
        style={{
          padding: "20px 40px",
          borderTop: "1px solid var(--s-border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 12,
          color: "hsl(var(--muted-foreground))",
          fontFamily: "var(--font-mono)",
        }}
      >
        <span>
          Lagret sammenligning #{id.slice(-6).toUpperCase()}
          {createdDate && ` · ${createdDate}`}
        </span>
        <Link
          href="/stats/sg-sammenlign"
          style={{
            color: "hsl(var(--primary))",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Mine sammenligninger →
        </Link>
      </div>
    </div>
  );
}
