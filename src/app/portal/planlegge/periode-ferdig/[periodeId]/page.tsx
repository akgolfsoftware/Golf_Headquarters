// PlayerHQ Perioden er ferdig — Precision Athletics, pakke 17b (utkast plan-hjelpere.html, 16.10.2026).
import { notFound, redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { lastPeriodeFerdig } from "@/lib/portal-plan/periode-ferdig-last";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHPeriodeFerdig } from "@/components/portal/precision/PHPeriodeFerdig";

export const dynamic = "force-dynamic";
export const metadata = { title: "Perioden er ferdig · PlayerHQ" };

export default async function PeriodeFerdigPage({ params }: { params: Promise<{ periodeId: string }> }) {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");
  const { periodeId } = await params;

  const [res, uleste] = await Promise.all([lastPeriodeFerdig(user.id, periodeId), getUnreadNotifications(user.id, 1)]);
  if (res.status === "ikke-funnet") notFound();
  // Perioden pågår: den vises i Plan til den er over.
  if (res.status === "pagar") redirect(res.href);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PHPeriodeFerdig data={res.data} />
    </PlayerHQSkall>
  );
}
