/**
 * AgencyOS · Live-økt (coach). Lys (beslutninger.md §LIVE-ØKTENE ER ALLTID LYSE, 14.10).
 * Flyttet ut av (fullscreen)-gruppa av samme grunn som /admin/agencyos/live
 * — se den fila. Data, auth og server actions
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
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG13LiveOkt data={data} />
    </AgencyOSSkall>
  );
}
