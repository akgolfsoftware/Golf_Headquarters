/**
 * v2-forhåndsvisning — PlayerHQ Baneguide (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver PortalShell — kun root-layout. V2Shell leverer
 * chrome-en (IkonRail/BunnNav), BaneguideV2 rendrer innholds-stacken.
 *
 * Auth + dataloader gjenbrukt 1:1 fra den ekte siden (src/app/portal/baneguide/page.tsx).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getBaneLibrary } from "@/lib/baneguide/queries";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { BaneguideV2 } from "@/components/portal/v2/BaneguideV2";

export const dynamic = "force-dynamic";

export default async function V2BaneguidePreviewPage() {
  const user = await requirePortalUser();
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const data = await getBaneLibrary(user.id);

  return (
    <V2Shell aktiv="analyse" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <BaneguideV2 data={data} />
    </V2Shell>
  );
}
