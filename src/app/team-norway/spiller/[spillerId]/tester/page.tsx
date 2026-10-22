import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentTnSpillerAnalyseHub, hentTnSpillerOvrigeTester, hentTnSpillerTester, hentTnSpillerTilgang } from "@/lib/domain/tn-arbeidsflate";
import { TnIupLaastSkjerm } from "@/components/team-norway/skjermer/tn-iup-laast-skjerm";
import { TnSpillerUtviklingVisning } from "@/components/team-norway/skjermer/tn-spiller-utvikling-visning";
import { TnSpillerTesterVisning } from "@/components/team-norway/skjermer/tn-spiller-tester-visning";

/**
 * IUP › Tester (T4 Resultat per spiller). Alle 19 testene i batteriet i tre deler, fra den felles
 * lista i testbatteri.ts. TN-protokoller valideres kanonisk (`hentTnSpillerTester`); fysiske tester
 * og andre PlayerHQ-tester hentes fra den generelle testoversikten. Tester utenfor batteriet står
 * i egen del, så ingen lagrede resultater forsvinner. `kreverTilgang: "TALENT"` — samme
 * eksisterende regel som portalens testlesing, ingen ny tilgangsregel.
 * Visningen ligger i tn-spiller-tester-visning.tsx. `?visning=utvikling` viser utvikling per protokoll
 * (tidligere fanen Analyse). Uten deling: samme lås som de andre IUP-fanene.
 */
export default async function SpillerTesterPage({ params, searchParams }: { params: Promise<{ spillerId: string }>; searchParams: Promise<{ visning?: string }> }) {
  const [{ spillerId }, sp] = await Promise.all([params, searchParams]);
  const bruker = await requirePortalUser({ tillatDemo: true, kreverTilgang: "TALENT" });
  if (!(await hentTnSpillerTilgang(bruker, spillerId))) return <TnIupLaastSkjerm bruker={bruker} spillerId={spillerId} aktiv="tester" />;
  if (sp.visning === "utvikling") {
    const [data, hub] = await Promise.all([hentTnSpillerTester(bruker, spillerId), hentTnSpillerAnalyseHub(bruker, spillerId)]);
    if (!data || !hub) notFound();
    return <TnSpillerUtviklingVisning brukerNavn={bruker.name} spillerId={spillerId} data={data} hub={hub} />;
  }
  const [data, ovrige] = await Promise.all([
    hentTnSpillerTester(bruker, spillerId),
    hentTnSpillerOvrigeTester(bruker, spillerId),
  ]);
  if (!data) notFound();
  return <TnSpillerTesterVisning brukerNavn={bruker.name ?? "Ukjent"} spillerId={spillerId} tilgang={data.tilgang} tnRader={data.rader} ovrige={ovrige} />;
}
