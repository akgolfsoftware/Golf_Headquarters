import { notFound } from "next/navigation";

import { innloggetKanSeDataGolf } from "@/lib/auth/datagolf-tilgang";
import { hentTnArbeidskontekst, hentTnGruppeanalyseResultat, type TnGruppeanalyseRad } from "@/lib/domain/tn-arbeidsflate";
import { TESTBATTERI } from "@/lib/portal-tester/testbatteri";
import { hentSkjermbruker } from "./felles";
import { TnReferansenivaerVisning, type TnReferanseRad } from "./tn-referansenivaer-visning";

/**
 * TN-18 Referansenivåer. Henter gruppas beste gyldige resultat per protokoll i batteriet
 * (samme regel som Analyse, hentTnGruppeanalyseResultat) og regner median og beste per test.
 * Varianter av samme test (lengde, kjønn) slås sammen. Visningen ligger i tn-referansenivaer-visning.tsx.
 */
export async function TnReferansenivaerSkjerm() {
  const bruker = await hentSkjermbruker();
  const kontekst = await hentTnArbeidskontekst(bruker);
  if (!kontekst || kontekst.erSpiller) notFound();

  const rader: TnReferanseRad[] = await Promise.all(TESTBATTERI.map(async (test) => {
    const resultater = await Promise.all(test.protokoller.map((protokollId) => hentTnGruppeanalyseResultat(bruker, { protokollId })));
    const lavereErBedre = resultater.find((r) => r)?.lowerIsBetter ?? true;
    const gyldige = resultater.flatMap((r) => r?.rader ?? []).filter((r): r is TnGruppeanalyseRad & { score: number } => r.score !== null);
    gyldige.sort((a, b) => (lavereErBedre ? a.score - b.score : b.score - a.score));
    const median = gyldige.length ? gyldige[Math.floor((gyldige.length - 1) / 2)]!.formatert : null;
    return { test, protokollId: test.protokoller[0] ?? null, median, beste: gyldige[0]?.formatert ?? null, antall: gyldige.length };
  }));

  return <TnReferansenivaerVisning brukerNavn={bruker.name} visDataGolf={await innloggetKanSeDataGolf()} kontekst={kontekst} rader={rader} />;
}
