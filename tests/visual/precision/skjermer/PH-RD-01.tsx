/** Prøvefil for PH-RD-01 Registrer runde: hvor mye vil du føre? (pakke 5). Syntetiske data. */
import { PHRD01VelgNiva } from "@/components/portal/precision/PHRD01VelgNiva";
import Loading from "@/app/portal/mal/runder/ny/loading";

export const sti = "/portal/mal/runder/ny";
const kladd = { bane: "Fredrikstad GK", ferdige: 6, av: 9, dato: "5. oktober kl. 14:18" };

export const tilstander = {
  data: <PHRD01VelgNiva uleste={2} />,
  kladd: <PHRD01VelgNiva uleste={2} kladd={kladd} />,
  tom: <PHRD01VelgNiva tilstand="tom" />,
  laster: <Loading />,
  feil: <PHRD01VelgNiva tilstand="feil" feilKode="TEST-1" />,
};
