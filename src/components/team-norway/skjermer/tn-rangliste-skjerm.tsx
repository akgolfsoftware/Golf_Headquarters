import { notFound } from "next/navigation";

import { innloggetKanSeDataGolf } from "@/lib/auth/datagolf-tilgang";
import { hentTnRangliste } from "@/lib/domain/tn-arbeidsflate";
import type { TnRanglisteSortering } from "@/lib/domain/tn-rangliste";
import { hentSkjermbruker, osloDag } from "./felles";
import { TnRanglisteVisning } from "./tn-rangliste-visning";

/** TN-16 Rangliste. Visningen ligger i tn-rangliste-visning.tsx. */
export async function TnRanglisteSkjerm({ sokeparametre }: { sokeparametre: Record<string, string | string[] | undefined> }) {
  const bruker = await hentSkjermbruker();
  const aar = osloDag(new Date()).aar;
  const data = await hentTnRangliste(bruker, aar);
  if (!data || data.kontekst.erSpiller) notFound();
  const sortering: TnRanglisteSortering = sokeparametre.sort === "plass" || sokeparametre.sort === "starter" ? sokeparametre.sort : "brutto";
  return <TnRanglisteVisning brukerNavn={bruker.name} visDataGolf={await innloggetKanSeDataGolf()} data={data} aar={aar} sortering={sortering} />;
}
