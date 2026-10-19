import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

// PlayerHQ steg 1 (playerhq-alle-sider-nytt-design-2026-10-16.md): spillerens egen side er dobbelt
// med Meg › Utstyr og sendes dit. Coachens visning (EquipmentView) bor i coach-ruten under /portal/mal/sg-hub/coach.
export default async function EquipmentPage() {
  await requirePortalUser();
  redirect("/portal/meg/utstyr");
}
