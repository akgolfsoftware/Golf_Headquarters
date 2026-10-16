/** Prøvefil for PH-13 Øvelser fra coach (pakke 11 og 12). Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH13CoachOvelser, type PH13CoachOvelserData } from "@/components/portal/precision/PH13CoachOvelser";
import { PHBookingMeldingerLaster, PHBmFeilKort } from "@/components/portal/precision/PHBookingMeldingerLaster";

export const sti = "/portal/coach/ovelser";

const DATA: PH13CoachOvelserData = {
  coachFornavn: "Anders",
  ovelser: [
    { key: "e1", ovelseId: "e1", navn: "P6.0 med pinne langs skaftet", akse: "tek", info: ["30 reps", "20 min"], fra: "Fra Anders 2. okt.", iPlanen: true, bilde: null },
    { key: "e2", ovelseId: "e2", navn: "P6.0 til P7.0 på 75 %", akse: "tek", info: ["3 × 10", "25 min"], fra: "Fra Anders 2. okt.", iPlanen: true, bilde: null },
    { key: "e3", ovelseId: "e3", navn: "Innspill 100–150 m, stigen", akse: "slag", info: ["24 reps", "30 min"], fra: "Fra Anders 28. sep.", iPlanen: true, bilde: null },
    { key: "e4", ovelseId: "e4", navn: "Wedge til tre lengder", akse: "slag", info: ["25 min"], fra: "Fra Anders 21. sep.", iPlanen: false, bilde: null },
    { key: "t:ni hull", ovelseId: null, navn: "Ni hull med én ball, to køller", akse: "spill", info: ["75 min"], fra: "Fra Anders 14. sep.", iPlanen: false, bilde: null },
  ],
};

const Vis = ({ children }: { children: React.ReactNode }) => <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>{children}</PlayerHQSkall>;

export const tilstander = {
  data: <Vis><PH13CoachOvelser data={DATA} /></Vis>,
  tom: <Vis><PH13CoachOvelser data={{ coachFornavn: null, ovelser: [] }} /></Vis>,
  laster: <Vis><PHBookingMeldingerLaster variant="ovelser" /></Vis>,
  feil: <Vis><PHBmFeilKort variant="ovelser" /></Vis>,
};
