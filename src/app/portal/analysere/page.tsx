/**
 * /portal/analysere — PlayerHQ Analysere ("Les tallene").
 * Portet fra fersk Claude Design-fasit (ph-screens.jsx · AnalyzeScreen):
 * eyebrow + "Les tallene." → sesong-header (SG-trend + 4 KPI) → faner
 * (SG / Runder / TrackMan / Tester / Innsikt). Default SG. Ekte data.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getAnalysereData } from "@/lib/portal-analysere/analysere-data";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { AnalysereFaner } from "@/components/portal/analysere/analysere-faner";

export const dynamic = "force-dynamic";

export default async function AnalyserePage() {
  const user = await requirePortalUser();
  const data = await getAnalysereData(user.id);

  return (
    <div className="mx-auto w-full max-w-[460px] px-4 pb-8 pt-3 sm:px-5 md:max-w-[940px] md:px-8 md:pt-6">
      <AthleticEyebrow tone="lime" className="md:hidden">PLAYERHQ · ANALYSERE</AthleticEyebrow>
      <h1 className="mt-2 mb-1 font-display text-[26px] font-bold leading-tight tracking-[-0.02em] text-foreground md:mt-0 md:text-[30px]">
        Les <em className="font-normal italic text-primary">tallene.</em>
      </h1>
      <p className="mb-6 hidden text-sm leading-relaxed text-muted-foreground md:block">
        Hvor tjener og taper du slag? Én flate — Strokes Gained, runder, TrackMan, tester og hull-for-hull innsikt.
      </p>
      <AnalysereFaner data={data} />
    </div>
  );
}
