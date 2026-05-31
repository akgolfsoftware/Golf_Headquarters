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
  type DGLiveStatsRow,
} from "@/lib/datagolf/client";
import { iso3to2 } from "@/lib/datagolf/country";
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

// DataGolf live-tournament-stats støtter KUN "pga" og "opp" (opposite-field).
// Øvrige tourer (DP World/Korn Ferry/Challenge) har vi kalender + offisiell
// link for, men ikke live leaderboard via dette endepunktet.
const LIVE_TOURS: DGTour[] = ["pga", "opp"];

// Spillere fra live-feeden (pga + opposite-field) er pro-er på PGA-nivå.
const LIVE_PLAYER_TIER = "pro-pga";

export async function syncLiveLeaderboards(): Promise<{
  tours: number;
  events: number;
  entries: number;
  playersCreated: number;
}> {
  let totalEntries = 0;
  let totalEvents = 0;
  let playersCreated = 0;

  // Metadata for alle DataGolf-spillere (dg_id → land/amatør) — én gang,
  // gjenbrukt på tvers av tourer for å berike auto-opprettede spillere.
  let playerMeta: Map<number, { country_code: string; amateur: number }> | null =
    null;

  for (const tour of LIVE_TOURS) {
    let stats: Awaited<ReturnType<typeof getLiveTournamentStats>>;
    try {
      stats = await getLiveTournamentStats(tour);
    } catch {
      // En tour uten aktiv turnering kan svare 400 — hopp videre.
      continue;
    }
    if (!stats.event_name || !stats.live_stats || stats.live_stats.length === 0)
      continue;

    // Match turnering på navn + aktiv status. Opposite-field-events ligger i
    // schedule under tour="pga", så vi begrenser ikke matchen til touren.
    // orderBy startDate desc sikrer deterministisk valg hvis to rader deler navn.
    const turnering = await prisma.tournament.findFirst({
      where: {
        name: stats.event_name,
        status: { in: ["IN_PROGRESS", "UPCOMING"] },
      },
      orderBy: { startDate: "desc" },
    });
    if (!turnering) continue;
    totalEvents++;

    // Lagre rå-snapshot (hele DataGolf-svaret) for reprosessering
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

    if (turnering.status !== "IN_PROGRESS") {
      await prisma.tournament.update({
        where: { id: turnering.id },
        data: { status: "IN_PROGRESS", lastSyncAt: new Date() },
      });
    }

    // Last spiller-metadata lat — kun hvis vi faktisk har et aktivt felt
    if (!playerMeta) {
      const all = await getAllPlayers();
      playerMeta = new Map(
        all.map((p) => [
          p.dg_id,
          { country_code: p.country_code, amateur: p.amateur ?? 0 },
        ]),
      );
    }

    // Sørg for at alle spillere i feltet finnes som PublicPlayer (auto-opprett)
    const { byDgId, created } = await ensurePlayers(stats.live_stats, playerMeta);
    playersCreated += created;

    // Rundenummeret er topp-nivå (stat_round), ikke per-spiller. Per-spiller
    // "round"-feltet inneholder stat-verdier, ikke rundenummer.
    const currentRound =
      typeof stats.stat_round === "number" ? stats.stat_round : null;

    // Upsert entry per spiller i feltet
    let norske = 0;
    for (const row of stats.live_stats) {
      const playerId = byDgId.get(row.dg_id);
      if (!playerId) continue;

      const pos = parsePosition(row.position);
      const status =
        pos === "CUT" ? "CUT" : pos === "WD" ? "WITHDREW" : "TEED_OFF";
      // DataGolf kan returnere thru som number ELLER string ("F" = finished, "18").
      // Konverter begge til number. "F" → 18 (fullstendig runde).
      const thruRaw = row.thru;
      const thruNum =
        typeof thruRaw === "number"
          ? thruRaw
          : thruRaw === "F"
            ? 18
            : typeof thruRaw === "string" && /^\d+$/.test(thruRaw)
              ? parseInt(thruRaw, 10)
              : null;
      const rounds = {
        thru: thruNum,
        round: currentRound,
      };

      await prisma.publicPlayerEntry.upsert({
        where: { playerId_tournamentId: { playerId, tournamentId: turnering.id } },
        create: {
          playerId,
          tournamentId: turnering.id,
          status,
          position: typeof pos === "number" ? pos : null,
          scoreToPar: row.total ?? null,
          rounds,
        },
        update: {
          status,
          position: typeof pos === "number" ? pos : null,
          scoreToPar: row.total ?? null,
          rounds,
        },
      });
      totalEntries++;
      if ((playerMeta.get(row.dg_id)?.country_code ?? "") === "NOR") norske++;
    }

    // Oppdater denormalisert norske-teller på turneringen
    await prisma.tournament.update({
      where: { id: turnering.id },
      data: { norskeAntall: norske, lastSyncAt: new Date() },
    });
  }

  return {
    tours: LIVE_TOURS.length,
    events: totalEvents,
    entries: totalEntries,
    playersCreated,
  };
}

/**
 * Sørger for at hver spiller i live-feltet finnes som PublicPlayer.
 * Auto-oppretter ukjente spillere med land/tier fra DataGolf-metadata.
 * Returnerer map dg_id → playerId + antall nyopprettede.
 */
async function ensurePlayers(
  rows: DGLiveStatsRow[],
  playerMeta: Map<number, { country_code: string; amateur: number }>,
): Promise<{ byDgId: Map<number, string>; created: number }> {
  const dgIds = [...new Set(rows.map((r) => r.dg_id))];

  const existing = await prisma.publicPlayer.findMany({
    where: { dataGolfId: { in: dgIds } },
    select: { id: true, dataGolfId: true },
  });
  const byDgId = new Map<number, string>(
    existing.map((p) => [p.dataGolfId!, p.id]),
  );

  // Pre-beregn alle basis-slugger for nye spillere (batched slug-kollisjonsssjekk)
  const newRows = rows.filter((r) => !byDgId.has(r.dg_id));
  const candidateSlugs = [
    ...new Set(
      newRows.map((r) => slugify(formatPlayerName(r.player_name)) || `spiller-${r.dg_id}`)
    ),
  ];

  // Hent alle eksisterende slug-kollisjoner i én DB-runde
  const kollisjonRows = candidateSlugs.length > 0
    ? await prisma.publicPlayer.findMany({
        where: { slug: { in: candidateSlugs } },
        select: { slug: true },
      })
    : [];
  const kollisjoner = new Set(kollisjonRows.map((r) => r.slug));

  let created = 0;
  for (const row of newRows) {
    const navn = formatPlayerName(row.player_name);
    const meta = playerMeta.get(row.dg_id);
    const country = iso3to2(meta?.country_code); // iso3to2 returnerer allerede uppercase
    const tier = meta?.amateur === 1 ? "amateur" : LIVE_PLAYER_TIER;

    const baseSlug = slugify(navn) || `spiller-${row.dg_id}`;
    const finalSlug = kollisjoner.has(baseSlug) ? `${baseSlug}-${row.dg_id}` : baseSlug;

    try {
      const nyspiller = await prisma.publicPlayer.create({
        data: { name: navn, slug: finalSlug, country, tier, dataGolfId: row.dg_id },
      });
      byDgId.set(row.dg_id, nyspiller.id);
      created++;
    } catch (e) {
      // P2002: concurrent cron-kjøring opprettet spilleren mellom vår sjekk og create.
      // Hent den eksisterende raden og fortsett.
      if (
        e instanceof Error &&
        "code" in e &&
        (e as { code: string }).code === "P2002"
      ) {
        const existing = await prisma.publicPlayer.findFirst({
          where: { dataGolfId: row.dg_id },
          select: { id: true },
        });
        if (existing) byDgId.set(row.dg_id, existing.id);
      } else {
        throw e;
      }
    }
  }

  return { byDgId, created };
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
