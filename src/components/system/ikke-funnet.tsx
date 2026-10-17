import { PrecisionTilstand } from "@/components/system/precision-tilstand";

export type IkkeFunnetProps = {
  hjemHref?: string;
  knappTekst?: string;
  tittel?: string;
  beskrivelse?: string;
  sekundarKnappTekst?: string;
  sekundarHref?: string;
  /** Inni PlayerHQ- eller AgencyOS-skallet: ingen egen topplinje. */
  iSkall?: boolean;
};

/** SY-01 404 i nytt design (gfgk-system.html). Handlingene per flate er uendret. */
export function IkkeFunnet({
  hjemHref = "/",
  knappTekst = "Til forsiden",
  tittel = "Siden finnes ikke",
  beskrivelse = "Adressen kan være skrevet feil, eller siden er flyttet.",
  sekundarKnappTekst = "Til PlayerHQ",
  sekundarHref = "/portal",
  iSkall,
}: IkkeFunnetProps) {
  return (
    <PrecisionTilstand
      kicker="404"
      tittel={tittel}
      tekst={beskrivelse}
      hjelpeliste={["Sjekk adressen", "Gå til forsiden og finn veien derfra"]}
      primar={{ label: knappTekst, href: hjemHref }}
      sekundar={{ label: sekundarKnappTekst, href: sekundarHref }}
      toppLenke={iSkall ? undefined : { tekst: "Logg inn", href: "/auth/login" }}
      iSkall={iSkall}
    />
  );
}
