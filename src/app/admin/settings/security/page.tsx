/**
 * v2: AgencyOS Innstillinger → Sikkerhet. Speiler den ekte
 * /admin/(legacy)/settings/security-flaten, men i v2-språket (V2Shell +
 * v2-komponentbiblioteket). Samme auth som legacy — COACH og ADMIN ser sin
 * egen sikkerhet, ikke admin-only.
 *
 * Ingen ekstra Prisma-kall: user-objektet fra requirePortalUser har alt vi
 * trenger (rolle, e-post, sist oppdatert).
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TlTilbake } from "@/components/admin/v2/oppsett/tl-kit";
import {
  AdminSecurityTrainLock,
  type AdminSecurityV2Data,
} from "@/components/admin/v2/oppsett/AdminSecurityTrainLock";

export default async function V2AdminSecurityPage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const data: AdminSecurityV2Data = {
    rolle: user.role === "ADMIN" ? "ADMIN" : "COACH",
    epost: user.email,
    sistOppdatert: user.updatedAt.toLocaleString("nb-NO", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  return (
    <V2Shell bredde="kolonne" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TlTilbake href="/admin/settings">Innstillinger</TlTilbake>
      <AdminSecurityTrainLock data={data} />
    </V2Shell>
  );
}
