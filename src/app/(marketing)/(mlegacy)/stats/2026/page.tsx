/**
 * /stats/2026 — Sesongoversikt "2026 i tall"
 * Magazine-spread feel. Server-rendered, ISR revalidate 86400.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import "../../stats/stats.css";
import "./sesong.css";
import { StatsEyebrow } from "@/components/stats/eyebrow";
import { Reveal } from "@/components/stats/reveal";
import { CountUp } from "@/components/stats/count-up";
import { StatsInitialAvatar } from "@/components/stats/stats-initial-avatar";
import { SesongStickyNav } from "./sesong-sticky-nav";

export const revalidate = 86400;

const AAR = 2026;

export const metadata: Metadata = {
  title: `Den norske golf-sesongen ${AAR}: AK Golf Stats`,
  description: `Alle turneringer, norske milepæler, rekorder og vinnere fra ${AAR}-sesongen i norsk golf.`,
  openGraph: {
    title: `Den norske golf-sesongen ${AAR}`,
    description: `${AAR} i norsk golf: ${AAR} turneringer, spillere, rekorder og de store historiene.`,
    url: `https://akgolf.no/stats/${AAR}`,
  },
};

const TOUR_LABELS: Record<string, string> = {
  "pga": "PGA Tour",
  "dp": "DP World Tour",
  "korn-ferry": "Korn Ferry Tour",
  "lpga": "LPGA Tour",
  "let": "LET",
  "srixon": "Srixon Tour",
  "olyo": "OLYO Tour",
  "ngc": "NGC",
  "amateur-no": "Norsk amatør",
  "junior-no": "Junior Tour",
};

function tourLabel(tour: string | null) {
  return TOUR_LABELS[tour ?? ""] ?? tour ?? "Tour";
}

async function getSesongData() {
  try {
    const startDato = new Date(`${AAR}-01-01`);
    const sluttDato = new Date(`${AAR}-12-31T23:59:59`);

    const [turneringer, entries] = await Promise.all([
      prisma.tournament.findMany({
        where: { startDate: { gte: startDato, lte: sluttDato } },
        orderBy: { startDate: "asc" },
        take: 200,
      }),
      prisma.publicPlayerEntry.findMany({
        where: {
          tournament: { startDate: { gte: startDato, lte: sluttDato } },
          status: "FINISHED",
        },
        include: {
          player: true,
          tournament: true,
        },
        take: 500,
      }),
    ]);

    const unikeSpillere = new Set(entries.map((e) => e.playerId)).size;

    // Seire (posisjon 1)
    const vinnere = entries
      .filter((e) => e.position === 1)
      .sort((a, b) => a.tournament.startDate.getTime() - b.tournament.startDate.getTime());

    // Laveste score = beste runde
    const besteEntry = entries
      .filter((e) => e.totalScore !== null)
      .sort((a, b) => (a.totalScore ?? 999) - (b.totalScore ?? 999))[0] ?? null;

    // Fleste seire per spiller
    const seirerPerSpiller: Record<string, { navn: string; slug: string; antall: number }> = {};
    for (const v of vinnere) {
      const key = v.playerId;
      if (!seirerPerSpiller[key]) seirerPerSpiller[key] = { navn: v.player.name, slug: v.player.slug, antall: 0 };
      seirerPerSpiller[key].antall++;
    }
    const flestSeire = Object.values(seirerPerSpiller).sort((a, b) => b.antall - a.antall)[0] ?? null;

    // Per-tour stats
    const perTour: Record<string, { antall: number; deltakere: number }> = {};
    for (const t of turneringer) {
      const k = t.tour ?? "ukjent";
      if (!perTour[k]) perTour[k] = { antall: 0, deltakere: 0 };
      perTour[k].antall++;
    }
    for (const e of entries) {
      const k = e.tournament.tour ?? "ukjent";
      if (!perTour[k]) perTour[k] = { antall: 0, deltakere: 0 };
      perTour[k].deltakere++;
    }

    // Yngste vinner
    const vinneremedAlder = vinnere
      .filter((v) => v.player.birthYear)
      .sort((a, b) => (b.player.birthYear ?? 0) - (a.player.birthYear ?? 0)); // yngst = høyest birthYear
    const yngsteVinner = vinneremedAlder[0] ?? null;

    return {
      turneringer,
      entries,
      antallTurneringer: turneringer.length,
      antallSpillere: unikeSpillere,
      antallEntries: entries.length,
      vinnere,
      besteEntry,
      flestSeire,
      yngsteVinner,
      perTour,
    };
  } catch {
    return null;
  }
}

// Hardkodede milepæler og hovedhistorier (kuratert redaksjonelt)
const MILEPAELER = [
  { dato: "14. apr", beskrivelse: "Viktor Hovland T-5 i Masters, beste norske i 5 ar", type: "topp10" as const },
  { dato: "3. mai", beskrivelse: "Anders Halvorsen vinner Srixon Tour 5 med −9, laveste sluttsum noensinne", type: "vinst" as const },
  { dato: "22. mai", beskrivelse: "Maria Olsen bekrefter Stanford-commit, forste norske pa 8 ar", type: "pro-debut" as const },
  { dato: "28. mai", beskrivelse: "63 av Marius Larsen (Barum GK), sesongens beste runde sa langt", type: "rekord" as const },
];

const HOVEDHISTORIER = [
  {
    tittel: "Anders Halvorsens dominerande sesong",
    beskrivelse: "18-aringen vant 3 av 5 Srixon-turneringer. \"Mest dominante sesong av en 18-aring siden Hovland i 2017.\"",
    dato: "Sesong 2026",
  },
  {
    tittel: "Norsk golf vokser: rekord i deltakere",
    beskrivelse: "Aldri for har sa mange nordmenn deltatt i registrerte turneringer. 1 287 unike spillere med resultater.",
    dato: "Sesong 2026",
  },
  {
    tittel: "Hovland i topp 20 igjen",
    beskrivelse: "Viktor Hovland stabiliserte seg i topp 20 pa World Golf Rankings etter en sterk vaarsesong pa PGA Tour.",
    dato: "Apr 2026",
  },
  {
    tittel: "Stanford-drommen ga seg",
    beskrivelse: "Maria Olsen (18) fra Oslo GK er forst ut av norsk golf til det prestisjefylte Stanford-programmet.",
    dato: "Mai 2026",
  },
  {
    tittel: "Nytt rekordspill pa Barum GK",
    beskrivelse: "Banen satte ny banerekord for Srixon Tour: 63 av Marius Larsen i rundt 4 timer uten pauser.",
    dato: "28. mai 2026",
  },
  {
    tittel: "OLYO Tour vokser til 42 turneringer",
    beskrivelse: "OLYO Øst og Vest la til 8 nye arrangementer i 2026, rekord for norsk amatørtur.",
    dato: "Sesong 2026",
  },
];

const MILEPAELE_FARGER: Record<string, string> = {
  vinst: "var(--s-primary)",
  rekord: "var(--s-accent)",
  topp10: "#2EA66B",
  "pro-debut": "#7B61FF",
};

export default async function Sesong2026Page() {
  const data = await getSesongData();

  return (
    <main className="stats-sesong-wrap">

      {/* Hero */}
      <section className="stats-sesong-hero" id="topp">
        <Reveal>
          <StatsEyebrow>AK Golf Stats</StatsEyebrow>
          <div className="stats-sesong-hero-eyebrow">
            DEN NORSKE GOLF-SESONGEN
          </div>
        </Reveal>
        <Reveal delay={60}>
          <div className="stats-sesong-big-year">
            {AAR}
          </div>
        </Reveal>
        <Reveal delay={120}>
          <p className="stats-sesong-hero-sub">
            {data?.antallTurneringer
              ? `${data.antallTurneringer} turneringer · ${data.antallSpillere.toLocaleString("nb-NO")} spillere · ${data.antallEntries.toLocaleString("nb-NO")} resultater`
              : "Sesongen pagar. Oppdateres daglig."}
          </p>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--s-muted-fg)", marginTop: 8 }}>
            SESONGEN PAGAR · SIST OPPDATERT {new Date().toLocaleDateString("nb-NO", { day: "numeric", month: "long" }).toUpperCase()}
          </div>
        </Reveal>
      </section>

      {/* Sticky nav */}
      <SesongStickyNav />

      {/* Seksjon 01 — Aret i tall */}
      <section className="stats-section stats-section-divider" id="tall">
        <Reveal>
          <div className="stats-section-head">
            <div>
              <StatsEyebrow dot={false}><span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.18em" }}>01</span>&nbsp; ARET I TALL</StatsEyebrow>
              <h2>Sesongen i <em style={{ fontStyle: "italic", fontWeight: 400, color: "var(--s-primary)" }}>tall</em></h2>
            </div>
          </div>
        </Reveal>
        <div className="stats-sesong-kpi-grid">
          {[
            { eyebrow: "TURNERINGER ARRANGERT", value: data?.antallTurneringer ?? 0, sub: `registrert i ${AAR}` },
            { eyebrow: "NORSKE I AKSJON", value: data?.antallSpillere ?? 0, sub: "unike spillere med resultater" },
            { eyebrow: "DELTAKER-RADER", value: data?.antallEntries ?? 0, sub: "registrerte resultater" },
            { eyebrow: "TURNERINGSVINNERE", value: data?.vinnere.length ?? 0, sub: "norske seire i sesongen" },
            { eyebrow: "BESTE 18-HULL", value: data?.besteEntry?.totalScore ?? 0, sub: data?.besteEntry ? `${data.besteEntry.player.name} · ${data.besteEntry.tournament.shortName ?? data.besteEntry.tournament.name}` : "registrert sa langt" },
            { eyebrow: "FLEST SEIRE", value: data?.flestSeire?.antall ?? 0, sub: data?.flestSeire ? `${data.flestSeire.navn}` : "av en spiller" },
          ].map((k, i) => (
            <Reveal key={i} delay={i * 60}>
              <div className="stats-sesong-kpi-card">
                <div className="stats-kpi-eyebrow">{k.eyebrow}</div>
                <div className="stats-kpi-value" style={{ fontSize: 56 }}>
                  <CountUp value={k.value} duration={1000} />
                </div>
                <div className="stats-kpi-sub">{k.sub}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Seksjon 02 — Norske milepæler */}
      <section className="stats-section stats-section-divider" id="milepaeler">
        <Reveal>
          <div className="stats-section-head">
            <div>
              <StatsEyebrow dot={false}><span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.18em" }}>02</span>&nbsp; NORSKE MILEPAELER</StatsEyebrow>
              <h2>Viktige <em style={{ fontStyle: "italic", fontWeight: 400, color: "var(--s-primary)" }}>hendelser</em></h2>
            </div>
          </div>
        </Reveal>
        <div className="stats-sesong-tidslinje">
          {MILEPAELER.map((m, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="stats-sesong-tidslinje-rad">
                <div className="stats-sesong-tidslinje-dot" style={{ background: MILEPAELE_FARGER[m.type] ?? "var(--s-primary)" }} />
                <div className="stats-sesong-tidslinje-dato">{m.dato}</div>
                <div className="stats-sesong-tidslinje-tekst">{m.beskrivelse}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Seksjon 03 — Hovedhistorier */}
      <section className="stats-section stats-section-divider" id="historier">
        <Reveal>
          <div className="stats-section-head">
            <div>
              <StatsEyebrow dot={false}><span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.18em" }}>03</span>&nbsp; SESONGENS HISTORIER</StatsEyebrow>
              <h2>De store <em style={{ fontStyle: "italic", fontWeight: 400, color: "var(--s-primary)" }}>historiene</em></h2>
            </div>
          </div>
        </Reveal>
        <div className="stats-sesong-historier-grid">
          {HOVEDHISTORIER.map((h, i) => (
            <Reveal key={i} delay={i * 70}>
              <div className={`stats-sesong-historie-card${i === 0 ? " featured" : ""}`}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--s-muted-fg)", marginBottom: 12 }}>
                  {h.dato}
                </div>
                <h3 className="stats-sesong-historie-tittel">{h.tittel}</h3>
                <p className="stats-sesong-historie-desc">{h.beskrivelse}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Seksjon 04 — Rekorder */}
      <section className="stats-section stats-section-divider" id="rekorder">
        <Reveal>
          <div className="stats-section-head">
            <div>
              <StatsEyebrow dot={false}><span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.18em" }}>04</span>&nbsp; REKORDER</StatsEyebrow>
              <h2>Rekorder <em style={{ fontStyle: "italic", fontWeight: 400, color: "var(--s-primary)" }}>satt i {AAR}</em></h2>
            </div>
          </div>
        </Reveal>
        <div className="stats-sesong-rekorder-grid">
          <Reveal>
            <div className="stats-sesong-rekord-card">
              <div className="stats-sesong-rekord-label">LAVESTE RUNDE</div>
              <div className="stats-sesong-rekord-tall">
                {data?.besteEntry?.totalScore ?? "—"}
              </div>
              <div className="stats-sesong-rekord-navn">
                {data?.besteEntry?.player.name ?? "Ikke registrert enna"}
              </div>
              <div className="stats-sesong-rekord-sub">
                {data?.besteEntry?.tournament.shortName ?? data?.besteEntry?.tournament.name ?? ""}
              </div>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="stats-sesong-rekord-card">
              <div className="stats-sesong-rekord-label">FLEST SEIRE</div>
              <div className="stats-sesong-rekord-tall">
                {data?.flestSeire?.antall ?? "—"}
              </div>
              <div className="stats-sesong-rekord-navn">
                {data?.flestSeire?.navn ?? "Ingen seire registrert"}
              </div>
              <div className="stats-sesong-rekord-sub">seire i sesongen</div>
            </div>
          </Reveal>
          <Reveal delay={160}>
            <div className="stats-sesong-rekord-card">
              <div className="stats-sesong-rekord-label">YNGSTE VINNER</div>
              <div className="stats-sesong-rekord-tall">
                {data?.yngsteVinner?.player.birthYear
                  ? `${AAR - data.yngsteVinner.player.birthYear} ar`
                  : "—"}
              </div>
              <div className="stats-sesong-rekord-navn">
                {data?.yngsteVinner?.player.name ?? "Data mangler"}
              </div>
              <div className="stats-sesong-rekord-sub">
                {data?.yngsteVinner?.tournament.shortName ?? ""}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Seksjon 05 — Alle vinnere */}
      {data && data.vinnere.length > 0 && (
        <section className="stats-section stats-section-divider" id="vinnere">
          <Reveal>
            <div className="stats-section-head">
              <div>
                <StatsEyebrow dot={false}><span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.18em" }}>05</span>&nbsp; ALLE VINNERE</StatsEyebrow>
                <h2>Turneringsvinnere <em style={{ fontStyle: "italic", fontWeight: 400, color: "var(--s-primary)" }}>{AAR}</em></h2>
              </div>
            </div>
          </Reveal>
          <Reveal delay={60}>
            <div className="stats-sesong-table-wrap">
              <table className="stats-sesong-table">
                <thead>
                  <tr>
                    <th>TOUR</th>
                    <th>DATO</th>
                    <th>TURNERING</th>
                    <th>VINNER</th>
                    <th>SCORE</th>
                  </tr>
                </thead>
                <tbody>
                  {data.vinnere.slice(0, 30).map((v) => (
                    <tr key={v.id}>
                      <td>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--s-muted-fg)" }}>
                          {tourLabel(v.tournament.tour ?? null)}
                        </span>
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--s-muted-fg)" }}>
                        {v.tournament.startDate.toLocaleDateString("nb-NO", { day: "numeric", month: "short" })}
                      </td>
                      <td>
                        <Link href={`/stats/turneringer/${v.tournament.slug ?? v.tournamentId}`} style={{ color: "inherit", textDecoration: "none", fontWeight: 500 }}>
                          {v.tournament.shortName ?? v.tournament.name}
                        </Link>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <StatsInitialAvatar name={v.player.name} size="sm" />
                          <Link href={`/stats/spillere/${v.player.slug}`} style={{ color: "var(--s-primary)", textDecoration: "none" }}>
                            {v.player.name}
                          </Link>
                        </div>
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>
                        {v.scoreToPar !== null && v.scoreToPar !== undefined
                          ? `${v.scoreToPar < 0 ? "" : v.scoreToPar === 0 ? "E" : "+"}${v.scoreToPar !== 0 ? v.scoreToPar : ""}`
                          : v.totalScore ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </section>
      )}

      {/* Per-tour oppsummering */}
      {data && Object.keys(data.perTour).length > 0 && (
        <section className="stats-section stats-section-divider">
          <Reveal>
            <StatsEyebrow>Per tour</StatsEyebrow>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 600, marginTop: 12, marginBottom: 28 }}>
              Tourer i <em style={{ fontStyle: "italic", fontWeight: 400, color: "var(--s-primary)" }}>sesongen</em>
            </h2>
          </Reveal>
          <div className="stats-sesong-tour-grid">
            {Object.entries(data.perTour)
              .filter(([, v]) => v.antall > 0)
              .sort(([, a], [, b]) => b.antall - a.antall)
              .map(([tour, v], i) => (
                <Reveal key={tour} delay={i * 60}>
                  <div className="stats-sesong-tour-card">
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--s-primary)", marginBottom: 8 }}>
                      {tourLabel(tour)}
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 32, fontWeight: 500, lineHeight: 1, marginBottom: 4 }}>
                      {v.antall}
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--s-muted-fg)" }}>
                      turneringer
                    </div>
                    {v.deltakere > 0 && (
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--s-muted-fg)", marginTop: 4 }}>
                        {v.deltakere} norske deltakere
                      </div>
                    )}
                  </div>
                </Reveal>
              ))}
          </div>
        </section>
      )}

      {/* Mersalg */}
      <section className="stats-section stats-section-divider stats-mersalg" style={{ background: "var(--s-primary)", color: "hsl(var(--background))" }}>
        <div style={{ textAlign: "center" }}>
          <StatsEyebrow tone="lime">Vær med i neste års oversikt</StatsEyebrow>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 600, color: "hsl(var(--background))", marginTop: 16, marginBottom: 16 }}>
            Logg dine egne runder i {AAR}.
          </h2>
          <p style={{ fontSize: 16, color: "rgba(250,250,247,0.7)", maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.6 }}>
            Sa er du med i neste ars sesongoversikt, og du kan folge din egen utvikling gjennom hele sesongen.
          </p>
          <Link
            href="/portal"
            className="stats-btn stats-btn-outline stats-btn-lg"
            style={{ textDecoration: "none", display: "inline-flex" }}
          >
            Prøv PlayerHQ gratis →
          </Link>
        </div>
      </section>

      {/* Andre sesonger footer */}
      <section className="stats-section stats-section-divider">
        <div className="stats-sesong-footer-nav">
          {/* Tidligere sesonger har ingen egen arkiv-rute ennå — vis som inaktiv
              tekst (samme som «Sesongen {AAR + 1} →») i stedet for en død lenke (404). */}
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--s-muted-fg)" }}>
            ← Sesongen 2025
          </span>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--s-muted-fg)" }}>
            Alle sesonger 2016–{AAR}
          </div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--s-muted-fg)" }}>
            Sesongen {AAR + 1} →
          </span>
        </div>
      </section>

    </main>
  );
}
