/**
 * PH25Tilbakemelding — tilbakemelding i PlayerHQSkall.
 * Samme sending. En foresatt og en gjest slipper ikke inn.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { MegFeedbackV2, type MegFeedbackData } from "@/components/portal/v2/MegFeedbackV2";

export const dynamic = "force-dynamic";

export default async function FeedbackPage({ searchParams }: { searchParams: Promise<{ takk?: string }> }) {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");
  const [sp, ulest] = await Promise.all([searchParams, getUnreadNotifications(user.id, 1)]);
  const data: MegFeedbackData = { takk: sp?.takk === "1" };

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side"><MegFeedbackV2 data={data} /></div>
    </PlayerHQSkall>
  );
}
