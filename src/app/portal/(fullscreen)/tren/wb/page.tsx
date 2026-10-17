import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

/**
 * Dagens Workbench-økter vises på I dag (PH-01) med fylte øktkort. Én inngang per funksjon:
 * den gamle lista sender dit. Øktarket for én økt ligger fortsatt på /portal/tren/wb/[sessionId].
 * Samme tilgang som før (FULL), så ruten ikke åpner seg for andre nivåer.
 */
export default async function WorkbenchDagensOkterPage() {
  await requirePortalUser({ allow: ["PLAYER"] });
  redirect("/portal");
}
