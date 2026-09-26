import { notFound } from "next/navigation";

import { hentTnArbeidskontekst } from "@/lib/domain/tn-arbeidsflate";
import { TnFlate, TnFlatehode, TnMangler, TnRutenett, TnSkjermhode } from "../tn-flate";
import { SkjermRamme, hentSkjermbruker } from "./felles";

/**
 * TN-10 Lisens, helse og stipend.
 * Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), skjerm TN-10.
 *
 * Avvik:
 *   - Ingen av de fire områdene (antidoping, helseattest, stipend,
 *     kjøregodtgjørelse) har en datamodell i dag. Hver flate sier hva som
 *     mangler. Ingen eksempelbeløp, ingen uregistrerte frister, og ikke noe
 *     refusjonsskjema som ikke lagrer noe.
 */

const OMRADER = [
  { tittel: "Antidoping", tekst: "Status for Ren Utøver-kurset og signert egenerklæring er ikke registrert i AK Golf HQ. Kurset tas hos Antidoping Norge." },
  { tittel: "Helseattest", tekst: "Gyldighetsdato og godkjenning av helseattest er ikke registrert. Attesten må gjelde hele samlingsperioden." },
  { tittel: "Stipend og budsjett", tekst: "Stipendnivå, utstyrsstipend og samlingsbudsjett er ikke registrert. Beløp vises først når de kan leses fra en ekte kilde." },
  { tittel: "Kjøregodtgjørelse og refusjon", tekst: "Refusjoner for landslagsreiser kan ikke sendes inn herfra ennå. Bruk forbundets eget skjema inntil videre." },
] as const;

export async function TnLisensSkjerm() {
  const bruker = await hentSkjermbruker();
  const kontekst = await hentTnArbeidskontekst(bruker);
  if (!kontekst) notFound();

  return (
    <SkjermRamme aktiv="lisens" brukerNavn={bruker.name} kontekst={kontekst}>
      <TnSkjermhode rute="/team-norway/lisens-okonomi" tittel="Lisens, helse og stipend" ingress="Dokumentene som må være i orden før du kan stille, og pengene du har krav på." />
      <TnRutenett>
        {OMRADER.map((o) => (
          <TnFlate key={o.tittel}>
            <TnFlatehode tittel={o.tittel} merknad="Ikke registrert" />
            <TnMangler>{o.tekst}</TnMangler>
          </TnFlate>
        ))}
      </TnRutenett>
    </SkjermRamme>
  );
}
