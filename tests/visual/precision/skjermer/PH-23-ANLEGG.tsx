/** Prøvefil for PH-23 Anlegg (pakke 11 og 12). Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH23Anlegg, type PH23AnleggData } from "@/components/portal/precision/PH23Anlegg";
import { PHBookingMeldingerLaster, PHBmFeilKort } from "@/components/portal/precision/PHBookingMeldingerLaster";

export const sti = "/portal/booking/anlegg/l1";

const DATA: PH23AnleggData = {
  navn: "Fredrikstad Golfklubb", adresse: "Torsnesveien 16, 1630 Gamle Fredrikstad",
  fasiliteter: [
    { id: "f1", navn: "Range 3", typeLabel: "Driving range (1. etg)", inne: false, beskrivelse: "20 utslagsplasser" },
    { id: "f2", navn: "Simulator 2", typeLabel: "Performance Studio", inne: true, beskrivelse: "TrackMan" },
    { id: "f3", navn: "Chippinggreen", typeLabel: "Nærspillsområde", inne: false, beskrivelse: "Med bunker" },
    { id: "f4", navn: "Puttegreen", typeLabel: "Putting green", inne: false, beskrivelse: null },
  ],
};

const Vis = ({ children }: { children: React.ReactNode }) => <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>{children}</PlayerHQSkall>;

export const tilstander = {
  data: <Vis><PH23Anlegg data={DATA} /></Vis>,
  tom: <Vis><PH23Anlegg data={{ ...DATA, adresse: null, fasiliteter: [] }} /></Vis>,
  laster: <Vis><PHBookingMeldingerLaster variant="anlegg" /></Vis>,
  feil: <Vis><PHBmFeilKort variant="anlegg" /></Vis>,
};
