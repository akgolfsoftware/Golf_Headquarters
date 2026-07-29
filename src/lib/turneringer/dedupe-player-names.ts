/**
 * Navnevask for PublicPlayer. KUN trygg formaterings-tier.
 *
 * Kalles fra:
 * - scripts/dedupe-player-names.ts (CLI)
 * - cron-agent `dedupe-player-names` (apply=true)
 *
 * Middelnavn-varianter merges IKKE — de rapporteres for manuell gjennomgang.
 */

import type { PrismaClient } from "@/generated/prisma/client";
import { normalizePlayerName } from "@/lib/scrapers/player-resolve";

/** Rent visningsnavn: fjern parentes-markører, kollaps mellomrom. */
export function cleanName(s: string): string {
  return s.replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
}

/** Første + siste navne-token (for å telle gjenværende fuzzy-grupper). */
export function firstLast(s: string): string {
  const t = cleanName(s).toLowerCase().split(/\s+/).filter(Boolean);
  return t.length >= 2 ? `${t[0]}|${t[t.length - 1]}` : t[0] ?? "";
}

export type DedupePlayerNamesResult = {
  apply: boolean;
  mergedGroups: number;
  mergedProfiles: number;
  movedEntries: number;
  droppedEntries: number;
  renamed: number;
  skippedConflict: number;
  fuzzyLeft: number;
  skippedNames: string[];
};

export async function runDedupePlayerNames(
  prisma: PrismaClient,
  opts: { apply?: boolean } = {},
): Promise<DedupePlayerNamesResult> {
  const APPLY = opts.apply === true;

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

    const years = new Set(
      group.map((p) => p.birthYear).filter((y): y is number => y != null),
    );
    const dgIds = new Set(
      group.map((p) => p.dataGolfId).filter((d): d is number => d != null),
    );
    if (years.size > 1 || dgIds.size > 1) {
      skipped.push(group[0].name);
      continue;
    }

    group.sort((a, b) => {
      if (b._count.entries !== a._count.entries)
        return b._count.entries - a._count.entries;
      const ln = cleanName(b.name).length - cleanName(a.name).length;
      if (ln !== 0) return ln;
      return (b.dataGolfId ? 1 : 0) - (a.dataGolfId ? 1 : 0);
    });
    const target = group[0];
    const sources = group.slice(1);

    const bestName = group
      .map((p) => cleanName(p.name))
      .sort((a, b) => b.length - a.length)[0];
    const fill = {
      name: bestName,
      birthYear:
        target.birthYear ??
        group.find((p) => p.birthYear != null)?.birthYear ??
        null,
      dataGolfId:
        target.dataGolfId ??
        group.find((p) => p.dataGolfId != null)?.dataGolfId ??
        null,
      ngfId: target.ngfId ?? group.find((p) => p.ngfId)?.ngfId ?? null,
      bio: target.bio ?? group.find((p) => p.bio)?.bio ?? null,
      photoUrl:
        target.photoUrl ?? group.find((p) => p.photoUrl)?.photoUrl ?? null,
      instagramHandle:
        target.instagramHandle ??
        group.find((p) => p.instagramHandle)?.instagramHandle ??
        null,
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
          if (APPLY)
            await prisma.publicPlayerEntry.delete({ where: { id: e.id } });
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
      // Flytt User.publicPlayerId fra kilde til mål før sletting (unik constraint).
      if (APPLY) {
        const srcUsers = await prisma.user.findMany({
          where: { publicPlayerId: src.id },
          select: { id: true },
        });
        const targetLinked = await prisma.user.findFirst({
          where: { publicPlayerId: target.id },
          select: { id: true },
        });
        for (const u of srcUsers) {
          if (targetLinked) {
            // Mål allerede koblet — løsne kilde-linken for å unngå unik-kollisjon
            await prisma.user.update({
              where: { id: u.id },
              data: { publicPlayerId: null },
            });
          } else {
            await prisma.user.update({
              where: { id: u.id },
              data: { publicPlayerId: target.id },
            });
          }
        }
        await prisma.publicPlayer.delete({ where: { id: src.id } });
      }
      mergedProfiles++;
    }
    if (APPLY) {
      await prisma.publicPlayer.update({
        where: { id: target.id },
        data: fill,
      });
    }
    mergedGroups++;
  }

  const dirty = await prisma.publicPlayer.findMany({
    where: { name: { contains: "(" } },
    select: { id: true, name: true },
  });
  let renamed = 0;
  for (const p of dirty) {
    const clean = cleanName(p.name);
    if (clean && clean !== p.name) {
      renamed++;
      if (APPLY)
        await prisma.publicPlayer.update({
          where: { id: p.id },
          data: { name: clean },
        });
    }
  }

  const remaining = await prisma.publicPlayer.findMany({
    select: { name: true },
  });
  const flGroups = new Map<string, Set<string>>();
  for (const p of remaining) {
    const k = firstLast(p.name);
    if (!k) continue;
    if (!flGroups.has(k)) flGroups.set(k, new Set());
    flGroups.get(k)!.add(normalizePlayerName(p.name));
  }
  const fuzzyLeft = [...flGroups.values()].filter((s) => s.size > 1).length;

  return {
    apply: APPLY,
    mergedGroups,
    mergedProfiles,
    movedEntries,
    droppedEntries,
    renamed,
    skippedConflict: skipped.length,
    fuzzyLeft,
    skippedNames: skipped.slice(0, 20),
  };
}
