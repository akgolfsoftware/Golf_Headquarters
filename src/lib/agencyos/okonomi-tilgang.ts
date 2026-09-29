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
