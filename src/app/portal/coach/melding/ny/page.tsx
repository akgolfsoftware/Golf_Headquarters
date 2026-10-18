// PH21Innboks «Ny melding» — Precision Athletics, nytt design (pakke 11). Data og handlinger er beholdt.
/**
 * PlayerHQ · Ny melding (/portal/coach/melding/ny).
 * Fasit: docs/design-system/utkast-playerhq/kommunikasjon.html, arket «Ny melding» i Meldinger.
 * Avvik:
 *   - Avvikene fra utkastet står øverst i komponenten siden bruker.
 * Åpner Meldinger med arket «Ny melding» og typen Melding valgt. Meldingen går til spillerens coach.
 */
import { redirect } from "next/navigation";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getPH21Data } from "@/lib/portal-coach/ph21-queries";
import { PH21Innboks } from "@/components/portal/precision/PH21Innboks";

export const dynamic = "force-dynamic";

export default async function NyMeldingPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN", "PARENT"] });
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const data = await getPH21Data(user.id);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <PH21Innboks data={data} initialTab="msg" apneNy nyStartType="melding" />
    </PlayerHQSkall>
  );
}
