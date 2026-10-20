import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentTnArbeidskontekst } from "@/lib/domain/tn-arbeidsflate";
import { TnTurneringNyVisning } from "@/components/team-norway/skjermer/tn-turneringer-visning";

/** TN-17 Legg inn turnering. Bare for spillere: turneringen legges i spillerens egen plan. */
export default async function Page() {
  const bruker = await requirePortalUser({ tillatDemo: true, kreverTilgang: "INGEN" });
  const kontekst = await hentTnArbeidskontekst(bruker);
  if (!kontekst || !kontekst.erSpiller) notFound();
  return <TnTurneringNyVisning brukerNavn={bruker.name} kontekst={kontekst} visDataGolf={false} />;
}
