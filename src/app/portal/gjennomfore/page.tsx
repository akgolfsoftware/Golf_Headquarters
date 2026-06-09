/**
 * /portal/gjennomfore — PlayerHQ Gjennomføre.
 * Portet fra fersk Claude Design-fasit (ph-screens.jsx · ExecuteScreen):
 * eyebrow + "Gjør jobben." → faner (I dag / Kalender / Booking).
 * "I dag" er default og viser dagens program fra ekte data.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getGjennomforeData } from "@/lib/portal-gjennomfore/gjennomfore-data";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { GjennomforeFaner } from "@/components/portal/gjennomfore/gjennomfore-faner";

export const dynamic = "force-dynamic";

export default async function GjennomforePage() {
  const user = await requirePortalUser();
  const data = await getGjennomforeData(user.id);

  return (
    <div className="mx-auto w-full max-w-[460px] px-4 pb-8 pt-3 sm:px-5 md:max-w-[720px]">
      <AthleticEyebrow tone="lime">PLAYERHQ · GJENNOMFØRE</AthleticEyebrow>
      <h1 className="mt-2 mb-5 font-display text-[26px] font-bold leading-tight tracking-[-0.02em] text-foreground">
        Gjør <em className="font-normal italic text-primary">jobben.</em>
      </h1>
      <GjennomforeFaner data={data} />
    </div>
  );
}
