/**
 * Tilbakemelding (/portal/meg/feedback) — Precision Athletics PH-25.
 * Auth og ?takk=1 er uendret; innsendingen går via server-handlingen submitFeedback.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentUleste } from "@/lib/portal-booking/uleste";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH25Feedback } from "@/components/portal/precision/PH25Abonnement";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tilbakemelding · PlayerHQ" };

export default async function FeedbackPage({ searchParams }: { searchParams: Promise<{ takk?: string }> }) {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");
  const sp = await searchParams;
  const uleste = await hentUleste(user.id);
  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PH25Feedback takk={sp?.takk === "1"} />
    </PlayerHQSkall>
  );
}
