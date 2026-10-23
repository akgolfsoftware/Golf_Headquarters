import { notFound } from "next/navigation";

import { innloggetKanSeDataGolf } from "@/lib/auth/datagolf-tilgang";
import { hentTnArbeidskontekst } from "@/lib/domain/tn-arbeidsflate";
import { hentWagrReferanse } from "@/lib/domain/tn-referanse-wagr";
import type { WagrVisning } from "@/lib/domain/tn-referanse-wagr-regler";
import { hentSkjermbruker } from "./felles";
import { TnReferanseWagrVisning } from "./tn-referanse-wagr-visning";

/**
 * Referanse › WAGR (beslutninger.md §TEAM NORWAY ER BARE FOR TRENERE, punkt 3). Leser gruppene
 * og spillerne pipelines skriver til wagr_ref_* hver mandag. Visningen ligger i tn-referanse-wagr-visning.tsx.
 */
export async function TnReferanseWagrSkjerm({ gruppeId, visning = "leaderboard" }: { gruppeId?: string; visning?: WagrVisning }) {
  const bruker = await hentSkjermbruker();
  const kontekst = await hentTnArbeidskontekst(bruker);
  if (!kontekst || kontekst.erSpiller) notFound();

  const data = await hentWagrReferanse(gruppeId, visning);
  return <TnReferanseWagrVisning brukerNavn={bruker.name} visDataGolf={await innloggetKanSeDataGolf()} kontekst={kontekst} visning={visning} {...data} />;
}
