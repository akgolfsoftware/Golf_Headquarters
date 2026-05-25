/**
 * /stats/uka — Ukentlig editorial roundup
 * Server-rendered, ISR revalidate 86400 (24t).
 * Editorial newsletter-stil — henter norske resultater fra siste uke.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import "../../stats/stats.css";
import "./uka.css";
import { StatsEyebrow } from "@/components/stats/eyebrow";
import { Reveal } from "@/components/stats/reveal";
import { CountUp } from "@/components/stats/count-up";
import { StatsInitialAvatar } from "@/components/stats/stats-initial-avatar";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Ukentlig roundup — AK Golf Stats",
  description: "Norsk golf oppsummert fra forrige uke. Resultater, ukens spiller, kommende turneringer.",
  openGraph: {
    title: "Ukentlig roundup — AK Golf Stats",
    description: "Norsk golf på 60 sekunder. Oppdateres hver mandag.",
  },
};

function getUkeNummer(dato: Date): number {
  const d = new Date(Date.UTC(dato.getFullYear(), dato.getMonth(), dato.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function getUkeRange(fromDate: Date) {
  const monday = new Date(fromDate);
  const day = monday.getDay() || 7;
  monday.setDate(monday.getDate() - day + 1);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { monday, sunday };
}

async function getUkesData() {
  const now = new Date();
  const { monday, sunday } = getUkeRange(now);

  try {
    const turneringer = await prisma.tournament.findMany({
      where: {
        startDate: { gte: monday, lte: sunday },
        publicEntries: { some: {} },
      },
      include: {
        publicEntries: {
          include: { player: true },
          orderBy: { position: "asc" },
          take: 5,
        },
      },
      orderBy: { startDate: "asc" },
      take: 20,
    });

    const alleEntries = turneringer.flatMap((t) =>
      t.publicEntries.map((e) => ({ ...e, tournament: t }))
    );

    const bestEntry = alleEntries
      .filter((e) => e.position !== null)
      .sort((a, b) => (a.position ?? 999) - (b.position ?? 999))[0] ?? null;

    const lavScore = alleEntries
      .filter((e) => e.totalScore !== null)
      .sort((a, b) => (a.totalScore ?? 999) - (b.totalScore ?? 999))[0] ?? null;

    // Kommende neste uke
    const { monday: nextMon, sunday: nextSun } = getUkeRange(
      new Date(now.getTime() + 7 * 86400 * 1000)
    );

    const kommendeNeste = await prisma.tournament.findMany({
      where: { startDate: { gte: nextMon, lte: nextSun } },
      orderBy: { startDate: "asc" },
      take: 8,
    });

    return {
      ukeNummer: getUkeNummer(monday),
      aar: monday.getFullYear(),
      fra: monday,
      til: sunday,
      turneringer,
      alleEntries,
      bestEntry,
      lavScore,
      antallSpillere: new Set(alleEntries.map((e) => e.playerId)).size,
      antallTurneringer: turneringer.length,
      kommendeNeste,
    };
  } catch {
    return null;
  }
}

const TOUR_LABELS: Record<string, string> = {
  "pga": "PGA Tour",
  "dp": "DP World Tour",
  "korn-ferry": "Korn Ferry",
  "lpga": "LPGA",
  "let": "LET",
  "srixon": "Srixon Tour",
  "olyo": "OLYO",
  "ngc": "NGC",
  "amateur-no": "Norsk amatør",
  "junior-no": "Junior",
};

function tourLabel(tour: string | null) {
  return TOUR_LABELS[tour ?? ""] ?? tour ?? "Tour";
}

export default async function UkaPage() {
  const data = await getUkesData();

  const formatDato = (d: Date) =>
    d.toLocaleDateString("nb-NO", { day: "numeric", month: "long" });

  return (
    <main className="stats-uka-wrap">

      {/* Hero */}
      <section className="stats-uka-hero">
        <Reveal>
          <div className="stats-uka-hero-eyebrow">
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--s-primary)" }}>
              UKE {data?.ukeNummer ?? "—"} · {data?.aar ?? new Date().getFullYear()}
            </span>
            {data && (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--s-muted-fg)" }}>
                {formatDato(data.fra).toUpperCase()} — {formatDato(data.til).toUpperCase()}
              </span>
            )}
          </div>
        </Reveal>
        <Reveal delay={60}>
          <h1 className="stats-uka-headline">
            Norsk golf<br/>
            <em style={{ fontStyle: "italic", fontWeight: 400, color: "var(--s-primary)" }}>denne uken.</em>
          </h1>
        </Reveal>
        <Reveal delay={120}>
          <p className="stats-uka-sub">
            Alle norske resultater, ukens spiller og hva som venter neste uke — på 60 sekunder.
          </p>
        </Reveal>
      </section>

      {/* KPI Strip */}
      <div className="stats-kpi-strip">
        <div className="stats-kpi">
          <div className="stats-kpi-eyebrow">NORSKE SPILLERE</div>
          <div className="stats-kpi-value">
            <CountUp value={data?.antallSpillere ?? 0} />
          </div>
          <div className="stats-kpi-sub">spilte denne uka</div>
        </div>
        <div className="stats-kpi">
          <div className="stats-kpi-eyebrow">TURNERINGER</div>
          <div className="stats-kpi-value">
            <CountUp value={data?.antallTurneringer ?? 0} />
          </div>
          <div className="stats-kpi-sub">på tvers av tourer</div>
        </div>
        <div className="stats-kpi" style={{ background: "var(--s-accent)", color: "var(--s-accent-fg)" }}>
          <div className="stats-kpi-eyebrow" style={{ color: "var(--s-accent-fg)" }}>RESULTATER REGISTRERT</div>
          <div className="stats-kpi-value">
            <CountUp value={data?.alleEntries.length ?? 0} />
          </div>
          <div className="stats-kpi-sub" style={{ color: "var(--s-accent-fg)" }}>deltaker-rader</div>
        </div>
      </div>

      {/* Ukens spiller */}
      {data?.bestEntry && (
        <section className="stats-section stats-section-divider">
          <Reveal>
            <StatsEyebrow>Ukens spiller</StatsEyebrow>
          </Reveal>
          <Reveal delay={60}>
            <div className="stats-uka-featured-card">
              <div className="stats-uka-featured-inner">
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--s-muted-fg)", marginBottom: 16 }}>
                  UKENS SPILLER
                </div>
                <div className="stats-uka-featured-name">
                  {data.bestEntry.player.name.split(" ").slice(0, -1).join(" ")}{" "}
                  <em style={{ fontStyle: "italic", fontWeight: 400 }}>
                    {data.bestEntry.player.name.split(" ").slice(-1)[0]}
                  </em>
                </div>
                <p className="stats-uka-featured-desc">
                  Beste norske i {data.bestEntry.tournament.name} — posisjon #{data.bestEntry.position ?? "—"} med totalscore{" "}
                  {data.bestEntry.scoreToPar !== null && data.bestEntry.scoreToPar !== undefined
                    ? `${data.bestEntry.scoreToPar < 0 ? "" : "+"}${data.bestEntry.scoreToPar}`
                    : `${data.bestEntry.totalScore ?? "—"}`}.
                </p>
                <div className="stats-uka-featured-footer">
                  <StatsInitialAvatar name={data.bestEntry.player.name} size="md" />
                  <Link href={`/stats/spillere/${data.bestEntry.player.slug}`} className="stats-uka-profil-link">
                    Se hele profilen →
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* Ukens runde */}
      {data?.lavScore && (
        <section className="stats-section stats-section-divider">
          <Reveal>
            <StatsEyebrow>Ukens runde</StatsEyebrow>
          </Reveal>
          <Reveal delay={60}>
            <div className="stats-uka-runde-card">
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--s-muted-fg)", marginBottom: 8 }}>
                  UKENS RUNDE
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 64, fontWeight: 500, lineHeight: 1, color: "var(--s-primary)", fontVariantNumeric: "tabular-nums" }}>
                    {data.lavScore.totalScore ?? "—"}
                  </span>
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600 }}>
                      {data.lavScore.tournament.shortName ?? data.lavScore.tournament.name}
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--s-muted-fg)", marginTop: 4 }}>
                      av {data.lavScore.player.name} · {tourLabel(data.lavScore.tournament.tour ?? null)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* Resultatliste */}
      {data && data.alleEntries.length > 0 && (
        <section className="stats-section stats-section-divider">
          <Reveal>
            <div className="stats-section-head">
              <div>
                <StatsEyebrow>Alle norske</StatsEyebrow>
                <h2>Resultater <em style={{ fontStyle: "italic", fontWeight: 400, color: "var(--s-primary)" }}>denne uken</em></h2>
              </div>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="stats-uka-table-wrap">
              <table className="stats-uka-table">
                <thead>
                  <tr>
                    <th>TOUR</th>
                    <th>SPILLER</th>
                    <th>TURNERING</th>
                    <th>POS</th>
                    <th>SCORE</th>
                  </tr>
                </thead>
                <tbody>
                  {data.alleEntries.slice(0, 25).map((e) => (
                    <tr key={e.id}>
                      <td>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--s-muted-fg)" }}>
                          {tourLabel(e.tournament.tour ?? null)}
                        </span>
                      </td>
                      <td>
                        <Link href={`/stats/spillere/${e.player.slug}`} style={{ color: "var(--s-primary)", textDecoration: "none", fontWeight: 500 }}>
                          {e.player.name}
                        </Link>
                      </td>
                      <td style={{ color: "var(--s-muted-fg)", fontSize: 13 }}>
                        {e.tournament.shortName ?? e.tournament.name}
                      </td>
                      <td>
                        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: (e.position ?? 99) <= 3 ? "var(--s-primary)" : "inherit" }}>
                          {e.position !== null && e.position !== undefined ? `#${e.position}` : "—"}
                          {(e.position ?? 99) <= 3 && " ★"}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>
                          {e.scoreToPar !== null && e.scoreToPar !== undefined
                            ? `${e.scoreToPar < 0 ? "" : e.scoreToPar === 0 ? "E" : "+"}${e.scoreToPar !== 0 ? e.scoreToPar : ""}`
                            : e.totalScore ?? "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </section>
      )}

      {/* Ukens fakta */}
      <section className="stats-section stats-section-divider">
        <Reveal>
          <div className="stats-uka-pullquote">
            <div className="stats-uka-pullquote-mark">&ldquo;</div>
            <blockquote className="stats-uka-pullquote-text">
              {data && data.alleEntries.length > 0
                ? `${data.antallSpillere} norske golfspillere spilte på ${data.antallTurneringer} turneringer denne uken.`
                : "Ingen norske resultater registrert denne uken ennå."}
            </blockquote>
            <div className="stats-uka-pullquote-credit">AK Golf Stats redaksjon · uke {data?.ukeNummer ?? "—"}</div>
          </div>
        </Reveal>
      </section>

      {/* Kommende uke */}
      {data && data.kommendeNeste.length > 0 && (
        <section className="stats-section stats-section-divider">
          <Reveal>
            <StatsEyebrow>Kommende uke</StatsEyebrow>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, marginTop: 12, marginBottom: 24 }}>
              Hva skjer neste uke?
            </h2>
          </Reveal>
          <div className="stats-uka-kommende-grid">
            {data.kommendeNeste.map((t, i) => (
              <Reveal key={t.id} delay={i * 60}>
                <div className="stats-uka-kommende-card">
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--s-muted-fg)", marginBottom: 8 }}>
                    {t.startDate.toLocaleDateString("nb-NO", { weekday: "short", day: "numeric", month: "short" }).toUpperCase()}
                  </div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, lineHeight: 1.3, marginBottom: 4 }}>
                    {t.shortName ?? t.name}
                  </div>
                  {t.tour && (
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--s-primary)", letterSpacing: "0.06em" }}>
                      {tourLabel(t.tour)}
                    </div>
                  )}
                  {t.norskeAntall && t.norskeAntall > 0 ? (
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--s-muted-fg)", marginTop: 4 }}>
                      {t.norskeAntall} norske
                    </div>
                  ) : null}
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Nyhetsbrev CTA */}
      <section className="stats-section stats-section-divider">
        <Reveal>
          <div className="stats-uka-nl-band">
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
                Fa ukens roundup i innboksen.
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--s-muted-fg)", letterSpacing: "0.06em" }}>
                HVER MANDAG MORGEN · 60 SEKUNDER A LESE · GRATIS
              </div>
            </div>
            <form className="stats-uka-nl-form" action="/api/newsletter/subscribe" method="POST">
              <input
                type="email"
                name="email"
                placeholder="din@email.com"
                required
                className="stats-uka-nl-input"
                aria-label="E-postadresse for nyhetsbrev"
              />
              <button type="submit" className="stats-btn stats-btn-primary stats-btn-md">
                Meld pa
              </button>
            </form>
          </div>
        </Reveal>
      </section>

      {/* Arsiv-footer */}
      <section className="stats-section stats-section-divider">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          {data && data.ukeNummer > 1 && (
            <Link href={`/stats/uka/${data.aar}-${data.ukeNummer - 1}`} style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--s-primary)", textDecoration: "none" }}>
              ← Uke {data.ukeNummer - 1}
            </Link>
          )}
          <Link href="/stats" style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--s-muted-fg)", textDecoration: "none" }}>
            Tilbake til Stats Hub
          </Link>
        </div>
      </section>

    </main>
  );
}
