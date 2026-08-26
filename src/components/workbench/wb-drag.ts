/**
 * Delt konvensjon for native HTML5 drag-and-drop av kilder → uke (B5).
 *
 * Bevisst native DnD (ikke dnd-kit): vi trenger kun fri slipp-posisjon på en
 * åpen flate, ikke sortering — `e.clientY` gir eksakt posisjon uten en egen
 * sensor-motor. Ingen touch-støtte, men kildepanelet er kun i AgencyOS
 * (coach, desktop).
 */

import type { DragEvent } from "react";

export const KILDE_DATA_TYPE = "application/x-ak-workbench-kilde";

export function settKildeDataTransfer(e: DragEvent, sourceId: string): void {
  e.dataTransfer.setData(KILDE_DATA_TYPE, sourceId);
  e.dataTransfer.setData("text/plain", sourceId);
  e.dataTransfer.effectAllowed = "copy";
}

export function lesKildeDataTransfer(e: DragEvent): string | null {
  const id = e.dataTransfer.getData(KILDE_DATA_TYPE) || e.dataTransfer.getData("text/plain");
  return id || null;
}
