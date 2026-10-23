import { notFound } from "next/navigation";

import type { TnBruker } from "@/lib/domain/tn-arbeidsflate";
import { hentTnIupLaast } from "@/lib/domain/tn-iup-oversikt";
import type { TnSpillerFane } from "../tn-shell";
import { osloDag } from "./felles";
import { TnIupLaastVisning } from "./tn-iup-laast-visning";

/**
 * Låst IUP for en IUP-fane når treneren ikke har deling. Spiller i gruppa: låsen med navn, klubb,
 * fødselsår og WAGR-plass. Alle andre (ikke trener, ikke medlem): 404. Kalles bare etter at
 * `hentTnSpillerTilgang` har gitt null.
 */
export async function TnIupLaastSkjerm({ bruker, spillerId, aktiv }: { bruker: TnBruker; spillerId: string; aktiv: TnSpillerFane }) {
  const laast = await hentTnIupLaast(bruker, spillerId);
  if (!laast) notFound();
  return <TnIupLaastVisning brukerNavn={bruker.name} kontekst={laast.kontekst} spillerId={spillerId} aktiv={aktiv} navn={laast.navn} klubb={laast.klubb} fodselsaar={laast.fodselsaar} wagr={laast.wagr} aar={osloDag(new Date()).aar} />;
}
