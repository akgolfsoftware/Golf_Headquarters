/**
 * PH-21 Innboks · Ønsket økt (/portal/onskeligokt) i Precision Athletics.
 * Coach-lista utledes av hvem som faktisk tilbyr coaching (serviceType.coachUserId).
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { innboksKontekst } from "@/lib/portal-okt/innboks-data";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH21Ramme, PH21Onske } from "@/components/portal/precision/PH21Innboks";
import { sendOnskeligOkt } from "@/app/portal/(legacy)/onskeligokt/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ønsket økt · PlayerHQ" };

export default async function OnskeligOktPage() {
  const user = await requirePortalUser();
  const ctx = await innboksKontekst(user.id);
  const iDag = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());
  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ctx.uleste}>
      <PH21Ramme aktiv="onske" coachNavn={ctx.coachNavn}>
        <PH21Onske coachNavn={ctx.coachNavn ?? "Coachen"} coachId={ctx.coachId} iDag={iDag} send={sendOnskeligOkt} />
      </PH21Ramme>
    </PlayerHQSkall>
  );
}
