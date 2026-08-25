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
  "OLYO",
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
    where: { mergedIntoId: null, sourceId: { not: null } },
    select: {
      id: true,
      name: true,
      sourceOrigin: true,
      sourceId: true,
      tour: true,
      startDate: true,
      _count: { select: { publicEntries: true, results: true, entries: true } },
    },
  });

  // Gruppering krever samme sourceId (+ tour + år), ikke navn+år. Navn+år var
  // for grovt: bekreftet 25.08.2026 at det slo sammen WAGR sine kjønnsdelte
  // startfelt (42 par, disjunkte spillerlister) OG urelaterte DataGolf-/
  // klubbturneringer som bare tilfeldigvis deler navn og kalenderår
  // ("PGA Championship" mai vs. november samme år, "Riyadh"/"Korea"/
  // "Singapore" fra ulike tourer, Haugesund GK to helt separate klubbdager)
  // — null av 27 grupper var reelle dubletter.
  // NGF lagrer kildens egen id med et opprinnelsesprefiks (f.eks.
  // "srixon-5329343" der SRIXON-raden selv har sourceId "5329343") — strip
  // prefikset før sammenligning så disse fortsatt matches.
  // Årstall må fortsatt være med: DataGolf gjenbruker samme sourceId for
  // samme turnerings-"slot" hvert år (id "11" = Colombia Classic i 44 ulike
  // år) — uten årsskille grupperes hele historikken til én kjempegruppe.
  // `tour` må også med: DataGolf sin sourceId er kun unik INNENFOR én tour —
  // id "11" er samtidig THE PLAYERS Championship (pga), Visit Knoxville Open
  // (kft) og Fortox Colombia Classic (champ) i 2022. Uten tour i nøkkelen
  // slås fire helt urelaterte turneringer fra fire ulike tourer sammen.
  // "TBD" er DataGolf sin plassholder-id for ikke-tildelte europeiske
  // turneringer og er ingen ekte id — ekskluderes helt.
  const normalizeSourceId = (raw: string) => raw.replace(/^[a-z]+-/, "");
  const groups = new Map<string, typeof ts>();
  for (const t of ts) {
    if (!t.sourceId || !t.startDate) continue;
    const normalized = normalizeSourceId(t.sourceId);
    if (normalized.toLowerCase() === "tbd") continue;
    const k = `${t.tour ?? ""}-${normalized}-${t.startDate.getUTCFullYear()}`;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(t);
  }

  let mergedGroups = 0;
  let mergedRows = 0;
  let movedParticipants = 0;

  for (const group of groups.values()) {
    if (group.length < 2) continue;

    // Mål = mest EKTE data. Runder (faktisk spilte resultater) veier tyngst —
    // en turnering med 80 spilte runder skal alltid vinne over en med 120 tomme
    // påmeldinger uten resultat. Kun ved lik rundetelling avgjør resten av
    // dataomfanget, og først til slutt (reell tie) NGF-origin.
    // (Bug oppdaget 25.08.2026: score talte kun rå publicEntries-antall, ikke
    // runder — en fersk scraper-kilde med ekte resultater tapte mot en tom
    // NGF-registreringsliste med flere rader. Se docs/feillogg.md.)
    const roundCounts = await Promise.all(
      group.map((t) =>
        prisma.publicPlayerRound.count({ where: { entry: { tournamentId: t.id } } }),
      ),
    );
    const roundCountById = new Map(group.map((t, i) => [t.id, roundCounts[i]]));

    const score = (t: (typeof ts)[number]) =>
      (roundCountById.get(t.id) ?? 0) * 100 +
      t._count.results * 5 +
      t._count.publicEntries +
      t._count.entries;
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

        // TournamentResult har @@unique([tournamentId, userId]) — samme guard som
        // publicPlayerEntry over: dropp duplikatet på target, flytt resten.
        const srcResults = await prisma.tournamentResult.findMany({
          where: { tournamentId: src.id },
          select: { id: true, userId: true },
        });
        const targetUsers = new Set(
          (
            await prisma.tournamentResult.findMany({
              where: { tournamentId: target.id },
              select: { userId: true },
            })
          ).map((r) => r.userId),
        );
        for (const r of srcResults) {
          if (targetUsers.has(r.userId)) {
            await prisma.tournamentResult.delete({ where: { id: r.id } });
          } else {
            await prisma.tournamentResult.update({
              where: { id: r.id },
              data: { tournamentId: target.id },
            });
          }
        }

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
