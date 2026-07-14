import "server-only";

/**
 * Forsvar-i-dybden for server-actions som tar `userId` som eksplisitt
 * parameter i stedet for å utlede den fra sesjonen selv (sikkerhetsgjennomgang
 * 2026-07-14 — samme bug-klasse som ble fikset i loadLiveSession: en
 * eksportert "use server"-funksjon kan POST-es direkte, utenom side-vakten).
 *
 * Tillater: brukeren ser sine egne data, ELLER en coach/admin med bekreftet
 * tilgang til spilleren ser spillerens data (matcher hvordan
 * /admin/spillere/[id]/analyse allerede bruker disse loaderne).
 */

import { getCurrentUser } from "./getCurrentUser";
import { harCoachTilgangTilSpiller } from "./coached";

export async function assertCanViewPlayerData(userId: string): Promise<void> {
  const viewer = await getCurrentUser();
  if (!viewer) throw new Error("Ikke innlogget");
  if (viewer.id === userId) return;
  const isCoachOrAdmin = viewer.role === "COACH" || viewer.role === "ADMIN";
  if (isCoachOrAdmin && (await harCoachTilgangTilSpiller(viewer, userId))) return;
  throw new Error("Ingen tilgang");
}
