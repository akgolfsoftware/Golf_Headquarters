import { notFound } from "next/navigation";

import { innloggetKanSeDataGolf } from "@/lib/auth/datagolf-tilgang";
import { hentTnSpillere, hentTnTurneringer } from "@/lib/domain/tn-arbeidsflate";
import { hentSkjermbruker } from "./felles";
import { TnTurneringVisning } from "./tn-turneringer-visning";

/** TN-07 med valgt turnering. Visningen ligger i tn-turneringer-visning.tsx. */
export async function TnTurneringSkjerm({ id }: { id: string }) {
  const bruker = await hentSkjermbruker();
  const [data, spillerside] = await Promise.all([hentTnTurneringer(bruker), hentTnSpillere(bruker)]);
  if (!data) notFound();
  const turnering = data.turneringer.find((x) => x.id === id);
  if (!turnering) notFound();
  const visDataGolf = !data.kontekst.erSpiller && (await innloggetKanSeDataGolf());
  const navn = Object.fromEntries((spillerside?.rader ?? []).map((r) => [r.id, r.navn]));
  return <TnTurneringVisning brukerNavn={bruker.name} visDataGolf={visDataGolf} data={data} turnering={turnering} navn={navn} naa={new Date()} />;
}
