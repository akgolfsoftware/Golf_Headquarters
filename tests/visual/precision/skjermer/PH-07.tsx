/** Prøvefil for PH-07 Etter økten i nytt design (pakke 2). Syntetiske data fra utkastet. */
import { PH07Oktoppsummering } from "@/components/portal/precision/PH07Oktoppsummering";
import type { OktoppsummeringData } from "@/lib/portal-live/ph04-07-data";

export const sti = "/portal/live/o1/summary";

const data: OktoppsummeringData = {
  sessionId: "o1", title: "Innspill og nærspill", playerName: "Testspiller", dateStr: "Mandag 5. oktober", timeRangeStr: "15:30–16:45",
  totalShots: 160, actualMinutes: 75, plannedMinutes: 75, completedDrillsCount: 4, totalDrillsCount: 5, dagsform: "4 · God",
  axes: [{ axis: "slag", actualMin: 75, plannedMin: 75 }],
  drillRows: [
    { id: "d1", name: "Oppvarming · Halv swing fra 50 m", quantityText: "10 slag", timeText: "10 min", hitsText: "—" },
    { id: "d2", name: "Innspill 100–150 m · Lengdekontroll", quantityText: "30 slag", timeText: "21 min", hitsText: "18 treff" },
    { id: "d3", name: "Putting 3–5 fot · Ballstart", quantityText: "50 putter", timeText: "10 min", hitsText: "—" },
  ],
};

export const tilstander = {
  data: <PH07Oktoppsummering data={data} onSave={async () => {}} />,
  workbench: <PH07Oktoppsummering data={data} />,
  vurdering: <PH07Oktoppsummering data={data} vurdering={{ type: "golf", belastning: null, fokus: null, onLagre: async () => ({ ok: true }) }} />,
  fysisk: <PH07Oktoppsummering data={{ ...data, title: "Styrke bein og kjerne", axes: [{ axis: "fys", actualMin: 45, plannedMin: 45 }] }} vurdering={{ type: "fys", belastning: 6, fokus: null, onLagre: async () => ({ ok: true }) }} />,
  tom: <PH07Oktoppsummering data={{ ...data, totalShots: 0, completedDrillsCount: 0, drillRows: [], dagsform: "" }} onSave={async () => {}} />,
};
