/** Prøvefil for Tester › Egen test (pakke 13, Stats resten). Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH14EgenTest, type Skjema } from "@/components/portal/precision/PH14EgenTest";
import { TmLaster } from "@/components/portal/precision/PH17TmFelles";
import { SdFeil } from "@/components/portal/precision/PHStatsDybdeFelles";

export const sti = "/portal/tren/tester/ny/egen";

const fylt: Partial<Skjema> = {
  navn: "Bunker til 3 m", pyramide: "SLAG", beskrivelse: "10 bunkerslag fra greenside-bunkeren til et hull 12 m unna.",
  steg: ["Legg 10 baller i bunkeren, flat lie", "Slå én ball om gangen mot hullet", "Tell baller som stopper innenfor 3 m"],
  minutter: "15", utstyr: "Sandwedge, 10 baller", maaltall: { A: "8", B: "7", C: "6", D: "5", E: "4" },
};
const skall = (n: React.ReactNode) => <PlayerHQSkall innboksHref="/portal/varsler" uleste={2}>{n}</PlayerHQSkall>;
const p = { rolle: "PLAYER" as const, coachNavn: "Anders", gruppeNavn: "GFGK Junior Elite" };
export const tilstander = {
  data: skall(<PH14EgenTest {...p} startSkjema={{ navn: "Bunker til 3 m", pyramide: "SLAG" }} />),
  tom: skall(<PH14EgenTest {...p} />),
  steg2: skall(<PH14EgenTest {...p} startSteg={2} startSkjema={fylt} />),
  steg3: skall(<PH14EgenTest {...p} startSteg={3} startSkjema={fylt} />),
  steg4: skall(<PH14EgenTest {...p} startSteg={4} startSkjema={fylt} />),
  "steg4-coach": skall(<PH14EgenTest rolle="COACH" coachNavn={null} gruppeNavn={null} startSteg={4} startSkjema={fylt} />),
  steg5: skall(<PH14EgenTest {...p} startSteg={5} startSkjema={fylt} />),
  laster: skall(<TmLaster tekst="Lagrer testen" />),
  feil: skall(<SdFeil tittel="Testen kunne ikke lagres" tekst="Det du skrev, er beholdt. Prøv igjen om litt." reset={() => {}} />),
};
