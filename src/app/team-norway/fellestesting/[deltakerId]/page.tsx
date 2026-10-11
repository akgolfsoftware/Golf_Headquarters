import { notFound } from "next/navigation";
import { hentTnArbeidskontekst, hentTnTestdagDeltaker } from "@/lib/domain/tn-arbeidsflate";
import { tnProtocol } from "@/lib/portal-tester/tn-catalog";
import { TnTestdagScorecard } from "@/components/team-norway/tn-testdag-scorecard";
import { SkjermRamme, hentSkjermbruker } from "@/components/team-norway/skjermer/felles";

/** TN-03 — trenerføring for én deltaker i en testdag, i samme skall som øvrige TN-skjermer. */
export default async function TestdagDeltakerPage({ params }: { params: Promise<{ deltakerId: string }> }) {
  const { deltakerId } = await params;
  const bruker = await hentSkjermbruker();
  const deltaker = await hentTnTestdagDeltaker(bruker, deltakerId);
  if (!deltaker) notFound();
  const kontekst = await hentTnArbeidskontekst(bruker);
  if (!kontekst) notFound();
  const protokoll = tnProtocol(deltaker.protokollId, undefined, deltaker.protokollVersjon);
  if (!protokoll) notFound();

  return (
    <SkjermRamme aktiv="fellestesting" brukerNavn={bruker.name} kontekst={kontekst}>
      {/* key=deltakerId: tvinger full remount ved navigasjon til neste/
          forrige deltaker, slik at raw/notes/revision-state ALDRI følger
          med til en annen spiller (review 14.09 — spiller 2 må starte
          med blanke felt, ikke spiller 1s score). */}
      <TnTestdagScorecard key={deltakerId} deltaker={deltaker} protocol={protokoll} testDagId={deltaker.testDagId} />
    </SkjermRamme>
  );
}
