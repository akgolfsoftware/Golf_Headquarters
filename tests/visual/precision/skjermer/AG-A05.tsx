/** Prøvefil for AG-A05 Datakvalitet (Innboks-fane). Syntetiske data, ingen ekte spillere. */
import { Vis } from "./_innboks-data";

export const sti = "/admin/innboks";

export const tilstander = {
  data: <Vis filter="datakvalitet" />,
  tom: <Vis filter="datakvalitet" tom />,
  laster: <Vis filter="datakvalitet" tilstand="laster" />,
  feil: <Vis filter="datakvalitet" tilstand="feil" />,
};
