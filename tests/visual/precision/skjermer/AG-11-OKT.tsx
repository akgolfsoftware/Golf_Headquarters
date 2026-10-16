/** Prøvefil for AG-11-OKT Workbench · økt og øvelsesbank. Syntetiske data. */
import { Feil, Laster, Vis } from "./AG-11";

export const sti = "/admin/workbench/p1";

export const tilstander = {
  data: <Vis niva="okt" valgtOktId="o2" />,
  tom: <Vis tom niva="okt" />,
  laster: <Laster />,
  feil: <Feil />,
};
