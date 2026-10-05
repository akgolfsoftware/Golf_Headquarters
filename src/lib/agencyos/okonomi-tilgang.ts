/**
 * AG-20 Økonomi er bare for head coach (ADMIN) — beslutninger.md
 * §ØKONOMI BARE FOR HEAD COACH, WEDGE GATE TELLER TREFF, ALLE STANDARDPLANER
 * FOR ALLE KATEGORIER (Anders 28.09.2026). Assistant coach ser verken
 * menypunktet (src/lib/agencyos/precision-ia.ts, AOS_MER.bareHeadCoach) eller
 * selve siden.
 */
import type { UserRole } from "@/generated/prisma/client";

export function harTilgangTilOkonomi(role: UserRole): boolean {
  return role === "ADMIN";
}

/**
 * Fjerner elementer merket `bareHeadCoach` for alle andre enn head coach.
 * Brukes av globalt søk (API-ruta) så Økonomi og Rapporter ikke vises som treff
 * for assistant coach.
 */
export function filtrerHeadCoachBare<T extends { bareHeadCoach?: true }>(
  elementer: readonly T[],
  role: UserRole,
): T[] {
  return harTilgangTilOkonomi(role) ? [...elementer] : elementer.filter((e) => !e.bareHeadCoach);
}
