/** Prøvefil for Logg økt (pakke 13). Syntetiske data, lagring stubbet. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH17LoggOkt } from "@/components/portal/precision/PH17LoggOkt";
import { TmLaster } from "@/components/portal/precision/PH17TmFelles";
import { SdFeil } from "@/components/portal/precision/PHStatsDybdeFelles";

export const sti = "/portal/trening/logg";
const skall = (n: React.ReactNode) => <PlayerHQSkall innboksHref="/portal/varsler" uleste={2}>{n}</PlayerHQSkall>;
export const tilstander = {
  data: skall(<PH17LoggOkt iDag="2026-10-05" lagre={async () => true} />),
  laster: skall(<TmLaster tekst="Henter skjemaet" />),
  feil: skall(<SdFeil tittel="Logg økt kunne ikke åpnes" tekst="Ingenting er endret. Prøv igjen om litt." reset={() => {}} />),
};
