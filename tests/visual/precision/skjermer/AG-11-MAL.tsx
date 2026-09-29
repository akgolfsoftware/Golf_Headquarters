/** Prøvefil for AG-11-MAL Workbench · målsetninger. Syntetiske data. */
import { Feil, Laster, Vis } from "./AG-11";

export const sti = "/admin/workbench/p1";

export const tilstander = {
  data: <Vis niva="mal" side="mal" />,
  tom: <Vis tom niva="mal" side="mal" />,
  laster: <Laster />,
  feil: <Feil />,
};
