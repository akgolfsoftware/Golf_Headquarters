/**
 * Klassifiserer gjenværende middelnavn-varianter (samme for-/etternavn, ulikt
 * fullnavn) for review-assistert sammenslåing. Skriver KUN rapport — ingen
 * DB-endring her (merge skjer via dedupe-player-names.ts --variants etter OK).
 *
 *   npx tsx scripts/review-name-variants.ts              # kun rapport
 *   npx tsx scripts/review-name-variants.ts --apply-high # slå sammen HIGH
 *   npx tsx scripts/review-name-variants.ts --apply-high --include-review
 *
 * Sikkerhetsnivå pr. gruppe:
 *   HIGH   — ett navn er delmengde/initial av et annet, fødselsår kompatibelt
 *            → trygt å slå sammen
 *   REVIEW — mellominitial uten fullt anker, eller manglende fødselsår
 *            → bør sees over manuelt
 *   KEEP   — ulike fulle mellomnavn eller ulikt fødselsår → trolig ulik person
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";
import { writeFileSync } from "node:fs";

loadEnv({ path: ".env.local" });
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

type P = {
  id: string;
  name: string;
  slug: string;
  birthYear: number | null;
  tier: string;
  _count: { entries: number };
};

function tokens(name: string): { first: string; last: string; mids: string[] } {
  const t = name
    .replace(/\([^)]*\)/g, " ")
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  return { first: t[0] ?? "", last: t[t.length - 1] ?? "", mids: t.slice(1, -1) };
}

/** Er a sitt mellomnavn delmengde/initial-kompatibelt med b sitt? */
function midCompatible(a: string[], b: string[]): boolean {
  if (a.length === 0 || b.length === 0) return true; // én mangler mellomnavn
  const [short, long] = a.length <= b.length ? [a, b] : [b, a];
  return short.every((s, i) => {
    const l = long[i] ?? "";
    return s === l || (s.length === 1 && l.startsWith(s)) || (l.length === 1 && s.startsWith(l));
  });
}

function classifyGroup(members: P[]): "HIGH" | "REVIEW" | "KEEP" {
  const years = new Set(members.map((m) => m.birthYear).filter((y): y is number => y != null));
  if (years.size > 1) return "KEEP"; // ulikt fødselsår = ulik person

  // alle par må være mid-kompatible for HIGH
  const toks = members.map((m) => tokens(m.name));
  let allCompatible = true;
  let anyFullAnchor = false;
  for (let i = 0; i < toks.length; i++) {
    for (let j = i + 1; j < toks.length; j++) {
      if (!midCompatible(toks[i].mids, toks[j].mids)) allCompatible = false;
    }
    if (toks[i].mids.some((m) => m.length > 1)) anyFullAnchor = true;
  }
  if (!allCompatible) return "KEEP";
  // kompatible + minst ett fullt mellomnavn som anker → HIGH; ellers REVIEW
  return anyFullAnchor ? "HIGH" : "REVIEW";
}

async function main() {
  const players = await prisma.publicPlayer.findMany({
    select: { id: true, name: true, slug: true, birthYear: true, tier: true, _count: { select: { entries: true } } },
  });

  const fl = (n: string) => {
    const { first, last } = tokens(n);
    return `${first}|${last}`;
  };
  const groups = new Map<string, P[]>();
  for (const p of players) {
    const k = fl(p.name);
    if (!k.includes("|") || k.startsWith("|") || k.endsWith("|")) continue;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(p);
  }

  const variant = [...groups.values()].filter(
    (g) => new Set(g.map((p) => p.name)).size > 1,
  );

  const buckets: Record<string, P[][]> = { HIGH: [], REVIEW: [], KEEP: [] };
  for (const g of variant) buckets[classifyGroup(g)].push(g);

  const lines: string[] = [];
  lines.push(`# Navnevarianter — review for sammenslåing\n`);
  lines.push(`Totalt ${variant.length} grupper. HIGH=${buckets.HIGH.length}, REVIEW=${buckets.REVIEW.length}, KEEP=${buckets.KEEP.length}.\n`);
  lines.push(`Mål velges automatisk: flest entries, så fyldigste navn. Bekreft, så kjører jeg de bekreftede.\n`);

  for (const level of ["HIGH", "REVIEW", "KEEP"] as const) {
    lines.push(`\n## ${level}${level === "HIGH" ? " — anbefalt sammenslåing" : level === "REVIEW" ? " — sjekk manuelt" : " — trolig ulike personer (behold)"}\n`);
    for (const g of buckets[level]) {
      const sorted = [...g].sort((a, b) => b._count.entries - a._count.entries || b.name.length - a.name.length);
      const target = sorted[0];
      lines.push(`- **${target.name}** (mål, ${target._count.entries}e${target.birthYear ? `, ${target.birthYear}` : ""})`);
      for (const s of sorted.slice(1)) {
        const arrow = level === "KEEP" ? "≠" : "←";
        lines.push(`    ${arrow} ${s.name} (${s._count.entries}e${s.birthYear ? `, ${s.birthYear}` : ""}) \`${s.slug}\``);
      }
    }
  }

  const out = "docs/turnering-navnevarianter-review.md";
  writeFileSync(out, lines.join("\n"));

  // Apply: slå sammen bekreftede grupper (HIGH, ev. + REVIEW)
  const APPLY_HIGH = process.argv.includes("--apply-high");
  const INCLUDE_REVIEW = process.argv.includes("--include-review");
  if (APPLY_HIGH) {
    const toMerge = [...buckets.HIGH, ...(INCLUDE_REVIEW ? buckets.REVIEW : [])];
    let mergedProfiles = 0;
    let movedEntries = 0;
    for (const g of toMerge) {
      const sorted = [...g].sort(
        (a, b) => b._count.entries - a._count.entries || b.name.length - a.name.length,
      );
      const target = sorted[0];
      const sources = sorted.slice(1);
      const targetTids = new Set(
        (
          await prisma.publicPlayerEntry.findMany({
            where: { playerId: target.id },
            select: { tournamentId: true },
          })
        ).map((e) => e.tournamentId),
      );
      // Kanonisk navn = fyldigst (flest tokens, så lengst), uten løse kommaer
      const bestName = [...g]
        .map((p) => p.name.replace(/\s*,\s*/g, " ").replace(/\s+/g, " ").trim())
        .sort((a, b) => b.split(" ").length - a.split(" ").length || b.length - a.length)[0];
      const fill: Record<string, unknown> = {};
      if (bestName && bestName !== target.name) fill.name = bestName;
      const donorYear = g.find((p) => p.birthYear != null)?.birthYear ?? null;
      if (target.birthYear == null && donorYear != null) fill.birthYear = donorYear;
      if (Object.keys(fill).length)
        await prisma.publicPlayer.update({ where: { id: target.id }, data: fill });

      for (const src of sources) {
        const srcEntries = await prisma.publicPlayerEntry.findMany({
          where: { playerId: src.id },
          select: { id: true, tournamentId: true },
        });
        for (const e of srcEntries) {
          if (targetTids.has(e.tournamentId)) {
            await prisma.publicPlayerEntry.delete({ where: { id: e.id } });
          } else {
            targetTids.add(e.tournamentId);
            movedEntries++;
            await prisma.publicPlayerEntry.update({
              where: { id: e.id },
              data: { playerId: target.id },
            });
          }
        }
        await prisma.publicPlayer.delete({ where: { id: src.id } });
        mergedProfiles++;
      }
    }
    console.log(`\n[APPLY] grupper: ${toMerge.length}, profiler fjernet: ${mergedProfiles}, entries flyttet: ${movedEntries}`);
  }
  console.log(`Grupper: ${variant.length} (HIGH ${buckets.HIGH.length} / REVIEW ${buckets.REVIEW.length} / KEEP ${buckets.KEEP.length})`);
  console.log(`Skrev review-fil: ${out}`);
  // kort konsoll-utdrag
  for (const level of ["HIGH", "REVIEW", "KEEP"] as const) {
    console.log(`\n--- ${level} (viser opptil 6) ---`);
    buckets[level].slice(0, 6).forEach((g) => {
      const s = [...g].sort((a, b) => b._count.entries - a._count.entries);
      console.log(`  ${s[0].name} (${s[0]._count.entries}e) ${level === "KEEP" ? "≠" : "←"} ${s.slice(1).map((x) => `${x.name}(${x._count.entries}e)`).join(", ")}`);
    });
  }
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
