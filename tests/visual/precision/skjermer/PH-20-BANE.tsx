/** Prøvefil for PH-20 Gameplan, banekart (/portal/gameplan/[baneId]). Syntetiske data. Mapbox-kartet er en plassholder. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH20Bane, type PH20BaneHull } from "@/components/portal/precision/PH20Bane";
import { PHIupFeil, PHIupLaster } from "@/components/portal/precision/PHIupTilstand";

export const sti = "/portal/gameplan/syn-fgk";

const LENGDE: Array<[number, number]> = [[4, 352], [3, 158], [5, 471], [4, 338], [4, 395], [3, 172], [4, 362], [5, 488], [4, 326], [4, 371], [3, 145], [4, 402], [5, 455], [4, 318], [3, 188], [4, 344], [4, 381], [5, 492]];
const hull: PH20BaneHull[] = LENGDE.map(([par, lengde], i) => ({ nr: i + 1, par, lengde, slag: [6, 0, 4, 2, 0, 1][i % 6] }));
const kart = <div style={{ background: "#7c9a6a" }} aria-label="Kartplassholder i prøven" />;
const skall = (n: React.ReactNode) => <PlayerHQSkall innboksHref="#" uleste={0}>{n}</PlayerHQSkall>;

export const tilstander = {
  data: skall(<PH20Bane baneId="syn-fgk" navn="Fredrikstad GK" parSum={72} hull={hull} kart={kart} />),
  utenKart: skall(<PH20Bane baneId="syn-fgk" navn="Fredrikstad GK" parSum={72} hull={hull} />),
  tom: skall(<PH20Bane baneId="syn-fgk" navn="Borregaard GK" parSum={0} hull={[]} />),
  laster: skall(<PHIupLaster tekst="Henter banen …" />),
  feil: skall(<PHIupFeil tittel="Banekartet kunne ikke hentes" tekst="Slagene og gameplanene dine er ikke endret. Prøv igjen." onProvIgjen={() => {}} />),
};
