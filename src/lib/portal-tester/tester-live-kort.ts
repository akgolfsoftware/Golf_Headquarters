/**
 * «Pågår test»-kortet på «I dag» (C4/Loop 8) — samme prinsipp som PH-01c
 * TrackMan-teaseren: henter spillerens pågående test-live-økt, eller `null`
 * når det ikke finnes noen ELLER protokollen ikke har et gate-/PEI-artefakt
 * ennå (§Feilhåndtering, CLAUDE.md §7: valgfritt kort, aldri krasj «I dag»).
 *
 * Kun IN_PROGRESS TestSession med en gjenkjent live-protokoll (gate/PEI, se
 * `detectLiveArtefaktKind`) gir kort — andre protokoller fortsetter i
 * Tester-huben («Én ting nå»), urørt av dette loopet.
 */

import { prisma } from "@/lib/prisma";
import { detectLiveArtefaktKind, liveArtefaktShots } from "@/lib/domain/tester-live";
import { beregnCurrentStepIndex, parseSessionScoring } from "@/lib/portal-tester/session-data";

export type TesterLiveKort = { testId: string; testNavn: string; fremdrift: string };

export async function getTesterLiveKort(userId: string): Promise<TesterLiveKort | null> {
  try {
    const sesjon = await prisma.testSession.findFirst({
      where: { userId, status: "IN_PROGRESS" },
      orderBy: { startedAt: "desc" },
      select: {
        testId: true,
        scoringData: true,
        test: { select: { name: true, protocol: true } },
      },
    });
    if (!sesjon) return null;

    const kind = detectLiveArtefaktKind(sesjon.test.protocol);
    if (!kind) return null;

    const shots = liveArtefaktShots(sesjon.test.protocol);
    const idx = beregnCurrentStepIndex(parseSessionScoring(sesjon.scoringData));

    return {
      testId: sesjon.testId,
      testNavn: sesjon.test.name,
      fremdrift: `${Math.min(idx, shots)} av ${shots}`,
    };
  } catch {
    // Skjul kortet stille — "I dag" skal aldri krasje på et valgfritt kort.
    return null;
  }
}
