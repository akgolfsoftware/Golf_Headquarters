/** Prøvefil for AG-04 Innboks. Syntetiske data, ingen ekte spillere. */
import { Vis } from "./_innboks-data";

export const sti = "/admin/innboks";

export const tilstander = {
  data: <Vis />,
  tom: <Vis tom />,
  laster: <Vis tilstand="laster" />,
  feil: <Vis tilstand="feil" />,
  godkjenn: <Vis filter="godkjenn" />,
  spillere: <Vis filter="spillere" />,
  epost: <Vis filter="epost" />,
  varsler: <Vis filter="varsler" />,
};
