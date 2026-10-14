/** Prøvefil for AG-13-U Live coachingøkt · uten samtykke. Syntetiske data. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AG13LiveOkt } from "@/components/admin/precision/AG13LiveOkt";
import type { LiveOktData } from "@/lib/agencyos/live-okt-data";

export const sti = "/admin/agencyos/live/s1";
export const natt = ["utenOpptak", "medOpptak"];

const base: LiveOktData = {
  id: "s1",
  kilde: "v2",
  tittel: "Wedge 50–90 m",
  spillerNavn: "Testspiller Én",
  coachNavn: "Test Coach",
  sted: "Range",
  miljo: "UTE",
  type: "Privattime",
  status: "PÅGÅR",
  startTime: "2026-09-29T13:00:00.000Z",
  varighetPlanlagtMin: 60,
  malsetning: "Avstandskontroll 50–90 m, treff innenfor 3 m.",
  opptak: null,
  driller: [
    { id: "d1", navn: "Oppvarming · korte wedger", varighetMin: 10, pyramide: "TEK", logget: true },
    { id: "d2", navn: "Avstandskontroll 60 m", varighetMin: 15, pyramide: "SLAG", logget: false },
  ],
  coachBrief: "",
  coachRating: null,
};

const Vis = (d: LiveOktData) => (
  <AdminRolleProvider erAdmin>
    <AgencyOSSkall navn="Test Coach" natt>
      <AG13LiveOkt data={d} />
    </AgencyOSSkall>
  </AdminRolleProvider>
);

export const tilstander = {
  utenOpptak: Vis(base),
  medOpptak: Vis({
    ...base,
    opptak: { status: "FERDIG", durationSec: 754, transcript: "Coach: Bra tempo på den siste …", coachAnalyse: "Jevnt over god avstandskontroll, litt kort på 90 m." },
    coachBrief: "Tenk rytme, ikke fart.",
    coachRating: 4,
  }),
};
