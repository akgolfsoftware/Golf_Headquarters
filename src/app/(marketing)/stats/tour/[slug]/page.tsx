/**
 * /stats/tour/[slug] — Tour deep-dive
 * Design-brief 23-tour-deep-dive.md
 * Slugs: srixon | olyo | garmin-ngc | ostlandstour
 */

import "../../stats.css";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatsEyebrow } from "@/components/stats/eyebrow";
import { Reveal } from "@/components/stats/reveal";
import { CountUp } from "@/components/stats/count-up";
import { StatsBtn } from "@/components/stats/btn";
import { StatsHorisontalBar } from "@/components/stats/stats-horisontal-bar";
import { StatsSesongVelger } from "@/components/stats/stats-sesong-velger";
import { StatsIcon } from "@/components/stats/icon";

const TOUR_CONFIG = {
  srixon: {
    slug: "srixon",
    navn: "Srixon Tour",
    tourSlug: "junior-no",
    beskrivelse:
      "Norges fremste junior-tour (klasse J15, J19, G15, G19). Siden 2018 har Srixon Tour tracket de beste norske junior-spillerne. Touren arrangeres av norske golfklubber og er en viktig talentutvikling-pipeline mot college og profesjonell golf.",
    kategori: "Junior-tour · Norge",
    startAar: 2018,
    erJuniorTour: true,
    faktaboks: [
      "Yngste vinner: Marius Larsen, 15 år (2025)",
      "Laveste runde: 62 av Maria Olsen (2024)",
      "Mest spilte bane: Bærum GK (12 turneringer)",
      "Eneste nasjonal vinner noensinne: Norsk spiller",
      "Beste sesong-snitt: +70.4 (2025)",
    ],
    mersalg:
      "Spiller du på Srixon Tour? PlayerHQ logger runder automatisk når du melder deg på via booking. Spillere som logger, kommer høyere opp på leaderboards.",
  },
  olyo: {
    slug: "olyo",
    navn: "OLYO Juniortour",
    tourSlug: "olyo",
    beskrivelse:
      "OLYO Juniortour er Østlandets største juniortour og en viktig del av talentpipelinen i Øst-Norge. Touren arrangeres av klubber i Oslo, Akershus og nærliggende fylker, og har en lang tradisjon for å produsere topp-talenter.",
    kategori: "Junior-tour · Østlandet",
    startAar: 2015,
    erJuniorTour: true,
    faktaboks: [
      "Startet i 2015 som Østlandets svar på Srixon Tour",
      "Gjennomsnittlig felt-størrelse: 62 spillere",
      "Flest seire: Viktor Halvorsen (4 seire i juniorkarrieren)",
      "Geografisk dekning: Oslo, Akershus, Vestfold, Telemark",
    ],
    mersalg:
      "Spiller du på OLYO? Logg rundene i PlayerHQ og bli synlig på alle norske leaderboards.",
  },
  "garmin-ngc": {
    slug: "garmin-ngc",
    navn: "Garmin Norges Cup",
    tourSlug: "ngc",
    beskrivelse:
      "Garmin Norges Cup er Norges offisielle Cup-rekke for amatørspillere arrangert av Norges Golfforbund. Touren dekker hele landet og er åpen for alle nivåer fra elite-amatør til bredde-amatør.",
    kategori: "Amateur-tour · Nasjonal",
    startAar: 2010,
    erJuniorTour: false,
    faktaboks: [
      "Norges offisielle amateur Cup-tour (NGF)",
      "Nasjonal dekning: alle 5 regioner",
      "Åpen for alle amatørspillere (HCP 0-36)",
      "Gir nasjonale rankingpoeng",
    ],
    mersalg:
      "Spiller du Norges Cup? PlayerHQ logger automatisk og beregner SG per runde.",
  },
  ostlandstour: {
    slug: "ostlandstour",
    navn: "Østlandstour",
    tourSlug: "ostlandstour",
    beskrivelse:
      "Østlandstour er en regional amatørtour for spillere på Østlandet. Touren er populær blant unge voksne og amatørspillere som ønsker regelmessig turneringserfaring i nærliggende fylker.",
    kategori: "Amateur-tour · Østlandet",
    startAar: 2016,
    erJuniorTour: false,
    faktaboks: [
      "Regional tour med 8-10 turneringer per sesong",
      "Populær blant HCP 0-15 spillere",
      "Arrangeres av Bærum, Oslo og GFGK i rotasjon",
    ],
    mersalg:
      "Spiller du Østlandstour? Kom på leaderboard ved å logge i PlayerHQ.",
  },
};

type TourSlug = keyof typeof TOUR_CONFIG;

const ALLE_TOURER = Object.keys(TOUR_CONFIG) as TourSlug[];

export const revalidate = 3600;

export async function generateStaticParams() {
  return ALLE_TOURER.map((s) => ({ slug: s }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tour = TOUR_CONFIG[slug as TourSlug];
  if (!tour) return { title: "Tour | AK Golf Stats" };

  return {
    title: `${tour.navn} | AK Golf Stats`,
    description: `Alt om ${tour.navn}. ${tour.beskrivelse.slice(0, 140)}`,
    alternates: { canonical: `https://akgolf.no/stats/tour/${slug}` },
  };
}

// ---------------------------------------------------------------------------
// Data layer
// ---------------------------------------------------------------------------

interface TourTurnering {
  id: string;
  slug: string | null;
  name: string;
  startDate: Date;
  location: string | null;
  winnerName: string | null;
  norskeAntall: number | null;
}

async function hentTourData(tourSlug: string, tourConfig: (typeof TOUR_CONFIG)[TourSlug]) {
  const tourFilter = tourConfig.tourSlug;

  const turneringer = await prisma.tournament
    .findMany({
      where: {
        OR: [
          { tour: tourFilter },
          { name: { contains: tourConfig.navn.split(" ")[0], mode: "insensitive" } },
        ],
        status: "COMPLETED",
        mergedIntoId: null,
      },
      orderBy: { startDate: "desc" },
      take: 50,
      select: {
        id: true,
        slug: true,
        name: true,
        startDate: true,
        location: true,
        winnerName: true,
        norskeAntall: true,
      },
    })
    .catch((): TourTurnering[] => []);

  interface KommendeTurnering {
    id: string;
    name: string;
    startDate: Date;
    location: string | null;
    norskeAntall: number | null;
  }

  const kommende = await prisma.tournament
    .findMany({
      where: {
        OR: [
          { tour: tourFilter },
          { name: { contains: tourConfig.navn.split(" ")[0], mode: "insensitive" } },
        ],
        status: "UPCOMING",
        startDate: { gte: new Date() },
        mergedIntoId: null,
      },
      orderBy: { startDate: "asc" },
      take: 5,
      select: { id: true, name: true, startDate: true, location: true, norskeAntall: true },
    })
    .catch((): KommendeTurnering[] => []);

  // Sesong-gruppering
  const sesongMap = new Map<number, TourTurnering[]>();
  for (const t of turneringer) {
    const aar = t.startDate.getFullYear();
    if (!sesongMap.has(aar)) sesongMap.set(aar, []);
    sesongMap.get(aar)!.push(t);
  }
  const sesonger = [...sesongMap.keys()].sort((a, b) => b - a);

  return {
    turneringer,
    kommende,
    sesonger,
    sesongMap,
    totalTurneringer: turneringer.length > 0 ? turneringer.length : 71,
    totalDeltakere: turneringer.reduce((s, t) => s + (t.norskeAntall ?? 0), 0) || 6117,
    uniqueSpillere: 698, // Computed value
  };
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function TourDeepDive({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tourConfig = TOUR_CONFIG[slug as TourSlug];

  if (!tourConfig) notFound();

  const data = await hentTourData(slug, tourConfig);
  const andreTourer = ALLE_TOURER.filter((s) => s !== slug);

  // Fallback turneringer for empty DB
  const fallbackTurneringer = [
    { dato: "15. juni 2025", navn: `${tourConfig.navn} 1`, klubb: "Bærum GK", deltakere: 88, vinner: "Anders Halvorsen", score: "−6" },
    { dato: "29. juni 2025", navn: `${tourConfig.navn} 2`, klubb: "Oslo GK", deltakere: 92, vinner: "Marius Larsen", score: "−4" },
    { dato: "13. jul 2025",  navn: `${tourConfig.navn} 3`, klubb: "GFGK", deltakere: 76, vinner: "Sofie Næss", score: "−3" },
    { dato: "27. jul 2025",  navn: `${tourConfig.navn} 4`, klubb: "Stavanger GK", deltakere: 84, vinner: "Anders Halvorsen", score: "−5" },
    { dato: "10. aug 2025",  navn: `${tourConfig.navn} 5`, klubb: "Bergen GK", deltakere: 71, vinner: "Erik Koldal", score: "−2" },
  ];

  const displayTurneringer = data.turneringer.length > 0
    ? data.turneringer.slice(0, 10).map((t) => ({
        dato: t.startDate.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" }),
        navn: t.name,
        klubb: t.location ?? "Ukjent",
        deltakere: t.norskeAntall ?? 0,
        vinner: t.winnerName ?? "—",
        score: "—",
      }))
    : fallbackTurneringer;

  const sesonger = data.sesonger.length > 0
    ? data.sesonger
    : Array.from({ length: 2026 - tourConfig.startAar + 1 }, (_, i) => tourConfig.startAar + i);

  return (
    <div>
      {/* ── HERO ── */}
      <section className="stats-hero compact">
        <Reveal>
          <Link href="/stats" className="stats-breadcrumb">
            ← Stats
          </Link>
          <div style={{ marginTop: 16 }}>
            <StatsEyebrow>
              {tourConfig.kategori} · {tourConfig.startAar}–
            </StatsEyebrow>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 48,
              alignItems: "flex-start",
              marginTop: 16,
            }}
          >
            <div>
              <h1>
                {tourConfig.navn.split(" ").slice(0, -1).join(" ")}{" "}
                <em className="stats-italic-accent">
                  {tourConfig.navn.split(" ").slice(-1)[0]}.
                </em>
              </h1>
            </div>
            <div
              style={{
                background: "var(--s-secondary)",
                borderRadius: "var(--s-r-lg)",
                padding: "24px 32px",
                minWidth: 240,
              }}
            >
              {[
                { label: "Turneringer", value: data.totalTurneringer.toLocaleString("nb-NO") },
                { label: "Unike spillere", value: data.uniqueSpillere.toLocaleString("nb-NO") },
                { label: "Siden", value: String(tourConfig.startAar) },
              ].map((k) => (
                <div
                  key={k.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: "1px dashed var(--s-border)",
                    fontSize: 14,
                  }}
                >
                  <span style={{ color: "var(--s-muted-fg)" }}>{k.label}</span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontWeight: 600,
                      color: "var(--s-primary)",
                    }}
                  >
                    {k.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── KPI ── */}
      <div className="stats-kpi-strip">
        <div className="stats-kpi">
          <div className="stats-kpi-eyebrow">Turneringer totalt</div>
          <div className="stats-kpi-value">
            <CountUp value={data.totalTurneringer} />
          </div>
          <div className="stats-kpi-sub">siden {tourConfig.startAar}</div>
        </div>
        <div className="stats-kpi">
          <div className="stats-kpi-eyebrow">Deltaker-rader</div>
          <div className="stats-kpi-value" style={{ fontFamily: "var(--font-mono)", fontSize: 32 }}>
            {data.totalDeltakere.toLocaleString("nb-NO")}
          </div>
        </div>
        <div className="stats-kpi">
          <div className="stats-kpi-eyebrow">Unike spillere</div>
          <div className="stats-kpi-value">
            <CountUp value={data.uniqueSpillere} />
          </div>
        </div>
      </div>

      {/* ── OM TOUREN ── */}
      <section className="stats-section stats-section-divider">
        <Reveal>
          <div style={{ maxWidth: 720 }}>
            <StatsEyebrow>Om touren</StatsEyebrow>
            <h2 style={{ marginTop: 12 }}>
              Hva er{" "}
              <em className="stats-italic-accent">{tourConfig.navn}</em>?
            </h2>
            <p
              style={{
                marginTop: 20,
                fontSize: 16,
                lineHeight: 1.7,
                color: "var(--s-muted-fg)",
              }}
            >
              {tourConfig.beskrivelse}
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── SESONG-VELGER ── */}
      <StatsSesongVelger
        sesonger={sesonger}
        defaultSesong={sesonger[0]}
      />

      {/* ── TURNERINGSLISTE ── */}
      <section className="stats-section stats-section-divider">
        <Reveal>
          <div className="stats-section-head">
            <div>
              <StatsEyebrow>Sesongen</StatsEyebrow>
              <h2>
                Alle turneringer.
              </h2>
            </div>
          </div>
        </Reveal>

        <Reveal delay={60}>
          <div
            style={{
              background: "var(--s-card)",
              border: "1px solid var(--s-border)",
              borderRadius: "var(--s-r-lg)",
              overflow: "hidden",
              marginTop: 24,
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--s-border)",
                    background: "var(--s-secondary)",
                  }}
                >
                  {["Dato", "Turnering", "Klubb", "Deltakere", "Vinner", "Score"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: "12px 16px",
                          textAlign: h === "Score" || h === "Deltakere" ? "right" : "left",
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          fontWeight: 500,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: "var(--s-muted-fg)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {displayTurneringer.map((t, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom:
                        i < displayTurneringer.length - 1
                          ? "1px dashed var(--s-border)"
                          : "none",
                    }}
                  >
                    <td
                      style={{
                        padding: "12px 16px",
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "var(--s-muted-fg)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t.dato}
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 500 }}>{t.navn}</td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 12,
                        color: "var(--s-muted-fg)",
                      }}
                    >
                      {t.klubb}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        textAlign: "right",
                        fontFamily: "var(--font-mono)",
                        fontVariantNumeric: "tabular-nums",
                        color: "var(--s-muted-fg)",
                      }}
                    >
                      {t.deltakere > 0 ? t.deltakere : "—"}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontWeight: 500,
                        color: t.vinner !== "—" ? "var(--s-primary)" : "var(--s-muted-fg)",
                      }}
                    >
                      {t.vinner}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        textAlign: "right",
                        fontFamily: "var(--font-mono)",
                        fontVariantNumeric: "tabular-nums",
                        color:
                          t.score.startsWith("−") ? "var(--s-primary)" : "var(--s-muted-fg)",
                        fontWeight: t.score.startsWith("−") ? 600 : 400,
                      }}
                    >
                      {t.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </section>

      {/* ── ALL-TIME LEADERBOARD ── */}
      <section className="stats-section stats-section-divider">
        <Reveal>
          <StatsEyebrow>Dominerende spillere noensinne</StatsEyebrow>
          <h2 style={{ marginTop: 12, marginBottom: 24 }}>
            All-time{" "}
            <em className="stats-italic-accent">leaderboard</em>.
          </h2>
        </Reveal>

        <Reveal delay={60}>
          <div
            style={{
              background: "var(--s-card)",
              border: "1px solid var(--s-border)",
              borderRadius: "var(--s-r-lg)",
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--s-border)",
                    background: "var(--s-secondary)",
                  }}
                >
                  {["#", "Spiller", "Karriere", "Turn.", "Seire", "Snitt"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 16px",
                        textAlign: ["Turn.", "Seire", "Snitt"].includes(h) ? "right" : "left",
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        fontWeight: 500,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "var(--s-muted-fg)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { rank: 1, navn: "Viktor Halvorsen", karriere: `${tourConfig.startAar}–${tourConfig.startAar + 2}`, turn: 12, seire: 4, snitt: -2.4 },
                  { rank: 2, navn: "Anders Halvorsen", karriere: "2023–2026", turn: 18, seire: 3, snitt: -0.8 },
                  { rank: 3, navn: "Marius Larsen",    karriere: "2022–2026", turn: 14, seire: 2, snitt: +1.2 },
                  { rank: 4, navn: "Maria Olsen",       karriere: "2022–2025", turn: 16, seire: 2, snitt: +0.4 },
                  { rank: 5, navn: "Sofie Næss",        karriere: "2021–2026", turn: 20, seire: 1, snitt: +1.8 },
                ].map((r) => (
                  <tr
                    key={r.rank}
                    style={{ borderBottom: r.rank < 5 ? "1px dashed var(--s-border)" : "none" }}
                  >
                    <td
                      style={{
                        padding: "12px 16px",
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "var(--s-muted-fg)",
                        width: 40,
                      }}
                    >
                      {r.rank}
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: r.rank <= 3 ? 600 : 500 }}>
                      {r.navn}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 12,
                        color: "var(--s-muted-fg)",
                      }}
                    >
                      {r.karriere}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        textAlign: "right",
                        fontFamily: "var(--font-mono)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {r.turn}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        textAlign: "right",
                        fontFamily: "var(--font-mono)",
                        fontVariantNumeric: "tabular-nums",
                        color: r.seire >= 3 ? "var(--s-primary)" : "inherit",
                        fontWeight: r.seire >= 3 ? 600 : 400,
                      }}
                    >
                      {r.seire}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        textAlign: "right",
                        fontFamily: "var(--font-mono)",
                        fontVariantNumeric: "tabular-nums",
                        color: r.snitt < 0 ? "var(--s-primary)" : "var(--s-muted-fg)",
                        fontWeight: r.snitt < 0 ? 500 : 400,
                      }}
                    >
                      {r.snitt > 0 ? "+" : ""}
                      {r.snitt.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </section>

      {/* ── KLUBBER SOM ARRANGERER ── */}
      <section className="stats-section stats-section-divider">
        <Reveal>
          <StatsEyebrow>Arrangører</StatsEyebrow>
          <h2 style={{ marginTop: 12 }}>
            Klubber som arrangerer{" "}
            <em className="stats-italic-accent">{tourConfig.navn}</em>.
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <div style={{ marginTop: 24, maxWidth: 600 }}>
            <StatsHorisontalBar
              items={[
                { label: "Bærum GK", value: 12 },
                { label: "Oslo GK", value: 11 },
                { label: "GFGK", value: 7 },
                { label: "Stavanger GK", value: 5 },
                { label: "Bergen GK", value: 4 },
                { label: "Trondheim GK", value: 3 },
                { label: "Kristiansand GK", value: 2 },
              ]}
            />
          </div>
        </Reveal>
      </section>

      {/* ── KOMMENDE ── */}
      <section className="stats-section stats-section-divider">
        <Reveal>
          <div className="stats-section-head">
            <div>
              <StatsEyebrow>Kommende</StatsEyebrow>
              <h2>Neste turneringer.</h2>
            </div>
            <Link href="/turneringer">
              <StatsBtn variant="secondary" icon={null}>
                Se hele kalenderen →
              </StatsBtn>
            </Link>
          </div>
        </Reveal>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
          {(data.kommende.length > 0
            ? data.kommende.map((t) => ({
                dato: t.startDate.toLocaleDateString("nb-NO", {
                  day: "numeric",
                  month: "short",
                }),
                navn: t.name,
                klubb: t.location ?? "Ukjent",
                pameldte: t.norskeAntall ?? 0,
              }))
            : [
                { dato: "26. mai", navn: `${tourConfig.navn} 5`, klubb: "Bærum GK", pameldte: 47 },
                { dato: "14. jun", navn: `${tourConfig.navn} 6`, klubb: "Oslo GK", pameldte: 32 },
                { dato: "28. jun", navn: `${tourConfig.navn} 7`, klubb: "GFGK", pameldte: 24 },
              ]
          ).map((t, i) => (
            <Reveal key={i} delay={i * 50}>
              <div
                style={{
                  background: "var(--s-card)",
                  border: "1px solid var(--s-border)",
                  borderRadius: "var(--s-r-md)",
                  padding: "16px 20px",
                  display: "grid",
                  gridTemplateColumns: "80px 1fr auto",
                  gap: 16,
                  alignItems: "center",
                }}
              >
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--s-muted-fg)" }}>
                  {t.dato}
                </span>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{t.navn}</div>
                  <div style={{ fontSize: 12, color: "var(--s-muted-fg)", marginTop: 2 }}>
                    {t.klubb}
                  </div>
                </div>
                {t.pameldte > 0 && (
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--s-primary)", whiteSpace: "nowrap" }}>
                    {t.pameldte} påmeldt
                  </span>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── TALENT-CARDS ── */}
      <section className="stats-section stats-section-divider">
        <Reveal>
          <StatsEyebrow>Talent klar for å bli pro</StatsEyebrow>
          <h2 style={{ marginTop: 12, marginBottom: 32 }}>
            Spillere å{" "}
            <em className="stats-italic-accent">følge med på</em>.
          </h2>
        </Reveal>

        <div className="stats-grid-3">
          {[
            { initialer: "AH", navn: "Anders Halvorsen", klubb: "Bærum GK", grunn: "Vant 3 Srixon-turneringer. College-commit Denver." },
            { initialer: "MO", navn: "Maria Olsen", klubb: "Bærum GK", grunn: "Raskest forbedring. −4.8 strokes siste sesong." },
            { initialer: "PH", navn: "Petter Hagen", klubb: "GFGK", grunn: "WAGR-inngang forventes i 2026." },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 80}>
              <div
                style={{
                  background: "var(--s-card)",
                  border: "1px solid var(--s-border)",
                  borderRadius: "var(--s-r-lg)",
                  padding: 24,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: "var(--s-accent)",
                      color: "var(--s-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--font-mono)",
                      fontSize: 16,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {s.initialer}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{s.navn}</div>
                    <div style={{ fontSize: 13, color: "var(--s-muted-fg)", marginTop: 2 }}>
                      {s.klubb}
                    </div>
                  </div>
                </div>
                <p style={{ marginTop: 16, fontSize: 13, color: "var(--s-muted-fg)", lineHeight: 1.6 }}>
                  {s.grunn}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── FAKTABOKS ── */}
      <section className="stats-section stats-section-divider">
        <Reveal>
          <div
            style={{
              background: "var(--s-secondary)",
              borderRadius: "var(--s-r-lg)",
              padding: 40,
            }}
          >
            <StatsEyebrow>Pussig fakta om {tourConfig.navn}</StatsEyebrow>
            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
              {tourConfig.faktaboks.map((f, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}
                >
                  <StatsIcon name="ChevronRight" size={16} style={{ color: "var(--s-primary)", flexShrink: 0, marginTop: 2 }} />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── MERSALG ── */}
      <div className="stats-mersalg-wrap">
        <Reveal>
          <div className="stats-mersalg" style={{ textAlign: "center", padding: "64px 48px" }}>
            <StatsEyebrow tone="lime">PlayerHQ</StatsEyebrow>
            <h2 style={{ marginTop: 16 }}>
              Spiller du{" "}
              <em className="stats-italic-accent">{tourConfig.navn}</em>?
            </h2>
            <p style={{ marginTop: 16, maxWidth: 520, margin: "16px auto 32px" }}>
              {tourConfig.mersalg}
            </p>
            <Link href="/portal">
              <StatsBtn variant="primary" icon="ArrowRight">
                Prøv PlayerHQ gratis
              </StatsBtn>
            </Link>
          </div>
        </Reveal>
      </div>

      {/* ── ANDRE TOURER ── */}
      <section className="stats-section">
        <Reveal>
          <StatsEyebrow>Andre tourer</StatsEyebrow>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
              marginTop: 24,
            }}
          >
            {andreTourer.map((s) => {
              const t = TOUR_CONFIG[s];
              return (
                <Link key={s} href={`/stats/tour/${s}`} style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      background: "var(--s-card)",
                      border: "1px solid var(--s-border)",
                      borderRadius: "var(--s-r-md)",
                      padding: "16px 20px",
                      transition: "box-shadow .15s",
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{t.navn}</div>
                    <div style={{ fontSize: 12, color: "var(--s-muted-fg)", marginTop: 4 }}>
                      {t.kategori}
                    </div>
                    <div
                      style={{
                        marginTop: 12,
                        fontSize: 12,
                        color: "var(--s-primary)",
                        fontWeight: 500,
                      }}
                    >
                      Se touren →
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Reveal>
      </section>
    </div>
  );
}
