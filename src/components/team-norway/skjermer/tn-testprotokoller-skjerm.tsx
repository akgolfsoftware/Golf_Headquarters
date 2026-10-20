import { notFound } from "next/navigation";

import { innloggetKanSeDataGolf } from "@/lib/auth/datagolf-tilgang";
import { hentTnArbeidskontekst, hentTnProtokollbibliotek, hentTnProtokolldetalj } from "@/lib/domain/tn-arbeidsflate";
import { hentSkjermbruker } from "./felles";
import { TnTestprotokollerVisning } from "./tn-testprotokoller-visning";

/** TN-15 Testprotokoller og én protokoll. Visningen ligger i tn-testprotokoller-visning.tsx. */
export async function TnTestprotokollerSkjerm({ sokeparametre, valgtId }: { sokeparametre: Record<string, string | string[] | undefined>; valgtId?: string }) {
  const bruker = await hentSkjermbruker();
  const kontekst = await hentTnArbeidskontekst(bruker);
  if (!kontekst || kontekst.erSpiller) notFound();

  const bibliotek = hentTnProtokollbibliotek();
  const status = sokeparametre.status === "klar" ? "KLAR" : sokeparametre.status === "utkast" ? "UTKAST" : null;
  const liste = bibliotek.rader.filter((p) => !status || p.status === status);
  const valgtParam = valgtId ?? (Array.isArray(sokeparametre.valgt) ? sokeparametre.valgt[0] : sokeparametre.valgt);
  const detalj = valgtParam ? hentTnProtokolldetalj(valgtParam) : liste[0] ? hentTnProtokolldetalj(liste[0].id) : null;
  if (valgtId && !detalj) notFound();

  const visDataGolf = await innloggetKanSeDataGolf();
  return <TnTestprotokollerVisning brukerNavn={bruker.name} visDataGolf={visDataGolf} kontekst={kontekst} bibliotek={bibliotek} status={status} detalj={detalj} egenSide={Boolean(valgtId)} />;
}
