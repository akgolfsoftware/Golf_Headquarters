/** Prøvefil for PH-06 Slagteller i lyst tema (pakke 2). Syntetiske data. */
import { PH06Slagteller } from "@/components/portal/precision/PH06Slagteller";
import type { SlagtellerData } from "@/lib/portal-live/ph04-07-data";

export const sti = "/portal/live/o1/tapper";

const data: SlagtellerData = {
  sessionId: "o1", title: "Innspill og nærspill", drillIndex: 1, totalDrills: 5,
  activeDrill: { id: "d2", code: "SLAG_INNSPILL_AUTO", name: "Innspill 100–150 m · Lengdekontroll", club: "PW", quantity: 30, unit: "slag", minutes: 20, axis: "slag" },
  bagClubs: ["Driver", "7-jern", "PW", "54°", "58°", "Putter"], selectedClub: "PW", totalShotsGoal: 30, currentShots: 12,
  trackmanShot: { carry: 118.4, clubSpeed: 82.1, ballSpeed: 108.6, smashFactor: 1.32, launchAngle: 27.5, clubPath: -1.2 },
};

export const tilstander = {
  data: <PH06Slagteller data={data} />,
  utenTrackman: <PH06Slagteller data={{ ...data, trackmanShot: null, currentShots: 0 }} />,
};
