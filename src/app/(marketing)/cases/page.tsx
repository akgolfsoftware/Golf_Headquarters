/**
 * MARKEDSSIDE Cases & turneringer (/cases, retning C). OFFENTLIG: ingen
 * auth-guard, egen marketing-chrome (MRamme), IKKE V2Shell. Turneringer
 * hentes fra DB her (server) og sendes som prop til klient-komponenten
 * (samme kilde som /turneringer).
 */
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { MarkedCasesV2, type CasesTournament } from "@/components/marketing/v2/MarkedCasesV2";

export const metadata: Metadata = {
  title: "Suksesshistorier · AK Golf Academy",
  description:
    "Les hvordan spillere i AK Golf Academy har senket handicapet sitt med data-drevet coaching.",
};

const MND = ["JAN", "FEB", "MAR", "APR", "MAI", "JUN", "JUL", "AUG", "SEP", "OKT", "NOV", "DES"];

function formaterFormat(format: string | null): string {
  switch ((format ?? "").toUpperCase()) {
    case "STROKE":
      return "Slagspill";
    case "MATCH":
      return "Match play";
    case "STABLEFORD":
      return "Stableford";
    default:
      return "Turnering";
  }
}

async function hentKommendeTurneringer(): Promise<CasesTournament[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in90 = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

  const rows = await prisma.tournament.findMany({
    where: {
      startDate: { gte: today, lte: in90 },
      status: { in: ["UPCOMING", "IN_PROGRESS"] },
      mergedIntoId: null,
    },
    orderBy: { startDate: "asc" },
    take: 6,
    select: { id: true, name: true, startDate: true, location: true, format: true, status: true },
  });

  return rows.map((r) => ({
    day: String(r.startDate.getDate()).padStart(2, "0"),
    mon: MND[r.startDate.getMonth()],
    name: r.name,
    venue: r.location ?? "Sted kommer",
    format: formaterFormat(r.format),
    pagar: r.status === "IN_PROGRESS",
  }));
}

export default async function CasesPage() {
  const tournaments = await hentKommendeTurneringer();
  return <MarkedCasesV2 tournaments={tournaments} />;
}
