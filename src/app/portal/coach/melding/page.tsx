// PH21Innboks «Meldinger» — Precision Athletics, nytt design (pakke 11). Data og handlinger er beholdt.
/**
 * PlayerHQ · Meldinger (/portal/coach/melding).
 * Fasit: docs/design-system/utkast-playerhq/kommunikasjon.html, mal «traad» (godkjent 14.10.2026).
 * Samme skjerm som /portal/coach på fanen Meldinger: samtalen med coachen og «Ny melding».
 */
import { redirect } from "next/navigation";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getPH21Data } from "@/lib/portal-coach/ph21-queries";
import { PH21Innboks } from "@/components/portal/precision/PH21Innboks";

export const dynamic = "force-dynamic";

export default async function CoachMeldingPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN", "PARENT"] });
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const data = await getPH21Data(user.id);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <PH21Innboks data={data} initialTab="msg" />
    </PlayerHQSkall>
  );
}
