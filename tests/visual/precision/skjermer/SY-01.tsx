/** Prøvefil for SY-01 systemsidene (404, 500, vedlikehold, ikke tilgang, frakoblet). Ingen data. */
import { WifiOff } from "lucide-react";
import { PrecisionTilstand } from "@/components/system/precision-tilstand";
import { IkkeFunnet } from "@/components/system/ikke-funnet";

export const sti = "/finnes-ikke";

export const tilstander = {
  "404": <IkkeFunnet />,
  "404-i-skall": <IkkeFunnet iSkall hjemHref="/portal" knappTekst="Tilbake til hjem" sekundarKnappTekst="Logg inn på nytt" sekundarHref="/auth/login" />,
  "500": (
    <PrecisionTilstand
      kicker="500"
      tittel="Noe gikk galt hos oss"
      tekst="Siden kunne ikke vises. Det du lagret før, er ikke borte."
      kode="Referanse: 2481736512 · oppgi den hvis du kontakter post@akgolf.no"
      primarKnapp={{ label: "Prøv igjen", onClick: () => undefined }}
      sekundar={{ label: "Til forsiden", href: "/" }}
    />
  ),
  vedlikehold: (
    <PrecisionTilstand
      kicker="Vedlikehold"
      tittel="AK Golf HQ oppdateres"
      tekst="Vi gjør en planlagt oppdatering. Ingenting du har lagret, blir borte."
      linjer={[{ label: "Booking av coaching", verdi: "000 00 000" }, { label: "Spørsmål på e-post", verdi: "post@akgolf.no" }]}
      primar={{ label: "Ring 000 00 000", href: "tel:00000000" }}
      sekundar={{ label: "Sjekk på nytt", href: "/" }}
    />
  ),
  tilgang: (
    <PrecisionTilstand
      kicker="403"
      tittel="Du har ikke tilgang til denne siden"
      tekst="Du er logget inn som spiller. Siden er for en annen rolle."
      primar={{ label: "Til PlayerHQ", href: "/portal" }}
      barn={<form><button type="button" className="knapp sek">Logg inn med en annen konto</button></form>}
    />
  ),
  frakoblet: (
    <PrecisionTilstand
      kicker="Frakoblet"
      ikon={<span className="ikonboks" style={{ width: 64, height: 64, borderRadius: 16 }}><WifiOff className="ikon" style={{ width: 30, height: 30 }} aria-hidden="true" /></span>}
      tittel="Du er uten nett"
      tekst="Slag og økter du registrerer nå, lagres på telefonen og sendes når nettet er tilbake."
      primar={{ label: "Prøv igjen", href: "/offline" }}
      sekundar={{ label: "Fortsett økta", href: "/portal" }}
    />
  ),
};
