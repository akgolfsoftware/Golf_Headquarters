/**
 * AgencyOS · Live-økt (coach) — Precision Athletics (AG-13-U, bolk A3,
 * 28.–29.09.2026). Nattema, per beslutninger.md §SKJERMENE … RUNDE 8:
 * «AG-13 Live coachingøkt er nattema: AgencyOSSkall med natt (ingen
 * hurtigknapp)». Flyttet ut av (fullscreen)-gruppa av samme grunn som
 * /admin/agencyos/live — se den fila. Data, auth og server actions
 * (lastLiveOktData, live-okt-actions.ts) er urørt.
 */
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG13LiveOkt } from "@/components/admin/precision/AG13LiveOkt";
import { kanSeLiveOkt, lastLiveOktData } from "@/lib/agencyos/live-okt-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Live-økt · AgencyOS" };

export default async function LiveOktPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { sessionId } = await params;
  if (!(await kanSeLiveOkt(user, sessionId))) notFound();
  const data = await lastLiveOktData(sessionId);
  if (!data) notFound();

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"} natt>
      <AG13LiveOkt data={data} />
    </AgencyOSSkall>
  );
}
