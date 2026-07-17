import { redirect } from "next/navigation";

/**
 * /kommando → /admin/agent-team (B8, 2026-07-16).
 * Kommandosenter-dashbordet (KPI-strip over åpne oppgaver/AI-kjøringer/
 * prosjekter + «I dag»-panel) er avviklet. Funksjonen er fordelt: AI-chat på
 * /admin/agenter, oppgaver+prosjekter+agent-team-kjøringer på
 * /admin/agent-team, booking+oppgavefrist på /admin/kalender. Ingen enkelt
 * side erstatter selve KPI-aggregeringen ett-til-ett — /admin/agent-team er
 * nærmeste reelle hjem (de to tyngste panelene, Agent-team og Oppgaver, bor
 * begge der).
 */
export default function KommandoDashboardRedirect(): never {
  redirect("/admin/agent-team");
}
