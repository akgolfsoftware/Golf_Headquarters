/**
 * Importerer norske turneringer (Srixon, OLYO, Norges Cup, Østlandstour)
 * fra JSON-eksporter i Google Drive.
 *
 * Strategi (Stats Fase 1 STATS-5 — erstatter NGF-stub):
 *   - Les ferdige JSON-eksporter fra ~/My Drive/AK Golf Group/Data/
 *   - Upsert Tournament-rader (sourceOrigin = NGF/SRIXON/OLYO/NGC/OSTLANDS)
 *   - Upsert PublicPlayer-rader (deduplikert på slug)
 *   - Upsert PublicPlayerEntry-rader med rounds-JSON
 *   - Begrenset til siste 3 år (2024-2026) for å unngå overload
 *
 * Kjør lokalt mot dev/prod:
 *   npx tsx scripts/import-norske-turneringer.ts
 *
 * Idempotent — kan kjøres flere ganger.
 *
 * Senere migrering: når akgolf-pipelines-repo er klart, kan vi bytte til
 * cron-pipeline som leser fra Supabase Storage eller direkte fra forbund-API.
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";
import fs from "fs";
import os from "os";
import path from "path";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DRIVE_BASE = path.join(
  os.homedir(),
  "My Drive/AK Golf Group/Data",
);

// Begrens import til siste 3 år
const MIN_YEAR = 2024;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function parseOlyoDate(s: string): Date | null {
  // OLYO bruker "20180516T000000"
  if (s.length < 8) return null;
  const y = Number(s.slice(0, 4));
  const m = Number(s.slice(4, 6));
  const d = Number(s.slice(6, 8));
  const dt = new Date(Date.UTC(y, m - 1, d));
  return isNaN(dt.getTime()) ? null : dt;
}

function parseSrixonDate(s: string): Date | null {
  // Srixon bruker "20180915" (YYYYMMDD, ingen T)
  if (s.length < 8) return null;
  const y = Number(s.slice(0, 4));
  const m = Number(s.slice(4, 6));
  const d = Number(s.slice(6, 8));
  const dt = new Date(Date.UTC(y, m - 1, d));
  return isNaN(dt.getTime()) ? null : dt;
}

function getWeekStart(d: Date): Date {
  const w = new Date(d);
  const dow = w.getUTCDay();
  const daysSinceMonday = (dow + 6) % 7;
  w.setUTCDate(w.getUTCDate() - daysSinceMonday);
  w.setUTCHours(0, 0, 0, 0);
  return w;
}

function inferTier(tournamentName: string, tour: string): number {
  // 1=major, 2=tour, 3=challenge, 4=junior, 5=amateur/lokal
  if (tour === "olyo" || tour === "srixon") return 4; // junior
  if (tour === "ngc") return 3; // Norges Cup = profesjonell norsk tour
  return 5; // amateur/regional default
}

function inferPlayerTier(birthYear: number | null): string {
  const currentYear = new Date().getFullYear();
  if (!birthYear) return "amateur";
  const age = currentYear - birthYear;
  if (age < 20) return "junior";
  return "amateur";
}

// ---------------------------------------------------------------------------
// PublicPlayer-cache (dedup på slug)
// ---------------------------------------------------------------------------

const playerCache = new Map<string, string>(); // slug → playerId

async function ensurePlayer(
  fn: string,
  ln: string,
  club: string | null,
  birthYear: number | null,
): Promise<string> {
  const fullName = `${fn} ${ln}`.trim();
  const baseSlug = slugify(fullName);
  // Spillere kan ha samme navn — diskriminer på fødselsår
  const slug = birthYear ? `${baseSlug}-${birthYear}` : baseSlug;

  const cached = playerCache.get(slug);
  if (cached) return cached;

  const existing = await prisma.publicPlayer.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (existing) {
    playerCache.set(slug, existing.id);
    return existing.id;
  }

  const created = await prisma.publicPlayer.create({
    data: {
      slug,
      name: fullName,
      country: "NO",
      birthYear: birthYear ?? null,
      tier: inferPlayerTier(birthYear),
      bio: club ? `Klubb: ${club}` : null,
    },
    select: { id: true },
  });

  playerCache.set(slug, created.id);
  return created.id;
}

// ---------------------------------------------------------------------------
// SRIXON TOUR
// ---------------------------------------------------------------------------

type SrixonRound = { n: number; score: string; par: string };
type SrixonPlayer = {
  pos: number;
  fn: string;
  ln: string;
  club: string;
  by?: number;
  total: string;
  topar?: string;
  rounds: SrixonRound[];
};
type SrixonClass = { name: string; players: SrixonPlayer[] };
type SrixonTournament = {
  id: number;
  name: string;
  type: string;
  date: string;
  classes: SrixonClass[];
};

async function importSrixon(): Promise<{ tournaments: number; entries: number }> {
  const file = path.join(DRIVE_BASE, "srixon_all_data.json");
  if (!fs.existsSync(file)) {
    console.warn(`[srixon] Hopper over — fant ikke ${file}`);
    return { tournaments: 0, entries: 0 };
  }

  const raw = fs.readFileSync(file, "utf-8");
  const data = JSON.parse(raw) as SrixonTournament[];

  let tournamentCount = 0;
  let entryCount = 0;

  for (const t of data) {
    const startDate = parseSrixonDate(t.date);
    if (!startDate) continue;
    if (startDate.getUTCFullYear() < MIN_YEAR) continue;

    const slug = `srixon-${slugify(t.name)}-${startDate.getUTCFullYear()}`;
    const weekStart = getWeekStart(startDate);
    const tier = inferTier(t.name, "srixon");

    const turnering = await prisma.tournament.upsert({
      where: { slug },
      create: {
        name: t.name,
        slug,
        startDate,
        endDate: startDate, // Srixon = 1-dag
        format: t.type === "StrokePlay" ? "STROKE" : "STROKE",
        sourceOrigin: "NGF",
        sourceId: `srixon-${t.id}`,
        tour: "junior-no",
        country: "NO",
        status: "COMPLETED",
        tier,
        weekStart,
        notes: JSON.stringify({ tour: "srixon", externalId: t.id }),
        lastSyncAt: new Date(),
      },
      update: {
        lastSyncAt: new Date(),
        tier,
        weekStart,
      },
      select: { id: true },
    });

    tournamentCount++;

    // Importer deltakere
    for (const cls of t.classes) {
      for (const p of cls.players) {
        const playerId = await ensurePlayer(p.fn, p.ln, p.club, p.by ?? null);

        const rounds = p.rounds.map((r) => ({
          n: r.n,
          score: Number(r.score),
          par: r.par,
        }));
        const totalScore = Number(p.total) || null;

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
            status: "FINISHED",
            position: p.pos,
            totalScore,
            rounds,
          },
          update: {
            position: p.pos,
            totalScore,
            rounds,
            status: "FINISHED",
          },
        });

        entryCount++;
      }
    }
  }

  // Oppdater norskeAntall denormalisert
  await prisma.$executeRaw`
    UPDATE tournaments t
    SET "norskeAntall" = (
      SELECT COUNT(*) FROM public_player_entries pe
      JOIN public_players pp ON pp.id = pe."playerId"
      WHERE pe."tournamentId" = t.id AND pp.country = 'NO'
    )
    WHERE "sourceOrigin" = 'NGF'
  `;

  return { tournaments: tournamentCount, entries: entryCount };
}

// ---------------------------------------------------------------------------
// OLYO TOUR — alle regioner
// ---------------------------------------------------------------------------

type OlyoSchedule = {
  id: number;
  name: string;
  start_date: string;
  end_date?: string;
  type: string;
  categories?: number[];
};

async function importOlyoSchedules(): Promise<{ tournaments: number }> {
  const file = path.join(DRIVE_BASE, "olyo_schedules.json");
  if (!fs.existsSync(file)) {
    console.warn(`[olyo] Hopper over — fant ikke ${file}`);
    return { tournaments: 0 };
  }

  const raw = fs.readFileSync(file, "utf-8");
  const data = JSON.parse(raw) as Record<string, Record<string, OlyoSchedule[]>>;

  let total = 0;

  for (const [region, years] of Object.entries(data)) {
    for (const [yearStr, events] of Object.entries(years)) {
      const year = Number(yearStr);
      if (year < MIN_YEAR) continue;

      for (const e of events) {
        const startDate = parseOlyoDate(e.start_date);
        const endDate = e.end_date ? parseOlyoDate(e.end_date) : startDate;
        if (!startDate) continue;

        const slug = `olyo-${slugify(region)}-${slugify(e.name)}-${year}`;
        const weekStart = getWeekStart(startDate);
        const tier = inferTier(e.name, "olyo");

        await prisma.tournament.upsert({
          where: { slug },
          create: {
            name: e.name,
            slug,
            startDate,
            endDate,
            format: e.type === "StrokePlay" ? "STROKE" : "STROKE",
            sourceOrigin: "NGF",
            sourceId: `olyo-${e.id}`,
            tour: "junior-no",
            country: "NO",
            status: startDate.getTime() > Date.now() ? "UPCOMING" : "COMPLETED",
            tier,
            weekStart,
            notes: JSON.stringify({
              tour: "olyo",
              krets: region,
              categories: e.categories ?? [],
              externalId: e.id,
            }),
            lastSyncAt: new Date(),
          },
          update: {
            lastSyncAt: new Date(),
            tier,
            weekStart,
            notes: JSON.stringify({
              tour: "olyo",
              krets: region,
              categories: e.categories ?? [],
              externalId: e.id,
            }),
          },
        });

        total++;
      }
    }
  }

  return { tournaments: total };
}

// ---------------------------------------------------------------------------
// NORGES CUP (Garmin)
// ---------------------------------------------------------------------------

async function importNorgesCup(): Promise<{ tournaments: number }> {
  const file = path.join(DRIVE_BASE, "norgescup_srixon_filtered.csv");
  if (!fs.existsSync(file)) {
    console.warn(`[ngc] Hopper over — fant ikke ${file}`);
    return { tournaments: 0 };
  }

  // CSV-format: ukjent — leser bare for å logge antall linjer
  const lines = fs.readFileSync(file, "utf-8").trim().split("\n");
  console.log(`[ngc] CSV har ${lines.length} linjer — krever parser-spesifikasjon`);

  // TODO: implementer parser når CSV-strukturen er bekreftet
  return { tournaments: 0 };
}

// ---------------------------------------------------------------------------
// ØSTLANDSTOUR
// ---------------------------------------------------------------------------

async function importOstlandsTour(): Promise<{ tournaments: number }> {
  const file = path.join(DRIVE_BASE, "ostlandstour_results.json");
  if (!fs.existsSync(file)) {
    console.warn(`[ostlands] Hopper over — fant ikke ${file}`);
    return { tournaments: 0 };
  }

  const raw = fs.readFileSync(file, "utf-8");
  const data = JSON.parse(raw) as unknown;

  if (!Array.isArray(data)) {
    console.warn(`[ostlands] Forventet array, fikk ${typeof data}`);
    return { tournaments: 0 };
  }

  console.log(`[ostlands] ${data.length} entries i JSON — krever parser-spesifikasjon`);
  // TODO: implementer parser når struktur er bekreftet
  return { tournaments: 0 };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("Starter import av norske turneringer ...");
  console.log(`Kilde: ${DRIVE_BASE}`);
  console.log(`Begrenset til år >= ${MIN_YEAR}\n`);

  if (!fs.existsSync(DRIVE_BASE)) {
    console.error(`KRITISK: ${DRIVE_BASE} finnes ikke. Sjekk Google Drive-mounting.`);
    process.exit(1);
  }

  console.log("=== SRIXON TOUR ===");
  const srixon = await importSrixon();
  console.log(`  ${srixon.tournaments} turneringer, ${srixon.entries} deltaker-rader\n`);

  console.log("=== OLYO TOUR (alle regioner) ===");
  const olyo = await importOlyoSchedules();
  console.log(`  ${olyo.tournaments} turneringer\n`);

  console.log("=== NORGES CUP ===");
  const ngc = await importNorgesCup();
  console.log(`  ${ngc.tournaments} turneringer\n`);

  console.log("=== ØSTLANDSTOUR ===");
  const ostlands = await importOstlandsTour();
  console.log(`  ${ostlands.tournaments} turneringer\n`);

  const totalT = srixon.tournaments + olyo.tournaments + ngc.tournaments + ostlands.tournaments;
  console.log(`✓ Ferdig — totalt ${totalT} turneringer + ${srixon.entries} deltaker-rader importert`);
  console.log(`  Unike spillere lagt til denne kjøringen: ${playerCache.size}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("FEIL:", err);
  process.exit(1);
});
