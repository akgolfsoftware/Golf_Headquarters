import { notFound } from "next/navigation";

import { innloggetKanSeDataGolf } from "@/lib/auth/datagolf-tilgang";
import { hentTnTrenere } from "@/lib/domain/tn-arbeidsflate";
import { hentSkjermbruker } from "./felles";
import { TnFagapparatVisning } from "./tn-nettverk-visning";

/**
 * TN-09 Fagapparat. Visningen (retning «Skrå», tavle E3) ligger i tn-nettverk-visning.tsx.
 * Fasit: docs/design-system/utkast-tn/plan-fag.html, skjerm Fagapparat (pakke 5).
 * Erstatter den gamle trenerkatalogen (/team-norway/apparatet sender hit).
 *
 * Avvik:
 *   - Bare fanen «Fagteam» har data: aktive trenere i Team Norway-gruppen.
 *     Fagpersoner fra Olympiatoppen, oppfølgingsplan per utøver og
 *     samlingsrapport har ingen datamodell og vises ikke.
 *   - Telefon, tilgjengelighet og «Be om konsultasjon» er utelatt.
 *   - E-post vises bare for dem som kan administrere gruppen, som før.
 */
export async function TnFagapparatSkjerm() {
  const bruker = await hentSkjermbruker();
  const data = await hentTnTrenere(bruker);
  if (!data || data.kontekst.erSpiller) notFound();
  return <TnFagapparatVisning brukerNavn={bruker.name} visDataGolf={await innloggetKanSeDataGolf()} data={data} />;
}
