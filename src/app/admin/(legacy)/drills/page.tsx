/**
 * Gammel frittstående drill-bibliotek-rute. Pensjonert (T6, 27.08.2026):
 * kilder til en økt velges nå i Workbench sitt Kilder-panel
 * (src/components/workbench/SourcesPanel.tsx, PR #601 — ekte loadSources-data,
 * drag inn i uken), ikke på en egen side. Redirecter til Planlegge-hub'en,
 * som er den ærlige inngangen til Workbench (spillervalg → uke).
 */

import { permanentRedirect } from "next/navigation";

export default function DrillBibliotekRedirect() {
  permanentRedirect("/admin/planlegge");
}
