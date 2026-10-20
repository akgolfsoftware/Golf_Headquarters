import { notFound } from "next/navigation";

import { innloggetKanSeDataGolf } from "@/lib/auth/datagolf-tilgang";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentTnGruppeanalyseValg, hentTnGruppeanalyseResultat } from "@/lib/domain/tn-arbeidsflate";
import { TnAnalyseVisning } from "@/components/team-norway/skjermer/tn-analyse-visning";

/** TN-09 Gruppeanalyse. Visningen og avvikene står i tn-analyse-visning.tsx. */
export default async function GruppeanalysePage({ searchParams }: { searchParams: Promise<{ protokoll?: string; dag?: string }> }) {
  const sp = await searchParams;
  const bruker = await requirePortalUser({ tillatDemo: true, kreverTilgang: "INGEN" });
  const valg = await hentTnGruppeanalyseValg(bruker);
  if (!valg) notFound();

  const resultat = sp.protokoll || sp.dag
    ? await hentTnGruppeanalyseResultat(bruker, { protokollId: sp.protokoll, testDayId: sp.dag })
    : null;
  const ugyldigValg = Boolean((sp.protokoll || sp.dag) && !resultat);
  const visDataGolf = !valg.kontekst.erSpiller && (await innloggetKanSeDataGolf());

  return <TnAnalyseVisning brukerNavn={bruker.name} visDataGolf={visDataGolf} valg={valg} resultat={resultat} ugyldigValg={ugyldigValg} sp={sp} />;
}
