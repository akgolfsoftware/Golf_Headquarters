/**
 * Delte visuelle konstanter for Workbench-uka (Loop 2).
 *
 * Ingen nye tokens (CLAUDE.md invariant 2): alt peker på eksisterende
 * Paper-/v2-variabler. `WARM` er `--p-accent-fg` — den AA-trygge clay-tonen
 * (#B85C3D i lys, lysere i mørk) som bærer publisert/fullført-haken.
 */

import { T } from "@/lib/v2/tokens";
import type { PyramidArea, SessionStatus } from "@/lib/domain/workbench/types";

export const WARM = "var(--p-accent-fg)";

/** Statuser der spilleren ser økten. DRAFT er bevisst utenfor. */
export const SYNLIG_FOR_SPILLER: readonly SessionStatus[] = [
  "PUBLISHED",
  "IN_PROGRESS",
  "COMPLETED",
];

export function pyramideFarge(p: PyramidArea): string {
  return T.ax[p];
}

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
