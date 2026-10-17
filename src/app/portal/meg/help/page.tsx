// PlayerHQ Hjelp — Precision Athletics, pakke 15 (utkast hjelp.html, 16.10.2026).
/**
 * /portal/meg/help — søk, kategorier og vanlige spørsmål. Innholdet er redaksjonelt
 * (src/lib/portal-hjelp/artikler.ts), ikke spillerens data.
 */
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHHjelp } from "@/components/portal/precision/PHHjelp";

export const dynamic = "force-dynamic";
export const metadata = { title: "Hjelp · PlayerHQ" };

export default async function HelpPage() {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");
  const uleste = await getUnreadNotifications(user.id, 1);
  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PHHjelp />
    </PlayerHQSkall>
  );
}
