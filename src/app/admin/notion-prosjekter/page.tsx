/**
 * /admin/notion-prosjekter — redirect til canonical workspace-rute
 *
 * Backstop-redirect i tilfelle next.config.ts ikke fanger requesten.
 * Fjernet bruk av forbudt CoachhqStubsShell.
 */

import { redirect } from "next/navigation";

export default function NotionProsjekterPage() {
  redirect("/admin/workspace/prosjekter");
}
