/**
 * Hjelpesenter (/portal/meg/help) — Precision Athletics PH-25.
 * Auth-guarden speiler den tidligere siden. Innholdet er statisk redaksjonelt (data.ts).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentUleste } from "@/lib/portal-booking/uleste";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH25Hjelp } from "@/components/portal/precision/PH25Abonnement";
import { HJELP_FAQ, HJELP_KATEGORIER, HJELP_ARTIKLER } from "./data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Hjelp · PlayerHQ" };

export default async function HelpPage() {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");
  const uleste = await hentUleste(user.id);
  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PH25Hjelp data={{ faq: HJELP_FAQ, kategorier: HJELP_KATEGORIER, artikler: HJELP_ARTIKLER }} />
    </PlayerHQSkall>
  );
}
