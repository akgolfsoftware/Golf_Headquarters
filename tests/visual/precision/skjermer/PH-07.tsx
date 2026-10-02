/** Prøvefil for PH-07 Etter økt. Syntetiske data, ingen ekte spillere. */
import { EtterOkt } from "@/components/portal/live/EtterOkt";
import Laster from "@/app/portal/(fullscreen)/live/[sessionId]/summary/loading";
import Feil from "@/app/portal/(fullscreen)/live/[sessionId]/summary/error";
import type { LiveV2Drill, LiveV2DrillLog, LiveV2Summary } from "@/components/portal/live/types";

export const sti = "/portal/live/syntetisk-okt/summary";

const drill = (o: Partial<LiveV2Drill> & { id: string; name: string }): LiveV2Drill => ({
  index: 1, description: null, durationMinutes: 10, actualDurationSec: null, plannedReps: 0,
  pyramide: "SLAG", lFase: null, notes: null, repType: null, repAntall: null, repMinutter: null, repSett: null, repReps: null,
  fysTreningstype: null, fysMuskelgruppe: null, fysSett: null, fysReps: null, fysVektKg: null, fysTempo: null, fysPauseSek: null,
  fysVarighetMin: null, fysIntensitetsSone: null, fysDistanseM: null, fysAktivitet: null, fysBevegelighetType: null, fysHoldSek: null, ...o,
});
const logg = (drillId: string, repsTotal: number, notes: string | null = null): LiveV2DrillLog => ({
  drillId, repsTotal, repsWithoutBall: 0, repsLowSpeed: 0, repsAutomatic: 0, repsHit: 0, successRate: 0, notes, loggedAt: "2026-09-26T12:00:00Z",
});
const okt = (o: Partial<LiveV2Summary>): LiveV2Summary => ({
  sessionId: "syntetisk-okt", title: "Innspill og nærspill", coachComment: null, focus: null, status: "COMPLETED",
  scheduledAtISO: "2026-09-26T12:30:00Z", endTimeISO: "2026-09-26T13:42:00Z", location: null, maalsetning: null,
  coachName: "Anders Kristiansen", publishedAtISO: null, completed: true, studentName: "Øyvind Rohjan", pyramide: "SLAG", drills: [], existingLogs: [],
  completedSummary: null, durationSec: 0, totalReps: 0, drillsCompleted: 0, pyramidSummary: { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 }, ...o,
} as LiveV2Summary);

const golf = okt({
  durationSec: 2612,
  drills: [
    drill({ id: "a", name: "Innspill ca. 100 m · Lengdekontroll", plannedReps: 60, actualDurationSec: 1080, durationMinutes: 20 }),
    drill({ id: "b", name: "Pitch · Landingspunkt med et veldig langt øvelsesnavn som må brytes over flere linjer", plannedReps: 40, actualDurationSec: 720, durationMinutes: 15 }),
    drill({ id: "c", name: "Putting 3–5 fot · Ballstart", plannedReps: 50, durationMinutes: 20 }),
  ],
  existingLogs: [logg("a", 58), logg("b", 40)],
  drillsCompleted: 2,
});
const fys = okt({
  title: "Styrke underkropp", pyramide: "FYS", durationSec: 1800,
  drills: [drill({ id: "f1", name: "Knebøy", pyramide: "FYS", fysSett: 3, durationMinutes: 15 }), drill({ id: "f2", name: "Markløft", pyramide: "FYS", fysSett: 3, durationMinutes: 15 })],
  existingLogs: [logg("f1", 24, "Styrke: 60 kg × 8 · 60 kg × 8 · 60 kg × 8"), logg("f2", 16, "Styrke: 80 kg × 8 · 80 kg × 8")],
});
const tom = okt({ drills: [drill({ id: "a", name: "Innspill", plannedReps: 40 })] });
const tapper = okt({ logSource: "tapper", totalReps: 172, durationSec: 0 } as Partial<LiveV2Summary>);
const neste = { tekst: "Tirsdag 29.09 kl. 15:00 · Putting og nærspill", href: "#" };

export const tilstander = {
  golf: <EtterOkt data={golf} nesteOkt={neste} />,
  lagret: <EtterOkt data={golf} nesteOkt={neste} vurdering={{ kvalitet: 4, rpe: 6, fokus: 7 }} lagretNotat="Lengdekontroll satt bedre på 50 m enn 100 m." />,
  fysisk: <EtterOkt data={fys} />,
  tom: <EtterOkt data={tom} />,
  slagtelling: <EtterOkt data={tapper} />,
  laster: <Laster />,
  feil: <Feil error={new Error("x")} reset={() => {}} />,
};
export const natt = Object.keys(tilstander);
