import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentTnSpillerTester, hentTnSpillerOvrigeTester } from "@/lib/domain/tn-arbeidsflate";
import { TnSpillerTesterVisning } from "@/components/team-norway/skjermer/tn-spiller-tester-visning";

/**
 * IUP › Tester (T4 Resultat per spiller). Alle 19 testene i batteriet i tre deler, fra den felles
 * lista i testbatteri.ts. TN-protokoller valideres kanonisk (`hentTnSpillerTester`); fysiske tester
 * og andre PlayerHQ-tester hentes fra den generelle testoversikten. Tester utenfor batteriet står
 * i egen del, så ingen lagrede resultater forsvinner. `kreverTilgang: "TALENT"` — samme
 * eksisterende regel som portalens testlesing, ingen ny tilgangsregel.
 * Visningen ligger i tn-spiller-tester-visning.tsx.
 */
export default async function SpillerTesterPage({ params }: { params: Promise<{ spillerId: string }> }) {
  const { spillerId } = await params;
  const bruker = await requirePortalUser({ tillatDemo: true, kreverTilgang: "TALENT" });
  const [data, ovrige] = await Promise.all([
    hentTnSpillerTester(bruker, spillerId),
    hentTnSpillerOvrigeTester(bruker, spillerId),
  ]);
  if (!data) notFound();
  return <TnSpillerTesterVisning brukerNavn={bruker.name ?? "Ukjent"} spillerId={spillerId} tilgang={data.tilgang} tnRader={data.rader} ovrige={ovrige} />;
}
