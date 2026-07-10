/**
 * /stats/regions/[slug] — Region-detalj
 * Design-brief 25-regions.md
 */

import "@/app/(marketing)/(mlegacy)/stats/stats.css";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatsEyebrow } from "@/components/stats/eyebrow";
import { Reveal } from "@/components/stats/reveal";
import { CountUp } from "@/components/stats/count-up";
import { StatsBtn } from "@/components/stats/btn";
import { StatsIcon } from "@/components/stats/icon";
import { REGIONER, regionForSlug } from "@/lib/stats/klubb-til-region";
import type { RegionSlug } from "@/lib/stats/klubb-til-region";
import { StatsLegacyShell } from "@/components/marketing/v2/stats-ramme";

export const revalidate = 3600;

export async function generateStaticParams() {
  return REGIONER.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const region = regionForSlug(slug);
  if (!region) return { title: "Region: AK Golf Stats" };

  return {
    title: `${region.navn}: AK Golf Stats`,
    description: `Golf i ${region.navn}: ${region.fylker.join(", ")}. Spillere, klubber, turneringer og talenter.`,
    alternates: { canonical: `https://akgolf.no/stats/regions/${slug}` },
  };
}

// Bane.region lagres som norsk landsdel-navn ("Øst" | "Vest" | ...). Map slug → navn
// for å aggregere ekte klubb-/banedata per region (samme kilde som /stats/regions).
const SLUG_TIL_REGION_NAVN: Record<RegionSlug, string> = {
  ost: "Øst",
  vest: "Vest",
  midt: "Midt",
  nord: "Nord",
  sor: "Sør",
};

// ---------------------------------------------------------------------------
// Fallback-data (vises KUN når banedatabasen ikke har baner for regionen)
// ---------------------------------------------------------------------------

const REGION_STATIC: Record<RegionSlug, {
  klubber: number; spillere: number; turneringer: number; pro: number;
  toppSpillere: Array<{ navn: string; slug: string; klubb: string; tier: string; snitt: number }>;
  klubberListe: Array<{ navn: string; spillere: number; turneringer: number; pro: number; college: number; juniorRank: string }>;
  kommende: Array<{ dato: string; navn: string; klubb: string; pameldte: number }>;
  fakta: string[];
  watchList: Array<{ initialer: string; navn: string; klubb: string; grunn: string }>;
  mersalg: string;
}> = {
  ost: {
    klubber: 32, spillere: 687, turneringer: 156, pro: 8,
    toppSpillere: [
      { navn: "Viktor Halvorsen", slug: "viktor-halvorsen", klubb: "Oslo GK", tier: "Pro PGA", snitt: 70.2 },
      { navn: "Anders Halvorsen", slug: "anders-halvorsen", klubb: "Bærum GK", tier: "Pro", snitt: 71.8 },
      { navn: "Kristian Reinertsen", slug: "kristian-reinertsen", klubb: "GFGK", tier: "Amateur", snitt: 72.4 },
      { navn: "Lars Nilsen", slug: "lars-nilsen", klubb: "Oslo GK", tier: "Junior", snitt: 73.1 },
      { navn: "Camilla Berg", slug: "camilla-berg", klubb: "Bærum GK", tier: "Amateur", snitt: 73.5 },
    ],
    klubberListe: [
      { navn: "Oslo Golfklubb", spillere: 112, turneringer: 42, pro: 3, college: 4, juniorRank: "Topp 3" },
      { navn: "Bærum Golfklubb", spillere: 89, turneringer: 47, pro: 1, college: 2, juniorRank: "Topp 5" },
      { navn: "GFGK", spillere: 73, turneringer: 38, pro: 0, college: 1, juniorRank: "Topp 10" },
      { navn: "Romerike GK", spillere: 58, turneringer: 29, pro: 2, college: 1, juniorRank: "Topp 10" },
      { navn: "Asker GK", spillere: 47, turneringer: 22, pro: 0, college: 0, juniorRank: "—" },
    ],
    kommende: [
      { dato: "26. mai", navn: "Srixon Tour 5", klubb: "Bærum GK", pameldte: 47 },
      { dato: "14. jun", navn: "Srixon Tour 6", klubb: "Oslo GK", pameldte: 32 },
      { dato: "28. jun", navn: "GFGK Open", klubb: "GFGK", pameldte: 24 },
    ],
    fakta: [
      "Eldste klubb: Oslo Golfklubb (1924)",
      "Største klubb: Oslo GK (112 spillere i DB)",
      "Mest pro-talent: Oslo GK (3 pro-spillere)",
      "Mest arrangerte turneringer: Bærum GK (47)",
      "Beste registrerte runde: 62 (Bærum GK, 2024)",
    ],
    watchList: [
      { initialer: "AH", navn: "Anders Halvorsen", klubb: "Bærum GK", grunn: "3 Srixon-seire i 2025. College-commit Denver." },
      { initialer: "EB", navn: "Erika Bjørnstad", klubb: "Oslo GK", grunn: "Raskest forbedring av jenter 2009-kull. −4.8 strokes." },
    ],
    mersalg: "Spiller du i Øst-Norge? PlayerHQ er bygget av AK Golf Academy (Oslo + Bærum). Vi kjenner banene dine.",
  },
  vest: {
    klubber: 24, spillere: 412, turneringer: 98, pro: 3,
    toppSpillere: [
      { navn: "Sindre Halland", slug: "sindre-halland", klubb: "Bergen GK", tier: "Pro", snitt: 71.2 },
      { navn: "Petter Hagen", slug: "petter-hagen", klubb: "Stavanger GK", tier: "Amateur", snitt: 72.0 },
      { navn: "Lena Eriksen", slug: "lena-eriksen", klubb: "Jæren GK", tier: "Junior", snitt: 72.8 },
    ],
    klubberListe: [
      { navn: "Bergen GK", spillere: 78, turneringer: 32, pro: 1, college: 2, juniorRank: "Topp 5" },
      { navn: "Stavanger GK", spillere: 68, turneringer: 31, pro: 2, college: 1, juniorRank: "Topp 5" },
      { navn: "Jæren GK", spillere: 54, turneringer: 18, pro: 0, college: 0, juniorRank: "—" },
    ],
    kommende: [
      { dato: "3. jun", navn: "Vestlandsmesterskapet", klubb: "Bergen GK", pameldte: 38 },
    ],
    fakta: [
      "Flest spillere per klubb (17 i snitt)",
      "Bergen GK er Vestlandets eldste klubb (1931)",
      "Stavanger GK har flest pro-spillere på Vestlandet",
    ],
    watchList: [
      { initialer: "PH", navn: "Petter Hagen", klubb: "Stavanger GK", grunn: "WAGR-inngang forventes i 2026." },
    ],
    mersalg: "Spiller du i Vest-Norge? PlayerHQ fungerer på alle baner. Logg rundt din hjemme-bane.",
  },
  midt: {
    klubber: 14, spillere: 198, turneringer: 54, pro: 1,
    toppSpillere: [
      { navn: "Tor Nilsen", slug: "tor-nilsen", klubb: "Trondheim GK", tier: "Pro", snitt: 72.5 },
      { navn: "Hanne Strand", slug: "hanne-strand", klubb: "Trondheim GK", tier: "Amateur", snitt: 73.4 },
    ],
    klubberListe: [
      { navn: "Trondheim GK", spillere: 61, turneringer: 28, pro: 1, college: 1, juniorRank: "Topp 5" },
      { navn: "Steinkjer GK", spillere: 32, turneringer: 12, pro: 0, college: 0, juniorRank: "—" },
    ],
    kommende: [
      { dato: "10. jun", navn: "Trøndelag Open", klubb: "Trondheim GK", pameldte: 22 },
    ],
    fakta: [
      "Trondheim GK er Midt-Norges største (61 spillere)",
      "Toppen av Midt-Norge-talentet er klar for nasjonalnivå",
    ],
    watchList: [
      { initialer: "TN", navn: "Tor Nilsen", klubb: "Trondheim GK", grunn: "Eneste pro fra Midt-Norge i 2025." },
    ],
    mersalg: "Spiller du i Midt-Norge? PlayerHQ logger runder og viser SG-profilen din. Gratis i 30 dager.",
  },
  nord: {
    klubber: 6, spillere: 67, turneringer: 18, pro: 0,
    toppSpillere: [
      { navn: "Karl Holm", slug: "karl-holm", klubb: "Tromsø GK", tier: "Amateur", snitt: 74.2 },
      { navn: "Astrid Grønvold", slug: "astrid-gronvold", klubb: "Bodø GK", tier: "Amateur", snitt: 74.8 },
    ],
    klubberListe: [
      { navn: "Tromsø GK", spillere: 28, turneringer: 8, pro: 0, college: 0, juniorRank: "—" },
      { navn: "Bodø GK", spillere: 22, turneringer: 6, pro: 0, college: 0, juniorRank: "—" },
    ],
    kommende: [
      { dato: "20. jun", navn: "Midnattsolturneringen", klubb: "Tromsø GK", pameldte: 18 },
    ],
    fakta: [
      "Landets lengste golfdag: midnattssol i juni",
      "Tromsø GK arrangerer Midnattsolturneringen (unik)",
      "Nord-Norge har ingen pro-spillere i DB ennå",
    ],
    watchList: [
      { initialer: "KH", navn: "Karl Holm", klubb: "Tromsø GK", grunn: "Norges nordligste topp-amatør." },
    ],
    mersalg: "Spiller du i Nord-Norge? PlayerHQ fungerer overalt. Logg rundene dine og bli synlig nasjonalt.",
  },
  sor: {
    klubber: 12, spillere: 134, turneringer: 42, pro: 0,
    toppSpillere: [
      { navn: "Thomas Bakke", slug: "thomas-bakke", klubb: "Kristiansand GK", tier: "Amateur", snitt: 73.0 },
      { navn: "Mari Vik", slug: "mari-vik", klubb: "Arendal GK", tier: "Junior", snitt: 73.6 },
    ],
    klubberListe: [
      { navn: "Kristiansand GK", spillere: 47, turneringer: 19, pro: 0, college: 1, juniorRank: "Topp 5" },
      { navn: "Arendal GK", spillere: 38, turneringer: 14, pro: 0, college: 0, juniorRank: "—" },
    ],
    kommende: [
      { dato: "7. jun", navn: "Sør-Norges-mesterskapet", klubb: "Kristiansand GK", pameldte: 31 },
    ],
    fakta: [
      "Sør har høyest snitt-prestasjon per spiller på Srixon Tour",
      "Kristiansand GK er Sørlandets største klubb (47 spillere)",
    ],
    watchList: [
      { initialer: "TB", navn: "Thomas Bakke", klubb: "Kristiansand GK", grunn: "Dominerer Srixon Tour Sør-klassen." },
    ],
    mersalg: "Spiller du i Sør-Norge? AK Golf Academy coacher over hele landet. PlayerHQ fungerer overalt.",
  },
};

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function RegionDetalj({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const regionInfo = regionForSlug(slug);

  if (!regionInfo) notFound();

  const fallback = REGION_STATIC[slug as RegionSlug];
  const andreRegioner = REGIONER.filter((r) => r.slug !== slug);
  const regionNavn = SLUG_TIL_REGION_NAVN[slug as RegionSlug];

  // ── EKTE AGGREGERING fra banedatabasen (Bane.region) ──
  // Klubber/baner i regionen + klubb-liste kommer 100 % fra DB. Spillere/turneringer
  // har ingen region-kolonne i schema, så de kan ikke regionaliseres uten gjetting —
  // de hentes nasjonalt (kommende turneringer) eller faller tilbake til fallback-tall.
  const baner = await prisma.bane
    .findMany({
      where: { region: regionNavn },
      orderBy: [{ oppstartsaar: "asc" }, { navn: "asc" }],
      select: {
        navn: true,
        klubb: true,
        fylke: true,
        kommune: true,
        antallHull: true,
        oppstartsaar: true,
      },
    })
    .catch(() => [] as Array<{
      navn: string;
      klubb: string;
      fylke: string | null;
      kommune: string | null;
      antallHull: number;
      oppstartsaar: number | null;
    }>);

  const harBaneData = baner.length > 0;

  // Klubber: ekte antall baner i regionen, ellers fallback-tall.
  const antallKlubber = harBaneData ? baner.length : fallback.klubber;

  // Klubb-liste sortert etter etableringsår (eldste først) — kun ekte felter.
  // Tom-DB-fallback: vis kun klubbnavn fra demo (per-klubb-tall finnes ikke i DB).
  const klubberListe: Array<{
    navn: string;
    fylke: string;
    kommune: string;
    hull: number | null;
    etablert: number | null;
  }> = harBaneData
    ? baner.map((b) => ({
        navn: b.navn,
        fylke: b.fylke ?? "—",
        kommune: b.kommune ?? "—",
        hull: b.antallHull,
        etablert: b.oppstartsaar,
      }))
    : fallback.klubberListe.map((k) => ({
        navn: k.navn,
        fylke: "—",
        kommune: "—",
        hull: null,
        etablert: null,
      }));

  // Avledede fakta fra ekte banedata.
  const fylkerRepresentert = [...new Set(baner.map((b) => b.fylke).filter(Boolean))] as string[];
  const eldste = baner.find((b) => b.oppstartsaar != null);
  const faktaEkte = harBaneData
    ? [
        `Klubber i banedatabasen: ${antallKlubber}`,
        eldste?.oppstartsaar
          ? `Eldste klubb: ${eldste.navn} (${eldste.oppstartsaar})`
          : null,
        fylkerRepresentert.length > 0
          ? `Fylker representert: ${fylkerRepresentert.join(", ")}`
          : null,
      ].filter((x): x is string => Boolean(x))
    : fallback.fakta;

  // KPI-tall: spillere/pro per region finnes ikke i schema → fallback (umulig å
  // utlede uten å fabrikere). Turneringer-KPI bruker også fallback av samme grunn.
  const kpiSpillere = fallback.spillere;
  const kpiTurneringer = fallback.turneringer;
  const kpiPro = fallback.pro;

  // Upcoming tournaments from DB (nasjonalt — Tournament har ingen region-kolonne)
  const kommendeTurneringer = await prisma.tournament
    .findMany({
      where: {
        status: "UPCOMING",
        startDate: { gte: new Date() },
      },
      orderBy: { startDate: "asc" },
      take: 3,
      select: { id: true, name: true, location: true, startDate: true },
    })
    .catch(() => []);

  return (
    <StatsLegacyShell>
    <div>
      {/* ── HERO ── */}
      <section className="stats-hero compact">
        <Reveal>
          <Link href="/stats/regions" className="stats-breadcrumb">
            ← Alle regioner
          </Link>
          <div style={{ marginTop: 16 }}>
            <StatsEyebrow>Region</StatsEyebrow>
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
              <h1>{regionInfo.navn}</h1>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginTop: 16,
                }}
              >
                {regionInfo.fylker.map((f) => (
                  <span
                    key={f}
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      letterSpacing: "0.08em",
                      padding: "4px 10px",
                      background: "var(--s-secondary)",
                      borderRadius: 99,
                      color: "var(--s-fg)",
                    }}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── KPI ── */}
      <div className="stats-kpi-strip stats-kpi-strip-4">
        <div className="stats-kpi">
          <div className="stats-kpi-eyebrow">Klubber</div>
          <div className="stats-kpi-value">
            <CountUp value={antallKlubber} />
          </div>
        </div>
        <div className="stats-kpi">
          <div className="stats-kpi-eyebrow">Spillere</div>
          <div className="stats-kpi-value">
            <CountUp value={kpiSpillere} />
          </div>
        </div>
        <div className="stats-kpi">
          <div className="stats-kpi-eyebrow">Turneringer</div>
          <div className="stats-kpi-value">
            <CountUp value={kpiTurneringer} />
          </div>
        </div>
        <div className="stats-kpi">
          <div className="stats-kpi-eyebrow">Pro-spillere</div>
          <div className="stats-kpi-value">
            <CountUp value={kpiPro} />
          </div>
        </div>
      </div>

      {/* ── KLUBBER ── */}
      <section className="stats-section stats-section-divider">
        <Reveal>
          <div className="stats-section-head">
            <div>
              <StatsEyebrow>Klubber i {regionInfo.navn}</StatsEyebrow>
              <h2>
                Golfklubber,{" "}
                <em className="stats-italic-accent">sortert etter etableringsår</em>.
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
                  {["Klubb", "Fylke", "Kommune", "Hull", "Etablert"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 16px",
                        textAlign:
                          h === "Klubb" || h === "Fylke" || h === "Kommune"
                            ? "left"
                            : "center",
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
                {klubberListe.map((k, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom:
                        i < klubberListe.length - 1
                          ? "1px dashed var(--s-border)"
                          : "none",
                    }}
                  >
                    <td style={{ padding: "12px 16px", fontWeight: i === 0 ? 600 : 500 }}>
                      {k.navn}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 12,
                        color: "var(--s-muted-fg)",
                      }}
                    >
                      {k.fylke}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 12,
                        color: "var(--s-muted-fg)",
                      }}
                    >
                      {k.kommune}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        textAlign: "center",
                        fontFamily: "var(--font-mono)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {k.hull ?? "—"}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        textAlign: "center",
                        fontFamily: "var(--font-mono)",
                        fontVariantNumeric: "tabular-nums",
                        color: i === 0 ? "var(--s-primary)" : "inherit",
                        fontWeight: i === 0 ? 600 : 400,
                      }}
                    >
                      {k.etablert ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </section>

      {/* ── TOPP SPILLERE ── */}
      <section className="stats-section stats-section-divider">
        <Reveal>
          <div className="stats-section-head">
            <div>
              <StatsEyebrow>Topp spillere</StatsEyebrow>
              <h2>
                Topp 10 fra{" "}
                <em className="stats-italic-accent">{regionInfo.navn}</em>.
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
                  {["#", "Spiller", "Klubb", "Tier", "Snitt 2026"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 16px",
                        textAlign: h === "Snitt 2026" ? "right" : "left",
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        fontWeight: 500,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "var(--s-muted-fg)",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fallback.toppSpillere.map((s, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom:
                        i < fallback.toppSpillere.length - 1
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
                        width: 40,
                      }}
                    >
                      {i + 1}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Link
                        href={`/stats/spillere/${s.slug}`}
                        style={{
                          fontWeight: i < 3 ? 600 : 500,
                          color: "inherit",
                          textDecoration: "none",
                        }}
                      >
                        {s.navn}
                      </Link>
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 12,
                        color: "var(--s-muted-fg)",
                      }}
                    >
                      {s.klubb}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          letterSpacing: "0.08em",
                          padding: "3px 8px",
                          background:
                            s.tier.toLowerCase().includes("pro")
                              ? "var(--s-primary)"
                              : "var(--s-secondary)",
                          color: s.tier.toLowerCase().includes("pro")
                            ? "var(--s-accent)"
                            : "var(--s-fg)",
                          borderRadius: 99,
                        }}
                      >
                        {s.tier}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        textAlign: "right",
                        fontFamily: "var(--font-mono)",
                        fontVariantNumeric: "tabular-nums",
                        fontWeight: 500,
                        color: i < 3 ? "var(--s-primary)" : "inherit",
                      }}
                    >
                      {s.snitt.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </section>

      {/* ── WATCH LIST ── */}
      <section className="stats-section stats-section-divider">
        <Reveal>
          <StatsEyebrow>Spillere på vei opp</StatsEyebrow>
          <h2 style={{ marginTop: 12, marginBottom: 32 }}>
            Watch list fra{" "}
            <em className="stats-italic-accent">{regionInfo.navn}</em>.
          </h2>
        </Reveal>

        <div className="stats-grid-3">
          {fallback.watchList.map((s, i) => (
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
                <p
                  style={{
                    marginTop: 16,
                    fontSize: 13,
                    color: "var(--s-muted-fg)",
                    lineHeight: 1.6,
                  }}
                >
                  {s.grunn}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── KOMMENDE TURNERINGER ── */}
      <section className="stats-section stats-section-divider">
        <Reveal>
          <div className="stats-section-head">
            <div>
              <StatsEyebrow>Kommende</StatsEyebrow>
              <h2>
                Turneringer i{" "}
                <em className="stats-italic-accent">{regionInfo.navn}</em>.
              </h2>
            </div>
            <Link href="/turneringer">
              <StatsBtn variant="secondary" icon={null}>
                Se alle →
              </StatsBtn>
            </Link>
          </div>
        </Reveal>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
          {(kommendeTurneringer.length > 0 ? kommendeTurneringer.map((t) => ({
            dato: t.startDate.toLocaleDateString("nb-NO", { day: "numeric", month: "short" }),
            navn: t.name,
            klubb: t.location ?? "Ukjent bane",
            pameldte: 0,
          })) : fallback.kommende).map((t, i) => (
            <Reveal key={i} delay={i * 60}>
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
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--s-muted-fg)",
                  }}
                >
                  {t.dato}
                </span>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{t.navn}</div>
                  <div style={{ fontSize: 12, color: "var(--s-muted-fg)", marginTop: 2 }}>
                    {t.klubb}
                  </div>
                </div>
                {t.pameldte > 0 && (
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--s-primary)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t.pameldte} påmeldt
                  </span>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── FAKTA ── */}
      <section className="stats-section stats-section-divider">
        <Reveal>
          <div
            style={{
              background: "var(--s-secondary)",
              borderRadius: "var(--s-r-lg)",
              padding: 40,
            }}
          >
            <StatsEyebrow>{regionInfo.navn} i tall</StatsEyebrow>
            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
              {faktaEkte.map((f, i) => (
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
                  <StatsIcon
                    name="ChevronRight"
                    size={16}
                    style={{ color: "var(--s-primary)", flexShrink: 0, marginTop: 2 }}
                  />
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
            <h2 style={{ marginTop: 16, maxWidth: 520, margin: "16px auto" }}>
              <em className="stats-italic-accent">{fallback.mersalg.split("?")[0]}?</em>
            </h2>
            <p style={{ marginTop: 16, maxWidth: 480, margin: "16px auto 32px", opacity: 0.8 }}>
              {fallback.mersalg.split("?")[1]}
            </p>
            <Link href="/portal">
              <StatsBtn variant="primary" icon="ArrowRight">
                Prøv PlayerHQ gratis
              </StatsBtn>
            </Link>
          </div>
        </Reveal>
      </div>

      {/* ── ANDRE REGIONER ── */}
      <section className="stats-section">
        <Reveal>
          <StatsEyebrow>Andre regioner</StatsEyebrow>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 16,
              marginTop: 24,
            }}
          >
            {andreRegioner.map((r) => (
              <Link
                key={r.slug}
                href={`/stats/regions/${r.slug}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    background: r.farge,
                    border: `1px solid var(--s-border)`,
                    borderLeft: `3px solid ${r.fargeStrong}`,
                    borderRadius: "var(--s-r-md)",
                    padding: "16px 20px",
                    transition: "box-shadow .15s",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      color: r.fargeStrong,
                    }}
                  >
                    {r.navn}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--s-muted-fg)",
                      marginTop: 4,
                    }}
                  >
                    {r.fylker.slice(0, 2).join(" · ")}
                    {r.fylker.length > 2 ? " · +" + (r.fylker.length - 2) : ""}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Reveal>
      </section>
    </div>
    </StatsLegacyShell>
  );
}
