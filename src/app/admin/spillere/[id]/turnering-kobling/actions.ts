"use server";

/**
 * Koble PlayerHQ-bruker til PublicPlayer (turneringsidentitet).
 * Setter User.publicPlayerId og speiler eksisterende resultater.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { assertCoachTilgangTilSpiller } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { normalizePlayerName } from "@/lib/scrapers/player-resolve";
import { mirrorTournamentResultForLinkedUser } from "@/lib/turneringer/materialize-entry";

export type PublicPlayerSokTreff = {
  id: string;
  name: string;
  country: string;
  tier: string;
  birthYear: number | null;
  entriesCount: number;
  alreadyLinkedTo: string | null; // user name if taken
};

const SokSchema = z.object({
  spillerId: z.string().min(1),
  q: z.string().min(1).max(80),
});

const KobleSchema = z.object({
  spillerId: z.string().min(1),
  publicPlayerId: z.string().min(1),
});

/**
 * Søk i PublicPlayer på navn (contains). Returnerer inntil 20 treff.
 */
export async function sokPublicPlayers(
  spillerId: string,
  q: string,
): Promise<{ ok: true; treff: PublicPlayerSokTreff[] } | { ok: false; error: string }> {
  const actor = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const parsed = SokSchema.safeParse({ spillerId, q: q.trim() });
  if (!parsed.success) return { ok: false, error: "Ugyldig søk" };
  await assertCoachTilgangTilSpiller(actor, parsed.data.spillerId);

  const term = parsed.data.q;
  if (term.length < 2) return { ok: true, treff: [] };

  const rows = await prisma.publicPlayer.findMany({
    where: {
      isActive: true,
      name: { contains: term, mode: "insensitive" },
    },
    select: {
      id: true,
      name: true,
      country: true,
      tier: true,
      birthYear: true,
      _count: { select: { entries: true } },
      linkedUser: { select: { id: true, name: true } },
    },
    orderBy: { name: "asc" },
    take: 20,
  });

  return {
    ok: true,
    treff: rows.map((r) => ({
      id: r.id,
      name: r.name,
      country: r.country,
      tier: r.tier,
      birthYear: r.birthYear,
      entriesCount: r._count.entries,
      alreadyLinkedTo:
        r.linkedUser && r.linkedUser.id !== spillerId ? r.linkedUser.name : null,
    })),
  };
}

/**
 * Forslag: PublicPlayers med samme normaliserte navn som spilleren.
 */
export async function foreslaPublicPlayers(
  spillerId: string,
): Promise<{ ok: true; treff: PublicPlayerSokTreff[] } | { ok: false; error: string }> {
  const actor = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  await assertCoachTilgangTilSpiller(actor, spillerId);

  const spiller = await prisma.user.findUnique({
    where: { id: spillerId },
    select: { name: true },
  });
  if (!spiller) return { ok: false, error: "Spiller ikke funnet" };

  const norm = normalizePlayerName(spiller.name);
  if (!norm) return { ok: true, treff: [] };

  // Grovt filter på etternavn, så presis normalisering i JS
  const last =
    spiller.name.trim().split(/\s+/).filter(Boolean).pop() ?? spiller.name;
  const rough = await prisma.publicPlayer.findMany({
    where: {
      isActive: true,
      name: { contains: last, mode: "insensitive" },
    },
    select: {
      id: true,
      name: true,
      country: true,
      tier: true,
      birthYear: true,
      _count: { select: { entries: true } },
      linkedUser: { select: { id: true, name: true } },
    },
    take: 50,
  });

  const treff = rough
    .filter((p) => normalizePlayerName(p.name) === norm)
    .map((r) => ({
      id: r.id,
      name: r.name,
      country: r.country,
      tier: r.tier,
      birthYear: r.birthYear,
      entriesCount: r._count.entries,
      alreadyLinkedTo:
        r.linkedUser && r.linkedUser.id !== spillerId ? r.linkedUser.name : null,
    }));

  return { ok: true, treff };
}

/**
 * Sett User.publicPlayerId og speil eksisterende PublicPlayerEntry → profil.
 */
export async function koblePublicPlayer(
  spillerId: string,
  publicPlayerId: string,
): Promise<{ ok: true; mirrored: number } | { ok: false; error: string }> {
  const actor = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const parsed = KobleSchema.safeParse({ spillerId, publicPlayerId });
  if (!parsed.success) return { ok: false, error: "Ugyldig input" };
  await assertCoachTilgangTilSpiller(actor, parsed.data.spillerId);

  const [spiller, publicPlayer] = await Promise.all([
    prisma.user.findUnique({
      where: { id: parsed.data.spillerId },
      select: { id: true, publicPlayerId: true, role: true },
    }),
    prisma.publicPlayer.findUnique({
      where: { id: parsed.data.publicPlayerId },
      select: {
        id: true,
        name: true,
        linkedUser: { select: { id: true, name: true } },
      },
    }),
  ]);

  if (!spiller || spiller.role !== "PLAYER") {
    return { ok: false, error: "Spiller ikke funnet" };
  }
  if (!publicPlayer) {
    return { ok: false, error: "Turneringsspiller ikke funnet" };
  }
  if (
    publicPlayer.linkedUser &&
    publicPlayer.linkedUser.id !== parsed.data.spillerId
  ) {
    return {
      ok: false,
      error: `Allerede koblet til ${publicPlayer.linkedUser.name}. Løsne der først.`,
    };
  }

  await prisma.user.update({
    where: { id: parsed.data.spillerId },
    data: { publicPlayerId: parsed.data.publicPlayerId },
  });

  // Speil eksisterende resultater
  const entries = await prisma.publicPlayerEntry.findMany({
    where: { playerId: parsed.data.publicPlayerId },
    select: {
      tournamentId: true,
      position: true,
      scoreToPar: true,
      totalScore: true,
      status: true,
    },
  });

  let mirrored = 0;
  for (const e of entries) {
    if (e.position == null && e.scoreToPar == null && e.totalScore == null) {
      continue;
    }
    const r = await mirrorTournamentResultForLinkedUser(prisma, {
      tournamentId: e.tournamentId,
      publicPlayerId: parsed.data.publicPlayerId,
      position: e.position,
      scoreToPar: e.scoreToPar,
      totalScore: e.totalScore,
      publicEntryStatus: e.status,
    });
    if (r.mirrored) mirrored++;
  }

  await audit({
    actorId: actor.id,
    action: "PUBLIC_PLAYER_LINKED",
    target: `user:${parsed.data.spillerId}`,
    metadata: {
      publicPlayerId: parsed.data.publicPlayerId,
      publicPlayerName: publicPlayer.name,
      mirrored,
    },
  });

  revalidatePath(`/admin/spillere/${parsed.data.spillerId}`);
  revalidatePath(
    `/admin/spillere/${parsed.data.spillerId}/turnering-kobling`,
  );
  revalidatePath(`/admin/spillere/${parsed.data.spillerId}/analyse`);

  return { ok: true, mirrored };
}

/**
 * Fjern kobling (nullstill publicPlayerId). Historikk i TournamentResult beholdes.
 */
export async function fjernPublicPlayerKobling(
  spillerId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const actor = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  await assertCoachTilgangTilSpiller(actor, spillerId);

  const spiller = await prisma.user.findUnique({
    where: { id: spillerId },
    select: { id: true, publicPlayerId: true, role: true },
  });
  if (!spiller || spiller.role !== "PLAYER") {
    return { ok: false, error: "Spiller ikke funnet" };
  }

  await prisma.user.update({
    where: { id: spillerId },
    data: { publicPlayerId: null },
  });

  await audit({
    actorId: actor.id,
    action: "PUBLIC_PLAYER_UNLINKED",
    target: `user:${spillerId}`,
    metadata: { previousPublicPlayerId: spiller.publicPlayerId },
  });

  revalidatePath(`/admin/spillere/${spillerId}`);
  revalidatePath(`/admin/spillere/${spillerId}/turnering-kobling`);

  return { ok: true };
}
