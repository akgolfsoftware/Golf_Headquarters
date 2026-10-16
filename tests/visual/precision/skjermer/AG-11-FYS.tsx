/** Prøvefil for AG-11-FYS Workbench · sidefelt fysisk program. Syntetiske data. */
import { Feil, Laster, Vis } from "./AG-11";

export const sti = "/admin/workbench/p1";

export const tilstander = {
  data: <Vis side="fys" />,
  tom: <Vis tom side="fys" />,
  laster: <Laster />,
  feil: <Feil />,
};
