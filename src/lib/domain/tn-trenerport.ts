/**
 * Team Norway er bare for trenere (Anders 21.10.2026, .claude/rules/beslutninger.md
 * §TEAM NORWAY ER BARE FOR TRENERE, SPILLERE BRUKER BARE PLAYERHQ): «Team Norway
 * er kun for coach. Alle spiller bruker kun PlayerHQ.»
 *
 * Ren regel uten databaseoppslag, så den kan låses med test. Brukes av
 * `src/app/team-norway/layout.tsx`, som alle TN-adresser går gjennom.
 */
import type { UserRole } from "@/generated/prisma/client";

/** Er gruppe-rollen i TN-gruppa en spillerrolle? ADMIN er aldri spiller her. */
export function erTnSpillerRolle(brukerRolle: UserRole, tnRolle: string | null): boolean {
  if (brukerRolle === "ADMIN") return false;
  return brukerRolle === "PLAYER" || tnRolle === "PLAYER";
}

/**
 * Hvor en innlogget bruker som ikke skal i trenerflaten sendes, eller `null`
 * når hen slipper inn. Andre som ikke er TN-trenere (f.eks. AK Golf-coacher)
 * slippes forbi her og stoppes av sidevakten som før.
 */
export function tnIkkeTrenerMaal(brukerRolle: UserRole, tnRolle: string | null): string | null {
  if (brukerRolle === "ADMIN") return null;
  if (brukerRolle === "PARENT") return "/forelder";
  if (erTnSpillerRolle(brukerRolle, tnRolle)) return "/portal";
  return null;
}
