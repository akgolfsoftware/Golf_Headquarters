/**
 * Delte visuelle konstanter for Workbench-uka (D3, Train-lock).
 *
 * `WARM` peker nå på `--tl-warm` (#B85C3D) — Train-lock-fasitens ENESTE
 * varme farge: logo-prikk + fullført-hake/ring, aldri grønn (CLAUDE.md
 * invariant 2, D2-UNDERLAG §5.1).
 */

import type { SessionStatus } from "@/lib/domain/workbench/types";

export const WARM = "var(--tl-warm)";

/**
 * Train-lock fargekoder ALDRI data (HANDOFF §MAT, §Beslutninger: «Negative
 * tall: opacity 0.45, aldri rød. Flagg som caps-tekst, aldri fargeprikk.»).
 * Pyramide-området vises derfor kun som caps-tekst (PYRAMID_LABEL) — denne
 * funksjonen er bevisst fjernet fra bruk i WeekGrid/SessionInspector.
 */

/** Statuser der spilleren ser økten. DRAFT er bevisst utenfor. */
export const SYNLIG_FOR_SPILLER: readonly SessionStatus[] = [
  "PUBLISHED",
  "IN_PROGRESS",
  "COMPLETED",
];

/** Versal-merkelapp i økt-kortet og inspektøren. */
export const STATUS_CAPS: Record<SessionStatus, string> = {
  DRAFT: "UTKAST",
  SCHEDULED: "PLANLAGT",
  PUBLISHED: "PUBLISERT",
  IN_PROGRESS: "PÅGÅR",
  COMPLETED: "FULLFØRT",
  CANCELLED: "AVLYST",
  SKIPPED: "HOPPET OVER",
};

/** Warm hake på alt spilleren faktisk ser. */
export function harHake(status: SessionStatus): boolean {
  return SYNLIG_FOR_SPILLER.includes(status);
}
