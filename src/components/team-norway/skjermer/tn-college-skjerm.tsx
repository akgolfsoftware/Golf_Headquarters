import { notFound } from "next/navigation";

import { innloggetKanSeDataGolf } from "@/lib/auth/datagolf-tilgang";
import { hentTnCollege, hentTnRangliste, hentTnSamlinger } from "@/lib/domain/tn-arbeidsflate";
import { hentSkjermbruker } from "./felles";
import { TnCollegeVisning } from "./tn-nettverk-visning";

/**
 * TN-06 College og USA. Visningen (retning «Skrå», tavle E2) ligger i tn-nettverk-visning.tsx.
 * Utkast 2, retning B (godkjent 16.10.2026): spillerrad med statusmarkør.
 * Fasit: docs/design-system/utkast-tn/spillere.html, skjerm College (pakke 3).
 *
 * Avvik:
 *   - Konferanse, klasse, WAGR og siste college-resultat er ikke registrert.
 *     Kortet viser skole og skoleår fra spillerprofilen, og brutto snitt fra
 *     registrerte starter.
 *   - Tilgjengelighet per samling og NCAA-kalenderen har ingen datamodell.
 *     Kommende samlinger vises, men hvem som kan stille, står ikke før det kan
 *     registreres.
 *   - Trener registrerer college, status og start per spiller (Anders 27.09.2026).
 *     Spillere med college i profilen står med profilens skole til de er registrert.
 */
export async function TnCollegeSkjerm() {
  const bruker = await hentSkjermbruker();
  const [data, samlingsdata] = await Promise.all([hentTnRangliste(bruker), hentTnSamlinger(bruker)]);
  if (!data) notFound();
  const [college, visDataGolf] = await Promise.all([hentTnCollege(bruker, data.kontekst), data.kontekst.erSpiller ? Promise.resolve(false) : innloggetKanSeDataGolf()]);
  return <TnCollegeVisning brukerNavn={bruker.name} visDataGolf={visDataGolf} data={data} college={college} samlinger={samlingsdata?.samlinger ?? []} naa={new Date()} />;
}
