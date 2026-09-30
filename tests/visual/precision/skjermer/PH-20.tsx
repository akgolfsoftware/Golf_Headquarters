/** Prøvefil for PH-20 Gameplan og banekart. Syntetiske data, ingen ekte spillere. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH20Baner, PH20Bane, type PH20Hull, type PH20BaneKort } from "@/components/portal/precision/PH20Gameplan";
import { destinationPoint } from "@/lib/gameplan/dispersion";

export const sti = "/portal/gameplan";
export const natt = ["bane-natt"];

const tee = { lat: 59.2, lng: 10.9 };
const PAR = [4, 5, 3, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4, 4, 3, 4, 5, 4];
const LEN = [352, 468, 158, 341, 378, 172, 489, 362, 335, 372, 149, 501, 355, 388, 165, 344, 476, 359];
const slag = (klubb: string, m: number, side: number) => ({ klubb, landing: destinationPoint(destinationPoint(tee, 0, m), Math.PI / 2, side) });
const hull: PH20Hull[] = PAR.map((par, i) => {
  const green = destinationPoint(tee, 0, LEN[i]);
  const teeSlag = i === 3 || i === 0 ? [slag("Driver", 232, -6), slag("Driver", 240, 8), slag("Driver", 228, 3), slag("Driver", 236, -10), slag("3W", 205, 2), slag("3W", 210, -5), slag("3W", 198, 7), slag("4H", 176, 1)] : i === 1 ? [slag("Driver", 240, 4)] : [];
  return { nr: i + 1, par, meter: LEN[i], tee, green, teeSlag };
});
const baner: PH20BaneKort[] = [
  { id: "1", navn: "Gamle Fredrikstad Golfklubb med et langt navn som må brytes pent", klubb: "GFGK", hull: 18, par: 71, meter: 5_912, runder: 14, kartlagt: true },
  { id: "2", navn: "Onsøy Golfklubb", klubb: "Onsøy", hull: 18, par: 72, meter: 6_120, runder: 3, kartlagt: true },
  { id: "3", navn: "Borre Golfklubb", klubb: "Borre", hull: 0, par: null, meter: null, runder: 1, kartlagt: false },
];
const Skall = ({ children }: { children: React.ReactNode }) => <PlayerHQSkall innboksHref="#" uleste={0}>{children}</PlayerHQSkall>;
const bane = { id: "1", navn: "Gamle Fredrikstad Golfklubb", klubb: "GFGK" };
export const tilstander = {
  baner: <Skall><PH20Baner baner={baner} /></Skall>,
  bane: <Skall><PH20Bane bane={bane} hull={hull} planleggHref={() => "#"} /></Skall>,
  "bane-natt": <Skall><PH20Bane bane={bane} hull={hull} planleggHref={() => "#"} /></Skall>,
  "bane-tomt-hull": <Skall><PH20Bane bane={bane} hull={hull.slice(4)} planleggHref={() => "#"} /></Skall>,
  "bane-ikke-kartlagt": <Skall><PH20Bane bane={bane} hull={[]} planleggHref={() => "#"} /></Skall>,
  tom: <Skall><PH20Baner baner={[]} /></Skall>,
  feil: <Skall><PH20Baner baner={[]} feil feilKode="FEIL 502 · GOLFBOX" /></Skall>,
};
