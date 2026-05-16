import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { requireCoachForPlayer } from "@/lib/sg-hub/coach-access";
import { EquipmentView } from "../../../equipment/page";

export default async function CoachEquipmentPage({
  params,
}: {
  params: Promise<{ spillerId: string }>;
}) {
  const user = await requirePortalUser();
  const { spillerId } = await params;
  const { player } = await requireCoachForPlayer(user, spillerId);

  return (
    <EquipmentView
      userId={player.id}
      backHref={`/portal/mal/sg-hub/coach/${spillerId}`}
      spillerNavn={player.name}
    />
  );
}
