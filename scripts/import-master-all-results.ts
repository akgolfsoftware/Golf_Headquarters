/**
 * Importer master_all_results.csv (NOR) til public tournaments/entries.
 *
 *   npx tsx scripts/import-master-all-results.ts
 *   npx tsx scripts/import-master-all-results.ts --limit=5000
 *   npx tsx scripts/import-master-all-results.ts --only-nor
 */
import "./_env";
import { createReadStream, existsSync } from "node:fs";
import { createInterface } from "node:readline";
import { join } from "node:path";
import { homedir } from "node:os";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const LIMIT =
  Number(process.argv.find((a) => a.startsWith("--limit="))?.split("=")[1]) || 0;
const ONLY_NOR = process.argv.includes("--only-nor") || true;

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

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQ = !inQ;
      continue;
    }
    if (c === "," && !inQ) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += c;
  }
  out.push(cur);
  return out;
}

function sourceOrigin(source: string): string {
  const s = source.toLowerCase();
  if (s.includes("datagolf")) return "DATAGOLF";
  if (s.includes("olyo")) return "OLYO";
  if (s.includes("srixon")) return "SRIXON";
  if (s.includes("norgescup") || s.includes("norges")) return "NORGESCUP";
  if (s.includes("østland") || s.includes("ostland")) return "OSTLANDS";
  if (s.includes("sgf")) return "SGF";
  return "IMPORT";
}

async function main() {
  const path = join(dataDir(), "master_all_results.csv");
  if (!existsSync(path)) {
    console.error("Finner ikke", path);
    process.exit(1);
  }

  const rl = createInterface({
    input: createReadStream(path, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });

  let header: string[] | null = null;
  let n = 0;
  let imported = 0;
  let skipped = 0;

  // Cache for tournament/player keys this run
  const tCache = new Map<string, string>(); // slug -> id
  const pCache = new Map<string, string>(); // name|birth -> id

  for await (const line of rl) {
    if (!header) {
      header = parseCsvLine(line);
      continue;
    }
    n++;
    if (LIMIT > 0 && imported >= LIMIT) break;

    const cols = parseCsvLine(line);
    const row: Record<string, string> = {};
    header.forEach((h, i) => {
      row[h] = cols[i] ?? "";
    });

    const nat = (row.nationality || "").toUpperCase();
    if (ONLY_NOR && !["NOR", "NO", "NORWAY", "N"].includes(nat)) {
      skipped++;
      continue;
    }

    const year = parseInt(row.year, 10);
    const tName = (row.tournament || "").trim();
    if (!tName || !year) {
      skipped++;
      continue;
    }

    const first = (row.first_name || "").trim();
    const last = (row.last_name || "").trim();
    const playerName = `${first} ${last}`.trim();
    if (!playerName) {
      skipped++;
      continue;
    }

    const origin = sourceOrigin(row.source || "");
    const slug = `${slugify(tName)}-${year}`;
    let tournamentId = tCache.get(slug);
    if (!tournamentId) {
      const startDate = row.date
        ? new Date(row.date)
        : new Date(Date.UTC(year, 0, 1));
      const t = await prisma.tournament.upsert({
        where: { slug },
        create: {
          name: tName,
          slug,
          startDate: isNaN(startDate.getTime())
            ? new Date(Date.UTC(year, 0, 1))
            : startDate,
          sourceOrigin: origin,
          sourceId: `${origin}-${slug}`,
          tour: origin === "OLYO" || origin === "SRIXON" ? "junior-no" : "amateur-no",
          country: "NO",
          status: "COMPLETED",
          lastSyncAt: new Date(),
        },
        update: { lastSyncAt: new Date() },
      });
      tournamentId = t.id;
      tCache.set(slug, tournamentId);
    }

    const birth = row.birth_year ? parseInt(row.birth_year, 10) : null;
    const pKey = `${playerName.toLowerCase()}|${birth ?? ""}`;
    let playerId = pCache.get(pKey);
    if (!playerId) {
      const existing = await prisma.publicPlayer.findFirst({
        where: {
          name: { equals: playerName, mode: "insensitive" },
          ...(birth && !isNaN(birth) ? { birthYear: birth } : {}),
        },
        select: { id: true },
      });
      if (existing) {
        playerId = existing.id;
      } else {
        const baseSlug = slugify(playerName) || "spiller";
        let slugP = baseSlug;
        let k = 2;
        while (
          await prisma.publicPlayer.findUnique({
            where: { slug: slugP },
            select: { id: true },
          })
        ) {
          slugP = `${baseSlug}-${k++}`;
        }
        const created = await prisma.publicPlayer.create({
          data: {
            name: playerName,
            slug: slugP,
            country: "NO",
            tier:
              origin === "OLYO" || origin === "SRIXON" ? "junior" : "amateur",
            birthYear: birth && !isNaN(birth) ? birth : null,
          },
        });
        playerId = created.id;
      }
      pCache.set(pKey, playerId);
    }

    const r1 = row.r1 ? parseInt(row.r1, 10) : null;
    const r2 = row.r2 ? parseInt(row.r2, 10) : null;
    const r3 = row.r3 ? parseInt(row.r3, 10) : null;
    const r4 = row.r4 ? parseInt(row.r4, 10) : null;
    const scores = [r1, r2, r3, r4].map((s) =>
      s != null && !isNaN(s) ? s : null,
    );
    const posRaw = (row.pos || "").replace(/^T/i, "");
    const position = /^\d+$/.test(posRaw) ? parseInt(posRaw, 10) : null;
    const toPar = row.to_par
      ? parseInt(row.to_par.replace("+", ""), 10)
      : null;
    const total = row.total ? parseInt(row.total, 10) : null;

    const entry = await prisma.publicPlayerEntry.upsert({
      where: {
        playerId_tournamentId: { playerId, tournamentId },
      },
      create: {
        playerId,
        tournamentId,
        status: "FINISHED",
        position: position != null && !isNaN(position) ? position : null,
        scoreToPar: toPar != null && !isNaN(toPar) ? toPar : null,
        totalScore: total != null && !isNaN(total) ? total : null,
        rounds: {
          roundScores: scores,
          class: row.class || null,
          club: row.club || null,
          source: row.source || "IMPORT",
        },
      },
      update: {
        position: position != null && !isNaN(position) ? position : null,
        scoreToPar: toPar != null && !isNaN(toPar) ? toPar : null,
        totalScore: total != null && !isNaN(total) ? total : null,
        rounds: {
          roundScores: scores,
          class: row.class || null,
          club: row.club || null,
          source: row.source || "IMPORT",
        },
      },
    });

    for (let i = 0; i < scores.length; i++) {
      const score = scores[i];
      if (score == null) continue;
      await prisma.publicPlayerRound.upsert({
        where: {
          entryId_roundNumber: { entryId: entry.id, roundNumber: i + 1 },
        },
        create: {
          entryId: entry.id,
          roundNumber: i + 1,
          score,
          source: "NGF",
        },
        update: { score },
      });
    }

    imported++;
    if (imported % 500 === 0) {
      console.log(`… ${imported} importert (rad ${n})`);
    }
  }

  console.log({ lines: n, imported, skipped });
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
