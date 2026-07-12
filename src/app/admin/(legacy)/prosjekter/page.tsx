import { redirect } from "next/navigation";

/**
 * /admin/prosjekter → /admin/agent-team (B4, 2026-07-12).
 * AI-prosjektene (KommandoProject) styres nå fra Agent-team-flaten der de
 * brukes — ProjectList (opprett/arkiver/slett) er montert der. «Prosjekter»
 * i arbeids-forstand er /admin/workspace/prosjekter (Notion).
 */
export default function ProsjekterRedirect(): never {
  redirect("/admin/agent-team");
}
