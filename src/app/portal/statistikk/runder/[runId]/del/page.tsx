/**
 * PlayerHQ · Del runde (/portal/statistikk/runder/[runId]/del), nytt design i pakke 13.
 * Fasit og avvik: src/components/portal/precision/PH18DelRunde.tsx. Bare eierens egen runde.
 */
import { notFound, redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH18DelRunde } from "@/components/portal/precision/PH18DelRunde";
import { hentDelRunde } from "@/lib/portal-analyse/del-runde-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Del runden · PlayerHQ" };

export default async function DelRundePage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");
  const [d, ulest] = await Promise.all([hentDelRunde(runId, user.id), getUnreadNotifications(user.id, 1)]);
  if (!d) notFound();

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <PH18DelRunde d={d} spiller={user.name} />
    </PlayerHQSkall>
  );
}
