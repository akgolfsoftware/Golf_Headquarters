/**
 * /stats/baner/[slug] — Bane-detalj (v2, retning C)
 * Swap av (mlegacy)/stats/baner/[slug]/page.tsx → v2-utseende. Data
 * (hentBaneBySlug, hentBaneStats, DB-turneringer) er 1:1 videreført. Score-
 * distribusjon + leaderboard + tee-utvidelse er statisk illustrasjon (1:1
 * videreført fra legacy inntil runde-/tee-data finnes per bane).
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hentBaneBySlug, hentBaneStats } from "@/lib/stats/bane-queries";
import { StatsBaneDetaljV2 } from "@/components/marketing/v2/StatsBaneDetaljV2";
import { T } from "@/lib/v2/tokens";

export const revalidate = 3600;

export async function generateStaticParams() {
  const baner = await prisma.bane
    .findMany({ select: { slug: true }, orderBy: { navn: "asc" } })
    .catch(() => []);
  return baner.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const bane = await hentBaneBySlug(slug);
  if (!bane) return { title: "Bane ikke funnet" };

  return {
    title: `${bane.navn}: Banestatistikk | AK Golf Stats`,
    description: `Slope ${bane.slope ?? "—"}, CR ${bane.courseRating ?? "—"}, ${bane.lengdeMeter ?? "—"} m. ${bane.totaltAntallTurneringer} turneringer arrangert på ${bane.navn}. Se leaderboard og score-distribusjon.`,
    alternates: { canonical: `https://akgolf.no/stats/baner/${slug}` },
    openGraph: {
      title: `${bane.navn} | AK Golf Stats`,
      description: `Slope ${bane.slope ?? "—"} · CR ${bane.courseRating ?? "—"} · ${bane.totaltAntallTurneringer} turneringer`,
      url: `https://akgolf.no/stats/baner/${slug}`,
    },
  };
}

// ---------------------------------------------------------------------------
// Statiske detalj-data (1:1 videreført fra (mlegacy) — illustrasjon inntil
// runde-/tee-data finnes per bane)
// ---------------------------------------------------------------------------

const SCORE_DIST = [
  { range: "60–64", count: 1 },
  { range: "65–69", count: 8 },
  { range: "70–74", count: 34 },
  { range: "75–79", count: 62 },
  { range: "80–84", count: 84 },
  { range: "85–89", count: 71 },
  { range: "90–94", count: 43 },
  { range: "95–99", count: 19 },
  { range: "100+", count: 7 },
];

const LEADERBOARD = [
  { rank: 1, spiller: "Anders Halvorsen", score: 63, ar: 2024, turnering: "Srixon Tour 5" },
  { rank: 2, spiller: "Maria Olsen", score: 65, ar: 2024, turnering: "Bærum Junior Open" },
  { rank: 3, spiller: "Marius Larsen", score: 66, ar: 2025, turnering: "Srixon Tour 3" },
  { rank: 4, spiller: "Sofie Næss", score: 67, ar: 2023, turnering: "OLYO Øst 4" },
  { rank: 5, spiller: "Petter Hagen", score: 68, ar: 2026, turnering: "Srixon Tour 2" },
];

export default async function BaneDetaljPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [bane, dbStats] = await Promise.all([
    hentBaneBySlug(slug).catch(() => null),
    hentBaneStats(slug).catch(() => ({
      antallTurneringer: 0,
      antallSpillere: 0,
      lavesteRunde: null,
    })),
  ]);

  if (!bane) notFound();

  const turneringer = await prisma.tournament
    .findMany({
      where: {
        location: { contains: bane.navn.split(" ")[0], mode: "insensitive" },
        mergedIntoId: null,
      },
      orderBy: { startDate: "desc" },
      take: 5,
      select: { id: true, name: true, startDate: true, status: true, norskeAntall: true },
    })
    .catch(() => []);

  const teer = bane.lengdeMeter
    ? [
        { tee: "Hvit", farge: T.tee.hvit, lengde: bane.lengdeMeter, slope: bane.slope ?? 0, cr: bane.courseRating ?? 0, par: bane.par },
        {
          tee: "Gul",
          farge: T.tee.gul,
          lengde: Math.round(bane.lengdeMeter * 0.932),
          slope: bane.slope ? bane.slope - 5 : 0,
          cr: bane.courseRating ? Math.round((bane.courseRating - 1.4) * 10) / 10 : 0,
          par: bane.par,
        },
        {
          tee: "Rød",
          farge: T.tee.rod,
          lengde: Math.round(bane.lengdeMeter * 0.822),
          slope: bane.slope ? bane.slope - 11 : 0,
          cr: bane.courseRating ? Math.round((bane.courseRating - 3.1) * 10) / 10 : 0,
          par: bane.par,
        },
      ]
    : [];

  const fakta = [
    bane.oppstartsaar ? { label: "Åpnet", value: bane.oppstartsaar.toString() } : null,
    { label: "Bane-type", value: "Parkland" },
    { label: "Antall hull", value: bane.antallHull.toString() },
    { label: "Hjemmeklubb", value: bane.klubb },
    { label: "Region", value: bane.region },
    bane.kommune ? { label: "Kommune", value: bane.kommune } : null,
    bane.fylke ? { label: "Fylke", value: bane.fylke } : null,
  ].filter((row): row is { label: string; value: string } => row !== null);

  const bio =
    bane.bio ??
    `${bane.navn} er en av Norges golfbaner og har vært vertskap for ${dbStats.antallTurneringer} registrerte turneringer. Banen er ${bane.lengdeMeter} meter fra hvite teer med slope ${bane.slope} og course rating ${bane.courseRating}.`;

  const aktivitet = turneringer.map((t) => ({
    id: t.id,
    navn: t.name,
    dato: t.startDate.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" }),
    norske: t.norskeAntall,
  }));

  return (
    <StatsBaneDetaljV2
      navn={bane.navn}
      kommune={bane.kommune ?? ""}
      region={bane.region}
      lengdeMeter={bane.lengdeMeter}
      slope={bane.slope}
      courseRating={bane.courseRating}
      par={bane.par}
      antallHull={bane.antallHull}
      oppstartsaar={bane.oppstartsaar}
      bio={bio}
      antallTurneringer={dbStats.antallTurneringer}
      antallSpillere={dbStats.antallSpillere}
      lavesteRunde={dbStats.lavesteRunde}
      fakta={fakta}
      scoreDist={SCORE_DIST}
      leaderboard={LEADERBOARD}
      aktivitet={aktivitet}
      teer={teer}
    />
  );
}
