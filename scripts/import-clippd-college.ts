/**
 * Clippd.com NCAA college per-runde brutto-score importer
 *
 * Henter turneringshistorikk for alle norske college-spillere i DB
 * og importerer per-runde resultater fra scoreboard.clippd.com.
 *
 * Strategi:
 *   1. Hent PublicPlayer WHERE tier='college' AND country='NO' fra DB
 *   2. Søk etter Clippd playerId for hver spiller via /api/search/players
 *   3. For hver sesong (2022–2026): hent turneringsliste via /api/tournaments
 *   4. For hvert turnering med hasResults=true: hent HTML-leaderboard og parse
 *   5. Upsert Tournament + PublicPlayerEntry med per-runde scores
 *
 * Bekreftet fungerende API-endepunkter (verifikasjon 2026-05-26):
 *   GET /api/search/players?query={name}&limit=36&offset=0
 *   GET /api/tournaments?playerId={id}&season={year}&sort[0][attribute]=endDate&sort[0][order]=desc&limit=50
 *   GET /tournaments/{tournamentId}/scoring/player  (SSR HTML, parseable)
 *
 * Bruk:
 *   npx tsx scripts/import-clippd-college.ts --dry-run      # test uten DB-skriving
 *   npx tsx scripts/import-clippd-college.ts --limit=5      # test 5 spillere
 *   npx tsx scripts/import-clippd-college.ts --player="Anna Krekling"
 *   npx tsx scripts/import-clippd-college.ts                # full sync
 *
 * Runtime: ~2-4 timer for full sync (60 spillere × 4 sesonger × rate-limit).
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const CLIPPD_BASE = "https://scoreboard.clippd.com";
const DELAY_MS = 2500;   // mellom HTTP-kall (respekter rate-limit)
const SEASONS = [2022, 2023, 2024, 2025, 2026];
const USER_AGENT = "AKGolfBot/1.0 (akgolf.no; college-stats-pipeline)";

// CLI-argumenter
const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const LIMIT = args.find((a) => a.startsWith("--limit="))
  ? parseInt(args.find((a) => a.startsWith("--limit="))!.split("=")[1])
  : undefined;
const PLAYER_FILTER = args.find((a) => a.startsWith("--player="))
  ?.split("=")[1]
  ?.toLowerCase();

// ---------------------------------------------------------------------------
// Hjelpefunksjoner
// ---------------------------------------------------------------------------

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function normaliserNavn(navn: string): string {
  return navn
    .toLowerCase()
    .replace(/[åä]/g, "a")
    .replace(/[øö]/g, "o")
    .replace(/[æ]/g, "ae")
    .replace(/[éèê]/g, "e")
    .replace(/[íì]/g, "i")
    .replace(/[úù]/g, "u")
    .replace(/\s+/g, " ")
    .trim();
}

// Beregn Dice-koeffisient mellom to strenger (karakter-bigram overlapp)
function diceKoeffisient(a: string, b: string): number {
  if (a.length < 2 || b.length < 2) return a === b ? 1.0 : 0.0;
  const bigramA = new Set<string>();
  for (let i = 0; i < a.length - 1; i++) bigramA.add(a.slice(i, i + 2));
  const bigramB: string[] = [];
  for (let i = 0; i < b.length - 1; i++) bigramB.push(b.slice(i, i + 2));
  const felles = bigramB.filter((g) => bigramA.has(g)).length;
  return (2 * felles) / (bigramA.size + bigramB.length);
}

function navnLikhet(a: string, b: string): number {
  const na = normaliserNavn(a);
  const nb = normaliserNavn(b);
  if (na === nb) return 1.0;

  const partsA = na.split(" ");
  const partsB = nb.split(" ");

  // Første navn (fornavn) MÅ ha minst 60% karakter-likhet for å gi match.
  // Dette forhindrer "Frithjof" → "Alex" via felles etternavn "Rasmussen".
  const fornavnA = partsA[0];
  const fornavnB = partsB[0];
  const fornavnLikhet = diceKoeffisient(fornavnA, fornavnB);

  if (fornavnLikhet < 0.60) {
    // Fornavn matcher ikke — returnér 0 uansett etternavn
    return 0.0;
  }

  // Fornavn godkjent — beregn samlet overlapp på ord-nivå (for mellomnavn)
  const felles = partsA.filter((p) => partsB.includes(p)).length;
  const maxLen = Math.max(partsA.length, partsB.length);
  // Vektet: 70% ord-overlapp + 30% fornavn-likhet
  const ordScore = felles / maxLen;
  return 0.7 * ordScore + 0.3 * fornavnLikhet;
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
    });
    if (!res.ok) {
      console.warn(`  [http] ${res.status} på ${url}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`  [fetch] Feil på ${url}: ${(err as Error).message}`);
    return null;
  }
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 AKGolfBot/1.0",
        Accept: "text/html",
      },
    });
    if (!res.ok) {
      console.warn(`  [http] ${res.status} på ${url}`);
      return null;
    }
    return await res.text();
  } catch (err) {
    console.warn(`  [fetch] Feil på ${url}: ${(err as Error).message}`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Clippd API-typer
// ---------------------------------------------------------------------------

type ClippdPlayer = {
  playerId: number;
  playerName: string;
  schoolName?: string;
  division?: string;
  gender?: string;
};

type ClippdPlayerSearchResult = {
  players?: ClippdPlayer[];
  results?: ClippdPlayer[];
  data?: ClippdPlayer[];
};

type ClippdTournament = {
  tournamentId: number;
  tournamentName: string;
  startDate: string;
  endDate: string;
  venue?: string;
  city?: string;
  state?: string;
  hasResults: boolean;
  division?: string;
  gender?: string;
  rounds?: number;
};

type ClippdTournamentListResult = {
  tournaments?: ClippdTournament[];
  data?: ClippdTournament[];
  results?: ClippdTournament[];
};

// ---------------------------------------------------------------------------
// Clippd-søk: finn playerId for en spiller
// ---------------------------------------------------------------------------

async function finnClippdPlayerId(
  navn: string
): Promise<ClippdPlayer | null> {
  // Prøv fullt navn først
  const url = `${CLIPPD_BASE}/api/search/players?query=${encodeURIComponent(navn)}&limit=36&offset=0`;
  const result = await fetchJson<ClippdPlayerSearchResult | ClippdPlayer[]>(url);

  let spillere: ClippdPlayer[] = [];
  if (Array.isArray(result)) {
    spillere = result;
  } else if (result && "players" in result && Array.isArray(result.players)) {
    spillere = result.players;
  } else if (result && "results" in result && Array.isArray(result.results)) {
    spillere = result.results;
  } else if (result && "data" in result && Array.isArray(result.data)) {
    spillere = result.data;
  }

  // Hjelpefunksjon: parse ClippdPlayerSearchResult
  function parseSpillere(r: ClippdPlayerSearchResult | ClippdPlayer[] | null): ClippdPlayer[] {
    if (!r) return [];
    if (Array.isArray(r)) return r;
    if ("players" in r && Array.isArray(r.players)) return r.players;
    if ("results" in r && Array.isArray(r.results)) return r.results;
    if ("data" in r && Array.isArray(r.data)) return r.data;
    return [];
  }

  if (spillere.length === 0) {
    const deler = navn.trim().split(/\s+/);

    // Prøv fornavn + etternavn (dropp mellomnavn) for 3+-ords navn
    if (deler.length >= 3) {
      const fornavnEtternavn = `${deler[0]} ${deler[deler.length - 1]}`;
      await sleep(500);
      const r = await fetchJson<ClippdPlayerSearchResult | ClippdPlayer[]>(
        `${CLIPPD_BASE}/api/search/players?query=${encodeURIComponent(fornavnEtternavn)}&limit=36&offset=0`
      );
      spillere = parseSpillere(r);
    }

    // Prøv bare etternavn som fallback
    if (spillere.length === 0) {
      const etternavn = deler[deler.length - 1];
      if (etternavn.length < 4) return null;
      await sleep(500);
      const r = await fetchJson<ClippdPlayerSearchResult | ClippdPlayer[]>(
        `${CLIPPD_BASE}/api/search/players?query=${encodeURIComponent(etternavn)}&limit=36&offset=0`
      );
      spillere = parseSpillere(r);
    }
  }

  if (spillere.length === 0) return null;

  // Finn beste match basert på navnelikhet
  const medScore = spillere.map((s) => ({
    ...s,
    score: navnLikhet(navn, s.playerName),
  }));
  medScore.sort((a, b) => b.score - a.score);

  const beste = medScore[0];
  if (beste.score < 0.5) {
    console.log(
      `  [søk] Dårlig match for "${navn}": beste treff "${beste.playerName}" (score: ${beste.score.toFixed(2)})`
    );
    return null;
  }

  if (beste.score < 1.0) {
    console.log(
      `  [søk] Fuzzy match for "${navn}" → "${beste.playerName}" (score: ${beste.score.toFixed(2)})`
    );
  }

  return beste;
}

// ---------------------------------------------------------------------------
// Hent turneringsliste for en spiller og sesong
// ---------------------------------------------------------------------------

async function hentTurneringer(
  playerId: number,
  sesong: number
): Promise<ClippdTournament[]> {
  const url =
    `${CLIPPD_BASE}/api/tournaments?playerId=${playerId}&season=${sesong}` +
    `&sort[0][attribute]=endDate&sort[0][order]=desc&limit=50`;

  const result = await fetchJson<ClippdTournamentListResult | ClippdTournament[]>(url);
  if (!result) return [];

  if (Array.isArray(result)) return result;
  if ("tournaments" in result && Array.isArray(result.tournaments)) return result.tournaments;
  if ("data" in result && Array.isArray(result.data)) return result.data;
  if ("results" in result && Array.isArray(result.results)) return result.results;
  return [];
}

// ---------------------------------------------------------------------------
// Parse leaderboard HTML og finn spillerens data fra RSC payload
//
// Clippd bruker Next.js App Router med RSC-streaming. Spillerdata er embedded
// som JSON-escaped string i <script>self.__next_f.push([1,"..."])</script> tags.
// Format: ...\"playerId\":\"11701\",\"scores\":[-1,1,3],\"strokes\":[71,73,75],...
//
// Vi søker direkte på playerId (nummer) — ingen navnematching nødvendig.
// ---------------------------------------------------------------------------

type RundResultat = { n: number; score: number };

type SpilarLeaderboardRad = {
  posisjon: number | null;
  posisjonTekst: string;
  scoreToPar: number | null;
  totBrutto: number | null;
  runder: RundResultat[];
  status: string; // FINISHED | CUT | WD
};

function parseLeaderboardFromRsc(
  html: string,
  clippdPlayerId: number
): SpilarLeaderboardRad | null {
  // Søk etter playerId i RSC-payload (backslash-escaped JSON streng)
  // HTML inneholder: \"playerId\":\"11701\"
  const searchId = String(clippdPlayerId);
  const idPattern = `\\"playerId\\":\\"${searchId}\\"`;
  const idx = html.indexOf(idPattern);

  if (idx < 0) {
    // Prøv uten backslash-escaping (noen Clippd-sider kan ha ren JSON)
    const altPattern = `"playerId":"${searchId}"`;
    const altIdx = html.indexOf(altPattern);
    if (altIdx < 0) return null;
  }

  // Hjelpefunksjon: ekstraher verdi av et felt i RSC-escaped JSON
  function extractField(fieldName: string): string | null {
    // Prøv escaped variant (standard RSC format)
    const escapedRe = new RegExp(`\\\\"${fieldName}\\\\":\\s*\\\\"([^\\\\"]*)\\\\"`, "g");
    const numRe = new RegExp(`\\\\"${fieldName}\\\\":\\s*(-?\\d+)`, "g");
    const arrRe = new RegExp(`\\\\"${fieldName}\\\\":\\s*(\\[[^\\]]*\\])`, "g");

    // Prøv ren JSON variant
    const plainRe = new RegExp(`"${fieldName}":\\s*"([^"]*)"`, "g");
    const plainNumRe = new RegExp(`"${fieldName}":\\s*(-?\\d+)`, "g");
    const plainArrRe = new RegExp(`"${fieldName}":\\s*(\\[[^\\]]*\\])`, "g");

    // Søk i en begrenset region rundt spillerens playerId
    const region = html.slice(Math.max(0, idx - 100), idx + 2000);

    for (const re of [escapedRe, plainRe]) {
      re.lastIndex = 0;
      const m = re.exec(region);
      if (m) return m[1];
    }
    for (const re of [numRe, plainNumRe]) {
      re.lastIndex = 0;
      const m = re.exec(region);
      if (m) return m[1];
    }
    for (const re of [arrRe, plainArrRe]) {
      re.lastIndex = 0;
      const m = re.exec(region);
      if (m) return m[1];
    }
    return null;
  }

  // Ekstraher nøkkelfelter
  const scoresRaw = extractField("scores");
  const strokesRaw = extractField("strokes");
  const totalScoreRaw = extractField("totalScore");
  const holeThroughRaw = extractField("holeThrough");
  const currentRankRaw = extractField("currentRank");

  // Parse per-runde scores
  let runder: RundResultat[] = [];

  // Bruk brutto-strokes hvis tilgjengelig (mer presis), ellers score-to-par
  if (strokesRaw) {
    try {
      const strokes = JSON.parse(strokesRaw) as number[];
      runder = strokes
        .filter((s) => typeof s === "number")
        .map((s, i) => ({ n: i + 1, score: s }));
    } catch {
      // fallback til scores-to-par
    }
  }

  if (runder.length === 0 && scoresRaw) {
    try {
      const scores = JSON.parse(scoresRaw) as number[];
      runder = scores
        .filter((s) => typeof s === "number")
        .map((s, i) => ({ n: i + 1, score: s }));
    } catch {
      // ignore
    }
  }

  const totalScore = totalScoreRaw !== null ? parseInt(totalScoreRaw, 10) : null;
  const holeThrough = holeThroughRaw ?? null;
  const rankRaw = currentRankRaw !== null ? parseInt(currentRankRaw, 10) : null;

  // Bestem status
  let status = "REGISTERED";
  if (holeThrough === "18" || holeThrough === "F") {
    status = "FINISHED";
  } else if (holeThrough && holeThrough !== "0" && holeThrough !== "") {
    status = "TED_OFF";
  }

  return {
    posisjon: rankRaw,
    posisjonTekst: rankRaw !== null ? `T${rankRaw}` : "",
    scoreToPar: !isNaN(totalScore as number) ? (totalScore as number) : null,
    totBrutto: runder.length > 0
      ? runder.reduce((sum, r) => sum + r.score, 0)
      : null,
    runder,
    status,
  };
}

// ---------------------------------------------------------------------------
// Tour-mapping fra Clippd divisjon → vår Tournament.tour-enum
// ---------------------------------------------------------------------------

function mapTour(division?: string, gender?: string): string {
  const div = (division ?? "").toLowerCase();
  const g = (gender ?? "").toLowerCase();

  if (div.includes("d1") || div.includes("division i") || div.includes("division 1")) {
    return g === "f" || g === "women" ? "ncaa-d1-f" : "ncaa-d1-m";
  }
  if (div.includes("d2") || div.includes("division ii") || div.includes("division 2")) {
    return g === "f" || g === "women" ? "ncaa-d2-f" : "ncaa-d2-m";
  }
  if (div.includes("d3") || div.includes("division iii") || div.includes("division 3")) {
    return g === "f" || g === "women" ? "ncaa-d3-f" : "ncaa-d3-m";
  }
  if (div.includes("naia")) {
    return g === "f" || g === "women" ? "ncaa-d1-f" : "ncaa-d1-m"; // NAIA → D1-ish
  }
  return g === "f" || g === "women" ? "ncaa-d1-f" : "ncaa-d1-m";
}

// ---------------------------------------------------------------------------
// Upsert turnering i vår DB
// ---------------------------------------------------------------------------

async function upsertTurnering(t: ClippdTournament, spillerKjonn: string): Promise<string> {
  const sourceId = `clippd-${t.tournamentId}`;
  const existing = await prisma.tournament.findFirst({
    where: { sourceId },
    select: { id: true },
  });

  if (existing) return existing.id;

  const startDate = new Date(t.startDate);
  const endDate = new Date(t.endDate);
  const tour = mapTour(t.division, spillerKjonn ?? t.gender);

  const slug =
    `${t.tournamentName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}-${t.tournamentId}`;

  const created = await prisma.tournament.create({
    data: {
      name: t.tournamentName,
      slug,
      startDate,
      endDate,
      location: [t.city, t.state].filter(Boolean).join(", ") || t.venue || null,
      tour,
      sourceOrigin: "NCAA",
      sourceId,
      status: endDate < new Date() ? "COMPLETED" : "UPCOMING",
      lastSyncAt: new Date(),
    },
    select: { id: true },
  });

  return created.id;
}

// ---------------------------------------------------------------------------
// Upsert spillerens entry i turneringen
// ---------------------------------------------------------------------------

async function upsertEntry(
  spillerId: string,
  turneringId: string,
  rad: SpilarLeaderboardRad
): Promise<void> {
  const roundsJson = rad.runder.length > 0 ? rad.runder : null;

  await prisma.publicPlayerEntry.upsert({
    where: {
      playerId_tournamentId: {
        playerId: spillerId,
        tournamentId: turneringId,
      },
    },
    update: {
      status: rad.status,
      position: rad.posisjon,
      scoreToPar: rad.scoreToPar,
      ...(roundsJson !== null ? { rounds: roundsJson as object[] } : {}),
      updatedAt: new Date(),
    },
    create: {
      playerId: spillerId,
      tournamentId: turneringId,
      status: rad.status,
      position: rad.posisjon,
      scoreToPar: rad.scoreToPar,
      rounds: roundsJson as Parameters<typeof prisma.publicPlayerEntry.create>[0]["data"]["rounds"],
    },
  });
}

// ---------------------------------------------------------------------------
// Prosesser én spiller
// ---------------------------------------------------------------------------

async function prosesserSpiller(spiller: {
  id: string;
  name: string;
  bio: string | null;
}): Promise<{ turneringer: number; entries: number; feil: number }> {
  let turneringerCount = 0;
  let entriesCount = 0;
  let feilCount = 0;

  console.log(`\n[spiller] ${spiller.name}`);

  // Finn Clippd playerId
  await sleep(DELAY_MS);
  const clippdSpiller = await finnClippdPlayerId(spiller.name);
  if (!clippdSpiller) {
    console.log(`  Ingen Clippd-match funnet for "${spiller.name}" — hopper over`);
    return { turneringer: 0, entries: 0, feil: 1 };
  }

  console.log(
    `  Clippd: ${clippdSpiller.playerName} (id=${clippdSpiller.playerId}, ${clippdSpiller.schoolName ?? "ukjent skole"})`
  );

  // Utled kjønn fra bio (f.eks. "University · D1 · F")
  const bioGender = spiller.bio?.split("·").pop()?.trim() ?? "M";

  // Hent turneringer for alle sesonger
  for (const sesong of SEASONS) {
    await sleep(DELAY_MS);
    const turneringer = await hentTurneringer(clippdSpiller.playerId, sesong);

    const medResultater = turneringer.filter((t) => t.hasResults);
    if (medResultater.length === 0) continue;

    console.log(
      `  ${sesong}: ${turneringer.length} turneringer, ${medResultater.length} med resultater`
    );

    for (const t of medResultater) {
      await sleep(DELAY_MS);

      if (!DRY_RUN) {
        // Upsert turnering
        const turneringId = await upsertTurnering(t, bioGender);
        turneringerCount++;

        // Hent HTML-leaderboard
        const url = `${CLIPPD_BASE}/tournaments/${t.tournamentId}/scoring/player`;
        const html = await fetchHtml(url);

        if (!html) {
          feilCount++;
          continue;
        }

        // Parse spillerens rad fra RSC payload (bruker playerId, ikke navn)
        const radFallback = parseLeaderboardFromRsc(html, clippdSpiller.playerId);

        if (!radFallback) {
          console.log(
            `  [parse] Fant ikke playerId ${clippdSpiller.playerId} i RSC for ${t.tournamentName}`
          );
          feilCount++;
          continue;
        }

        await upsertEntry(spiller.id, turneringId, radFallback);
        entriesCount++;

        if (radFallback.runder.length > 0) {
          const rundeStr = radFallback.runder.map((r) => `R${r.n}:${r.score >= 0 ? "+" : ""}${r.score}`).join(" ");
          console.log(
            `  ✓ ${t.tournamentName} (${sesong}) — Pos: ${radFallback.posisjonTekst}, ${rundeStr}`
          );
        } else {
          console.log(
            `  ✓ ${t.tournamentName} (${sesong}) — Pos: ${radFallback.posisjonTekst} (ingen runde-data)`
          );
        }
      } else {
        // Dry run: bare vis hva vi ville gjort
        console.log(`  [dry-run] Ville importert: ${t.tournamentName} (${sesong})`);
        turneringerCount++;
        entriesCount++;
      }
    }
  }

  return { turneringer: turneringerCount, entries: entriesCount, feil: feilCount };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log("=== Clippd College Importer ===");
  if (DRY_RUN) console.log("DRY RUN — ingen DB-skriving");
  if (PLAYER_FILTER) console.log(`Filtrert på: "${PLAYER_FILTER}"`);
  if (LIMIT) console.log(`Maks spillere: ${LIMIT}`);
  console.log("");

  // Hent norske college-spillere fra DB
  const spillere = await prisma.publicPlayer.findMany({
    where: {
      country: "NO",
      tier: "college",
      isActive: true,
      ...(PLAYER_FILTER
        ? { name: { contains: PLAYER_FILTER, mode: "insensitive" } }
        : {}),
    },
    select: { id: true, name: true, bio: true },
    take: LIMIT,
    orderBy: { name: "asc" },
  });

  console.log(`Fant ${spillere.length} norske college-spillere i DB`);

  let totTurneringer = 0;
  let totEntries = 0;
  let totFeil = 0;
  let ingenMatch = 0;

  for (const spiller of spillere) {
    const res = await prosesserSpiller(spiller);
    totTurneringer += res.turneringer;
    totEntries += res.entries;
    totFeil += res.feil;
    if (res.entries === 0 && res.feil === 0) ingenMatch++;
  }

  console.log("\n=== SAMMENDRAG ===");
  console.log(`Spillere behandlet:  ${spillere.length}`);
  console.log(`Turneringer upsert:  ${totTurneringer}`);
  console.log(`Entries upsert:      ${totEntries}`);
  console.log(`Feil:                ${totFeil}`);
  console.log(`Ingen Clippd-match:  ${ingenMatch}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Fatal feil:", err);
  process.exit(1);
});
