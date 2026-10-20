import { notFound } from "next/navigation";

import { innloggetKanSeDataGolf } from "@/lib/auth/datagolf-tilgang";
import { hentTnSpillere, hentTnTurneringer } from "@/lib/domain/tn-arbeidsflate";
import { hentSkjermbruker } from "./felles";
import { TnLiveWatchVisning } from "./tn-turneringer-visning";

/** TN-08 Live Watch. Visningen ligger i tn-turneringer-visning.tsx. Ingen simulert strøm. */
export async function TnLiveWatchSkjerm() {
  const bruker = await hentSkjermbruker();
  const [data, spillerside] = await Promise.all([hentTnTurneringer(bruker), hentTnSpillere(bruker)]);
  if (!data) notFound();
  const visDataGolf = !data.kontekst.erSpiller && (await innloggetKanSeDataGolf());
  const navn = Object.fromEntries((spillerside?.rader ?? []).map((r) => [r.id, r.navn]));
  return <TnLiveWatchVisning brukerNavn={bruker.name} visDataGolf={visDataGolf} data={data} navn={navn} naa={new Date()} />;
}
