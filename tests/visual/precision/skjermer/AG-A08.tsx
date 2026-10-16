/** Prøvefil for AG-A08 Caddie-forslag (Innboks-fane). Syntetiske data, ingen ekte spillere. */
import { Vis } from "./_innboks-data";

export const sti = "/admin/innboks";

export const tilstander = {
  data: <Vis filter="caddie" />,
  tom: <Vis filter="caddie" tom />,
  laster: <Vis filter="caddie" tilstand="laster" />,
  feil: <Vis filter="caddie" tilstand="feil" />,
};
