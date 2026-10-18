// PlayerHQ Perioden er ferdig, uten valgt periode: åpner den sist avsluttede perioden (pakke 17b).
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { sisteFerdigePeriodeId } from "@/lib/portal-plan/periode-ferdig-last";
import { periodeFerdigHref } from "@/lib/portal/plan-hjelpere-videresending";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHPeriodeFerdig } from "@/components/portal/precision/PHPeriodeFerdig";

export const dynamic = "force-dynamic";
export const metadata = { title: "Perioden er ferdig · PlayerHQ" };

export default async function SistePeriodeFerdigPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const id = await sisteFerdigePeriodeId(user.id);
  if (id) redirect(periodeFerdigHref(id));

  const uleste = await getUnreadNotifications(user.id, 1);
  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PHPeriodeFerdig data={null} />
    </PlayerHQSkall>
  );
}
