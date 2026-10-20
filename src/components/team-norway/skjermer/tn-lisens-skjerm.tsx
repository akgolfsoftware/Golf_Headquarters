import { notFound } from "next/navigation";

import { innloggetKanSeDataGolf } from "@/lib/auth/datagolf-tilgang";
import { hentTnSpillere, hentTnSpillerstatuser } from "@/lib/domain/tn-arbeidsflate";
import { hentSkjermbruker, osloDag } from "./felles";
import { TnLisensVisning } from "./tn-lisens-visning";

/** TN-10 Lisens og økonomi. Visningen og avvikene står i tn-lisens-visning.tsx. */
export async function TnLisensSkjerm() {
  const bruker = await hentSkjermbruker();
  const spillerside = await hentTnSpillere(bruker);
  if (!spillerside) notFound();
  const { kontekst } = spillerside;
  const naa = new Date();
  const aar = osloDag(naa).aar;
  const [status, visDataGolf] = await Promise.all([
    hentTnSpillerstatuser(bruker, kontekst, aar),
    kontekst.erSpiller ? Promise.resolve(false) : innloggetKanSeDataGolf(),
  ]);
  return <TnLisensVisning brukerNavn={bruker.name} visDataGolf={visDataGolf} kontekst={kontekst} spillere={spillerside.rader} status={status} aar={aar} naa={naa} />;
}
