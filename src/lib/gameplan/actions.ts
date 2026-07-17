"use server";

/**
 * Server actions for Gameplan interaktiv modus (B30/C7) — spillerens eget
 * sikte + malte soner per hull. Ett GameplanHull-sikte per (hull, spiller);
 * flere GameplanSone-rader per (hull, spiller). Autorisasjon: alt scopes til
 * requirePortalUser().id — en spiller kan aldri lese/endre en annen spillers
 * Gameplan-data for et hull.
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export type GameplanSoneData = {
  id: string;
  type: "bra" | "aldri";
  senterLat: number;
  senterLng: number;
  radiusMeter: number;
};

export type GameplanHullData = {
  sikte: { lat: number; lng: number; notat: string | null } | null;
  soner: GameplanSoneData[];
};

function tilSoneType(raw: string): "bra" | "aldri" {
  return raw === "aldri" ? "aldri" : "bra";
}

export async function hentGameplanForHull(holeId: string): Promise<GameplanHullData> {
  const me = await requirePortalUser();

  const [hull, soner] = await Promise.all([
    prisma.gameplanHull.findUnique({
      where: { holeId_userId: { holeId, userId: me.id } },
      select: { siktLat: true, siktLng: true, notat: true },
    }),
    prisma.gameplanSone.findMany({
      where: { holeId, userId: me.id },
      orderBy: { createdAt: "asc" },
      select: { id: true, type: true, senterLat: true, senterLng: true, radiusMeter: true },
    }),
  ]);

  return {
    sikte: hull ? { lat: hull.siktLat, lng: hull.siktLng, notat: hull.notat } : null,
    soner: soner.map((s) => ({
      id: s.id,
      type: tilSoneType(s.type),
      senterLat: s.senterLat,
      senterLng: s.senterLng,
      radiusMeter: s.radiusMeter,
    })),
  };
}

export async function lagreSikte(
  holeId: string,
  sikte: { lat: number; lng: number },
): Promise<{ ok: true }> {
  const me = await requirePortalUser();

  await prisma.gameplanHull.upsert({
    where: { holeId_userId: { holeId, userId: me.id } },
    create: { holeId, userId: me.id, siktLat: sikte.lat, siktLng: sikte.lng },
    update: { siktLat: sikte.lat, siktLng: sikte.lng },
  });

  revalidatePath("/portal/gameplan");
  return { ok: true };
}

export async function leggTilSone(
  holeId: string,
  sone: { type: "bra" | "aldri"; senterLat: number; senterLng: number; radiusMeter: number },
): Promise<{ ok: true; id: string }> {
  const me = await requirePortalUser();

  const rad = await prisma.gameplanSone.create({
    data: {
      holeId,
      userId: me.id,
      type: sone.type,
      senterLat: sone.senterLat,
      senterLng: sone.senterLng,
      radiusMeter: sone.radiusMeter,
    },
    select: { id: true },
  });

  revalidatePath("/portal/gameplan");
  return { ok: true, id: rad.id };
}

export type FjernSoneResult = { ok: true } | { ok: false; error: "unauthorized" | "not-found" };

export async function fjernSone(soneId: string): Promise<FjernSoneResult> {
  const me = await requirePortalUser();

  const rad = await prisma.gameplanSone.findUnique({ where: { id: soneId }, select: { userId: true } });
  if (!rad) return { ok: false, error: "not-found" };
  if (rad.userId !== me.id) return { ok: false, error: "unauthorized" };

  await prisma.gameplanSone.delete({ where: { id: soneId } });

  revalidatePath("/portal/gameplan");
  return { ok: true };
}

/** "Tøm soner" — sletter alle spillerens egne malte soner for hullet. */
export async function tomSonerForHull(holeId: string): Promise<{ ok: true }> {
  const me = await requirePortalUser();

  await prisma.gameplanSone.deleteMany({ where: { holeId, userId: me.id } });

  revalidatePath("/portal/gameplan");
  return { ok: true };
}
