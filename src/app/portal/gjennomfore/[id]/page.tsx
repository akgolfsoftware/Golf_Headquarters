/**
 * /portal/gjennomfore/[id] — spillerens økt-detalj for TrainingSessionV2 (Spor B).
 *
 * v2-migrert (fase 6): V2Shell leverer chrome-en (IkonRail/BunnNav), OktV2
 * rendrer innholds-stacken. Auth + eierskaps-sjekk (studentId) skjer i
 * getOktDetaljData — samme kontrakt som v2-forhåndsvisningen
 * (src/app/(v2preview)/v2-okt/page.tsx), men sessionId kommer nå fra
 * params.id i stedet for et eksempel-oppslag.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getOktDetaljData } from "@/lib/portal-okt/okt-detalj-data";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { OktV2 } from "@/components/portal/v2/OktV2";
import { settDrillPyramide } from "./actions";
import { TilbakeLenke } from "@/components/v2";

export const dynamic = "force-dynamic";

export default async function OktDetaljPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const { id } = await params;
  const data = await getOktDetaljData(user.id, id);

  return (
    <V2Shell aktiv="gjor" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/gjennomfore">Gjør</TilbakeLenke>
      <OktV2 data={data} onSettPyramide={settDrillPyramide} />
    </V2Shell>
  );
}
