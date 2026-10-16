/** Prøvefil for PH-23 Coach (pakke 11 og 12). Syntetiske data: mandag 5. oktober 2026. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH23Coach, type PH23CoachData } from "@/components/portal/precision/PH23Coach";
import { PHBookingMeldingerLaster, PHBmFeilKort } from "@/components/portal/precision/PHBookingMeldingerLaster";

export const sti = "/portal/booking/coach/c1";

const DATA: PH23CoachData = {
  coachId: "c1", navn: "Anders Kristiansen", initialer: "AK", timerSammen: 14, siden: "januar 2026",
  maanedNavn: "oktober", timerIMaaned: 2, klippIgjen: 1, nesteTime: "07.10", samtaler: 3,
  tjenester: [
    { id: "s1", navn: "Performance Pro", varighetMin: 90, beskrivelse: "TrackMan, video og skriftlig plan", pris: "1 klipp" },
    { id: "s2", navn: "Flex 50 min", varighetMin: 50, beskrivelse: "Ett tema. Betales ved booking", pris: "1 500 kr" },
    { id: "s3", navn: "Flex 20 min", varighetMin: 20, beskrivelse: null, pris: "600 kr" },
  ],
  avbestillingTimer: 24, kreverFull: false,
};

const Vis = ({ children }: { children: React.ReactNode }) => <PlayerHQSkall innboksHref="/portal/varsler" uleste={1}>{children}</PlayerHQSkall>;

export const tilstander = {
  data: <Vis><PH23Coach data={DATA} /></Vis>,
  tom: <Vis><PH23Coach data={{ ...DATA, timerSammen: 0, siden: null, timerIMaaned: 0, klippIgjen: null, nesteTime: null, samtaler: 0, tjenester: [] }} /></Vis>,
  gratis: <Vis><PH23Coach data={{ ...DATA, kreverFull: true, klippIgjen: null }} /></Vis>,
  laster: <Vis><PHBookingMeldingerLaster variant="coach" /></Vis>,
  feil: <Vis><PHBmFeilKort variant="coach" /></Vis>,
};
