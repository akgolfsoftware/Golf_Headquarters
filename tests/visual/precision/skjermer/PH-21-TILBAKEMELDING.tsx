/** Prøvefil for PH-21 Tilbakemelding (pakke 11 og 12). Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH21Tilbakemelding } from "@/components/portal/precision/PH21Tilbakemelding";
import { PHBookingMeldingerLaster, PHBmFeilKort } from "@/components/portal/precision/PHBookingMeldingerLaster";
import type { CoachTilbakemeldingData } from "@/lib/portal-okt/coach-tilbakemelding-data";

export const sti = "/portal/coach/tilbakemelding/o1";

const DATA: CoachTilbakemeldingData = {
  found: true, oktId: "o1", sub: "Svingtrening P6.0–P7.0 · 2. oktober · Simulator 2", tilstand: "skrevet",
  coach: { navn: "Anders Kristiansen", fornavn: "Anders", initialer: "AK" },
  kildeMeta: "Skrevet 2. oktober 18:40 · 75 min økt",
  prosa: ["Bra økt. Ballstarten ble bedre utover, og du holdt farten nede som avtalt.", "Neste uke jobber vi videre med P6.0 på 75 % av Club Speed."],
  punkter: ["Hold køllen parallell lenger i P6.0. Bruk øvelsen med pinne langs skaftet.", "Club Path gikk fra −4,1 til −1,8 grader i løpet av økta.", "Bli på 75 % av Club Speed til bevegelsen sitter."],
  klipp: [{ id: "k1", url: "https://example.invalid/klipp.mp4", label: "Ditt klipp fra økta", meta: "2. oktober 17:12" }],
  dittSvar: null, kvittert: false, kanSvare: true,
};

const Vis = ({ children }: { children: React.ReactNode }) => <PlayerHQSkall innboksHref="/portal/varsler" uleste={1}>{children}</PlayerHQSkall>;

export const tilstander = {
  data: <Vis><PH21Tilbakemelding data={DATA} /></Vis>,
  kvittert: <Vis><PH21Tilbakemelding data={{ ...DATA, kvittert: true, punkter: [], klipp: [], dittSvar: { tekst: "Kjente at 75 % var uvant, men traff bedre.", sendt: "Sendt 2. oktober 20:10" } }} /></Vis>,
  tom: <Vis><PH21Tilbakemelding data={{ ...DATA, tilstand: "venter", prosa: [], punkter: [], klipp: [] }} /></Vis>,
  fantIkke: <Vis><PH21Tilbakemelding data={{ found: false }} /></Vis>,
  laster: <Vis><PHBookingMeldingerLaster variant="tilbakemelding" /></Vis>,
  feil: <Vis><PHBmFeilKort variant="tilbakemelding" /></Vis>,
};
