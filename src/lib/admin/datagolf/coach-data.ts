/**
 * Data Golf for coach (AgencyOS pakke 10, DG-01–09) — lesing fra basen.
 * Datakart: docs/design-system/datagolf-coach-datakart-og-skjermliste.md §1.
 *
 * Bare tall som er lagret. Ingen modellprognoser eller odds. Mangler et tall, er det null
 * og vises som «—». Sidene som kaller dette, er bak `krevDataGolfBruker` (bare COACH og ADMIN).
 */
import "server-only";
import { prisma } from "@/lib/prisma";

export type DgProffRad = {
  dgId: number;
  navn: string;
  land: string | null;
  tour: string | null;
  sgTotal: number | null;
  dgRang: number | null;
  owgr: number | null;
  norsk: boolean;
};

const ETT_DOGN = 86_400_000;
export const FORSINKET_DAGER = 14;

/** Data Golf skriver «Etternavn, Fornavn». */
export function visNavn(raw: string): string {
  const [etter, for_] = raw.split(",").map((s) => s.trim());
  return for_ ? `${for_} ${etter}` : raw;
}

export function erForsinket(sist: Date | null, naa = new Date()): boolean {
  return !sist || naa.getTime() - sist.getTime() > FORSINKET_DAGER * ETT_DOGN;
}

async function norskeIder(): Promise<Set<number>> {
  const r = await prisma.publicPlayer.findMany({ where: { dataGolfId: { not: null } }, select: { dataGolfId: true } });
  return new Set(r.map((p) => p.dataGolfId!).filter((n) => Number.isFinite(n)));
}

export async function hentOversikt() {
  const [antall, siste, synk, norske] = await Promise.all([
    prisma.datagolfTak.count({ where: { isActive: true } }),
    prisma.datagolfTak.findFirst({ where: { isActive: true }, orderBy: { asOf: "desc" }, select: { asOf: true } }),
    prisma.datagolfSyncState.findMany({ orderBy: { lastSyncedAt: "desc" }, take: 50 }).catch(() => []),
    norskeIder(),
  ]);
  const norskeProffer = norske.size === 0 ? [] : await prisma.datagolfTak.findMany({
    where: { dgPlayerId: { in: [...norske] } }, orderBy: { sgTotal: "desc" }, take: 8,
    select: { dgPlayerId: true, name: true, country: true, primaryTour: true, sgTotal: true, dgRank: true, owgrRank: true },
  });
  const sistSynk = synk.find((s) => s.lastSyncedAt)?.lastSyncedAt ?? null;
  return {
    antallProffer: antall,
    kildedato: siste?.asOf ?? null,
    sistSynk,
    feiletSynk: synk.filter((s) => s.lastStatus != null && s.lastStatus >= 400).length,
    endepunkter: synk.length,
    norske: norskeProffer.map((p): DgProffRad => ({ dgId: p.dgPlayerId, navn: visNavn(p.name), land: p.country, tour: p.primaryTour, sgTotal: p.sgTotal, dgRang: p.dgRank, owgr: p.owgrRank, norsk: true })),
  };
}

export type KatalogValg = { sok?: string; tour?: string; norskForst?: boolean };

export async function hentKatalog(valg: KatalogValg) {
  const norske = await norskeIder();
  const sok = valg.sok?.trim();
  const rader = await prisma.datagolfTak.findMany({
    where: {
      isActive: true,
      ...(sok ? { name: { contains: sok, mode: "insensitive" as const } } : {}),
      ...(valg.tour ? { primaryTour: valg.tour } : {}),
    },
    orderBy: [{ sgTotal: { sort: "desc", nulls: "last" } }],
    take: 200,
    select: { dgPlayerId: true, name: true, country: true, primaryTour: true, sgTotal: true, dgRank: true, owgrRank: true },
  });
  const ut = rader.map((p): DgProffRad => ({ dgId: p.dgPlayerId, navn: visNavn(p.name), land: p.country, tour: p.primaryTour, sgTotal: p.sgTotal, dgRang: p.dgRank, owgr: p.owgrRank, norsk: norske.has(p.dgPlayerId) }));
  if (valg.norskForst) ut.sort((a, b) => Number(b.norsk) - Number(a.norsk));
  const turer = await prisma.datagolfTak.findMany({ where: { isActive: true, primaryTour: { not: null } }, distinct: ["primaryTour"], select: { primaryTour: true } });
  return { rader: ut, turer: turer.map((t) => t.primaryTour!).sort() };
}

export async function hentProff(dgId: number) {
  const tak = await prisma.datagolfTak.findUnique({ where: { dgPlayerId: dgId }, include: { bands: true } });
  if (!tak) return null;
  const sesonger = await prisma.pgaPlayerSeason.findMany({ where: { dgPlayerId: dgId }, orderBy: [{ year: "desc" }, { tour: "asc" }], take: 8 });
  return { tak: { ...tak, name: visNavn(tak.name) }, sesonger };
}

export const TOPPLISTE_KATEGORIER = [
  { id: "sgTotal", label: "SG total", lavereBedre: false },
  { id: "avgScore", label: "Snittscore", lavereBedre: true },
  { id: "driveDist", label: "Driver (yards)", lavereBedre: false },
  { id: "fairwayPct", label: "Fairway %", lavereBedre: false },
  { id: "girPct", label: "GIR %", lavereBedre: false },
  { id: "puttsPerRound", label: "Putt per runde", lavereBedre: true },
] as const;
export type TopplisteKategori = (typeof TOPPLISTE_KATEGORIER)[number]["id"];

export async function hentTopplister(kategori: TopplisteKategori, tour: string, aar: number, minRunder: number) {
  const kat = TOPPLISTE_KATEGORIER.find((k) => k.id === kategori) ?? TOPPLISTE_KATEGORIER[0];
  const rader = await prisma.pgaPlayerSeason.findMany({
    where: { tour, year: aar, [kat.id]: { not: null }, ...(minRunder > 0 ? { rounds: { gte: minRunder } } : {}) },
    orderBy: { [kat.id]: kat.lavereBedre ? "asc" : "desc" },
    take: 30,
    select: { dgPlayerId: true, playerName: true, country: true, rounds: true, sgTotal: true, avgScore: true, driveDist: true, fairwayPct: true, girPct: true, puttsPerRound: true, lastUpdated: true },
  });
  const [aarValg, turValg] = await Promise.all([
    prisma.pgaPlayerSeason.findMany({ distinct: ["year"], select: { year: true }, orderBy: { year: "desc" }, take: 6 }),
    prisma.pgaPlayerSeason.findMany({ distinct: ["tour"], select: { tour: true }, orderBy: { tour: "asc" } }),
  ]);
  return {
    kategori: kat,
    aarValg: aarValg.map((a) => a.year),
    turValg: turValg.map((t) => t.tour),
    rader: rader.map((r) => ({ dgId: r.dgPlayerId, navn: visNavn(r.playerName), land: r.country, runder: r.rounds, verdi: (r as Record<string, unknown>)[kat.id] as number | null })),
    oppdatert: rader.reduce<Date | null>((m, r) => (!m || r.lastUpdated > m ? r.lastUpdated : m), null),
  };
}

export async function hentNorskeResultater() {
  const spillere = await prisma.publicPlayer.findMany({
    where: { dataGolfId: { not: null } }, orderBy: { name: "asc" }, take: 40,
    select: { id: true, name: true, dataGolfId: true, entries: { where: { tournament: { sourceOrigin: "DATAGOLF" } }, orderBy: { createdAt: "desc" }, take: 3, select: { id: true, position: true, scoreToPar: true, tournament: { select: { name: true, startDate: true } } } } },
  }).catch(() => []);
  const kommende = await prisma.tournament.findMany({
    where: { sourceOrigin: "DATAGOLF", startDate: { gte: new Date() } }, orderBy: { startDate: "asc" }, take: 5,
    select: { id: true, name: true, startDate: true, tour: true },
  }).catch(() => []);
  return { spillere, kommende };
}

export async function hentKilde() {
  const synk = await prisma.datagolfSyncState.findMany({ orderBy: [{ endpoint: "asc" }] }).catch(() => []);
  return synk.map((s) => ({ endepunkt: s.endpoint, rader: s.rowCount, status: s.lastStatus, feil: s.lastError ? "Siste synk feilet." : null, sist: s.lastSyncedAt }));
}
