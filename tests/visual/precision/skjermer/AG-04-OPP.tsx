/** Prøvefil for AG-04-OPP Innboks · Oppfølging. Syntetiske data, ingen ekte spillere. */
import { Vis } from "./_innboks-data";

export const sti = "/admin/innboks";

export const tilstander = {
  data: <Vis filter="oppfolging" />,
  tom: <Vis filter="oppfolging" tom />,
  laster: <Vis filter="oppfolging" tilstand="laster" />,
  feil: <Vis filter="oppfolging" tilstand="feil" />,
};
