import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentTnSpillerAktivePlaner, hentTnSpillerTilgang, hentTnSpillerTrening } from "@/lib/domain/tn-arbeidsflate";
import { TnIupLaastSkjerm } from "@/components/team-norway/skjermer/tn-iup-laast-skjerm";
import { TnIupTreningVisning } from "@/components/team-norway/skjermer/tn-iup-faner-visning";

export const dynamic = "force-dynamic";

/** IUP › Trening (wireframes utkast-tn/trenerflate §2). Erstatter «Plan» (workbench?spiller=) som fane. */
export default async function SpillerTreningPage({ params }: { params: Promise<{ spillerId: string }> }) {
  const { spillerId } = await params;
  const bruker = await requirePortalUser({ tillatDemo: true, kreverTilgang: "TALENT" });
  const tilgang = await hentTnSpillerTilgang(bruker, spillerId);
  if (!tilgang) return <TnIupLaastSkjerm bruker={bruker} spillerId={spillerId} aktiv="trening" />;
  const naa = new Date();
  const [data, planer] = await Promise.all([hentTnSpillerTrening(bruker, spillerId, naa), hentTnSpillerAktivePlaner(bruker, spillerId)]);
  if (!data) notFound();
  return <TnIupTreningVisning brukerNavn={bruker.name} kontekst={tilgang.kontekst} spillerId={spillerId} spillerNavn={tilgang.spillerNavn} naa={naa} data={data} planer={planer} />;
}
