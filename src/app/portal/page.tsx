/**
 * PlayerHQ Hjem — chat-først, 1:1 Claude Paper-fasit
 * (designsystem/paper/fase1/playerhq-chat-desktop.html / -mobil.html).
 *
 * PaperShell + PaperHjem — IKKE V2Shell (gammelt designsystem).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getDashboardData } from "@/app/portal/actions";
import { getGjennomforeData } from "@/lib/portal-gjennomfore/gjennomfore-data";
import { korteDatoKlokke } from "@/lib/portal/korte-dato-klokke";
import { PaperHjem } from "@/components/portal/paper/PaperHjem";

export const dynamic = "force-dynamic";

export default async function PortalHjemPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const [data, gjennomfore] = await Promise.all([
    getDashboardData(user.id),
    getGjennomforeData(user.id),
  ]);

  // Server-side «nå» for å unngå SSR/hydrerings-avvik
  const naaTekst = korteDatoKlokke(new Date());

  return <PaperHjem data={data} gjennomfore={gjennomfore} naaTekst={naaTekst} />;
}
