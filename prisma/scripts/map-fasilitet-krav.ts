/**
 * prisma/scripts/map-fasilitet-krav.ts
 *
 * Populerer `fasilitetKrav` på alle ExerciseDefinition-rader basert på
 * eksisterende `environment[]`, `utstyr[]`, `tags[]` og `skillArea`.
 *
 * Logikk:
 *   RADAR          — environment SIMULATOR/STUDIO, eller utstyr/tags inneholder
 *                    "trackman", "radar", "launch monitor", "flightscope",
 *                    "garmin", "mevo", "mevo+", "skytrak"
 *   MAT_NET        — environment STUDIO/HJEM, eller utstyr inneholder "matte",
 *                    "net", "nett", "mat"
 *   BUNKER         — skillArea AROUND_GREEN + tags/utstyr "bunker", "sand"
 *   KAMERA         — tags/utstyr "kamera", "camera", "video", "iphone", "stativ"
 *   PUTTING_GREEN_KORT — skillArea PUTTING
 *   PUTTING_GREEN_LANG — skillArea PUTTING + tags "lag-putt", "5m+", "10m+",
 *                        "15m", "20m", "30m", "1-300ft", "long putt"
 *   SHORT_GAME_AREA    — skillArea AROUND_GREEN (chip/pitch/lob fra gress)
 *   DRIVING_RANGE  — environment RANGE
 *   BANE           — environment BANE
 *   SIMULATOR      — environment SIMULATOR
 *
 * Tom fasilitetKrav = drill uten spesialkrav (kan gjøres overalt).
 *
 * Kjør: npx tsx prisma/scripts/map-fasilitet-krav.ts
 */

import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

type DrillFasilitet =
  | "RADAR"
  | "MAT_NET"
  | "BUNKER"
  | "KAMERA"
  | "PUTTING_GREEN_KORT"
  | "PUTTING_GREEN_LANG"
  | "SHORT_GAME_AREA"
  | "DRIVING_RANGE"
  | "BANE"
  | "SIMULATOR";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" }),
});

function inneholder(arr: string[], ...noekkler: string[]): boolean {
  return arr.some((s) =>
    noekkler.some((n) => s.toLowerCase().includes(n.toLowerCase())),
  );
}

function beregn(drill: {
  environment: string[];
  utstyr: string[];
  tags: string[];
  skillArea: string | null;
}): DrillFasilitet[] {
  const krav = new Set<DrillFasilitet>();

  const env = drill.environment;
  const utstyr = drill.utstyr;
  const tags = drill.tags;
  const skill = drill.skillArea;

  // ── RADAR ──────────────────────────────────────────────────────────────────
  if (
    env.includes("SIMULATOR") ||
    env.includes("STUDIO") ||
    inneholder(utstyr, "trackman", "radar", "launch monitor", "flightscope",
      "garmin", "mevo", "skytrak", "gc4", "gc3", "quadmax") ||
    inneholder(tags, "radar", "launch-monitor", "club-data", "spin-rate",
      "spin-aksen", "attack-angle", "face-angle", "face-to-path",
      "smash-factor", "carry", "total-distance", "offline", "shot-shape-data",
      "trajectory-data", "ball-speed", "club-speed")
  ) {
    krav.add("RADAR");
  }

  // ── MAT_NET ────────────────────────────────────────────────────────────────
  if (
    env.includes("STUDIO") ||
    env.includes("HJEM") ||
    inneholder(utstyr, "matte", "net", "nett", "mat", "impact-screen",
      "hitting mat", "net return") ||
    inneholder(tags, "hjemme", "stue", "garasje", "inne", "indoor",
      "mat-drill", "impact-tape")
  ) {
    krav.add("MAT_NET");
  }

  // ── BUNKER ─────────────────────────────────────────────────────────────────
  if (
    (skill === "AROUND_GREEN" || skill === "TILNAERMING") &&
    (inneholder(tags, "bunker", "sand", "greenside-bunker", "fairway-bunker",
      "plugged", "fried-egg", "wet-sand", "firm-sand", "uphill-lie") ||
      inneholder(utstyr, "bunker"))
  ) {
    krav.add("BUNKER");
  }

  // ── KAMERA ─────────────────────────────────────────────────────────────────
  if (
    inneholder(utstyr, "kamera", "camera", "video", "iphone", "stativ",
      "tripod", "phone", "filming") ||
    inneholder(tags, "video-feedback", "kamera", "filming", "opptak",
      "self-check", "face-on", "down-the-line", "impact-zone-video",
      "swing-video")
  ) {
    krav.add("KAMERA");
  }

  // ── PUTTING_GREEN (KORT og LANG) ───────────────────────────────────────────
  if (skill === "PUTTING") {
    krav.add("PUTTING_GREEN_KORT"); // alle putting-drills trenger green

    // Lag-putt / lange drills trenger større green
    if (
      inneholder(tags, "lag-putt", "5m+", "10m+", "15m", "20m", "25m",
        "30m", "1-300ft", "long-putt", "long putt", "distanse-kontroll",
        "distance-control") ||
      inneholder(utstyr, "lang putting", "long putting")
    ) {
      krav.add("PUTTING_GREEN_LANG");
    }
  }

  // ── SHORT_GAME_AREA ────────────────────────────────────────────────────────
  if (
    skill === "AROUND_GREEN" &&
    (inneholder(tags, "chip", "pitch", "lob", "from-rough", "bump-and-run",
      "scenario", "tucked-pin", "wet", "flop", "nærspill") ||
      !krav.has("BUNKER")) // default for around-green uten bunker
  ) {
    krav.add("SHORT_GAME_AREA");
  }

  // ── DRIVING_RANGE ──────────────────────────────────────────────────────────
  if (env.includes("RANGE")) {
    krav.add("DRIVING_RANGE");
  }

  // ── BANE ───────────────────────────────────────────────────────────────────
  if (env.includes("BANE")) {
    krav.add("BANE");
  }

  // ── SIMULATOR ──────────────────────────────────────────────────────────────
  if (env.includes("SIMULATOR")) {
    krav.add("SIMULATOR");
  }

  // STUDIO = typisk simulator-bay med radar (allerede lagt til over)
  if (env.includes("STUDIO") && !krav.has("SIMULATOR")) {
    krav.add("RADAR");
    krav.add("MAT_NET");
  }

  return [...krav];
}

async function main() {
  const drills = await prisma.exerciseDefinition.findMany({
    select: {
      id: true,
      name: true,
      environment: true,
      utstyr: true,
      tags: true,
      skillArea: true,
    },
  });

  console.log(`Behandler ${drills.length} drills...`);

  const fordeling: Record<string, number> = {};
  let oppdatert = 0;
  let ingenKrav = 0;

  for (const drill of drills) {
    const krav = beregn({
      environment: drill.environment as string[],
      utstyr: drill.utstyr,
      tags: drill.tags,
      skillArea: drill.skillArea as string | null,
    });

    // Tell fordeling
    if (krav.length === 0) {
      ingenKrav++;
    } else {
      for (const k of krav) {
        fordeling[k] = (fordeling[k] ?? 0) + 1;
      }
    }

    await prisma.exerciseDefinition.update({
      where: { id: drill.id },
      data: { fasilitetKrav: krav as ("RADAR" | "MAT_NET" | "BUNKER" | "KAMERA" | "PUTTING_GREEN_KORT" | "PUTTING_GREEN_LANG" | "SHORT_GAME_AREA" | "DRIVING_RANGE" | "BANE" | "SIMULATOR")[] },
    });
    oppdatert++;
  }

  console.log(`\n✓ Oppdatert ${oppdatert} drills\n`);
  console.log(`Ingen fasilitetskrav (universelle drills): ${ingenKrav}`);
  console.log("\nFordeling per fasilitetKrav:");
  for (const [k, v] of Object.entries(fordeling).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k}: ${v}`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
