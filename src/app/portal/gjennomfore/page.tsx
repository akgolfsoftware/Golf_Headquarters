/**
 * PlayerHQ Gjør nå — PH-02 i Precision Athletics.
 * Tilgang og getGjennomforeData beholdes. Visningen er PH02Gjor.
 */
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { getGjennomforeData } from "@/lib/portal-gjennomfore/gjennomfore-data";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH02Gjor } from "@/components/portal/precision/PH02Gjor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gjør nå · PlayerHQ" };

export default async function GjorPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const [data, uleste] = await Promise.all([
    getGjennomforeData(user.id),
    getUnreadNotifications(user.id, 1),
  ]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <Suspense fallback={null}>
        <PH02Gjor data={data} />
      </Suspense>
    </PlayerHQSkall>
  );
}
