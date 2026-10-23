import "server-only";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { medAkProfiler } from "./ak-profil-lesing";

const idSchema = z.string().trim().min(1).max(200);
const avvist = () => new Error("Du har ikke tilgang til denne spilleren.");

/**
 * Tilleggsport for coachingforslag og allerede godkjente in-app-handlinger.
 * Deling er ikke godkjenning av en handling eller hjemmel for andre formål.
 * Ingen nettverkskall/ekte utsendinger i callbacken; bare samme DB-transaksjon.
 */
export async function medAkProfilHandling<T>(
  viewer: { id: string; role: string }, spillerId: unknown,
  handling: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  const parsed = idSchema.safeParse(spillerId);
  if (!parsed.success) throw avvist();
  const resultat = await medAkProfiler(viewer, async (tx, scope) => {
    if (!await tx.user.findFirst({ where: { AND: [scope, { id: parsed.data }] }, select: { id: true } })) throw avvist();
    return handling(tx);
  }, "handling");
  if (resultat === null) throw avvist();
  return resultat;
}
