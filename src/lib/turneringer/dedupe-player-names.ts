/**
 * Navnevask for ukoblede PublicPlayer-profiler uten kilde-ID-konflikt.
 * Kontokoblinger flyttes eller fjernes aldri av denne funksjonen.
 *
 * Kalles fra:
 * - scripts/dedupe-player-names.ts (CLI)
 * - cron-agent `dedupe-player-names` (apply=true)
 *
 * Middelnavn-varianter merges IKKE — de rapporteres for manuell gjennomgang.
 */

import type { Prisma, PrismaClient } from "@/generated/prisma/client";
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
  skippedLinkedGroups: number;
  skippedStableIdConflicts: number;
  skippedGroups: {
    playerIds: string[];
    reason: "ACCOUNT_LINKED" | "SOURCE_ID_CONFLICT" | "BIRTH_YEAR_CONFLICT";
  }[];
};

export async function runDedupePlayerNames(
  prisma: PrismaClient,
  opts: { apply?: boolean } = {},
): Promise<DedupePlayerNamesResult> {
  const APPLY = opts.apply === true;
  // Hele gjennomføringen rulles tilbake ved en samtidig identitetsendring.
  // Ingen halvferdig flytting skal kunne etterlate en konto uten kildeprofil.
  if (APPLY) {
    return prisma.$transaction(tx => dedupePlayerNames(tx, true), {
      isolationLevel: "Serializable",
      timeout: 60_000,
    });
  }
  return dedupePlayerNames(prisma, false);
}

async function dedupePlayerNames(
  prisma: Prisma.TransactionClient,
  APPLY: boolean,
): Promise<DedupePlayerNamesResult> {

  const players = await prisma.publicPlayer.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      birthYear: true,
      dataGolfId: true,
      ngfId: true,
      wagrId: true,
      linkedUser: { select: { id: true } },
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
  const skipped: DedupePlayerNamesResult["skippedGroups"] = [];
  const blockedIds = new Set<string>();

  for (const group of groups.values()) {
    if (group.length < 2) continue;

    const skip = (reason: DedupePlayerNamesResult["skippedGroups"][number]["reason"]) => {
      const playerIds = group.map(p => p.id);
      playerIds.forEach(id => blockedIds.add(id));
      skipped.push({ playerIds, reason });
    };
    if (group.some(p => p.linkedUser != null)) {
      skip("ACCOUNT_LINKED");
      continue;
    }

    const years = new Set(
      group.map((p) => p.birthYear).filter((y): y is number => y != null),
    );
    const dgIds = new Set(
      group.map((p) => p.dataGolfId).filter((d): d is number => d != null),
    );
    const ngfIds = new Set(group.map(p => p.ngfId).filter((id): id is string => id != null));
    const wagrIds = new Set(group.map(p => p.wagrId).filter((id): id is string => id != null));
    if (dgIds.size > 1 || ngfIds.size > 1 || wagrIds.size > 1) {
      skip("SOURCE_ID_CONFLICT");
      continue;
    }
    if (years.size > 1) {
      skip("BIRTH_YEAR_CONFLICT");
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
      wagrId: target.wagrId ?? group.find((p) => p.wagrId)?.wagrId ?? null,
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
      if (APPLY) {
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
    where: {
      name: { contains: "(" },
      linkedUser: null,
      id: { notIn: [...blockedIds] },
    },
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
    // Bakoverkompatibelt felt; konkrete avvik rapporteres uten personnavn.
    skippedNames: [],
    skippedLinkedGroups: skipped.filter(g => g.reason === "ACCOUNT_LINKED").length,
    skippedStableIdConflicts: skipped.filter(g => g.reason === "SOURCE_ID_CONFLICT").length,
    skippedGroups: skipped,
  };
}
