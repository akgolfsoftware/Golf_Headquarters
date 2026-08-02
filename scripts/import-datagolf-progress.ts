/**
 * Importer offline DataGolf-historikk (datagolf_progress.json) til Supabase.
 *
 *   npx tsx scripts/import-datagolf-progress.ts
 *   npx tsx scripts/import-datagolf-progress.ts --limit=50
 *
 * Kilde: ~/Developer/ak-golf-data/datagolf_progress.json (eller AK_GOLF_DATA)
 */
import "./_env";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const LIMIT =
  Number(process.argv.find((a) => a.startsWith("--limit="))?.split("=")[1]) || 0;

function dataDir(): string {
  if (process.env.AK_GOLF_DATA) return process.env.AK_GOLF_DATA;
  const a = join(homedir(), "Developer", "ak-golf-data");
  if (existsSync(a)) return a;
  return join(homedir(), "ak-golf-data");
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[æå]/g, "a")
    .replace(/ø/g, "o")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70);
}

function formatName(raw: string): string {
  const utenId = raw.replace(/\s*\(\d+\)\s*$/, "").trim();
  const [etternavn, ...resten] = utenId.split(",").map((s) => s.trim());
  if (resten.length === 0) return utenId;
  return `${resten.join(" ")} ${etternavn}`;
}

function parsePos(fin: string | undefined): number | null {
  if (!fin) return null;
  const m = fin.match(/^T?(\d+)$/i);
  return m ? parseInt(m[1], 10) : null;
}

type ProgressEvent = {
  tour: string;
  event_id: number | string;
  year: number;
  event_name: string;
  event_completed?: string;
  players: Array<{
    dg_id: number;
    player_name: string;
    fin_text?: string;
    round_1?: { score?: number; course_name?: string; course_par?: number };
    round_2?: { score?: number; course_name?: string; course_par?: number };
    round_3?: { score?: number; course_name?: string; course_par?: number };
    round_4?: { score?: number; course_name?: string; course_par?: number };
  }>;
};

async function main() {
  const path = join(dataDir(), "datagolf_progress.json");
  if (!existsSync(path)) {
    console.error("Finner ikke", path);
    process.exit(1);
  }
  let events = JSON.parse(readFileSync(path, "utf8")) as ProgressEvent[];
  if (LIMIT > 0) events = events.slice(0, LIMIT);
  console.log(`Importerer ${events.length} events fra ${path}`);

  let tournaments = 0;
  let entries = 0;
  let rounds = 0;
  let playersCreated = 0;

  for (const ev of events) {
    if (!ev.players?.length) continue;
    const year = Number(ev.year);
    const name = ev.event_name || `Event ${ev.event_id}`;
    const slug = `${slugify(name)}-${year}`;
    const startDate = ev.event_completed
      ? new Date(ev.event_completed)
      : new Date(Date.UTC(year, 0, 1));
    if (isNaN(startDate.getTime())) continue;

    // Bane fra første runde med course_name
    let location: string | null = null;
    for (const pl of ev.players) {
      for (const r of [pl.round_1, pl.round_2, pl.round_3, pl.round_4]) {
        if (r?.course_name) {
          location = r.course_name;
          break;
        }
      }
      if (location) break;
    }

    const t = await prisma.tournament.upsert({
      where: { slug },
      create: {
        name,
        slug,
        startDate,
        endDate: startDate,
        sourceOrigin: "DATAGOLF",
        sourceId: String(ev.event_id),
        tour: ev.tour,
        country: null,
        location,
        status: "COMPLETED",
        lastSyncAt: new Date(),
      },
      update: {
        name,
        location: location ?? undefined,
        lastSyncAt: new Date(),
      },
    });
    tournaments++;

    for (const pl of ev.players) {
      const fullName = formatName(pl.player_name);
      let player = await prisma.publicPlayer.findUnique({
        where: { dataGolfId: pl.dg_id },
      });
      if (!player) {
        const baseSlug = slugify(fullName) || `spiller-${pl.dg_id}`;
        let slugP = baseSlug;
        let n = 2;
        while (
          await prisma.publicPlayer.findUnique({
            where: { slug: slugP },
            select: { id: true },
          })
        ) {
          slugP = `${baseSlug}-${n++}`;
        }
        player = await prisma.publicPlayer.create({
          data: {
            name: fullName,
            slug: slugP,
            country: "NO", // progress er filtrert NOR+SWE — justeres under
            tier: "pro-pga",
            dataGolfId: pl.dg_id,
          },
        });
        playersCreated++;
      }

      const scores = [pl.round_1, pl.round_2, pl.round_3, pl.round_4].map(
        (r) => r?.score ?? null,
      );
      const validScores = scores.filter(
        (s): s is number => typeof s === "number",
      );
      const totalScore =
        validScores.length > 0
          ? validScores.reduce((a, b) => a + b, 0)
          : null;
      // to par: sum (score - par) hvis par kjent
      let toPar: number | null = null;
      let parN = 0;
      for (const r of [pl.round_1, pl.round_2, pl.round_3, pl.round_4]) {
        if (r?.score != null && r?.course_par != null) {
          toPar = (toPar ?? 0) + (r.score - r.course_par);
          parN++;
        }
      }
      if (parN === 0) toPar = null;

      const entry = await prisma.publicPlayerEntry.upsert({
        where: {
          playerId_tournamentId: {
            playerId: player.id,
            tournamentId: t.id,
          },
        },
        create: {
          playerId: player.id,
          tournamentId: t.id,
          status: "FINISHED",
          position: parsePos(pl.fin_text),
          scoreToPar: toPar,
          totalScore,
          rounds: {
            roundScores: scores,
            fin_text: pl.fin_text,
            source: "DATAGOLF_HISTORICAL",
          },
        },
        update: {
          position: parsePos(pl.fin_text),
          scoreToPar: toPar,
          totalScore,
          rounds: {
            roundScores: scores,
            fin_text: pl.fin_text,
            source: "DATAGOLF_HISTORICAL",
          },
        },
      });
      entries++;

      for (let i = 0; i < scores.length; i++) {
        const score = scores[i];
        if (score == null) continue;
        await prisma.publicPlayerRound.upsert({
          where: {
            entryId_roundNumber: {
              entryId: entry.id,
              roundNumber: i + 1,
            },
          },
          create: {
            entryId: entry.id,
            roundNumber: i + 1,
            score,
            source: "DATAGOLF",
          },
          update: { score, source: "DATAGOLF" },
        });
        rounds++;
      }
    }
  }

  console.log({
    tournaments,
    entries,
    rounds,
    playersCreated,
  });
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
