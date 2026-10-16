import { redirect } from "next/navigation";

/**
 * Dagens Workbench-økter vises på I dag (PH-01) med fylte øktkort. Én inngang per funksjon:
 * den gamle lista sender dit. Øktarket for én økt ligger fortsatt på /portal/tren/wb/[sessionId].
 */
export default function WorkbenchDagensOkterPage() {
  redirect("/portal");
}
