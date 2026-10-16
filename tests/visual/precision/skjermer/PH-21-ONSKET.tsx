/** Prøvefil for PH-21 Ønsket økt sendt (pakke 11 og 12). Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH21OnsketBekreftet, type PH21OnsketData } from "@/components/portal/precision/PH21OnsketBekreftet";
import { PHBookingMeldingerLaster, PHBmFeilKort } from "@/components/portal/precision/PHBookingMeldingerLaster";

export const sti = "/portal/onskeligokt/bekreftet";

const DATA: PH21OnsketData = {
  coachNavn: "Anders Kristiansen", sendt: "i dag 14:20", naar: "tirsdag 13. oktober", tema: "Golfslag",
  hvorfor: "Bommer mye kort på 9-jern etter at vi la om i P6.0.", status: "PENDING", svar: null,
};

const Vis = ({ children }: { children: React.ReactNode }) => <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>{children}</PlayerHQSkall>;

export const tilstander = {
  data: <Vis><PH21OnsketBekreftet data={DATA} /></Vis>,
  godtatt: <Vis><PH21OnsketBekreftet data={{ ...DATA!, status: "APPROVED", svar: "Vi tar det på torsdag kl. 16." }} /></Vis>,
  utenCoach: <Vis><PH21OnsketBekreftet data={{ ...DATA!, coachNavn: null, naar: null, tema: null, hvorfor: null }} /></Vis>,
  tom: <Vis><PH21OnsketBekreftet data={null} /></Vis>,
  laster: <Vis><PHBookingMeldingerLaster variant="onsket" /></Vis>,
  feil: <Vis><PHBmFeilKort variant="onsket" /></Vis>,
};
