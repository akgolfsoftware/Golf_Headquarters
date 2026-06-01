/**
 * Rydder dublett-data i turnering-pipelinen. Idempotent. DRY-RUN som default.
 *
 *   npx tsx scripts/dedupe-tournament-data.ts            # rapport (ingen endring)
 *   npx tsx scripts/dedupe-tournament-data.ts --apply    # utfør
 *
 * To deler:
 *  A) Spiller-dubletter forårsaket av scraper-sync: en "scraper-only"-profil
 *     (alle entries fra GolfBox/GJGT) med en navnetvilling som har etablert
 *     historikk → flytt entries til tvillingen, slett scraper-profilen.
 *     Guard: hopp over hvis begge har ulikt ikke-null fødselsår (ulik person).
 *  B) Legacy turnering-dubletter (samme navn+år): soft-merge via mergedIntoId
 *     (samme semantikk som admin/tournaments mergeTurneringer) → behold den med
 *     mest data, flytt publicEntries, marker resten merget.
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";
import { normalizePlayerName } from "../src/lib/scrapers/player-resolve";

loadEnv({ path: ".env.local" });
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const APPLY = process.argv.includes("--apply");
const SCRAPER_ORIGINS = new Set([
  "GOLFBOX",
  "SRIXON",
  "NORGESCUP",
  "SENIOR",
  "NM",
  "GJGT",
]);

function log(...a: unknown[]) {
  console.log(...a);
}

// ---------------------------------------------------------------------------
// A) Spiller-dubletter
// ---------------------------------------------------------------------------

async function dedupePlayers() {
  const players = await prisma.publicPlayer.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      birthYear: true,
      entries: { select: { id: true, tournamentId: true, tournament: { select: { sourceOrigin: true } } } },
    },
  });

  const groups = new Map<string, typeof players>();
  for (const p of players) {
    const k = normalizePlayerName(p.name);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(p);
  }

  let merged = 0;
  let movedEntries = 0;
  let droppedEntries = 0;
  const skipped: string[] = [];

  for (const group of groups.values()) {
    if (group.length < 2) continue;

    const isScraperOnly = (p: (typeof players)[number]) =>
      p.entries.length > 0 &&
      p.entries.every((e) => SCRAPER_ORIGINS.has(String(e.tournament.sourceOrigin)));

    const sources = group.filter(isScraperOnly);
    if (sources.length === 0) continue;

    // Mål = medlemmet med flest entries som IKKE er en av kildene (etablert profil).
    const candidates = group
      .filter((p) => !sources.includes(p))
      .sort((a, b) => b.entries.length - a.entries.length);
    const target = candidates[0] ?? null;
    if (!target) continue; // hele gruppa er scraper-only → la stå (ingen etablert profil)

    for (const src of sources) {
      if (src.id === target.id) continue;
      // Guard: ulik ikke-null fødselsår = sannsynlig ulik person
      if (src.birthYear && target.birthYear && src.birthYear !== target.birthYear) {
        skipped.push(`${src.name} (${src.birthYear}≠${target.birthYear})`);
        continue;
      }

      const targetTids = new Set(target.entries.map((e) => e.tournamentId));
      for (const e of src.entries) {
        if (targetTids.has(e.tournamentId)) {
          droppedEntries++;
          if (APPLY) await prisma.publicPlayerEntry.delete({ where: { id: e.id } });
        } else {
          movedEntries++;
          if (APPLY)
            await prisma.publicPlayerEntry.update({
              where: { id: e.id },
              data: { playerId: target.id },
            });
        }
      }
      if (APPLY) await prisma.publicPlayer.delete({ where: { id: src.id } });
      merged++;
    }
  }

  log(`\n[A] Spiller-dubletter:`);
  log(`    profiler slått sammen : ${merged}`);
  log(`    entries flyttet       : ${movedEntries}`);
  log(`    entries droppet (dup) : ${droppedEntries}`);
  if (skipped.length) log(`    hoppet over (ulik fødselsår): ${skipped.length} — ${skipped.slice(0, 6).join(", ")}`);
}

// ---------------------------------------------------------------------------
// B) Legacy turnering-dubletter (samme navn+år)
// ---------------------------------------------------------------------------

async function dedupeTournaments() {
  const ts = await prisma.tournament.findMany({
    where: { mergedIntoId: null },
    select: {
      id: true,
      name: true,
      sourceOrigin: true,
      startDate: true,
      _count: { select: { publicEntries: true, results: true, entries: true } },
    },
  });

  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 40);
  const groups = new Map<string, typeof ts>();
  for (const t of ts) {
    if (!t.startDate) continue;
    const k = `${norm(t.name)}-${t.startDate.getUTCFullYear()}`;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(t);
  }

  let mergedGroups = 0;
  let mergedRows = 0;
  let movedParticipants = 0;

  for (const group of groups.values()) {
    if (group.length < 2) continue;

    // Mål = mest data (publicEntries + results + entries), tie → NGF-origin.
    const score = (t: (typeof ts)[number]) =>
      t._count.publicEntries * 10 + t._count.results + t._count.entries;
    group.sort((a, b) => {
      const d = score(b) - score(a);
      if (d !== 0) return d;
      return (a.sourceOrigin === "NGF" ? -1 : 0) - (b.sourceOrigin === "NGF" ? -1 : 0);
    });
    const target = group[0];
    const sources = group.slice(1);

    for (const src of sources) {
      // flytt publicEntries (guard mot unik [playerId, tournamentId])
      const srcEntries = await prisma.publicPlayerEntry.findMany({
        where: { tournamentId: src.id },
        select: { id: true, playerId: true },
      });
      const targetPlayers = new Set(
        (
          await prisma.publicPlayerEntry.findMany({
            where: { tournamentId: target.id },
            select: { playerId: true },
          })
        ).map((e) => e.playerId),
      );
      for (const e of srcEntries) {
        if (targetPlayers.has(e.playerId)) {
          if (APPLY) await prisma.publicPlayerEntry.delete({ where: { id: e.id } });
        } else {
          movedParticipants++;
          if (APPLY)
            await prisma.publicPlayerEntry.update({
              where: { id: e.id },
              data: { tournamentId: target.id },
            });
        }
      }
      if (APPLY) {
        await prisma.tournamentEntry.updateMany({
          where: { tournamentId: src.id },
          data: { tournamentId: target.id },
        });
        await prisma.tournamentResult.updateMany({
          where: { tournamentId: src.id },
          data: { tournamentId: target.id },
        });
        await prisma.tournament.update({
          where: { id: src.id },
          data: { mergedIntoId: target.id },
        });
      }
      mergedRows++;
    }
    mergedGroups++;
  }

  log(`\n[B] Turnering-dubletter (soft-merge via mergedIntoId):`);
  log(`    grupper          : ${mergedGroups}`);
  log(`    rader merget      : ${mergedRows}`);
  log(`    deltakere flyttet : ${movedParticipants}`);
}

async function main() {
  log(`=== dedupe-tournament-data ${APPLY ? "(APPLY)" : "(DRY-RUN — ingen endring)"} ===`);
  await dedupePlayers();
  await dedupeTournaments();
  log(`\nFerdig.${APPLY ? "" : " Kjør med --apply for å utføre."}`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
