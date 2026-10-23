/**
 * WAGR-plass for en HQ-spiller, lest fra én kilde i Team Norway: `wagr_ref_players`
 * (samme tabell som Oversikt, Spillerliste, Ranking og Referanse). Koblingen går via
 * `users.publicPlayerId` → `public_players."wagrId"`. Modellen `WagrPlayerStrength` brukes bare
 * til sjanser i Turneringsplan, aldri til plassen som vises (planen tn-designloft §5.3, A3).
 *
 * Ingen tilgangskontroll her: kalleren har alt sjekket at betrakteren får se spilleren,
 * og sender transaksjonen når en delingslås holdes.
 */
import type { Prisma } from "@/generated/prisma/client";
import { tilWagrId } from "./tn-iup-oversikt-regler";

export type TnWagrPlass = { plass: number | null; dato: Date };
type WagrDb = Pick<Prisma.TransactionClient, "user" | "wagrRefPlayer">;

export async function hentWagrPlassForSpiller(db: WagrDb, spillerId: string): Promise<TnWagrPlass | null> {
  const u = await db.user.findUnique({ where: { id: spillerId }, select: { publicPlayer: { select: { wagrId: true } } } });
  const wagrId = tilWagrId(u?.publicPlayer?.wagrId);
  if (wagrId === null) return null;
  const rad = await db.wagrRefPlayer.findUnique({ where: { wagrPlayerId: wagrId }, select: { rank: true, wagrDate: true } });
  return rad ? { plass: rad.rank, dato: rad.wagrDate } : null;
}
