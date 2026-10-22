import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentTnSpillerTilgang } from "@/lib/domain/tn-arbeidsflate";
import { hentTnIupRanking } from "@/lib/domain/tn-iup-oversikt";
import { TnIupLaastSkjerm } from "@/components/team-norway/skjermer/tn-iup-laast-skjerm";
import { TnIupRankingVisning } from "@/components/team-norway/skjermer/tn-iup-faner-visning";

export const dynamic = "force-dynamic";

/** IUP › Ranking (wireframes utkast-tn/trenerflate §2): WAGR fra wagr_ref-tabellene, NGF-juniorranking «—». */
export default async function SpillerRankingPage({ params }: { params: Promise<{ spillerId: string }> }) {
  const { spillerId } = await params;
  const bruker = await requirePortalUser({ tillatDemo: true, kreverTilgang: "TALENT" });
  const tilgang = await hentTnSpillerTilgang(bruker, spillerId);
  const ranking = tilgang ? await hentTnIupRanking(bruker, spillerId) : null;
  if (!tilgang || !ranking) return <TnIupLaastSkjerm bruker={bruker} spillerId={spillerId} aktiv="ranking" />;
  return <TnIupRankingVisning brukerNavn={bruker.name} kontekst={tilgang.kontekst} spillerId={spillerId} spillerNavn={tilgang.spillerNavn} ranking={ranking} />;
}
