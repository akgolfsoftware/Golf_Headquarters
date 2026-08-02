#!/usr/bin/env tsx
/**
 * Læringslogg til masterbrain — leser ukas godkjente/avviste forslag fra
 * øvelses-motoren (CaddieDraft) og skriver en oppsummering til den lokale
 * masterbrain-klonen. LOKALT SCRIPT, ikke en cron-agent: masterbrain er en
 * git-klone på Anders' maskin, ikke noe Vercel-produksjonsappen kan nå.
 * Kjør denne manuelt (eller fra en fremtidig Claude Code-sesjon) etter en
 * ukes drift for å mate lærdommen tilbake til kunnskapskilden.
 *
 *   npx tsx scripts/laeringslogg-til-masterbrain.ts
 *
 * Sti til masterbrain overstyres med MASTERBRAIN_PATH (samme konvensjon som
 * sync-masterbrain.ts). Skriver KUN filen — commit/push i masterbrain gjøres
 * bevisst manuelt, siden dette er kunnskapsinnhold noen bør lese før det blir
 * en del av fasiten.
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

loadEnv({ path: ".env.local" });

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const MASTERBRAIN_PATH = process.env.MASTERBRAIN_PATH ?? resolve(__dirname, "..", "..", "masterbrain");
const DRILL_DRAFT_TOOL = "createDrillSuggestion";
const MEDIA_DRAFT_TOOL = "suggestDrillVideo";
const DAGER = 7;

type ToolInput = {
  name?: string;
  exerciseName?: string;
  pyramidArea?: string;
  kildeNavn?: string;
  kildeUrl?: string;
  begrunnelse?: string;
};

function ukeStart(d: Date): Date {
  const m = new Date(d);
  m.setHours(0, 0, 0, 0);
  m.setDate(m.getDate() - DAGER);
  return m;
}

async function main() {
  if (!existsSync(MASTERBRAIN_PATH)) {
    console.error(`Fant ikke masterbrain-klonen: ${MASTERBRAIN_PATH}`);
    console.error("Sett MASTERBRAIN_PATH hvis den ligger et annet sted.");
    process.exit(1);
  }

  const fra = ukeStart(new Date());
  const drafts = await prisma.caddieDraft.findMany({
    where: {
      toolName: { in: [DRILL_DRAFT_TOOL, MEDIA_DRAFT_TOOL] },
      status: { in: ["APPROVED", "REJECTED"] },
      resolvedAt: { gte: fra },
    },
    orderBy: { resolvedAt: "asc" },
  });

  const godkjent = drafts.filter((d) => d.status === "APPROVED");
  const avvist = drafts.filter((d) => d.status === "REJECTED");

  const rad = (d: (typeof drafts)[number]) => {
    const inp = (d.toolInput ?? {}) as ToolInput;
    const navn = inp.name ?? inp.exerciseName ?? "(uten navn)";
    const kilde = inp.kildeNavn ? ` — kilde: ${inp.kildeNavn}` : "";
    const omraade = inp.pyramidArea ? ` [${inp.pyramidArea}]` : "";
    return `- ${navn}${omraade}${kilde}`;
  };

  const stamp = fra.toISOString().slice(0, 10);
  const md: string[] = [];
  md.push(`# Læringslogg — uke fra ${stamp}`);
  md.push("");
  md.push(`Generert ${new Date().toISOString().slice(0, 16).replace("T", " ")} fra øvelses-motorens godkjenningskø (AK Golf HQ).`);
  md.push("");
  md.push(`**Godkjent:** ${godkjent.length}  ·  **Avvist:** ${avvist.length}`);
  md.push("");

  if (godkjent.length > 0) {
    md.push("## Godkjent denne uka");
    md.push("");
    for (const d of godkjent) md.push(rad(d));
    md.push("");
  }

  if (avvist.length > 0) {
    md.push("## Avvist denne uka");
    md.push("");
    for (const d of avvist) md.push(rad(d));
    md.push("");
  }

  if (drafts.length === 0) {
    md.push("Ingen forslag ble godkjent eller avvist denne uka.");
    md.push("");
  }

  const maalMappe = join(MASTERBRAIN_PATH, "knowledge", "laeringslogg");
  mkdirSync(maalMappe, { recursive: true });
  const maalFil = join(maalMappe, `uke-${stamp}.md`);
  writeFileSync(maalFil, md.join("\n"));

  console.log(`Skrevet: ${maalFil}`);
  console.log(`Godkjent: ${godkjent.length}  Avvist: ${avvist.length}`);
  console.log("\nNeste steg (manuelt, gjennomgå før commit):");
  console.log(`  cd ${MASTERBRAIN_PATH} && git add knowledge/laeringslogg && git commit -m "Læringslogg uke ${stamp}" && git push`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
