/** Statusside for lyd-samtykke via lenke (ugyldig, brukt, utløpt). AU-05 «Lenken virker ikke». */
import { AuthFlate, AuthOverskrift } from "./AuthFlate";

export function LydSamtykkeStatus({ tittel, tekst }: { tittel: string; tekst: string }) {
  return (
    <AuthFlate max={520}>
      <AuthOverskrift kicker="Samtykke" tittel={tittel} tekst={tekst} />
    </AuthFlate>
  );
}
