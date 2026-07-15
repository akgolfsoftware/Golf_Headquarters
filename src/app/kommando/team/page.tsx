import { permanentRedirect } from "next/navigation";

/** /kommando/team → /admin/agent-team (2026-07-15, already v2 since 12. juli). */
export default function KommandoTeamRedirect(): never {
  permanentRedirect("/admin/agent-team");
}
