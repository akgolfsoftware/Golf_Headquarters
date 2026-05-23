/**
 * prisma/scripts/set-fasilitet-krav.ts
 *
 * Enrichment-script: setter fasilitetKrav på drills som har tom array.
 *
 * Logikk: regel-basert matching på environment[], utstyr[], tags[], name,
 * description, skillArea og pyramidArea. Eksisterende (ikke-tomme) verdier
 * overskrives ALDRI — scriptet legger kun til på drills med krav = '{}'.
 *
 * Kjør: npx tsx prisma/scripts/set-fasilitet-krav.ts
 */

import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" }),
});

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
  | "SIMULATOR"
  | "VEKTSTANG"
  | "TRAPBAR"
  | "LOPEBANE"
  | "MED_BALL";

type DrillRow = {
  id: string;
  name: string;
  description: string | null;
  skillArea: string | null;
  pyramidArea: string;
  environment: string[];
  utstyr: string[];
  tags: string[];
  fasilitetKrav: string[];
};

// ─── Regel-engine ─────────────────────────────────────────────────────────────

function bestemFasilitetKrav(drill: DrillRow): DrillFasilitet[] {
  const krav = new Set<DrillFasilitet>();

  const nameLower = drill.name.toLowerCase();
  const descLower = (drill.description ?? "").toLowerCase();
  const allText = `${nameLower} ${descLower}`;
  const utstyrLower = drill.utstyr.map((u) => u.toLowerCase());
  const tagsLower = drill.tags.map((t) => t.toLowerCase());
  const envSet = new Set(drill.environment);
  const utstyrTags = [...utstyrLower, ...tagsLower];

  // ── Simulator ──
  if (envSet.has("SIMULATOR") || utstyrTags.some((u) => u.includes("simulator"))) {
    krav.add("SIMULATOR");
  }

  // ── Range ──
  if (
    envSet.has("RANGE") ||
    utstyrTags.some((u) => u.includes("range")) ||
    (drill.skillArea === "TEE_TOTAL" && !envSet.has("HJEM") && !envSet.has("GYM"))
  ) {
    krav.add("DRIVING_RANGE");
  }

  // ── Bane ──
  if (envSet.has("BANE") || utstyrTags.some((u) => u.includes("bane"))) {
    krav.add("BANE");
  }

  // ── Bunker ──
  if (
    utstyrTags.some((u) => u.includes("bunker") || u.includes("sand")) ||
    allText.includes("bunker") ||
    allText.includes("sandslag") ||
    allText.includes("explosion shot")
  ) {
    krav.add("BUNKER");
    krav.add("SHORT_GAME_AREA");
  }

  // ── Radar / launch monitor ──
  // VIKTIG: sjekk "uten-radar" og "uten radar" FØR vi legger til RADAR.
  // Tags som "uten-radar" betyr eksplisitt at drillen IKKE trenger radar.
  const erUtenRadar =
    tagsLower.some((t) => t === "uten-radar" || t === "uten radar") ||
    allText.includes("uten radar") ||
    allText.includes("uten-radar");

  if (
    !erUtenRadar &&
    (utstyrTags.some(
      (u) =>
        (u === "trackman" ||
          u === "radar" ||
          u === "launch monitor" ||
          u === "flightscope" ||
          u === "garmin r10" ||
          u === "mevo+") &&
        !u.startsWith("uten"),
    ) ||
      allText.includes("launch monitor") ||
      (/\btrackman\b/i.test(allText) && !erUtenRadar))
  ) {
    krav.add("RADAR");
  }

  // ── Matte + nett ──
  if (
    utstyrTags.some((u) => u.includes("matte") || u.includes("nett") || u.includes("net")) ||
    envSet.has("STUDIO")
  ) {
    krav.add("MAT_NET");
  }

  // ── Kamera ──
  if (
    utstyrTags.some(
      (u) => u.includes("kamera") || u.includes("video") || u.includes("stativ"),
    )
  ) {
    krav.add("KAMERA");
  }

  // ── Medisinball ──
  if (utstyrTags.some((u) => u.includes("medisinball") || u.includes("med ball"))) {
    krav.add("MED_BALL");
  }

  // ── Vektstang ──
  if (
    utstyrTags.some(
      (u) =>
        u.includes("vektstang") ||
        u.includes("benkpress") ||
        u.includes("squat rack"),
    )
  ) {
    krav.add("VEKTSTANG");
  }

  // ── Trapbar ──
  if (utstyrTags.some((u) => u.includes("trapbar") || u.includes("hex bar"))) {
    krav.add("TRAPBAR");
  }

  // ── Løpebane ──
  if (
    utstyrTags.some(
      (u) =>
        u.includes("løpebane") ||
        u.includes("tredemølle") ||
        u.includes("friidrettsbane"),
    ) ||
    nameLower.includes("løp") ||
    nameLower.includes("aerob") ||
    nameLower.includes("kondisjon")
  ) {
    krav.add("LOPEBANE");
  }

  // ── Putting (skilArea-basert) ──
  if (drill.skillArea === "PUTTING") {
    const erLangPutt =
      allText.includes("lag-putt") ||
      allText.includes("lag putt") ||
      allText.includes("15m") ||
      allText.includes("20m") ||
      allText.includes("25m") ||
      allText.includes("30m") ||
      allText.includes("10m+") ||
      allText.includes("lang putt") ||
      allText.includes("langdistanse") ||
      tagsLower.some(
        (t) =>
          t.includes("lag-putt") ||
          t.includes("5m+") ||
          t.includes("lang"),
      );

    if (erLangPutt) {
      krav.add("PUTTING_GREEN_LANG");
    } else {
      krav.add("PUTTING_GREEN_KORT");
    }
  }

  // ── Short game / around green ──
  if (
    drill.skillArea === "AROUND_GREEN" ||
    allText.includes("chip") ||
    allText.includes("pitch") ||
    allText.includes("kortspill") ||
    allText.includes("nærspill") ||
    (nameLower.includes("lob") && !nameLower.includes("iron"))
  ) {
    if (!krav.has("BUNKER")) {
      krav.add("SHORT_GAME_AREA");
    }
  }

  // ── FYS-drills uten utstyr = ingen krav ──
  if (drill.pyramidArea === "FYS" && krav.size === 0) {
    // Bodyweight-drills kan gjøres overalt — forblir tom
    return [];
  }

  return Array.from(krav);
}

// ─── Hoved ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== fasilitetKrav Enrichment Script ===\n");

  // Hent kun drills med tom fasilitetKrav
  const drills = await prisma.$queryRaw<DrillRow[]>`
    SELECT id, name, description, "skillArea", "pyramidArea", environment, utstyr, tags, "fasilitetKrav"
    FROM exercise_definitions
    WHERE "fasilitetKrav" = '{}'
    ORDER BY name
  `;

  console.log(`Fant ${drills.length} drills med tom fasilitetKrav.\n`);

  let oppdatert = 0;
  let forblirTom = 0;

  for (const drill of drills) {
    const nyeKrav = bestemFasilitetKrav(drill);

    if (nyeKrav.length === 0) {
      forblirTom++;
      console.log(`  [TOM] ${drill.name} (${drill.pyramidArea}/${drill.skillArea ?? "–"})`);
    } else {
      await prisma.$executeRaw`
        UPDATE exercise_definitions
        SET "fasilitetKrav" = ${nyeKrav}::"DrillFasilitet"[]
        WHERE id = ${drill.id}
      `;
      oppdatert++;
      console.log(`  [OK]  ${drill.name} → ${nyeKrav.join(", ")}`);
    }
  }

  console.log(`\n=== Resultat ===`);
  console.log(`Oppdatert: ${oppdatert}`);
  console.log(`Forblir tom (ingen krav): ${forblirTom}`);
  console.log(`Totalt prosessert: ${drills.length}`);

  // Verifiser
  const totalTom = await prisma.exerciseDefinition.count({
    where: { fasilitetKrav: { equals: [] } },
  });
  console.log(`\nTotal tom fasilitetKrav i DB etter script: ${totalTom}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
