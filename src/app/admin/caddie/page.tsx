/**
 * Gammel co-agent-rute. Konsolidert inn i Caddie-skjermen (Fase 2):
 * dashbordet bor nå på /admin/agencyos/caddie/dashbord (med sub-nav +
 * chat + aktivitet). Redirecter dit.
 */

import { permanentRedirect } from "next/navigation";

export default function CaddieRedirect() {
  permanentRedirect("/admin/agencyos/caddie/dashbord");
}
