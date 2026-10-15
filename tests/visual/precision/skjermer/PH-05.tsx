/** Prøvefil for PH-05 Live aktiv i nytt design (pakke 2). Syntetiske data fra utkastet. */
import { PH05LiveAktiv } from "@/components/portal/precision/PH05LiveAktiv";
import type { DrillItem, LiveAktivData } from "@/lib/portal-live/ph04-07-data";

export const sti = "/portal/live/o1/active";

const D: DrillItem[] = [
  { id: "d1", code: "SLAG_INNSPILL_LAV_HAST", name: "Oppvarming · Halv swing fra 50 m", club: "PW", quantity: 10, unit: "slag", minutes: 10, axis: "slag", repsCompleted: 10 },
  { id: "d2", code: "SLAG_INNSPILL_AUTO", name: "Innspill 100–150 m · Lengdekontroll", club: "PW", quantity: 30, unit: "slag", minutes: 20, axis: "slag", repsCompleted: 12 },
  { id: "d3", code: "SLAG_INNSPILL_AUTO", name: "Innspill 50–100 m · Lengdekontroll", club: "54°", quantity: 40, unit: "slag", minutes: 20, axis: "slag" },
  { id: "d4", code: "SLAG_PUTTING_AUTO", name: "Putting 3–5 fot · Ballstart", club: "Putter", quantity: 50, unit: "putter", minutes: 10, axis: "slag" },
];
const data = (drills: DrillItem[]): LiveAktivData => ({ sessionId: "o1", title: "Innspill og nærspill", totalMinutes: 75, initialSeconds: 1021, drills, pauset: true, lagring: "workbench" });

export const tilstander = {
  data: <PH05LiveAktiv data={data(D)} />,
  tom: <PH05LiveAktiv data={data([])} />,
};
