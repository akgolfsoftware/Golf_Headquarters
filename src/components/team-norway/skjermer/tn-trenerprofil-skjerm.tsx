import { notFound } from "next/navigation";

import { innloggetKanSeDataGolf } from "@/lib/auth/datagolf-tilgang";
import { hentTnTrenerprofil } from "@/lib/domain/tn-trenerprofil";
import { hentSkjermbruker } from "./felles";
import { TnTrenerprofilVisning } from "./tn-trenerprofil-visning";

/** Min profil for Team Norway-treneren. Visningen og avvikene står i tn-trenerprofil-visning.tsx. */
export async function TnTrenerprofilSkjerm() {
  const bruker = await hentSkjermbruker();
  const p = await hentTnTrenerprofil(bruker);
  if (!p) notFound();
  return <TnTrenerprofilVisning brukerNavn={bruker.name} erAdmin={bruker.role === "ADMIN"} visDataGolf={await innloggetKanSeDataGolf()} p={p} />;
}

