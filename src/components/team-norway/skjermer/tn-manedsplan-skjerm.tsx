import { notFound } from "next/navigation";

import { innloggetKanSeDataGolf } from "@/lib/auth/datagolf-tilgang";
import { hentTnManedsplan, hentTnSamlinger, hentTnTurneringer } from "@/lib/domain/tn-arbeidsflate";
import { manedsvindu } from "@/lib/domain/tn-manedsplan";
import { heltallParam, hentSkjermbruker, osloDag } from "./felles";
import { TnManedsplanVisning } from "./tn-manedsplan-visning";

/** TN-11 Månedsplan. Visningen ligger i tn-manedsplan-visning.tsx. */
export async function TnManedsplanSkjerm({ sokeparametre }: { sokeparametre: Record<string, string | string[] | undefined> }) {
  const bruker = await hentSkjermbruker();
  const naa = new Date();
  const idag = osloDag(naa);
  const aar = heltallParam(sokeparametre.ar, 2000, 2100, idag.aar);
  const maned = heltallParam(sokeparametre.maned, 1, 12, idag.maned);
  const visning = sokeparametre.visning === "liste" ? "liste" : "kalender";
  const dagParam = Array.isArray(sokeparametre.dag) ? sokeparametre.dag[0] : sokeparametre.dag;

  const { fra, til } = manedsvindu(aar, maned);
  const [data, turneringsdata, samlingsdata] = await Promise.all([hentTnManedsplan(bruker, fra, til), hentTnTurneringer(bruker), hentTnSamlinger(bruker)]);
  if (!data) notFound();
  const visDataGolf = !data.kontekst.erSpiller && (await innloggetKanSeDataGolf());
  return <TnManedsplanVisning brukerNavn={bruker.name} visDataGolf={visDataGolf} data={data} turneringsdata={turneringsdata} samlingsdata={samlingsdata} aar={aar} maned={maned} visning={visning} dagParam={dagParam} naa={naa} />;
}
