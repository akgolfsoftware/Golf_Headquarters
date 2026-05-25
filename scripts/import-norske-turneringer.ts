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

// Importer all tilgjengelig historikk. Tidligste år i datasettet er 2016
// (Østlandstour). Endre til høyere år hvis du vil ha rasere kjøring.
const MIN_YEAR = 2016;

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

/**
 * Beriker en eksisterende PublicPlayer med ekstra info (university, division
 * for college; score_by_age for WAGR). Brukes etter ensurePlayer for å
 * legge til kilde-spesifikk metadata.
 */
async function enrichPlayer(
  playerId: string,
  updates: {
    tier?: string;
    bio?: string;
    extraBio?: string; // appendes til eksisterende bio
  },
): Promise<void> {
  const current = await prisma.publicPlayer.findUnique({
    where: { id: playerId },
    select: { bio: true, tier: true },
  });
  if (!current) return;

  const data: { tier?: string; bio?: string } = {};
  if (updates.tier) data.tier = updates.tier;

  if (updates.bio) {
    data.bio = updates.bio;
  } else if (updates.extraBio) {
    const existing = current.bio?.trim() ?? "";
    if (existing.includes(updates.extraBio)) {
      // Allerede der — skip
    } else {
      data.bio = existing ? `${existing} · ${updates.extraBio}` : updates.extraBio;
    }
  }

  if (Object.keys(data).length > 0) {
    await prisma.publicPlayer.update({ where: { id: playerId }, data });
  }
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
//
// Filformat: CSV med kolonner
//   source, year, tournament, date (YYYY-MM-DD), class, pos, first_name,
//   last_name, club, nationality, birth_year, handicap, total, to_par,
//   r1, r2, r3, r4
//
// NB: norgescup_srixon_filtered.csv er filtrert til kun Srixon-spillere —
// dvs. det er ikke komplett NGC, men det er det vi har. Full komplett NGC
// må komme fra senere pipeline.
// ---------------------------------------------------------------------------

type NgcRow = {
  source: string;
  year: string;
  tournament: string;
  date: string;
  class: string;
  pos: string;
  first_name: string;
  last_name: string;
  club: string;
  nationality: string;
  birth_year: string;
  handicap: string;
  total: string;
  to_par: string;
  r1: string;
  r2: string;
  r3: string;
  r4: string;
};

function parseCsv(text: string): NgcRow[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  const rows: NgcRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]);
    if (cells.length !== headers.length) continue;
    const obj = Object.fromEntries(
      headers.map((h, idx) => [h, cells[idx] ?? ""]),
    ) as unknown as NgcRow;
    rows.push(obj);
  }
  return rows;
}

function splitCsvLine(line: string): string[] {
  // Enkel CSV-parser som håndterer komma inni "..."-felter (typisk for klubbnavn).
  // NGC-CSV-en bruker ikke quotes, så split på komma er trygt — men vi håndterer
  // det for robusthet.
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result.map((s) => s.trim());
}

async function importNorgesCup(): Promise<{ tournaments: number; entries: number }> {
  const file = path.join(DRIVE_BASE, "norgescup_srixon_filtered.csv");
  if (!fs.existsSync(file)) {
    console.warn(`[ngc] Hopper over — fant ikke ${file}`);
    return { tournaments: 0, entries: 0 };
  }

  const text = fs.readFileSync(file, "utf-8");
  const rows = parseCsv(text);

  // Grupper per turnering (year + tournament + date)
  const turnMap = new Map<string, { name: string; date: Date; rows: NgcRow[] }>();
  for (const r of rows) {
    const year = Number(r.year);
    if (isNaN(year) || year < MIN_YEAR) continue;

    const date = new Date(r.date);
    if (isNaN(date.getTime())) continue;

    const key = `${r.year}|${r.tournament}|${r.date}`;
    const existing = turnMap.get(key);
    if (existing) {
      existing.rows.push(r);
    } else {
      turnMap.set(key, { name: r.tournament, date, rows: [r] });
    }
  }

  let tournamentCount = 0;
  let entryCount = 0;

  for (const [key, t] of turnMap.entries()) {
    const slug = `ngc-${slugify(t.name)}-${t.date.getUTCFullYear()}`;
    const weekStart = getWeekStart(t.date);

    const turnering = await prisma.tournament.upsert({
      where: { slug },
      create: {
        name: t.name,
        slug,
        startDate: t.date,
        endDate: t.date,
        format: "STROKE",
        sourceOrigin: "NGF",
        sourceId: `ngc-${key}`,
        tour: "amateur-no",
        country: "NO",
        status: "COMPLETED",
        tier: 3, // Norges Cup = profesjonell norsk tour
        weekStart,
        notes: JSON.stringify({ tour: "garmin", externalKey: key }),
        lastSyncAt: new Date(),
      },
      update: {
        lastSyncAt: new Date(),
        tier: 3,
        weekStart,
      },
      select: { id: true },
    });
    tournamentCount++;

    for (const r of t.rows) {
      const fn = r.first_name.replace(/\s*\(a\)\s*$/i, "").trim();
      const ln = r.last_name.replace(/\s*\(a\)\s*$/i, "").trim();
      const by = r.birth_year ? Number(r.birth_year) : null;
      const playerId = await ensurePlayer(fn, ln, r.club || null, by);

      const rounds = [
        { n: 1, score: r.r1 ? Number(r.r1) : null, par: null },
        { n: 2, score: r.r2 ? Number(r.r2) : null, par: null },
        { n: 3, score: r.r3 ? Number(r.r3) : null, par: null },
        { n: 4, score: r.r4 ? Number(r.r4) : null, par: null },
      ].filter((rnd) => rnd.score !== null && !isNaN(rnd.score));

      const totalScore = r.total ? Number(r.total) : null;
      const pos = r.pos ? Number(r.pos) : null;

      await prisma.publicPlayerEntry.upsert({
        where: {
          playerId_tournamentId: { playerId, tournamentId: turnering.id },
        },
        create: {
          playerId,
          tournamentId: turnering.id,
          status: "FINISHED",
          position: pos,
          totalScore: totalScore && !isNaN(totalScore) ? totalScore : null,
          rounds,
        },
        update: {
          position: pos,
          totalScore: totalScore && !isNaN(totalScore) ? totalScore : null,
          rounds,
          status: "FINISHED",
        },
      });
      entryCount++;
    }
  }

  // Oppdater norskeAntall denormalisert for NGC også (kjøres samlet i main)
  return { tournaments: tournamentCount, entries: entryCount };
}

// ---------------------------------------------------------------------------
// ØSTLANDSTOUR
//
// Filformat: JSON-array av turneringer med samme struktur som Srixon:
//   { comp_id, name, year, start_date (YYYYMMDDTHHMMSS), classes: [
//     { class_name, players: [{ pos, fn, ln, club, nat, by, hcp, total,
//       topar, rounds: [{ n, score, par }] }] }
//   ]}
// ---------------------------------------------------------------------------

type OstlandsRound = { n: number; score: string; par: string };
type OstlandsPlayer = {
  pos: number;
  fn: string;
  ln: string;
  club: string;
  nat?: string;
  by?: number;
  hcp?: string;
  total: string;
  topar?: string;
  rounds: OstlandsRound[];
};
type OstlandsClass = { class_name: string; players: OstlandsPlayer[] };
type OstlandsTournament = {
  comp_id: number;
  name: string;
  year: number;
  start_date: string;
  classes: OstlandsClass[];
};

async function importOstlandsTour(): Promise<{ tournaments: number; entries: number }> {
  const file = path.join(DRIVE_BASE, "ostlandstour_results.json");
  if (!fs.existsSync(file)) {
    console.warn(`[ostlands] Hopper over — fant ikke ${file}`);
    return { tournaments: 0, entries: 0 };
  }

  const raw = fs.readFileSync(file, "utf-8");
  const data = JSON.parse(raw) as OstlandsTournament[];

  if (!Array.isArray(data)) {
    console.warn(`[ostlands] Forventet array, fikk ${typeof data}`);
    return { tournaments: 0, entries: 0 };
  }

  let tournamentCount = 0;
  let entryCount = 0;

  for (const t of data) {
    if (t.year < MIN_YEAR) continue;
    const startDate = parseOlyoDate(t.start_date); // Samme format som OLYO
    if (!startDate) continue;

    const slug = `ostlands-${slugify(t.name)}-${t.year}`;
    const weekStart = getWeekStart(startDate);

    const turnering = await prisma.tournament.upsert({
      where: { slug },
      create: {
        name: t.name.trim(),
        slug,
        startDate,
        endDate: startDate, // Østlandstour er 2-dagers — endDate beregnes fra rundes
        format: "STROKE",
        sourceOrigin: "NGF",
        sourceId: `ostlands-${t.comp_id}`,
        tour: "amateur-no",
        country: "NO",
        status: "COMPLETED",
        tier: 4, // amatør-juniortour
        weekStart,
        notes: JSON.stringify({ tour: "ostlandstour", externalId: t.comp_id }),
        lastSyncAt: new Date(),
      },
      update: {
        lastSyncAt: new Date(),
        weekStart,
        tier: 4,
      },
      select: { id: true },
    });
    tournamentCount++;

    for (const cls of t.classes) {
      for (const p of cls.players) {
        // Hopp over ikke-norske spillere fra Østlandstour (de kommer fra andre tour-databaser)
        if (p.nat && p.nat !== "NO") continue;

        const playerId = await ensurePlayer(
          p.fn,
          p.ln,
          p.club || null,
          p.by ?? null,
        );

        const rounds = p.rounds.map((r) => ({
          n: r.n,
          score: Number(r.score),
          par: r.par,
        }));
        const totalScore = Number(p.total) || null;

        await prisma.publicPlayerEntry.upsert({
          where: {
            playerId_tournamentId: { playerId, tournamentId: turnering.id },
          },
          create: {
            playerId,
            tournamentId: turnering.id,
            status: "FINISHED",
            position: p.pos,
            totalScore: totalScore && !isNaN(totalScore) ? totalScore : null,
            rounds,
          },
          update: {
            position: p.pos,
            totalScore: totalScore && !isNaN(totalScore) ? totalScore : null,
            rounds,
            status: "FINISHED",
          },
        });
        entryCount++;
      }
    }
  }

  return { tournaments: tournamentCount, entries: entryCount };
}

// ---------------------------------------------------------------------------
// NCAA COLLEGE — norske spillere på amerikanske college-lag
//
// Filformat: college_pipeline_0b47d7f2.json med
//   { total_players, by_division, by_gender, universities,
//     players: [{ name, university, division (D1/D2/D3), gender (M/F), srixon_match }] }
//
// Importerer som PublicPlayer med tier="college" og bio = "University X · D1 · F"
// Beriker eksisterende rader (hvis spilleren allerede er importert fra Srixon).
// ---------------------------------------------------------------------------

type CollegePlayer = {
  name: string;
  university: string;
  division: string; // "D1" | "D2" | "D3" | "NAIA"
  gender: string;   // "M" | "F"
  srixon_match?: string;
};

type CollegePipeline = {
  total_players?: number;
  by_division?: Record<string, number>;
  by_gender?: Record<string, number>;
  universities?: string[];
  players: CollegePlayer[];
};

async function importNcaaCollege(): Promise<{ players: number; enriched: number; created: number }> {
  const file = path.join(DRIVE_BASE, "college_pipeline_0b47d7f2.json");
  if (!fs.existsSync(file)) {
    console.warn(`[ncaa] Hopper over — fant ikke ${file}`);
    return { players: 0, enriched: 0, created: 0 };
  }

  const raw = fs.readFileSync(file, "utf-8");
  const data = JSON.parse(raw) as CollegePipeline;
  const players = data.players ?? [];

  let created = 0;
  let enriched = 0;

  for (const p of players) {
    // Splitt navn — anta "Fornavn Mellomnavn Etternavn" der etternavn er siste ord
    const parts = p.name.trim().split(/\s+/);
    if (parts.length < 2) continue;
    const ln = parts[parts.length - 1];
    const fn = parts.slice(0, -1).join(" ");

    // Sjekk om vi har spilleren allerede (uten fødselsår — college kan være 18-23)
    const baseSlug = slugify(`${fn} ${ln}`);

    // Først: prøv å matche eksisterende spillere uten fødselsår
    const existing = await prisma.publicPlayer.findFirst({
      where: {
        OR: [
          { slug: baseSlug },
          { slug: { startsWith: `${baseSlug}-` } },
        ],
      },
      select: { id: true, bio: true },
      orderBy: { birthYear: "desc" }, // ta nyligste hvis flere
    });

    let playerId: string;
    const collegeBio = `${p.university} · ${p.division} · ${p.gender}`;

    if (existing) {
      playerId = existing.id;
      enriched++;
    } else {
      // Opprett ny — sett ngfId=college_srixon_match for kobling, antatt junior-college-alder
      const created2 = await prisma.publicPlayer.create({
        data: {
          slug: baseSlug,
          name: p.name.trim(),
          country: "NO",
          birthYear: null,
          tier: "college",
          bio: collegeBio,
        },
        select: { id: true },
      });
      playerId = created2.id;
      created++;
    }

    await enrichPlayer(playerId, {
      tier: "college",
      extraBio: collegeBio,
    });
  }

  return { players: players.length, enriched, created };
}

// ---------------------------------------------------------------------------
// WAGR — norske amatører med score-by-age benchmarks
//
// Filformat: wagr_data_94409d23.json med
//   { age_benchmarks: { "14": ..., "15": ... },
//     wagr_players: { "navn nedstilt": { name, birth_year, score_by_age: { "15": 72.5, ... } } } }
//
// Importerer som PublicPlayer med tier="amateur"|"junior" basert på alder.
// Lagrer score_by_age som JSON i ngfId-feltet (TODO: egen tabell senere).
// ---------------------------------------------------------------------------

type WagrPlayer = {
  name: string;
  birth_year?: number;
  score_by_age?: Record<string, number>;
};

type WagrData = {
  age_benchmarks?: Record<string, unknown>;
  wagr_players?: Record<string, WagrPlayer>;
};

async function importWagr(): Promise<{ players: number; enriched: number; created: number }> {
  const file = path.join(DRIVE_BASE, "wagr_data_94409d23.json");
  if (!fs.existsSync(file)) {
    console.warn(`[wagr] Hopper over — fant ikke ${file}`);
    return { players: 0, enriched: 0, created: 0 };
  }

  const raw = fs.readFileSync(file, "utf-8");
  const data = JSON.parse(raw) as WagrData;
  const playersMap = data.wagr_players ?? {};
  const players = Object.values(playersMap);

  let created = 0;
  let enriched = 0;

  for (const p of players) {
    if (!p.name) continue;

    const parts = p.name.trim().split(/\s+/);
    if (parts.length < 2) continue;
    const ln = parts[parts.length - 1];
    const fn = parts.slice(0, -1).join(" ");
    const birthYear = p.birth_year ?? null;

    const baseSlug = slugify(`${fn} ${ln}`);
    const slug = birthYear ? `${baseSlug}-${birthYear}` : baseSlug;

    const existing = await prisma.publicPlayer.findUnique({
      where: { slug },
      select: { id: true },
    });

    let playerId: string;
    if (existing) {
      playerId = existing.id;
      enriched++;
    } else {
      const newRow = await prisma.publicPlayer.create({
        data: {
          slug,
          name: p.name.trim(),
          country: "NO",
          birthYear,
          tier: inferPlayerTier(birthYear),
          bio: null,
        },
        select: { id: true },
      });
      playerId = newRow.id;
      created++;
    }

    // Berik med score_by_age og WAGR-tag
    const scoreSummary = p.score_by_age
      ? `WAGR snittscore: ${Object.entries(p.score_by_age)
          .map(([age, s]) => `${age}å=${s}`)
          .join(", ")}`
      : "WAGR-spiller";
    await enrichPlayer(playerId, { extraBio: scoreSummary });
  }

  return { players: players.length, enriched, created };
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
  console.log(`  ${olyo.tournaments} turneringer (kun schedules, ingen resultater)\n`);

  console.log("=== NORGES CUP (Garmin) ===");
  const ngc = await importNorgesCup();
  console.log(`  ${ngc.tournaments} turneringer, ${ngc.entries} deltaker-rader\n`);

  console.log("=== ØSTLANDSTOUR ===");
  const ostlands = await importOstlandsTour();
  console.log(`  ${ostlands.tournaments} turneringer, ${ostlands.entries} deltaker-rader\n`);

  console.log("=== NCAA COLLEGE (roster) ===");
  const ncaa = await importNcaaCollege();
  console.log(
    `  ${ncaa.players} spillere (${ncaa.created} nye, ${ncaa.enriched} beriket — har ikke turneringsdata ennå)\n`,
  );

  console.log("=== WAGR (norske amatører + score_by_age) ===");
  const wagr = await importWagr();
  console.log(
    `  ${wagr.players} spillere (${wagr.created} nye, ${wagr.enriched} beriket — har ikke per-runde data ennå)\n`,
  );

  // Oppdater norskeAntall denormalisert for alle NGF-turneringer
  console.log("=== OPPDATER norskeAntall-cache ===");
  await prisma.$executeRaw`
    UPDATE tournaments t
    SET "norskeAntall" = (
      SELECT COUNT(*) FROM public_player_entries pe
      JOIN public_players pp ON pp.id = pe."playerId"
      WHERE pe."tournamentId" = t.id AND pp.country = 'NO'
    )
    WHERE "sourceOrigin" = 'NGF'
  `;
  console.log("  Cache oppdatert\n");

  const totalT =
    srixon.tournaments + olyo.tournaments + ngc.tournaments + ostlands.tournaments;
  const totalE = srixon.entries + ngc.entries + ostlands.entries;
  console.log(
    `✓ Ferdig — totalt ${totalT} turneringer + ${totalE} deltaker-rader importert`,
  );
  console.log(`  Unike spillere lagt til denne kjøringen: ${playerCache.size}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("FEIL:", err);
  process.exit(1);
});
