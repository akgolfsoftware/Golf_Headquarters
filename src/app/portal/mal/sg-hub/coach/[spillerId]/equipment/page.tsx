/**
 * PlayerHQ · SG-hub · Coach-modus utstyr
 * (/portal/mal/sg-hub/coach/[spillerId]/equipment).
 * Flyttet ut av (legacy) 17. juli 2026 (Team F3). Tynn wrapper: auth
 * (requirePortalUser + requireCoachForPlayer) er uendret og identisk med
 * naboruten [spillerId]/page.tsx. Gjenbruker `EquipmentView` fra spillerens
 * (legacy) equipment-side — selve visningen er IKKE v2-portet ennå. V2Shell
 * gir chrome (naborute-mønsteret), siden ruten ikke lenger arver PortalShell
 * fra (legacy)-layouten.
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { requireCoachForPlayer } from "@/lib/sg-hub/coach-access";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { EquipmentView } from "@/app/portal/(legacy)/mal/sg-hub/equipment/page";

export default async function CoachEquipmentPage({
  params,
}: {
  params: Promise<{ spillerId: string }>;
}) {
  const user = await requirePortalUser();
  const { spillerId } = await params;
  const { player } = await requireCoachForPlayer(user, spillerId);

  return (
    <V2Shell aktiv="analyse" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <EquipmentView
        userId={player.id}
        backHref={`/portal/mal/sg-hub/coach/${spillerId}`}
        spillerNavn={player.name}
      />
    </V2Shell>
  );
}
