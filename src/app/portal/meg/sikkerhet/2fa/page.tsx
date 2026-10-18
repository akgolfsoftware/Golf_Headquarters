// PH-25 Tofaktor — Precision Athletics, pakke 14 (utkast meg-resten.html, 16.10.2026).
/**
 * /portal/meg/sikkerhet/2fa — tofaktor med kodeapp (Supabase MFA, TOTP). Flyten bor i PH25Tofaktor.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH25Tofaktor } from "@/components/portal/precision/PH25Tofaktor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tofaktor · PlayerHQ" };

export default async function TwoFaPage() {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  const uleste = await getUnreadNotifications(user.id, 1);
  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PH25Tofaktor />
    </PlayerHQSkall>
  );
}
