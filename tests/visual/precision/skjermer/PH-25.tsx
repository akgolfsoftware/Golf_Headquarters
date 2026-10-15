/** Prøvefil for PH-25 Abonnement i nytt design. Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH25Abonnement, type PH25Data } from "@/components/portal/precision/PH25Abonnement";
import { PH24MegFeil, PH24MegLaster } from "@/components/portal/precision/PH24MegTilstand";

export const sti = "/portal/meg/abonnement";

const pakke: PH25Data = {
  niva: "Full", pakke: { navn: "Performance Pro", igjen: 2, totalt: 4 }, avsluttes: false, periodeSlutt: "1. november", kanAvsluttes: true,
  fakturaer: [
    { id: "f1", dato: "01.10.2026", gjelder: "Performance Pro · oktober", belop: 3990 },
    { id: "f2", dato: "01.09.2026", gjelder: "Performance Pro · september", belop: 3990 },
  ],
};
const betaler: PH25Data = { niva: "Full", pakke: null, avsluttes: false, periodeSlutt: "1. november", kanAvsluttes: true, fakturaer: [{ id: "f1", dato: "01.10.2026", gjelder: "Abonnement", belop: 299 }] };
const gratis: PH25Data = { niva: "Gratis", pakke: null, avsluttes: false, periodeSlutt: null, kanAvsluttes: false, fakturaer: [], fraLaast: true };
const avsluttes: PH25Data = { ...pakke, avsluttes: true };
const avslutt = async () => ({ ok: true });
const Skall = ({ children }: { children: React.ReactNode }) => <PlayerHQSkall innboksHref="#" uleste={0}>{children}</PlayerHQSkall>;

export const tilstander = {
  data: <Skall><PH25Abonnement data={pakke} avslutt={avslutt} /></Skall>,
  "betaler-selv": <Skall><PH25Abonnement data={betaler} avslutt={avslutt} /></Skall>,
  avsluttes: <Skall><PH25Abonnement data={avsluttes} avslutt={avslutt} /></Skall>,
  tom: <Skall><PH25Abonnement data={gratis} avslutt={avslutt} /></Skall>,
  laster: <Skall><PH24MegLaster /></Skall>,
  feil: <Skall><PH24MegFeil tittel="Abonnementet kunne ikke hentes" /></Skall>,
};
