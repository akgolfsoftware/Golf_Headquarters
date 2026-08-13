/**
 * /admin/agent-team → /admin/agenticos.
 *
 * Låst beslutning (Anders 2026-08-04, `.claude/rules/beslutninger.md`
 * §«AI-laget samles på ÉN adresse»): AgenticOS-samleflaten erstatter
 * spredningen over /admin/agent-team, /admin/agents og AI-panelet på
 * konsollen — de gamle adressene blir redirects dit.
 *
 * `/kommando`, `/kommando/prosjekter`, `/kommando/oppgaver` og
 * `/kommando/team` redirecter alle hit i dag — de lander nå riktig på
 * /admin/agenticos via denne kjeden (verifisert manuelt, se PR).
 *
 * Prosjekt-/oppgave-CRUD (KommandoProject/KommandoTask, ProjectList/
 * TaskList) som tidligere bodde på denne siden er IKKE med i AgenticOS-hub-
 * fasiten (agencyos-agenticos-hub.html nevner ikke Kommando-modellene) —
 * /admin/workspace dekker oppgave-/prosjektoversikt i dag (Notion-synket
 * OppgaveCache/ProsjektCache, se rom-lista på hub-siden). Komponentene
 * (AdminAgentTeamV2, ProjectList, TaskList) er IKKE slettet — kun denne
 * ruten til dem. Flagget som åpent spørsmål til Anders i PR-en.
 */

import { redirect } from "next/navigation";

export const metadata = { title: "Agent-team · AgencyOS" };

export default function AdminAgentTeamRedirect() {
  redirect("/admin/agenticos");
}
