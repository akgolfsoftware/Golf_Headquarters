/**
 * Data Golf-regelen uten serveravhengigheter (ren, testbar, trygg å importere
 * fra både server- og klientkode). Sidevakter og oppslag på innlogget bruker
 * ligger i `datagolf-tilgang.ts`.
 *
 * Beslutning (Anders 19.10.2026, bindende, strammer inn 09.10): lisensen er
 * personlig og ikke-kommersiell. Data Golf-tall (runder, SG, skill ratings,
 * prognoser, odds, DFS, PGA-sammenligning) vises bare for ADMIN (Anders). Ikke
 * for coacher (heller ikke WANG-/TN-trenere), aldri for spillere, aldri for
 * forelder, aldri uten innlogging. Å åpne for flere roller krever ny beslutning
 * fra Anders og en endring av lisensgrunnlaget.
 */

import type { UserRole } from "@/generated/prisma/client";

/** Rollene som ser Data Golf. Alt annet — også ukjente fremtidige roller — får nei. */
export const DATAGOLF_ROLLER: readonly UserRole[] = ["ADMIN"];

/** Ren regel: true bare for ADMIN. Uinnlogget (null) får nei. */
export function kanSeDataGolf(user: { role: UserRole } | null | undefined): boolean {
  if (!user) return false;
  return DATAGOLF_ROLLER.includes(user.role);
}

/**
 * Prisma-filter på `Tournament` som tar bort turneringer synket fra Data Golf
 * (`sourceOrigin = "DATAGOLF"`). Resultatene der (plassering, score, runder) er
 * Data Golf-tall. `sourceOrigin` kan være null, og `not` alene ville tatt bort
 * de radene også — derfor OR.
 */
export const UTEN_DATAGOLF_TURNERING = {
  OR: [{ sourceOrigin: null }, { sourceOrigin: { not: "DATAGOLF" } }],
};

/** Er turneringen synket fra Data Golf? */
export function erDataGolfTurnering(t: { sourceOrigin: string | null | undefined }): boolean {
  return t.sourceOrigin === "DATAGOLF";
}
