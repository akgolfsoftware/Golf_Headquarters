/**
 * /portal/tren/wb — dagens Workbench-økter som egen liste utgikk 28.09.2026
 * (PH-02, Precision Athletics runde 20). Øktene ligger nå i agendaen på PH-01
 * I dag (/portal). Økt-arket /portal/tren/wb/[sessionId] er uendret.
 */

import { redirect } from "next/navigation";

export default function WorkbenchDagensOkterRedirect(): never {
  redirect("/portal");
}
