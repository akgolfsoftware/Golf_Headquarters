import { permanentRedirect } from "next/navigation";

/**
 * /kommando → /admin/agent-team (2026-07-15).
 * Kommandosenteret er retired: Agent-team (KommandoProject/Run/Step) er
 * allerede v2 og live her siden 12. juli. Kommandos EGNE oppgaver
 * (KommandoTask) er retired til fordel for det Notion-synkede systemet
 * (/admin/handlingssenter) — se plans/legacy-portering-prioritet.md.
 */
export default function KommandoDashboardRedirect(): never {
  permanentRedirect("/admin/agent-team");
}
