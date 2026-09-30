/** Prøvefil for PH-RD-03 Live runde (slag) og PH-RD-04 putt. Syntetiske data. */
import { PH08RundeLive, type PH08Props, type UtkastSlag } from "@/components/portal/precision/PH08RundeLive";

export const sti = "/portal/runde/live";

const base: PH08Props = {
  tilstand: "data",
  bane: "Gamle Fredrikstad Golfklubb med et langt banenavn",
  hullNr: 7,
  antallHull: 18,
  par: 4,
  lengdeMeter: 342,
  spilte: [{ par: 4, slag: 5 }, { par: 3, slag: 3 }, { par: 5, slag: 6 }, { par: 4, slag: 4 }, { par: 4, slag: 5 }, { par: 3, slag: 2 }],
  feilKode: "FRAKOBLET · 11:20 · 38 SLAG LOKALT",
  onFerdigHull: () => {},
  onAvslutt: () => {},
  onTilbake: () => {},
};

const slag: UtkastSlag[] = [
  { id: "a", dist: 342, lie: "TEE", club: "Driver", pen: 0, putt: null },
  { id: "b", dist: 128, lie: "FAIRWAY", club: "8i", pen: 1, putt: null },
];
const putt: UtkastSlag[] = [
  ...slag,
  { id: "c", dist: 28, lie: "GREEN", club: "Putter", pen: 0, putt: { brk: "VENSTRE_HOYRE", hel: "MODERAT", res: "miss", fart: "Kort", miss: "Venstre" } },
];

const lys = (p: Partial<PH08Props>) => <PH08RundeLive {...base} tema="light" {...p} />;

export const natt = ["data", "tom", "laster", "feil", "putt"];
export const tilstander = {
  data: <PH08RundeLive {...base} utkast={slag} />,
  tom: <PH08RundeLive {...base} hullNr={1} spilte={[]} />,
  laster: <PH08RundeLive {...base} tilstand="laster" />,
  feil: <PH08RundeLive {...base} tilstand="feil" />,
  putt: <PH08RundeLive {...base} utkast={putt} />,
  "lys-data": lys({ utkast: slag }),
  "lys-tom": lys({ hullNr: 1, spilte: [] }),
  "lys-feil": lys({ tilstand: "feil" }),
};
