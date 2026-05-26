/**
 * /portal/stats — PlayerHQ bruker dashboard (design 19)
 *
 * Krever requirePortalUser (PLAYER / COACH / ADMIN).
 * Data hentes fra: Round, BrukerSgInput, BrukerSammenligning, TournamentEntry
 */

import "../../(marketing)/stats/stats.css";
import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Zap, Trophy, Info } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
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
// Data-henting
// ---------------------------------------------------------------------------

async function hentBrukerStats(userId: string) {
  const now = new Date();
  const dag30Siden = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const arStart = new Date(now.getFullYear(), 0, 1);

  const [
    runderSiste30,
    alleRunderIAar,
    sgInputsSiste30,
    sisteInput,
    nesteTurnering,
    totalSgInputs,
  ] = await Promise.all([
    // Runder siste 30 dager
    prisma.round.findMany({
      where: { userId, playedAt: { gte: dag30Siden } },
      orderBy: { playedAt: "desc" },
      select: { score: true, playedAt: true, sgTotal: true, sgOtt: true, sgApp: true, sgArg: true, sgPutt: true, course: { select: { name: true } } },
    }),
    // Alle runder i år (for beste runde + trend)
    prisma.round.findMany({
      where: { userId, playedAt: { gte: arStart } },
      orderBy: { playedAt: "asc" },
      select: { score: true, playedAt: true },
    }),
    // SG-inputs siste 30 dager (proxy for SG-trend)
    prisma.brukerSgInput.findMany({
      where: { userId, dato: { gte: dag30Siden } },
      orderBy: { dato: "desc" },
      select: { sgTotal: true, sgOtt: true, sgApp: true, sgArg: true, sgPutt: true, dato: true, snittScore: true },
    }),
    // Siste SG-input (for radar + insights)
    prisma.brukerSgInput.findFirst({
      where: { userId },
      orderBy: { dato: "desc" },
      select: { sgTotal: true, sgOtt: true, sgApp: true, sgArg: true, sgPutt: true, dato: true },
    }),
    // Neste turnering (fremover i tid)
    prisma.tournamentEntry.findFirst({
      where: {
        userId,
        entryStatus: { in: ["PLANNED", "CONFIRMED"] },
        OR: [
          { tournament: { startDate: { gt: now } } },
          { manualDate: { gt: now } },
        ],
      },
      orderBy: [
        { tournament: { startDate: "asc" } },
        { manualDate: "asc" },
      ],
      select: {
        manualName: true,
        manualDate: true,
        tournament: { select: { name: true, startDate: true, location: true } },
      },
    }),
    // Totalt antall SG-inputs
    prisma.brukerSgInput.count({ where: { userId } }),
  ]);

  // Beregn snitt siste 30 dager
  const snittSiste30 = runderSiste30.length > 0
    ? runderSiste30.reduce((s, r) => s + r.score, 0) / runderSiste30.length
    : null;

  // Siste runde
  const sisteRunde = runderSiste30[0] ?? null;

  // Beste runde i år
  const besteIAar = alleRunderIAar.length > 0
    ? alleRunderIAar.reduce((best, r) => r.score < best.score ? r : best)
    : null;

  // Score-trend: årssnitt for siste 2 år (enkel versjon)
  const forrigeArStart = new Date(now.getFullYear() - 1, 0, 1);
  const forrigeArSlutt = new Date(now.getFullYear(), 0, 1);
  const [runderForrigeAr, runderDenneAr] = await Promise.all([
    prisma.round.findMany({
      where: { userId, playedAt: { gte: forrigeArStart, lt: forrigeArSlutt } },
      select: { score: true },
    }),
    prisma.round.findMany({
      where: { userId, playedAt: { gte: arStart } },
      select: { score: true },
    }),
  ]);

  const scoreTrend = [];
  if (runderForrigeAr.length > 0) {
    scoreTrend.push({
      aar: now.getFullYear() - 1,
      snitt: runderForrigeAr.reduce((s, r) => s + r.score, 0) / runderForrigeAr.length,
      antall: runderForrigeAr.length,
    });
  }
  if (runderDenneAr.length > 0) {
    scoreTrend.push({
      aar: now.getFullYear(),
      snitt: runderDenneAr.reduce((s, r) => s + r.score, 0) / runderDenneAr.length,
      antall: runderDenneAr.length,
    });
  }

  // SG-per-kategori fra siste input (radar)
  const sgPerKategori = sisteInput
    ? {
        ott: sisteInput.sgOtt ?? 0,
        app: sisteInput.sgApp ?? 0,
        arg: sisteInput.sgArg ?? 0,
        putt: sisteInput.sgPutt ?? 0,
      }
    : null;

  // Diff forrige uke (enkel sammenligning siste 7 vs forrige 7 dager)
  const dag7Siden = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const dag14_7 = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const [runderSiste7, runderForrige7] = await Promise.all([
    prisma.round.findMany({ where: { userId, playedAt: { gte: dag7Siden } }, select: { score: true } }),
    prisma.round.findMany({ where: { userId, playedAt: { gte: dag14_7, lt: dag7Siden } }, select: { score: true } }),
  ]);
  const snitt7 = runderSiste7.length > 0 ? runderSiste7.reduce((s, r) => s + r.score, 0) / runderSiste7.length : null;
  const snittForrige7 = runderForrige7.length > 0 ? runderForrige7.reduce((s, r) => s + r.score, 0) / runderForrige7.length : null;
  const diffForrigeUke = snitt7 !== null && snittForrige7 !== null ? snitt7 - snittForrige7 : null;

  // Regelbaserte insights
  type InsightType = "celebrate" | "warning" | "trophy" | "info";
  const insights: { type: InsightType; tittel: string; tekst: string }[] = [];

  if (totalSgInputs >= 5 && sgInputsSiste30.length > 0 && sisteInput?.sgTotal !== null && sisteInput?.sgTotal !== undefined) {
    const eldre = await prisma.brukerSgInput.findFirst({
      where: { userId, dato: { lt: dag30Siden } },
      orderBy: { dato: "desc" },
      select: { sgTotal: true },
    });
    if (eldre?.sgTotal !== null && eldre?.sgTotal !== undefined && sisteInput.sgTotal !== null) {
      const forbedring = eldre.sgTotal - sisteInput.sgTotal;
      if (forbedring > 0) {
        insights.push({
          type: "celebrate",
          tittel: "SG-fremgang siste 30 dager",
          tekst: `Ditt SG-total forbedret seg med ${forbedring.toFixed(2)} slag per runde sammenlignet med forrige periode.`,
        });
      }
    }
  }

  if (totalSgInputs > 0 && sisteInput) {
    const dagSidenInput = (now.getTime() - new Date(sisteInput.dato).getTime()) / (1000 * 60 * 60 * 24);
    if (dagSidenInput > 14) {
      insights.push({
        type: "warning",
        tittel: "Ingen SG-input siste 14 dager",
        tekst: `Siste SG-registrering er for ${Math.round(dagSidenInput)} dager siden. Legg inn nye data for å holde analysen oppdatert.`,
      });
    }
  }

  if (besteIAar) {
    const par = 72;
    const tilPar = besteIAar.score - par;
    insights.push({
      type: "trophy",
      tittel: `Beste runde i ${now.getFullYear()}`,
      tekst: `${besteIAar.score} (${tilPar <= 0 ? tilPar : "+" + tilPar} til par) — registrert ${new Date(besteIAar.playedAt).toLocaleDateString("nb-NO", { day: "numeric", month: "long" })}.`,
    });
  }

  if (insights.length === 0 && totalSgInputs === 0 && runderSiste30.length === 0) {
    insights.push({
      type: "info",
      tittel: "Kom i gang med statistikk",
      tekst: "Logg din første runde eller legg inn SG-data for å få personlige innsikter og trendanalyser.",
    });
  }

  // Neste turnering-data
  const nesteTurneringData = nesteTurnering
    ? {
        navn: nesteTurnering.tournament?.name ?? nesteTurnering.manualName ?? "Ukjent",
        dato: (nesteTurnering.tournament?.startDate ?? nesteTurnering.manualDate ?? now).toLocaleDateString("nb-NO", { day: "numeric", month: "long" }),
        sted: nesteTurnering.tournament?.location ?? null,
      }
    : null;

  return {
    snittSiste30,
    diffForrigeUke,
    runderSiste30: runderSiste30.length,
    sisteRunde: sisteRunde
      ? {
          score: sisteRunde.score,
          tilPar: sisteRunde.score - 72,
          bane: sisteRunde.course?.name ?? "Ukjent bane",
          dato: new Date(sisteRunde.playedAt).toLocaleDateString("nb-NO", { day: "numeric", month: "long" }),
        }
      : null,
    besteIAar: besteIAar
      ? {
          score: besteIAar.score,
          tilPar: besteIAar.score - 72,
        }
      : null,
    scoreTrend,
    sgPerKategori,
    insights,
    nesteTurnering: nesteTurneringData,
    harData: runderSiste30.length > 0 || totalSgInputs > 0,
  };
}

// ---------------------------------------------------------------------------
// Innsikt-kort farging
// ---------------------------------------------------------------------------

const INSIGHT_ICON = {
  celebrate: Sparkles,
  warning: Zap,
  trophy: Trophy,
  info: Info,
} as const;

const INSIGHT_BG = {
  celebrate: "rgba(209,248,67,0.12)",
  warning: "rgba(181,115,23,0.08)",
  trophy: "rgba(0,88,64,0.08)",
  info: "rgba(0,88,64,0.05)",
} as const;

const INSIGHT_BORDER = {
  celebrate: "rgba(209,248,67,0.4)",
  warning: "rgba(181,115,23,0.3)",
  trophy: "rgba(0,88,64,0.2)",
  info: "rgba(0,88,64,0.15)",
} as const;

const INSIGHT_ICON_COLOR = {
  celebrate: "var(--s-accent-fg)",
  warning: "#B57317",
  trophy: "var(--s-primary)",
  info: "var(--s-primary)",
} as const;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function PortalStatsPage() {
  const user = await requirePortalUser();
  const stats = await hentBrukerStats(user.id);
  const erGratis = user.tier === "GRATIS";
  const fornavn = (user.name ?? "Spiller").split(" ")[0] ?? "Spiller";

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
                  {fornavn}
                </em>
                .
              </h1>
              {stats.harData ? (
                <p className="stats-hero-sub" style={{ maxWidth: 560, marginTop: 12 }}>
                  {stats.runderSiste30 > 0 ? (
                    <>
                      Du spilte {stats.runderSiste30} runde{stats.runderSiste30 !== 1 ? "r" : ""} siste 30 dager.
                      {stats.diffForrigeUke !== null && (
                        <>
                          {" "}Snittet ditt{" "}
                          {stats.diffForrigeUke < 0 ? "forbedret seg" : "gikk opp"}{" "}
                          <strong className="font-mono">
                            {Math.abs(stats.diffForrigeUke).toFixed(1)} strokes
                          </strong>{" "}
                          mot uka før.
                        </>
                      )}
                    </>
                  ) : (
                    "Ingen runder registrert siste 30 dager. Logg en ny runde for å starte trackingen."
                  )}
                </p>
              ) : (
                <p className="stats-hero-sub" style={{ maxWidth: 560, marginTop: 12 }}>
                  Ingen data registrert ennå. Logg din første runde for å komme i gang.
                </p>
              )}
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
              {stats.snittSiste30 !== null ? (
                <CountUp value={stats.snittSiste30} decimals={1} />
              ) : (
                <span style={{ color: "var(--s-muted-fg)", fontSize: 28 }}>—</span>
              )}
            </div>
            <div className="stats-kpi-sub" style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {stats.diffForrigeUke !== null ? (
                <>
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
                </>
              ) : (
                "snitt brutto"
              )}
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
            {stats.sisteRunde ? (
              <>
                <div className="stats-kpi-value">
                  {stats.sisteRunde.score}{" "}
                  <span style={{ fontSize: 18, color: "var(--s-muted-fg)" }}>
                    ({stats.sisteRunde.tilPar <= 0 ? stats.sisteRunde.tilPar : `+${stats.sisteRunde.tilPar}`})
                  </span>
                </div>
                <div className="stats-kpi-sub">
                  {stats.sisteRunde.bane} · {stats.sisteRunde.dato}
                </div>
              </>
            ) : (
              <>
                <div className="stats-kpi-value" style={{ color: "var(--s-muted-fg)", fontSize: 28 }}>—</div>
                <div className="stats-kpi-sub">ingen runder ennå</div>
              </>
            )}
          </div>
          <div className="stats-kpi">
            <div className="stats-kpi-eyebrow">Beste i {now.getFullYear()}</div>
            {stats.besteIAar ? (
              <>
                <div className="stats-kpi-value" style={{ color: "var(--s-primary)" }}>
                  {stats.besteIAar.score}
                </div>
                <div className="stats-kpi-sub">
                  {stats.besteIAar.tilPar < 0 ? stats.besteIAar.tilPar : `+${stats.besteIAar.tilPar}`} til par
                </div>
              </>
            ) : (
              <>
                <div className="stats-kpi-value" style={{ color: "var(--s-muted-fg)", fontSize: 28 }}>—</div>
                <div className="stats-kpi-sub">ingen runder ennå</div>
              </>
            )}
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
              {stats.scoreTrend.length > 0 ? (
                <StatsTrendGraf data={stats.scoreTrend} height={220} />
              ) : (
                <div
                  style={{
                    height: 220,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--s-muted-fg)",
                    fontSize: 14,
                  }}
                >
                  Ingen runder registrert ennå
                </div>
              )}
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
              {stats.sgPerKategori ? (
                <>
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
                    {(() => {
                      const sg = stats.sgPerKategori;
                      const verste = Object.entries(sg).sort(([, a], [, b]) => a - b)[0];
                      const labels: Record<string, string> = { ott: "Utspark", app: "Innspill", arg: "Nærspill", putt: "Putting" };
                      return `Største gap: ${labels[verste[0]] ?? verste[0]} (${verste[1].toFixed(1)})`;
                    })()}{" "}
                    ·{" "}
                    <Link
                      href="/stats/min-progresjon"
                      style={{ color: "var(--s-primary)", textDecoration: "none" }}
                    >
                      Åpne full sammenligning →
                    </Link>
                  </div>
                </>
              ) : (
                <div
                  style={{
                    height: 220,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    color: "var(--s-muted-fg)",
                    fontSize: 14,
                    textAlign: "center",
                  }}
                >
                  <span>Ingen SG-data registrert ennå.</span>
                  <Link
                    href="/stats/sg-sammenlign"
                    style={{ color: "var(--s-primary)", textDecoration: "none", fontSize: 13 }}
                  >
                    Legg inn SG-data →
                  </Link>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Insights */}
      <section className="stats-section stats-section-divider">
        <Reveal>
          <div className="stats-section-head">
            <div>
              <StatsEyebrow>Insights</StatsEyebrow>
              <h2 className="font-display">
                {stats.insights.length === 1 ? "En" : stats.insights.length === 2 ? "To" : "Tre"}{" "}
                <em style={{ fontStyle: "italic", fontWeight: 400, color: "var(--s-primary)" }}>
                  observasjoner
                </em>{" "}
                basert på dine data.
              </h2>
            </div>
          </div>
        </Reveal>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {stats.insights.map((ins, i) => {
            const type = ins.type as "celebrate" | "warning" | "trophy" | "info";
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
      {stats.nesteTurnering && (
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
                  {stats.nesteTurnering.sted && (
                    <div style={{ marginTop: 12, color: "rgba(250,250,247,0.7)", fontSize: 15 }}>
                      {stats.nesteTurnering.sted}
                    </div>
                  )}
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
      )}

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
