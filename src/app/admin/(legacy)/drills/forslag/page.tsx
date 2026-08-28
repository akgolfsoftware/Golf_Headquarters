/**
 * Gammel AI drill-forslag-side. Pensjonert (T6, 27.08.2026) — AI-forslag
 * samles nå i AgenticOS-køen (docs/natt/D-LYS-OG-5T-BESLUTNING.md §0.5).
 * Redirecter dit.
 */

import { permanentRedirect } from "next/navigation";

export default function DrillForslagRedirect() {
  permanentRedirect("/admin/godkjenninger");
}
