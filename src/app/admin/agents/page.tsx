/**
 * /admin/agents (liste-siden) → /admin/agenticos.
 *
 * Låst beslutning (Anders 2026-08-04, `.claude/rules/beslutninger.md`
 * §«AI-laget samles på ÉN adresse»): AgenticOS-samleflaten erstatter
 * spredningen over /admin/agent-team, /admin/agents og AI-panelet på
 * konsollen — de gamle adressene blir redirects dit.
 *
 * `/admin/agents/[agentId]` (agent-detalj) er UBERØRT av denne redirecten —
 * kun liste-siden flytter. Registeret (AGENT_INFO/MANUELLE_AGENTER) som
 * denne siden tidligere eide, bor nå i `src/lib/agencyos/agent-registry.ts`
 * så /admin/agenticos har ett sted å lese det fra i stedet for en
 * redirect-side.
 */

import { redirect } from "next/navigation";

export const metadata = { title: "Agenter · AgencyOS" };

export default function AdminAgenterRedirect() {
  redirect("/admin/agenticos");
}
