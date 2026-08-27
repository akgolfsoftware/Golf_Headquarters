/**
 * Stall · dag — ren aggregering for Loop 6 (C2, natt-plan bølge 2).
 *
 * Fasit: `A-10 Mac Stall dag.dc.html` (spillere som kolonner, én dag),
 * `WB-09 Gruppe og stall.dc.html`, `AG-04 Stall.dc.html`. Egen, enkel modell
 * — ingen kalender-lag (skole/TURN/test/booking hører til C3, Loop 7) og
 * ingen GROUP-propagering til medlemmer. Kun lesing + gruppering av
 * eksisterende `WorkbenchSession`-rader for én dag, per spiller.
 *
 * Ingen treningsregler her (kun vokabular-typer fra ./types).
 */

import type { BlockType, SessionStatus, WorkbenchSession } from "./types";

export interface StallDagOkt {
  id: string;
  tittel: string;
  status: SessionStatus;
  blockType: BlockType;
  startMinute: number;
  durationMinutes: number;
  /** status === "DRAFT" — kun synlig for coach, aldri for spilleren (CLAUDE.md invariant 3). */
  erUtkast: boolean;
}

export interface StallDagSpiller {
  id: string;
  navn: string;
  /** Sortert stigende på startMinute. */
  okter: StallDagOkt[];
}

export interface StallDagViewModel {
  dato: string;
  /** Sortert alfabetisk (nb) på navn. */
  spillere: StallDagSpiller[];
}

/**
 * Grupperer én dags økter per spiller. `spillere` er allerede tilgangs-
 * filtrert av kalleren (gjenbruker `loadStallen`s coach-scope) — denne
 * funksjonen forholder seg kun til hvilke økter som hører til hvem.
 */
export function buildStallDagViewModel(
  dato: string,
  spillere: { id: string; navn: string }[],
  okter: WorkbenchSession[],
): StallDagViewModel {
  const perSpiller = new Map<string, StallDagOkt[]>();
  for (const s of spillere) perSpiller.set(s.id, []);

  for (const o of okter) {
    const liste = perSpiller.get(o.playerId);
    if (!liste) continue; // Økt for spiller utenfor coachens scope — ignorer.
    liste.push({
      id: o.id,
      tittel: o.title,
      status: o.status,
      blockType: o.blockType,
      startMinute: o.startMinute,
      durationMinutes: o.durationMinutes,
      erUtkast: o.status === "DRAFT",
    });
  }

  const spillereMedOkter = spillere
    .slice()
    .sort((a, b) => a.navn.localeCompare(b.navn, "nb"))
    .map((s) => ({
      id: s.id,
      navn: s.navn,
      okter: (perSpiller.get(s.id) ?? []).slice().sort((a, b) => a.startMinute - b.startMinute),
    }));

  return { dato, spillere: spillereMedOkter };
}
