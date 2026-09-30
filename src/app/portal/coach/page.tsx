/**
 * PH-21 Innboks · Meldinger (/portal/coach) i Precision Athletics.
 * Tegning: Claude Design 7d7c2994, ui_kits/playerhq/screens/PH-21.jsx.
 * Uten coach (selvbetjent spiller) vises veien inn, aldri en blindgate.
 */
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { erCoachetSpiller } from "@/lib/auth/coached";
import { innboksKontekst, hentMeldingsTrad } from "@/lib/portal-okt/innboks-data";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { KnappLenke, TomTilstand } from "@/components/precision/pa";
import { Side, SideHode } from "@/components/precision/pa-a4";
import { PH21Ramme, PH21Meldinger } from "@/components/portal/precision/PH21Innboks";
import { sendMeldingNyV2 } from "./melding/ny/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Innboks · PlayerHQ" };

export default async function InnboksMeldingerPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const ctx = await innboksKontekst(user.id);

  if (!(await erCoachetSpiller(user.id))) {
    return (
      <PlayerHQSkall innboksHref="/portal/varsler" uleste={ctx.uleste}>
        <Side max={1200}>
          <SideHode kicker="Innboks" title="Innboks" />
          <TomTilstand
            icon={Users}
            title="Coach følger med her, når du er med i AK Golf Academy"
            text="Med en coaching-pakke (Performance eller Performance Pro) eller plass i en AK-gruppe får du egen coach, ukeplaner laget for deg og direkte meldinger her. Alt du logger nå er der den dagen du får coach."
            actions={<KnappLenke href="/portal/booking" icon={Users} iconName="users">Book en prøvetime</KnappLenke>}
          />
        </Side>
      </PlayerHQSkall>
    );
  }

  const meldinger = await hentMeldingsTrad(user.id, ctx.coachId);
  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ctx.uleste}>
      <PH21Ramme aktiv="msg" coachNavn={ctx.coachNavn}>
        <PH21Meldinger coachId={ctx.coachId} coachNavn={ctx.coachNavn ?? "coachen"} meldinger={meldinger} send={sendMeldingNyV2} kanSende={user.role === "PLAYER" && user.tier !== "GRATIS" && !!ctx.coachId} />
      </PH21Ramme>
    </PlayerHQSkall>
  );
}
