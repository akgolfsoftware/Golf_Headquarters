/**
 * PlayerHQ · Live-økt — klient-snapshot for skjerm-overlevering.
 *
 * Live-økta er offline-først: faktiske reps + tid holdes klient-side under
 * den aktive økta. Når brukeren går til /summary leses dette snapshot-et fra
 * sessionStorage. Det persisteres IKKE til DB her (modellen
 * `trainingPlanSession` har ingen per-drill-faktisk-felt) — kun overlevering
 * mellom skjermer i samme nettleser-sesjon.
 */

export type LiveSnapshotDrill = {
  drillId: string;
  reps: number;
  elapsedSec: number;
  status: "done" | "active" | "queued";
};

export type LiveSnapshot = {
  sessionId: string;
  totalSec: number;
  videoCount: number;
  drills: LiveSnapshotDrill[];
};

export function liveSnapshotKey(sessionId: string): string {
  return `ak-live-snapshot:${sessionId}`;
}

export function writeLiveSnapshot(snap: LiveSnapshot): void {
  try {
    sessionStorage.setItem(liveSnapshotKey(snap.sessionId), JSON.stringify(snap));
  } catch {
    /* sessionStorage utilgjengelig — overlevering faller tilbake til plan */
  }
}
