/** Prøvefil for PH-RD-01 Registrer runde: velg nivå. Syntetiske data. */
import { PHRD01VelgNiva } from "@/components/portal/precision/PHRD01VelgNiva";
import Loading from "@/app/portal/mal/runder/ny/loading";
import { Natt } from "./_natt";

export const sti = "/portal/mal/runder/ny";
const kladd = { bane: "Fredrikstad GK", ferdige: 11, av: 18, dato: "20.09.2026" };

export const tilstander = {
  data: <PHRD01VelgNiva uleste={2} />,
  kladd: <PHRD01VelgNiva uleste={2} kladd={kladd} />,
  tom: <PHRD01VelgNiva tilstand="tom" />,
  laster: <Loading />,
  feil: <PHRD01VelgNiva tilstand="feil" />,
  nattData: <Natt><PHRD01VelgNiva uleste={2} kladd={kladd} /></Natt>,
  nattFeil: <Natt><PHRD01VelgNiva tilstand="feil" /></Natt>,
};
export const natt = ["nattData", "nattFeil"];
