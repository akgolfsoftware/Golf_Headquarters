/**
 * /stats/uka — Ukentlig editorial roundup (v2, retning C)
 * Swap av (mlegacy)/stats/uka/page.tsx → v2-utseende. Data-lag (getUkesData)
 * er 1:1 videreført fra legacy-siden; kun presentasjonen er byttet.
 */
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { StatsUkaV2 } from "@/components/marketing/v2/StatsUkaV2";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Ukentlig roundup: AK Golf Stats",
  description: "Norsk golf oppsummert fra forrige uke. Resultater, ukens spiller, kommende turneringer.",
  openGraph: {
    title: "Ukentlig roundup: AK Golf Stats",
    description: "Norsk golf på 60 sekunder. Oppdateres hver mandag.",
  },
};

// ---------------------------------------------------------------------------
// Data layer (1:1 videreført fra (mlegacy)/stats/uka/page.tsx)
// ---------------------------------------------------------------------------

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

function formatDato(d: Date) {
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "long" });
}

// ---------------------------------------------------------------------------

export default async function UkaPage() {
  const data = await getUkesData();

  const ukensSpiller = data?.bestEntry
    ? {
        navn: data.bestEntry.player.name,
        turnering: data.bestEntry.tournament.name,
        posisjonTekst: data.bestEntry.position != null ? `#${data.bestEntry.position}` : "—",
        scoreTekst:
          data.bestEntry.scoreToPar !== null && data.bestEntry.scoreToPar !== undefined
            ? `${data.bestEntry.scoreToPar < 0 ? "" : "+"}${data.bestEntry.scoreToPar}`
            : `${data.bestEntry.totalScore ?? "—"}`,
        slug: data.bestEntry.player.slug,
      }
    : null;

  const ukensRunde = data?.lavScore
    ? {
        score: data.lavScore.totalScore != null ? String(data.lavScore.totalScore) : "—",
        turnering: data.lavScore.tournament.shortName ?? data.lavScore.tournament.name,
        spiller: data.lavScore.player.name,
        tour: tourLabel(data.lavScore.tournament.tour ?? null),
      }
    : null;

  const resultater = (data?.alleEntries ?? []).map((e) => ({
    id: e.id,
    tour: tourLabel(e.tournament.tour ?? null),
    spiller: e.player.name,
    spillerSlug: e.player.slug,
    turnering: e.tournament.shortName ?? e.tournament.name,
    posisjonTekst: e.position !== null && e.position !== undefined ? `#${e.position}` : "—",
    scoreTekst:
      e.scoreToPar !== null && e.scoreToPar !== undefined
        ? `${e.scoreToPar < 0 ? "" : e.scoreToPar === 0 ? "E" : "+"}${e.scoreToPar !== 0 ? e.scoreToPar : ""}`
        : String(e.totalScore ?? "—"),
  }));

  const kommende = (data?.kommendeNeste ?? []).map((t) => ({
    id: t.id,
    dato: t.startDate.toLocaleDateString("nb-NO", { weekday: "short", day: "numeric", month: "short" }).toUpperCase(),
    navn: t.shortName ?? t.name,
    tour: t.tour ? tourLabel(t.tour) : null,
    norske: t.norskeAntall,
  }));

  const pullquote =
    data && data.alleEntries.length > 0
      ? `${data.antallSpillere} norske golfspillere spilte på ${data.antallTurneringer} turneringer denne uken.`
      : "Ingen norske resultater registrert denne uken ennå.";

  return (
    <StatsUkaV2
      ukeNummer={data?.ukeNummer ?? getUkeNummer(new Date())}
      aar={data?.aar ?? new Date().getFullYear()}
      fraTilTekst={data ? `${formatDato(data.fra).toUpperCase()}–${formatDato(data.til).toUpperCase()}` : "—"}
      antallSpillere={data?.antallSpillere ?? 0}
      antallTurneringer={data?.antallTurneringer ?? 0}
      antallResultater={data?.alleEntries.length ?? 0}
      ukensSpiller={ukensSpiller}
      ukensRunde={ukensRunde}
      resultater={resultater}
      pullquote={pullquote}
      kommende={kommende}
    />
  );
}
