// PH21VideoListe — Precision Athletics. Data og handlinger er beholdt.
import { redirect } from "next/navigation";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getPH21Data } from "@/lib/portal-coach/ph21-queries";
import { PH21Innboks } from "@/components/portal/precision/PH21Innboks";

export const dynamic = "force-dynamic";

export default async function CoachVideoerPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const data = await getPH21Data(user.id);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <div className="pa-side">
        <PH21Innboks data={data} initialTab="vid" />
      </div>
    </PlayerHQSkall>
  );
}
