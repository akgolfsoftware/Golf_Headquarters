import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentTnTestdagDeltaker } from "@/lib/domain/tn-arbeidsflate";
import { tnProtocol } from "@/lib/portal-tester/tn-catalog";
import { TnTestdagScorecard } from "@/components/team-norway/tn-testdag-scorecard";
import { TN } from "@/lib/v2/team-norway";

/** TN-03 — trenerføring for én deltaker i en testdag. */
export default async function TestdagDeltakerPage({ params }: { params: Promise<{ deltakerId: string }> }) {
  const { deltakerId } = await params;
  const bruker = await requirePortalUser({ kreverTilgang: "INGEN" });
  const deltaker = await hentTnTestdagDeltaker(bruker, deltakerId);
  if (!deltaker) notFound();
  const protokoll = tnProtocol(deltaker.protokollId);
  if (!protokoll) notFound();

  return (
    <div style={{ minHeight: "100dvh", background: TN.surfacePage, padding: "clamp(16px, 4vw, 40px)" }}>
      <main style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* key=deltakerId: tvinger full remount ved navigasjon til neste/
            forrige deltaker, slik at raw/notes/revision-state ALDRI følger
            med til en annen spiller (review 14.09 — spiller 2 må starte
            med blanke felt, ikke spiller 1s score). */}
        <TnTestdagScorecard key={deltakerId} deltaker={deltaker} protocol={protokoll} testDagId={deltaker.testDagId} />
      </main>
    </div>
  );
}
