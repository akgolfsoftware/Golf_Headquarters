/**
 * Puttelaboratoriet i nytt design (PlayerHQ pakke 13, godkjent av Anders 16.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/stats-resten.html, malen «putt».
 * Avvik:
 *   - står øverst i PH13Puttelab.tsx. Regnemodellen er @/lib/putt-core, uendret.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH13Puttelab } from "@/components/portal/precision/PH13Puttelab";

export const dynamic = "force-dynamic";
export const metadata = { title: "Puttelaboratoriet · PlayerHQ" };

export default async function PutteLaboratorietPage() {
  const user = await requirePortalUser();
  const ulest = await getUnreadNotifications(user.id, 1);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <PH13Puttelab />
    </PlayerHQSkall>
  );
}
