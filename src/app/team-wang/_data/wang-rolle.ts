import type { UserRole } from "@/generated/prisma/client";

export type WangRolle = "Trener" | "Sportssjef";

/**
 * Rollen i /team-wang avgjøres av serveren, aldri av nettleseren.
 * Sportssjef = ADMIN (Anders). Alle andre med tilgang til flaten er Trener.
 * Administrasjon er bare for sportssjef (beslutninger 27.09.2026).
 */
export function wangRolleFor(bruker: { role: UserRole }): WangRolle {
  return bruker.role === "ADMIN" ? "Sportssjef" : "Trener";
}

export function kanSeWangAdministrasjon(rolle: WangRolle): boolean {
  return rolle === "Sportssjef";
}
