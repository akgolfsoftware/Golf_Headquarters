/**
 * /portal/gjennomfore — PlayerHQ Gjennomføre (hybrid-design 2026-06-17).
 * Tre seksjoner: Neste økt (featured) · Resten av dagen · Fullført i dag.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getGjennomforeData } from "@/lib/portal-gjennomfore/gjennomfore-data";
import { Eyebrow } from "@/components/athletic/golfdata";
import { GjennomforeFaner } from "@/components/portal/gjennomfore/gjennomfore-faner";

export const dynamic = "force-dynamic";

export default async function GjennomforePage() {
  const user = await requirePortalUser();
  const data = await getGjennomforeData(user.id);

  return (
    <div className="golfdata-scope mx-auto w-full max-w-[460px] px-4 pb-8 pt-3 sm:px-5 md:max-w-[860px] md:px-8 md:pt-6">
      <Eyebrow tone="default" className="mb-2.5">
        Gjennomføre
      </Eyebrow>
      <h1 className="font-display text-[29px] font-bold leading-[1.05] tracking-[-0.035em] text-foreground">
        Dagens{" "}
        <em className="font-medium italic text-primary">program</em>
      </h1>
      <GjennomforeFaner data={data} />
    </div>
  );
}
