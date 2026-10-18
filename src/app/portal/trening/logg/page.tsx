/**
 * Logg økt (pakke 13): økt ført i etterkant. Teller i total treningstid, aldri mot planen.
 * Fasit og avvik: src/components/portal/precision/PH17LoggOkt.tsx.
 */
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH17LoggOkt } from "@/components/portal/precision/PH17LoggOkt";

export const dynamic = "force-dynamic";
export const metadata = { title: "Logg økt · PlayerHQ" };

export default async function LoggOktPage() {
  const user = await requirePortalUser();
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");
  const ulest = await getUnreadNotifications(user.id, 1).catch(() => ({ count: 0 }));
  const iDag = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <PH17LoggOkt iDag={iDag} />
    </PlayerHQSkall>
  );
}
