import { redirect } from "next/navigation";

/**
 * /kommando/team → /admin/agent-team (B8, 2026-07-16).
 * AdminAgentTeamV2 er den levende, overlegne versjonen av samme agent-team-
 * kjøring (samme /api/kommando/team-backend) — ingen funksjonstap.
 */
export default function KommandoTeamRedirect(): never {
  redirect("/admin/agent-team");
}
