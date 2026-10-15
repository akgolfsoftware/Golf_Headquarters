/** Prøvefil for PH-25 Innstillinger i nytt design. Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH25Innstillinger } from "@/components/portal/precision/PH25Innstillinger";
import { PH24MegFeil, PH24MegLaster } from "@/components/portal/precision/PH24MegTilstand";

export const sti = "/portal/meg/innstillinger";

const slett = async () => ({ ok: true as const });
const Skall = ({ children }: { children: React.ReactNode }) => <PlayerHQSkall innboksHref="#" uleste={0}>{children}</PlayerHQSkall>;

export const tilstander = {
  data: <Skall><PH25Innstillinger slett={slett} data={{ helseLogg: true, varsler: { paa: 6, av: 8 }, deling: 2, spraak: "Norsk" }} /></Skall>,
  tom: <Skall><PH25Innstillinger slett={slett} data={{ helseLogg: false, varsler: { paa: 0, av: 8 }, deling: null, spraak: "Norsk", slettingSendt: true }} /></Skall>,
  laster: <Skall><PH24MegLaster /></Skall>,
  feil: <Skall><PH24MegFeil tittel="Innstillingene kunne ikke hentes" /></Skall>,
};
