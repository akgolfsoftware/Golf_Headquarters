import { redirect } from "next/navigation";

/**
 * /kommando → /admin/agenticos (B8 2026-07-16, mål oppdatert 2026-08-17).
 * Kommandosenter-dashbordet (KPI-strip over åpne oppgaver/AI-kjøringer/
 * prosjekter + «I dag»-panel) er avviklet. AI-laget er samlet på
 * /admin/agenticos (beslutning 2026-08-04); booking+oppgavefrist bor på
 * /admin/kalender. De gamle mellomstasjonene /admin/agent-team og
 * /admin/agents er selv redirects dit — derfor peker vi direkte.
 */
export default function KommandoDashboardRedirect(): never {
  redirect("/admin/agenticos");
}
