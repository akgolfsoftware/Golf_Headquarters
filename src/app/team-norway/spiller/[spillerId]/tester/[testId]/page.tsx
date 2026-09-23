import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentTnSpillerTestDetalj, hentTnSpillerOvrigTestDetalj } from "@/lib/domain/tn-arbeidsflate";
import { TnVisning, TnOvrigVisning } from "./visning";

/**
 * TN-utvidelse 14.09.2026: full historikk + siste forsøksrader for ÉN
 * protokoll. Bedre-retning er lest fra det faktisk lagrede resultatets
 * egen metrikk (8-ball: poeng, ikke PEI), ikke gjettet. Prøver TN-
 * protokollen først; faller tilbake til øvrig PlayerHQ-test hvis testId
 * ikke er en TN-protokoll (samme spiller, samme tilgangssjekk).
 * Selve visningen (`TnVisning`/`TnOvrigVisning`) ligger i `./visning.tsx` —
 * ren presentasjon uten server-only-import, rendertestet i
 * tests/komponenter/tn-testdetalj.test.ts.
 */
export default async function SpillerTestDetaljPage({ params }: { params: Promise<{ spillerId: string; testId: string }> }) {
  const { spillerId, testId } = await params;
  const bruker = await requirePortalUser({ kreverTilgang: "TALENT" });
  const data = await hentTnSpillerTestDetalj(bruker, spillerId, testId);
  if (data) return <TnVisning spillerId={spillerId} data={data} />;

  const ovrig = await hentTnSpillerOvrigTestDetalj(bruker, spillerId, testId);
  if (!ovrig) notFound();
  return <TnOvrigVisning spillerId={spillerId} data={ovrig} />;
}
