/** Prøvefil for AG-04-HASTER Innboks · sak som haster (bjella rust). Syntetiske data, ingen ekte spillere. */
import { Vis } from "./_innboks-data";

export const sti = "/admin/innboks";

export const tilstander = {
  data: <Vis haster />,
  tom: <Vis haster tom />,
  laster: <Vis haster tilstand="laster" />,
  feil: <Vis haster tilstand="feil" />,
};
