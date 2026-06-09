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
    <div className="mx-auto w-full max-w-[460px] px-4 pb-8 pt-3 sm:px-5 md:max-w-[720px]">
      <AthleticEyebrow tone="lime">PLAYERHQ · ANALYSERE</AthleticEyebrow>
      <h1 className="mt-2 mb-6 font-display text-[26px] font-bold leading-tight tracking-[-0.02em] text-foreground">
        Les <em className="font-normal italic text-primary">tallene.</em>
      </h1>
      <AnalysereFaner data={data} />
    </div>
  );
}
