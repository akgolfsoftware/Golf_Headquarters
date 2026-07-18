/**
 * AK Golf HQ — CSV-import av spillere til grupper.
 *
 * CSV-format (UTF-8, semikolon eller komma som skilletegn):
 *   email;name;phone;hcp;birthYear;homeClub;tier;group
 *
 * Eksempel-rad:
 *   markus.test@akgolf.no;Test Testesen;91234567;12.4;2010;GFGK;PRO;GFGK Junior Elite U19
 *
 * Bruk:
 *   npx tsx scripts/import-players.ts data/spillere.csv
 *
 * Idempotent: oppdaterer eksisterende User basert på email, oppretter ny hvis
 * ikke finnes. Bruker placeholder authId (pending-<slug>) — den ekte UUID-en
 * settes når spilleren først logger inn.
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

type Row = {
  email: string;
  name: string;
  phone: string | null;
  hcp: number | null;
  birthYear: number | null;
  homeClub: string | null;
  tier: "GRATIS" | "PRO";
  group: string | null;
};

const HEADERS = [
  "email",
  "name",
  "phone",
  "hcp",
  "birthYear",
  "homeClub",
  "tier",
  "group",
];

function detectDelimiter(firstLine: string): string {
  if (firstLine.includes(";")) return ";";
  if (firstLine.includes("\t")) return "\t";
  return ",";
}

function parseRow(line: string, delim: string): Row | null {
  const cells = line.split(delim).map((c) => c.trim());
  if (cells.length < 2) return null;
  const [email, name, phone, hcp, birthYear, homeClub, tier, group] = cells;
  if (!email || !name) return null;
  return {
    email: email.toLowerCase(),
    name,
    phone: phone || null,
    hcp: hcp ? parseFloat(hcp.replace(",", ".")) : null,
    birthYear: birthYear ? parseInt(birthYear, 10) : null,
    homeClub: homeClub || null,
    tier: (tier as "GRATIS" | "PRO") || "GRATIS",
    group: group || null,
  };
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[æ]/g, "ae")
    .replace(/[ø]/g, "oe")
    .replace(/[å]/g, "aa")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  const path = process.argv[2];
  if (!path) {
    console.error("Bruk: npx tsx scripts/import-players.ts <fil.csv>");
    process.exit(1);
  }
  const fullPath = resolve(path);
  const content = readFileSync(fullPath, "utf-8");
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    console.error("Tom CSV-fil.");
    process.exit(1);
  }

  const delim = detectDelimiter(lines[0]);
  console.log(`Skilletegn: "${delim}"`);

  // Sjekk om første linje er header
  const firstCells = lines[0].split(delim).map((c) => c.trim().toLowerCase());
  const hasHeader = HEADERS.some((h) => firstCells.includes(h.toLowerCase()));
  const dataLines = hasHeader ? lines.slice(1) : lines;
  console.log(`Forventer ${HEADERS.length} kolonner: ${HEADERS.join(", ")}`);
  console.log(`Header-rad: ${hasHeader ? "ja" : "nei"}`);
  console.log(`Data-rader: ${dataLines.length}\n`);

  // Hent alle grupper én gang
  const groups = await prisma.group.findMany();
  const groupByName = new Map(groups.map((g) => [g.name.toLowerCase(), g]));

  let opprettet = 0;
  let oppdatert = 0;
  let feilet = 0;

  for (const line of dataLines) {
    const row = parseRow(line, delim);
    if (!row) {
      console.warn(`  ! Ugyldig rad: ${line}`);
      feilet++;
      continue;
    }

    try {
      // Upsert user
      const existing = await prisma.user.findUnique({
        where: { email: row.email },
      });
      const playingYears =
        row.birthYear !== null ? new Date().getFullYear() - row.birthYear : null;

      const user = existing
        ? await prisma.user.update({
            where: { email: row.email },
            data: {
              name: row.name,
              phone: row.phone,
              hcp: row.hcp,
              playingYears,
              homeClub: row.homeClub,
              tier: row.tier,
              role: "PLAYER",
            },
          })
        : await prisma.user.create({
            data: {
              authId: `pending-${slugify(row.email)}`,
              email: row.email,
              name: row.name,
              phone: row.phone,
              hcp: row.hcp,
              playingYears,
              homeClub: row.homeClub,
              tier: row.tier,
              role: "PLAYER",
            },
          });
      if (existing) oppdatert++;
      else opprettet++;

      console.log(`  ${existing ? "·" : "+"} ${user.email} (${user.name})`);

      // Koble til gruppe hvis spesifisert
      if (row.group) {
        const group = groupByName.get(row.group.toLowerCase());
        if (!group) {
          console.warn(
            `    ! Gruppe ikke funnet: "${row.group}" — bruker er ikke koblet`,
          );
          continue;
        }
        const member = await prisma.groupMember.findUnique({
          where: {
            groupId_userId: { groupId: group.id, userId: user.id },
          },
        });
        if (!member) {
          await prisma.groupMember.create({
            data: { groupId: group.id, userId: user.id, role: "PLAYER" },
          });
          console.log(`    + medlem av ${group.name}`);
        } else {
          console.log(`    · allerede medlem av ${group.name}`);
        }
      }
    } catch (err) {
      console.error(`  ! Feilet for ${row.email}:`, err);
      feilet++;
    }
  }

  console.log(`\n[import] Ferdig.`);
  console.log(`  Opprettet:  ${opprettet}`);
  console.log(`  Oppdatert:  ${oppdatert}`);
  console.log(`  Feilet:     ${feilet}`);
}

main()
  .catch((err) => {
    console.error("[import] FEIL:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
