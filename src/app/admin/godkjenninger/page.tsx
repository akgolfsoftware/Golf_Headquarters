/**
 * Norsk alias for /admin/approvals.
 *
 * Hovedimplementasjonen ligger i `src/app/admin/approvals/page.tsx` og følger
 * V2-designet fra `wireframe/design-files-v2/final/03-godkjenninger.html`.
 * Denne ruten finnes så norske URL-er fungerer; ressursen er den samme.
 */
import { redirect } from "next/navigation";

export default function GodkjenningerRedirect() {
  redirect("/admin/approvals");
}
