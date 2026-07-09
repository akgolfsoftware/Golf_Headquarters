/**
 * v2-forhåndsvisning — PlayerHQ Meg · Feedback (retning C). Egen top-level
 * route-group (v2preview) som IKKE arver PortalShell — kun root-layout.
 * V2Shell leverer chrome-en (IkonRail/BunnNav, aktiv «meg»), MegFeedbackV2
 * rendrer innholds-stacken.
 *
 * Auth + loader gjenbruker den ekte /portal/meg/feedback-siden: requirePortalUser
 * for tilgang, searchParams.takk for kvittering. Feedback-innsending går via den
 * EKTE server-action submitFeedback (inne i komponenten). Ingen fabrikerte verdier.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { MegFeedbackV2, type MegFeedbackData } from "@/components/portal/v2/MegFeedbackV2";

export const dynamic = "force-dynamic";

export default async function V2MegFeedbackPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ takk?: string }>;
}) {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const sp = await searchParams;
  const data: MegFeedbackData = { takk: sp?.takk === "1" };

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <MegFeedbackV2 data={data} />
    </V2Shell>
  );
}
