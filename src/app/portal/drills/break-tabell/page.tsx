// PH13BreakTabell — nytt design (pakke 4, godkjent av Anders 14.10.2026).
/**
 * PH-13 Break-tabell under putting i øvelsesbanken. Fasit: docs/design-system/utkast-playerhq/ovelser.html, skjerm «break».
 * Avvik:
 *   - Avvikene mot utkastet står øverst i PH13BreakTabell.tsx.
 */
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentOvelser } from "@/lib/portal-drills/ovelser-data";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH13BreakTabell } from "@/components/portal/precision/PH13BreakTabell";

export const dynamic = "force-dynamic";
export const metadata = { title: "Break-tabell · PlayerHQ" };

export default async function BreakTabellPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");
  const [ovelser, uleste] = await Promise.all([hentOvelser(user.id), getUnreadNotifications(user.id, 1)]);
  const antallPutting = ovelser.filter((o) => o.omraade?.startsWith("Putt")).length;
  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PH13BreakTabell antallPutting={antallPutting} />
    </PlayerHQSkall>
  );
}
