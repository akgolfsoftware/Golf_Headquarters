/**
 * Navnevask for PublicPlayer. Idempotent. DRY-RUN som default.
 *
 *   npx tsx scripts/dedupe-player-names.ts          # rapport
 *   npx tsx scripts/dedupe-player-names.ts --apply  # utfør
 *
 * KUN trygg tier: slår sammen profiler som blir IDENTISKE etter at
 * parentes-markører ("(am)", "(a)" osv.), æøå og tegnsetting er fjernet
 * — dvs. rene formaterings-/import-varianter av samme person.
 *
 * Middelnavn-varianter ("Herman Wibe Sekne" vs "Herman Sekne",
 * "Kristian K." vs "Kristian Krogh") er genuint tvetydige og merges IKKE
 * automatisk — de rapporteres for manuell gjennomgang.
 *
 * Guard: ulikt ikke-null fødselsår eller ulik dataGolfId → hopp over (ulik person).
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";
import { normalizePlayerName } from "../src/lib/scrapers/player-resolve";

loadEnv({ path: ".env.local" });
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const APPLY = process.argv.includes("--apply");

/** Rent visningsnavn: fjern parentes-markører, kollaps mellomrom. */
function cleanName(s: string): string {
  return s.replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
}
/** Første + siste navne-token (for å telle gjenværende fuzzy-grupper). */
function firstLast(s: string): string {
  const t = cleanName(s).toLowerCase().split(/\s+/).filter(Boolean);
  return t.length >= 2 ? `${t[0]}|${t[t.length - 1]}` : t[0] ?? "";
}

async function main() {
  console.log(`=== dedupe-player-names ${APPLY ? "(APPLY)" : "(DRY-RUN)"} ===`);
  const players = await prisma.publicPlayer.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      birthYear: true,
      dataGolfId: true,
      ngfId: true,
      bio: true,
      photoUrl: true,
      instagramHandle: true,
      tier: true,
      _count: { select: { entries: true } },
    },
  });

  // Tier 1: grupper på normalisert (markør-strippet) navn
  const groups = new Map<string, typeof players>();
  for (const p of players) {
    const k = normalizePlayerName(p.name);
    if (!k) continue;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(p);
  }

  let mergedGroups = 0;
  let mergedProfiles = 0;
  let movedEntries = 0;
  let droppedEntries = 0;
  const skipped: string[] = [];

  for (const group of groups.values()) {
    if (group.length < 2) continue;

    // Guard: konflikt i fødselsår eller dataGolfId → ulik person
    const years = new Set(group.map((p) => p.birthYear).filter((y): y is number => y != null));
    const dgIds = new Set(group.map((p) => p.dataGolfId).filter((d): d is number => d != null));
    if (years.size > 1 || dgIds.size > 1) {
      skipped.push(group[0].name);
      continue;
    }

    // Mål: flest entries, så lengst rent navn, så har dataGolfId
    group.sort((a, b) => {
      if (b._count.entries !== a._count.entries) return b._count.entries - a._count.entries;
      const ln = cleanName(b.name).length - cleanName(a.name).length;
      if (ln !== 0) return ln;
      return (b.dataGolfId ? 1 : 0) - (a.dataGolfId ? 1 : 0);
    });
    const target = group[0];
    const sources = group.slice(1);

    // Beste rene navn (lengst markør-fritt) som kanonisk visningsnavn
    const bestName = group
      .map((p) => cleanName(p.name))
      .sort((a, b) => b.length - a.length)[0];
    const fill = {
      name: bestName,
      birthYear: target.birthYear ?? group.find((p) => p.birthYear != null)?.birthYear ?? null,
      dataGolfId: target.dataGolfId ?? group.find((p) => p.dataGolfId != null)?.dataGolfId ?? null,
      ngfId: target.ngfId ?? group.find((p) => p.ngfId)?.ngfId ?? null,
      bio: target.bio ?? group.find((p) => p.bio)?.bio ?? null,
      photoUrl: target.photoUrl ?? group.find((p) => p.photoUrl)?.photoUrl ?? null,
      instagramHandle:
        target.instagramHandle ?? group.find((p) => p.instagramHandle)?.instagramHandle ?? null,
    };

    const targetTids = new Set(
      (
        await prisma.publicPlayerEntry.findMany({
          where: { playerId: target.id },
          select: { tournamentId: true },
        })
      ).map((e) => e.tournamentId),
    );

    for (const src of sources) {
      const srcEntries = await prisma.publicPlayerEntry.findMany({
        where: { playerId: src.id },
        select: { id: true, tournamentId: true },
      });
      for (const e of srcEntries) {
        if (targetTids.has(e.tournamentId)) {
          droppedEntries++;
          if (APPLY) await prisma.publicPlayerEntry.delete({ where: { id: e.id } });
        } else {
          targetTids.add(e.tournamentId);
          movedEntries++;
          if (APPLY)
            await prisma.publicPlayerEntry.update({
              where: { id: e.id },
              data: { playerId: target.id },
            });
        }
      }
      if (APPLY) await prisma.publicPlayer.delete({ where: { id: src.id } });
      mergedProfiles++;
    }
    // Oppdater kanonisk profil ETTER at kildene er slettet (unngår unik-konflikt
    // på dataGolfId når en kilde fortsatt holder samme verdi).
    if (APPLY) {
      await prisma.publicPlayer.update({ where: { id: target.id }, data: fill });
    }
    mergedGroups++;
  }

  console.log(`\n[Tier 1 — trygg formaterings-merge]`);
  console.log(`  grupper slått sammen : ${mergedGroups}`);
  console.log(`  profiler fjernet     : ${mergedProfiles}`);
  console.log(`  entries flyttet      : ${movedEntries}`);
  console.log(`  entries droppet (dup): ${droppedEntries}`);
  if (skipped.length)
    console.log(`  hoppet over (ulik fødselsår/dataGolfId): ${skipped.length} — ${skipped.slice(0, 5).join(", ")}`);

  // Fase C: rens parentes-markører fra gjenværende navn (singletons uten tvilling).
  // Trygt — endrer kun visningsnavn, ikke slug; tvillinger er allerede merget.
  const dirty = await prisma.publicPlayer.findMany({
    where: { name: { contains: "(" } },
    select: { id: true, name: true },
  });
  let renamed = 0;
  for (const p of dirty) {
    const clean = cleanName(p.name);
    if (clean && clean !== p.name) {
      renamed++;
      if (APPLY) await prisma.publicPlayer.update({ where: { id: p.id }, data: { name: clean } });
    }
  }
  console.log(`\n[Fase C — navnerens] markører fjernet fra visningsnavn: ${renamed}`);

  // Rapporter gjenværende fuzzy (samme første+siste, ulikt tight-navn = middelnavn-varianter)
  const remaining = await prisma.publicPlayer.findMany({ select: { name: true } });
  const flGroups = new Map<string, Set<string>>();
  for (const p of remaining) {
    const k = firstLast(p.name);
    if (!k) continue;
    if (!flGroups.has(k)) flGroups.set(k, new Set());
    flGroups.get(k)!.add(normalizePlayerName(p.name));
  }
  const fuzzyLeft = [...flGroups.values()].filter((s) => s.size > 1).length;
  console.log(`\n[Gjenstår til manuell review] middelnavn-varianter (samme fornavn+etternavn, ulikt fullnavn): ${fuzzyLeft}`);

  console.log(`\nFerdig.${APPLY ? "" : " Kjør med --apply for å utføre."}`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
