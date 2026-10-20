import { notFound } from "next/navigation";

import { innloggetKanSeDataGolf } from "@/lib/auth/datagolf-tilgang";
import { hentTnSkoler } from "@/lib/domain/tn-arbeidsflate";
import { hentSkjermbruker } from "./felles";
import { TnSkolerVisning } from "./tn-nettverk-visning";

/**
 * TN-17 Skoleoversikt. Visningen (retning «Skrå», tavle E1) ligger i tn-nettverk-visning.tsx.
 * Fasit: docs/design-system/utkast-tn/spillere.html, skjerm Skoler (pakke 3).
 * Skoler med færre enn tre spillere slås sammen til én rad uten navn, så ingen
 * mindreårig kan pekes ut av skolen alene. Spillerne finnes i Spillerutvikling.
 *
 * Avvik:
 *   - Skoletype (videregående / høyere utdanning) er ikke eget felt. Filtrene
 *     er tatt bort; tallene øverst er trinnene slik de står i profilene.
 */
export async function TnSkolerSkjerm() {
  const bruker = await hentSkjermbruker();
  const data = await hentTnSkoler(bruker);
  if (!data || data.kontekst.erSpiller) notFound();
  return <TnSkolerVisning brukerNavn={bruker.name} visDataGolf={await innloggetKanSeDataGolf()} data={data} />;
}
