import { notFound } from "next/navigation";

import { innloggetKanSeDataGolf } from "@/lib/auth/datagolf-tilgang";
import { hentTnRangliste, hentTnUttak, hentTnUttaksrunder } from "@/lib/domain/tn-arbeidsflate";
import { hentSkjermbruker } from "./felles";
import { TnUttakVisning } from "./tn-uttak-visning";

/** TN-05 Uttak og kriterier. Visningen ligger i tn-uttak-visning.tsx. */
export async function TnUttakSkjerm() {
  const bruker = await hentSkjermbruker();
  const data = await hentTnRangliste(bruker);
  if (!data || data.kontekst.erSpiller) notFound();
  const [uttak, rundeData, visDataGolf] = await Promise.all([hentTnUttak(bruker, data.kontekst), hentTnUttaksrunder(bruker, data.kontekst), innloggetKanSeDataGolf()]);
  return <TnUttakVisning brukerNavn={bruker.name} visDataGolf={visDataGolf} data={data} uttak={uttak} rundeData={rundeData} naa={new Date()} />;
}
