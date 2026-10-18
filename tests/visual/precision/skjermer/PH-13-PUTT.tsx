/** Prøvefil for Puttelaboratoriet (pakke 13). Ingen data: skjermen er en modell. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH13Puttelab } from "@/components/portal/precision/PH13Puttelab";
import { TmLaster } from "@/components/portal/precision/PH17TmFelles";
import { SdFeil } from "@/components/portal/precision/PHStatsDybdeFelles";

export const sti = "/portal/trening/putte-laboratoriet";

const skall = (n: React.ReactNode) => <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>{n}</PlayerHQSkall>;
export const tilstander = {
  data: skall(<PH13Puttelab />),
  greenen: skall(<PH13Puttelab startFane="greenen" />),
  kontroll: skall(<PH13Puttelab startFane="kontroll" />),
  laster: skall(<TmLaster tekst="Laster laboratoriet" />),
  feil: skall(<SdFeil tittel="Laboratoriet kunne ikke lastes" tekst="Prøv igjen om litt." reset={() => {}} />),
};
