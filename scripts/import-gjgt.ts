/**
 * Global Junior Golf (GJGT) import — internasjonal junior-tour (delsystem B).
 *
 * Henter terminliste (WP Events Calendar REST) + deltakerlister
 * (gjgdb entryList) fra globaljuniorgolflive.com. Lagrer turneringer som
 * Tournament (sourceOrigin="GJGT", tour="junior-int") og oppretter
 * PublicPlayer + PublicPlayerEntry for NORSKE deltakere (nasjon-id 128).
 *
 * Live-scoring er JS-drevet og ofte tom; vi henter deltakelse, ikke scores.
 * Se docs/turnering-datakilder.md og src/lib/scrapers/gjgt.ts.
 *
 *   npx tsx scripts/import-gjgt.ts            # full sync
 *   npx tsx scripts/import-gjgt.ts --limit=5  # MVP-test
 *
 * Idempotent. Logger til AgentRun.
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";
import {
  getEvents,
  getTournamentId,
  getEntryList,
  NORWAY_NATION_ID,
} from "../src/lib/scrapers/gjgt";
import { golfboxSlugify, deriveStatus } from "../src/lib/scrapers/golfbox-customers";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const args = process.argv.slice(2);
const LIMIT = Number(args.find((a) => a.startsWith("--limit="))?.split("=")[1]) || 0;
const NOW = new Date();

async function sync(): Promise<{
  events: number;
  withEntries: number;
  norwegianPlayers: number;
  entries: number;
}> {
  let events = await getEvents();
  if (LIMIT > 0) events = events.slice(0, LIMIT);

  let withEntries = 0;
  let norwegianPlayers = 0;
  let entryCount = 0;

  for (const ev of events) {
    if (!ev.startDate) continue;
    const year = ev.startDate.getUTCFullYear();
    const slug = `${golfboxSlugify(ev.name)}-${year}`;
    const status = deriveStatus(ev.startDate, ev.endDate, NOW);

    const tournament = await prisma.tournament.upsert({
      where: { slug },
      create: {
        name: ev.name,
        slug,
        startDate: ev.startDate,
        endDate: ev.endDate,
        format: "STROKE",
        sourceOrigin: "GJGT",
        sourceId: String(ev.wpId),
        tour: "junior-int",
        location: ev.venue,
        status,
        lastSyncAt: NOW,
      },
      update: {
        name: ev.name,
        startDate: ev.startDate,
        endDate: ev.endDate,
        sourceOrigin: "GJGT",
        sourceId: String(ev.wpId),
        tour: "junior-int",
        location: ev.venue,
        status,
        lastSyncAt: NOW,
      },
    });

    // Deltakerliste (kun publiserte turneringer har tournamentid)
    const tid = await getTournamentId(ev.url);
    if (!tid) continue;
    const list = await getEntryList(tid);
    if (list.length === 0) continue;
    withEntries++;

    const norske = list.filter((e) => e.nationId === NORWAY_NATION_ID);

    for (const e of norske) {
      if (!e.name) continue;
      const baseSlug = golfboxSlugify(e.name) || `gjgt-${tid}-${entryCount}`;
      let player = await prisma.publicPlayer.findUnique({ where: { slug: baseSlug } });
      if (!player) {
        player = await prisma.publicPlayer.create({
          data: { name: e.name, slug: baseSlug, country: "NO", tier: "junior" },
        });
        norwegianPlayers++;
      }

      await prisma.publicPlayerEntry.upsert({
        where: {
          playerId_tournamentId: { playerId: player.id, tournamentId: tournament.id },
        },
        create: {
          playerId: player.id,
          tournamentId: tournament.id,
          status: "REGISTERED",
          rounds: {
            source: "GJGT-entry",
            gradYear: e.gradYear,
            hcp: e.hcp,
            ageGroup: e.ageGroup,
          },
        },
        update: {
          status: "REGISTERED",
          rounds: {
            source: "GJGT-entry",
            gradYear: e.gradYear,
            hcp: e.hcp,
            ageGroup: e.ageGroup,
          },
        },
      });
      entryCount++;
    }

    await prisma.tournament.update({
      where: { id: tournament.id },
      data: { norskeAntall: norske.length, lastSyncAt: NOW },
    });
  }

  return { events: events.length, withEntries, norwegianPlayers, entries: entryCount };
}

async function main() {
  console.log(`[gjgt] import limit=${LIMIT || "—"}`);
  const start = Date.now();
  try {
    const r = await sync();
    console.log("[gjgt]", r);
    await prisma.agentRun.create({
      data: {
        agentName: "gjgt-sync",
        status: "OK",
        duration: Date.now() - start,
        output: r,
      },
    });
  } catch (err) {
    console.error("[gjgt] FEIL:", err);
    await prisma.agentRun.create({
      data: {
        agentName: "gjgt-sync",
        status: "ERROR",
        duration: Date.now() - start,
        error: String(err instanceof Error ? err.message : err),
      },
    });
  }
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
