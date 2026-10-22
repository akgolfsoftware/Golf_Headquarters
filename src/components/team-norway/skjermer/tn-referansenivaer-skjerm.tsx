import { notFound } from "next/navigation";

import { innloggetKanSeDataGolf } from "@/lib/auth/datagolf-tilgang";
import { hentTnReferanseTester } from "@/lib/domain/tn-arbeidsflate";
import { hentSkjermbruker } from "./felles";
import { TnReferansenivaerVisning } from "./tn-referansenivaer-visning";

/**
 * Referanse › Tester (tidligere Referansenivåer). Median og antall for hele gruppa, og spillerne som har delt,
 * med navn (Anders 22.10.2026). Henting og tilgang i hentTnReferanseTester; visningen i tn-referansenivaer-visning.tsx.
 */
export async function TnReferansenivaerSkjerm() {
  const bruker = await hentSkjermbruker();
  const data = await hentTnReferanseTester(bruker);
  if (!data) notFound();
  return <TnReferansenivaerVisning brukerNavn={bruker.name} visDataGolf={await innloggetKanSeDataGolf()} data={data} />;
}
