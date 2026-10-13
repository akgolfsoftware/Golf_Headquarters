import { PH05LiveAktiv } from "@/components/portal/precision/PH05LiveAktiv";
import { PH06Slagteller } from "@/components/portal/precision/PH06Slagteller";
import { PH07Oktoppsummering } from "@/components/portal/precision/PH07Oktoppsummering";
import { SessionBrief } from "@/components/portal/live/SessionBrief";
import { PrecisionBriefStart } from "@/components/portal/live/PrecisionBriefStart";
import type { LiveAktivData, OktoppsummeringData, SlagtellerData } from "@/lib/portal-live/ph04-07-data";

const active: LiveAktivData = {
  sessionId: "syntetisk-live-20261012", eierUserId: "syntetisk-spiller", lagring: "workbench",
  title: "Putting og innspill", totalMinutes: 60, initialSeconds: 782,
  drills: [
    { id: "syntetisk-putt", code: "", name: "Putting – startlinje", club: "P", quantity: 30, unit: "putter", minutes: 20, axis: "slag", repsCompleted: 12, status: "active", param: "Velg startlinje. Registrer puttene når du har gjennomført dem." },
    { id: "syntetisk-innspill", code: "", name: "Innspill til valgt mål", club: "7I", quantity: 40, unit: "slag", minutes: 25, axis: "slag" },
    { id: "syntetisk-fys", code: "", name: "Styrke – knebøy", club: "", quantity: 24, unit: "reps", minutes: 15, axis: "fys", fys: { type: "styrke", sett: 3, reps: 8, vektKg: 40 } },
  ],
};
const tapper: SlagtellerData = {
  sessionId: "syntetisk-tapper-20261012", eierUserId: "syntetisk-spiller",
  title: active.title, activeDrill: active.drills[0], drillIndex: 0, totalDrills: 3,
  bagClubs: ["Dr", "7I", "PW", "54", "P"], selectedClub: "P", totalShotsGoal: 0,
  currentShots: 27, counts: [{ club: "P", count: 12 }, { club: "7I", count: 15 }],
};
const summary: OktoppsummeringData = {
  sessionId: active.sessionId, title: active.title, playerName: "Syntetisk spiller",
  dateStr: "12. oktober 2026", timeRangeStr: "", totalShots: 27,
  actualMinutes: 42, plannedMinutes: 60, completedDrillsCount: 2, totalDrillsCount: 3, dagsform: "",
  axes: [{ axis: "slag", actualMin: 32, plannedMin: 45 }, { axis: "fys", actualMin: 10, plannedMin: 15 }],
  drillRows: [
    { id: "putt", name: "Putting – startlinje", quantityText: "12 putter", timeText: "17 min", hitsText: "—" },
    { id: "innspill", name: "Innspill til valgt mål", quantityText: "15 slag", timeText: "15 min", hitsText: "—" },
  ],
};
export const tilstander = {
  brief: <SessionBrief title={active.title} durationMin={60} scheduledAtISO="2026-10-12T12:00:00Z" location="Treningsområdet" context="Dagens økt" drills={active.drills.map((d) => ({ id: d.id, name: d.name, meta: [d.quantity + " " + d.unit, d.minutes + " min"], notes: d.param }))} sections={[]} action={<PrecisionBriefStart action={async () => ({ ok: true, href: "/?t=active" })} />} odId="syntetisk-brief" />,
  active: <PH05LiveAktiv data={active} />,
  fys: <PH05LiveAktiv data={{ ...active, sessionId: "syntetisk-fys-20261012", currentDrillIndex: 2 }} />,
  tom: <PH05LiveAktiv data={{ ...active, sessionId: "syntetisk-tom", drills: [] }} />,
  tapper: <PH06Slagteller data={tapper} />,
  summary: <PH07Oktoppsummering data={summary} onSave={async () => ({ ok: true })} />,
  summary_feil: <PH07Oktoppsummering data={summary} onSave={async () => ({ ok: false, error: "Lagringen feilet. Teksten er beholdt." })} />,
};
export const natt = Object.keys(tilstander);
