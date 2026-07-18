import { prisma } from "@/lib/prisma";
import type { Turnering } from "./types";

/**
 * Turneringsseriene WANG-årsplanen viser. Turneringene i katalogen har ingen
 * ren serie-kolonne — serien ligger i fritekst-navnet — så hver serie matches
 * på et navnemønster. Olyo Juniortour finnes over hele landet, så den avgrenses
 * til Østlandet ved å ekskludere «Sør -» og kjente vestlands-/Rogaland-/
 * Trøndelagsklubber (Anders' valg: kun Østlandet, ekskluder Sør+Vest).
 * Listen er bevisst enkel å justere når serie/region-taggen finnes i dataene.
 */

type SerieDef = {
  serie: string; // kort visnings-etikett
  tone: string; // matcher TrainingPeriod-tonene
  // Returnerer true hvis turneringsnavnet hører til denne serien.
  match: (navnLower: string) => boolean;
};

// Klubber utenfor Østlandet som skal ekskluderes fra Olyo (små bokstaver).
const OLYO_IKKE_OSTLANDET = [
  "sør -", // eksplisitt Sør-region
  "meland",
  "sunnfjord",
  "bjørnefjorden",
  "voss",
  "haugesund",
  "stord",
  "solastranden",
  "stavanger",
  "utsikten",
  "byneset",
  "sunnmøre",
  "volda",
];

const SERIER: SerieDef[] = [
  {
    serie: "Østlandstour",
    tone: "primary",
    match: (n) => n.includes("østlandstour"),
  },
  {
    serie: "Srixon Tour",
    tone: "accent",
    match: (n) => n.includes("srixon tour"),
  },
  {
    serie: "Garmin NC",
    tone: "gold",
    match: (n) => n.includes("garmin norgescup") || n.includes("garmin norges cup"),
  },
  {
    serie: "Olyo",
    tone: "moss",
    match: (n) => n.includes("olyo") && !OLYO_IKKE_OSTLANDET.some((k) => n.includes(k)),
  },
];

// Prisma-needles for et grovt førstepass i databasen (finfiltrering skjer i JS).
const DB_NEEDLES = ["østlandstour", "srixon tour", "garmin", "olyo"];

function normaliser(navn: string): string {
  return navn.toLowerCase().replace(/\s+/g, " ").trim();
}

function finnSerie(navnLower: string): SerieDef | null {
  return SERIER.find((s) => s.match(navnLower)) ?? null;
}

/**
 * Henter fremtidige turneringer (startdato > nå) fra WANG-seriene, dedupet på
 * normalisert navn + startdato. Sortert kronologisk.
 */
export async function hentWangTurneringer(): Promise<Turnering[]> {
  const now = new Date();

  const rader = await prisma.tournament.findMany({
    where: {
      startDate: { gt: now },
      mergedIntoId: null,
      OR: DB_NEEDLES.map((n) => ({ name: { contains: n, mode: "insensitive" as const } })),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      startDate: true,
      endDate: true,
      location: true,
    },
    orderBy: { startDate: "asc" },
  });

  const sett = new Set<string>();
  const turneringer: Turnering[] = [];

  for (const r of rader) {
    const navnLower = normaliser(r.name);
    const serie = finnSerie(navnLower);
    if (!serie) continue; // fanget av needle, men ikke en ekte serie-match (f.eks. Olyo Sør/Vest)

    const dedupNokkel = `${navnLower}|${r.startDate.toISOString().slice(0, 10)}`;
    if (sett.has(dedupNokkel)) continue;
    sett.add(dedupNokkel);

    turneringer.push({
      id: r.id,
      navn: r.name.trim(),
      serie: serie.serie,
      tone: serie.tone,
      startDate: r.startDate.toISOString(),
      endDate: r.endDate ? r.endDate.toISOString() : null,
      slug: r.slug,
      location: r.location,
    });
  }

  return turneringer;
}
