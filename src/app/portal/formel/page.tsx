import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHFormel } from "@/components/portal/precision/PHFormel";
import { getUnreadNotifications } from "@/app/portal/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "AK-formelen · PlayerHQ" };
export default async function FormelPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const notifications = await getUnreadNotifications(user.id, 1);
  return <PlayerHQSkall innboksHref="/portal/varsler" uleste={notifications.count}><PHFormel /></PlayerHQSkall>;
}
