import { notFound } from "next/navigation";

import { innloggetKanSeDataGolf } from "@/lib/auth/datagolf-tilgang";
import { Capability } from "@/lib/auth/cbac";
import { canUser } from "@/lib/auth/effective-capabilities";
import { hentTnManedsplan, hentTnSamlinger, hentTnTurneringer } from "@/lib/domain/tn-arbeidsflate";
import { heltallParam, hentSkjermbruker, osloDag } from "./felles";
import { TnSamlingVisning, TnSamlingerVisning } from "./tn-samlinger-visning";

/** TN-04 Samlinger og én samling. Visningen ligger i tn-samlinger-visning.tsx. */
export async function TnSamlingerSkjerm({ sokeparametre, valgtId }: { sokeparametre: Record<string, string | string[] | undefined>; valgtId?: string }) {
  if (valgtId) return <TnSamlingSkjerm id={valgtId} />;
  const bruker = await hentSkjermbruker();
  const [data, turneringsdata] = await Promise.all([hentTnSamlinger(bruker), hentTnTurneringer(bruker)]);
  if (!data) notFound();
  const naa = new Date();
  const idag = osloDag(naa);
  const aar = heltallParam(sokeparametre.ar, 2000, 2100, idag.aar);
  const maned = heltallParam(sokeparametre.maned, 1, 12, aar === idag.aar ? idag.maned : 1);
  const visDataGolf = !data.kontekst.erSpiller && (await innloggetKanSeDataGolf());
  return <TnSamlingerVisning brukerNavn={bruker.name} visDataGolf={visDataGolf} data={data} turneringsdata={turneringsdata} aar={aar} maned={maned} naa={naa} />;
}

async function TnSamlingSkjerm({ id }: { id: string }) {
  const bruker = await hentSkjermbruker();
  const data = await hentTnSamlinger(bruker);
  if (!data) notFound();
  const valgt = data.samlinger.find((s) => s.id === id);
  if (!valgt) notFound();
  const [kanPublisere, plan, visDataGolf] = await Promise.all([
    canUser(bruker, Capability.EDIT_GROUP_PLANS),
    hentTnManedsplan(bruker, valgt.startDate, new Date(valgt.endDate.getTime() + 864e5)),
    data.kontekst.erSpiller ? Promise.resolve(false) : innloggetKanSeDataGolf(),
  ]);
  return <TnSamlingVisning brukerNavn={bruker.name} visDataGolf={visDataGolf} data={data} valgt={valgt} plan={plan} kanPublisere={kanPublisere} naa={new Date()} />;
}
