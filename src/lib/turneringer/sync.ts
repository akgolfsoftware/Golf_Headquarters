/**
 * Sync-funksjoner for /turneringer.
 *
 * Henter data fra eksterne kilder (DataGolf, NGF) og lagrer i DB.
 * Kalles fra cron-routes (/api/cron/[agent]).
 *
 * Alle funksjoner er idempotente — kan kjøres flere ganger uten side-effekter.
 */

import { prisma } from "@/lib/prisma";
import {
  getSchedule,
  getLiveTournamentStats,
  getAllPlayers,
  type DGTour,
  type DGScheduleEvent,
} from "@/lib/datagolf/client";
import { scrapeNgfSchedule } from "@/lib/scrapers/ngf";

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[æå]/g, "a")
    .replace(/[ø]/g, "o")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function mapDgStatus(s: string): string {
  if (s === "completed") return "COMPLETED";
  if (s === "in-progress") return "IN_PROGRESS";
  if (s === "upcoming" || s === "future" || s === "scheduled") return "UPCOMING";
  return "UPCOMING";
}

// ---------------------------------------------------------------------------
// 1) Schedule sync — daglig
// ---------------------------------------------------------------------------

const SUPPORTED_TOURS: DGTour[] = ["pga", "euro", "kft", "alt"];

export async function syncDataGolfSchedules(): Promise<{
  tours: number;
  events: number;
}> {
  let totalEvents = 0;
  for (const tour of SUPPORTED_TOURS) {
    const events = await getSchedule(tour);
    for (const e of events) {
      await upsertEventFromDataGolf(tour, e);
      totalEvents++;
    }
  }
  return { tours: SUPPORTED_TOURS.length, events: totalEvents };
}

async function upsertEventFromDataGolf(
  tour: DGTour,
  e: DGScheduleEvent,
): Promise<void> {
  const startDate = new Date(e.start_date);
  if (isNaN(startDate.getTime())) return;

  const baseSlug = slugify(e.event_name);
  // Sørg for unik slug — append year hvis nødvendig
  const year = startDate.getFullYear();
  const slug = `${baseSlug}-${year}`;

  await prisma.tournament.upsert({
    where: {
      // Vi har ikke et compound unique på (sourceOrigin, sourceId), så bruker slug
      slug,
    },
    create: {
      name: e.event_name,
      slug,
      startDate,
      // DataGolf gir kun startdato — 4-dagers default
      endDate: new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000),
      sourceOrigin: "DATAGOLF",
      sourceId: String(e.event_id),
      tour,
      country: e.country,
      location: e.location,
      latitude: e.latitude,
      longitude: e.longitude,
      status: mapDgStatus(e.status),
      winnerName: e.winner ?? null,
      lastSyncAt: new Date(),
    },
    update: {
      name: e.event_name,
      startDate,
      endDate: new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000),
      tour,
      country: e.country,
      location: e.location,
      latitude: e.latitude,
      longitude: e.longitude,
      status: mapDgStatus(e.status),
      winnerName: e.winner ?? null,
      lastSyncAt: new Date(),
    },
  });
}

// ---------------------------------------------------------------------------
// 2) Norske spillere sync — ukentlig
// ---------------------------------------------------------------------------

export async function syncNorwegianPlayers(): Promise<{ added: number; updated: number }> {
  const all = await getAllPlayers();
  // DataGolf bruker ISO 3-letter, så "NOR" for Norge.
  const norske = all.filter((p) => p.country_code === "NOR");

  let added = 0;
  let updated = 0;

  for (const p of norske) {
    // DataGolf gir player_name som "Etternavn, Fornavn" — flytt til "Fornavn Etternavn"
    const navn = formatPlayerName(p.player_name);
    const slug = slugify(navn);

    const tier = p.amateur === 1 ? "amateur" : "pro-pga";

    const eksisterende = await prisma.publicPlayer.findUnique({
      where: { dataGolfId: p.dg_id },
    });

    if (eksisterende) {
      await prisma.publicPlayer.update({
        where: { dataGolfId: p.dg_id },
        data: {
          name: navn,
          slug,
          tier,
          country: "NO",
        },
      });
      updated++;
    } else {
      // Sjekk for slug-kollisjon (samme navn fra to kilder)
      const slugKollisjon = await prisma.publicPlayer.findUnique({
        where: { slug },
      });
      const finalSlug = slugKollisjon ? `${slug}-${p.dg_id}` : slug;

      await prisma.publicPlayer.create({
        data: {
          name: navn,
          slug: finalSlug,
          country: "NO",
          tier,
          dataGolfId: p.dg_id,
        },
      });
      added++;
    }
  }

  return { added, updated };
}

function formatPlayerName(raw: string): string {
  // "Hovland, Viktor (24023)" → "Viktor Hovland"
  // Trim av evt. parentes med ID
  const utenId = raw.replace(/\s*\(\d+\)\s*$/, "").trim();
  const [etternavn, ...resten] = utenId.split(",").map((s) => s.trim());
  if (resten.length === 0) return utenId;
  return `${resten.join(" ")} ${etternavn}`;
}

// ---------------------------------------------------------------------------
// 3) Live leaderboard sync — hver time under turnering
// ---------------------------------------------------------------------------

export async function syncLiveLeaderboards(): Promise<{ tours: number; entries: number }> {
  let totalEntries = 0;

  // DataGolf live-stats er kun tilgjengelig for PGA (og evt opposite-field event).
  // De andre turene har vi schedule for, men ikke live leaderboard via samme endpoint.
  const LIVE_TOURS: DGTour[] = ["pga"];

  for (const tour of LIVE_TOURS) {
    const stats = await getLiveTournamentStats(tour);
    if (!stats.event_name || !stats.live_stats) continue;

    // Finn matchende turnering i DB
    const turnering = await prisma.tournament.findFirst({
      where: {
        tour,
        name: stats.event_name,
        status: { in: ["IN_PROGRESS", "UPCOMING"] },
      },
    });
    if (!turnering) continue;

    // Lagre snapshot
    await prisma.leaderboardSnapshot.upsert({
      where: { tournamentId: turnering.id },
      create: {
        tournamentId: turnering.id,
        source: "DATAGOLF",
        payload: stats as unknown as object,
      },
      update: {
        payload: stats as unknown as object,
        fetchedAt: new Date(),
      },
    });

    // Oppdater status hvis live
    if (turnering.status !== "IN_PROGRESS") {
      await prisma.tournament.update({
        where: { id: turnering.id },
        data: { status: "IN_PROGRESS", lastSyncAt: new Date() },
      });
    }

    // Oppdater entries for norske spillere
    const norske = await prisma.publicPlayer.findMany({
      where: { country: "NO", dataGolfId: { not: null } },
    });
    const norskeDgIds = new Map(norske.map((p) => [p.dataGolfId!, p.id]));

    for (const row of stats.live_stats) {
      const playerId = norskeDgIds.get(row.dg_id);
      if (!playerId) continue;

      const pos = parsePosition(row.position);
      const status = pos === "CUT" ? "CUT" : pos === "WD" ? "WITHDREW" : "TEED_OFF";

      await prisma.publicPlayerEntry.upsert({
        where: {
          playerId_tournamentId: {
            playerId,
            tournamentId: turnering.id,
          },
        },
        create: {
          playerId,
          tournamentId: turnering.id,
          status,
          position: typeof pos === "number" ? pos : null,
          scoreToPar: row.total ?? null,
        },
        update: {
          status,
          position: typeof pos === "number" ? pos : null,
          scoreToPar: row.total ?? null,
        },
      });
      totalEntries++;
    }
  }

  return { tours: LIVE_TOURS.length, entries: totalEntries };
}

function parsePosition(p: string | undefined): number | "CUT" | "WD" | null {
  if (!p) return null;
  if (p === "CUT") return "CUT";
  if (p === "WD") return "WD";
  // "T5" → 5, "1" → 1
  const m = p.match(/^T?(\d+)$/);
  if (m) return parseInt(m[1], 10);
  return null;
}

// ---------------------------------------------------------------------------
// 4) NGF schedule sync — daglig (STUB)
// ---------------------------------------------------------------------------

export async function syncNgfSchedule(): Promise<{ events: number }> {
  const tournaments = await scrapeNgfSchedule();
  for (const t of tournaments) {
    const slug = `${slugify(t.name)}-${t.startDate.getFullYear()}`;
    await prisma.tournament.upsert({
      where: { slug },
      create: {
        name: t.name,
        slug,
        startDate: t.startDate,
        endDate: t.endDate,
        sourceOrigin: "NGF",
        sourceId: t.sourceId,
        tour: "amateur-no",
        country: "NO",
        location: t.location,
        status: "UPCOMING",
        officialUrl: t.officialUrl,
        lastSyncAt: new Date(),
      },
      update: {
        name: t.name,
        startDate: t.startDate,
        endDate: t.endDate,
        location: t.location,
        officialUrl: t.officialUrl,
        lastSyncAt: new Date(),
      },
    });
  }
  return { events: tournaments.length };
}
