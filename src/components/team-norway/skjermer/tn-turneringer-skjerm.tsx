import { notFound } from "next/navigation";

import { innloggetKanSeDataGolf } from "@/lib/auth/datagolf-tilgang";
import { hentTnSpillere, hentTnTurneringer } from "@/lib/domain/tn-arbeidsflate";
import { hentSkjermbruker } from "./felles";
import { TnTurneringerVisning } from "./tn-turneringer-visning";

/** TN-07 Turneringer. Visningen ligger i tn-turneringer-visning.tsx. */
export async function TnTurneringerSkjerm({ sokeparametre }: { sokeparametre: Record<string, string | string[] | undefined> }) {
  const bruker = await hentSkjermbruker();
  const [data, spillerside] = await Promise.all([hentTnTurneringer(bruker), hentTnSpillere(bruker)]);
  if (!data) notFound();
  const visDataGolf = !data.kontekst.erSpiller && (await innloggetKanSeDataGolf());
  const navn = Object.fromEntries((spillerside?.rader ?? []).map((r) => [r.id, r.navn]));
  const visning = sokeparametre.vis === "fullforte" ? "fullforte" : "kommende";
  return <TnTurneringerVisning brukerNavn={bruker.name} visDataGolf={visDataGolf} data={data} navn={navn} visning={visning} naa={new Date()} />;
}
