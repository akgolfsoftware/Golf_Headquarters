/** Prøvefil for PH-20 Gameplan, ett hull (/portal/gameplan/[baneId]/hull/[nr]). Syntetiske data. Mapbox og planleggeren er plassholdere. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH20Hull } from "@/components/portal/precision/PH20Hull";
import { PHIupFeil, PHIupLaster } from "@/components/portal/precision/PHIupTilstand";
import type { DispersionStats } from "@/lib/gameplan/dispersion";

export const sti = "/portal/gameplan/syn-fgk/hull/7";

const stats: DispersionStats = {
  n: 14, mean: { lateral: 6.2, distance: -4.1 }, std: { lateral: 11.4, distance: 9.8 },
  bias: { lateral: 6.2, side: "høyre", distance: -4.1, length: "kort" }, ellipse: null,
};
const kart = <div style={{ background: "#7c9a6a" }} aria-label="Kartplassholder i prøven" />;
const planlegger = <div style={{ height: 420, background: "#7c9a6a", borderRadius: 12 }} aria-label="Planlegger-plassholder i prøven" />;
const felles = { baneId: "syn-fgk", baneNavn: "Fredrikstad GK", nr: 7, par: 4, lengde: 362, nesteNr: 8 } as const;
const skall = (n: React.ReactNode) => <PlayerHQSkall innboksHref="#" uleste={0}>{n}</PlayerHQSkall>;

export const tilstander = {
  data: skall(<PH20Hull {...felles} segment="utslag" stats={stats} kart={kart} />),
  planlegg: skall(<PH20Hull {...felles} segment="planlegg" stats={stats} planlegger={planlegger} />),
  utenGeometri: skall(<PH20Hull {...felles} segment="planlegg" stats={null} />),
  tom: skall(<PH20Hull {...felles} segment="putt" stats={null} />),
  laster: skall(<PHIupLaster tekst="Henter hullet …" />),
  feil: skall(<PHIupFeil tittel="Hullet kunne ikke hentes" tekst="Slagene og gameplanene dine er ikke endret. Prøv igjen." onProvIgjen={() => {}} />),
};
