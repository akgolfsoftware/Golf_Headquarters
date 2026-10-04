import { PrecisionTilstand } from "@/components/system/precision-tilstand";

export type IkkeFunnetProps = {
  hjemHref?: string;
  knappTekst?: string;
  tittel?: string;
  beskrivelse?: string;
  sekundarKnappTekst?: string;
  sekundarHref?: string;
};

/** 404 i samme Precision-ramme som SY-01. Handlinger er uendret. */
export function IkkeFunnet({
  hjemHref = "/",
  knappTekst = "Til hjem",
  tittel = "Denne siden finnes ikke",
  beskrivelse = "Lenken kan være gammel, eller siden kan ha flyttet. Fant du den i en e-post fra oss, er den trolig utdatert.",
  sekundarKnappTekst = "Gå til I dag",
  sekundarHref = "/portal",
}: IkkeFunnetProps) {
  return (
    <PrecisionTilstand
      kicker="404"
      tittel={tittel}
      tekst={beskrivelse}
      kode="Feil 404"
      primar={{ label: sekundarKnappTekst, href: sekundarHref }}
      sekundar={{ label: knappTekst, href: hjemHref }}
    />
  );
}
