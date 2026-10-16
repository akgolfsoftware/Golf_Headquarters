/** Prøvefil for PH-23 Flytt time (/portal/meg/bookinger/reschedule/[id]), pakke 11. Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH23FlyttTime, type PH23FlyttTimeData } from "@/components/portal/precision/PH23FlyttTime";

export const sti = "/portal/meg/bookinger/reschedule/b1";
const skall = (n: React.ReactNode) => <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>{n}</PlayerHQSkall>;
const D: PH23FlyttTimeData = {
  bookingId: "b1", tjeneste: "Performance Pro", varighetMin: 90, sted: "Simulator 2", naaDag: "Fredag 9. oktober", naaKl: "16:00",
  coachNavn: "Anders Kristiansen", avbestillingTimer: 24,
  days: [["Man", "12.10"], ["Tir", "13.10"], ["Ons", "14.10"], ["Tor", "15.10"], ["Fre", "16.10"]],
  slots: { 0: ["15:00", "16:30"], 1: ["14:00", "17:30", "18:30"], 2: [], 3: ["15:30"], 4: ["14:00"] },
  slotDetails: { "0|15:00": { startIso: "2026-10-12T15:00:00", coachId: "c1", coachNavn: "Anders Kristiansen" } },
};

export const tilstander = {
  data: skall(<PH23FlyttTime data={D} tilbakeHref="/portal/booking/b1" />),
  tom: skall(<PH23FlyttTime data={{ ...D, days: [], slots: {}, slotDetails: {} }} tilbakeHref="/portal/booking/b1" />),
};
