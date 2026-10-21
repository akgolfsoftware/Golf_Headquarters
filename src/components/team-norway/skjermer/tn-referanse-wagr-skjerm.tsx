import { notFound } from "next/navigation";

import { innloggetKanSeDataGolf } from "@/lib/auth/datagolf-tilgang";
import { hentTnArbeidskontekst } from "@/lib/domain/tn-arbeidsflate";
import { hentWagrReferanse } from "@/lib/domain/tn-referanse-wagr";
import { hentSkjermbruker } from "./felles";
import { TnReferanseWagrVisning } from "./tn-referanse-wagr-visning";

/**
 * Referanse › WAGR (beslutninger.md §TEAM NORWAY ER BARE FOR TRENERE, punkt 3). Leser gruppene
 * og spillerne pipelines skriver til wagr_ref_* hver mandag. Visningen ligger i tn-referanse-wagr-visning.tsx.
 */
export async function TnReferanseWagrSkjerm({ gruppeId }: { gruppeId?: string }) {
  const bruker = await hentSkjermbruker();
  const kontekst = await hentTnArbeidskontekst(bruker);
  if (!kontekst || kontekst.erSpiller) notFound();

  const data = await hentWagrReferanse(gruppeId);
  return <TnReferanseWagrVisning brukerNavn={bruker.name} visDataGolf={await innloggetKanSeDataGolf()} kontekst={kontekst} {...data} />;
}
