// PH21Innboks «Nytt spørsmål» — Precision Athletics, nytt design (pakke 11). Data og handlinger er beholdt.
/**
 * PlayerHQ · Nytt spørsmål (/portal/coach/sporsmal/ny).
 * Fasit: docs/design-system/utkast-playerhq/kommunikasjon.html, arket «Ny melding» med typen Spørsmål.
 * Avvik:
 *   - Avvikene fra utkastet står øverst i komponenten siden bruker.
 * Åpner Spørsmål-fanen med arket og typen Spørsmål valgt. «Dine spørsmål» står på fanen.
 * Forelder sendes til foreldreportalen, som på de andre coach-sidene.
 */
import { redirect } from "next/navigation";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getPH21Data } from "@/lib/portal-coach/ph21-queries";
import { PH21Innboks } from "@/components/portal/precision/PH21Innboks";

export const dynamic = "force-dynamic";

export default async function NySporsmalPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "PARENT"] });
  if (user.role === "PARENT") redirect("/forelder");

  const data = await getPH21Data(user.id);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <PH21Innboks data={data} initialTab="q" apneNy nyStartType="sporsmal" />
    </PlayerHQSkall>
  );
}
