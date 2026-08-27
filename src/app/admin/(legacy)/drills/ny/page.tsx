/**
 * Gammel "opprett drill"-side. Pensjonert (T6, 27.08.2026, Anders'
 * beslutning i docs/natt/D-LYS-OG-5T-BESLUTNING.md §2.1 rad 9/§2.3) —
 * overlapper Loop 2S sin drill-editor i Workbench
 * (src/components/workbench/DrillListEditor.tsx). Redirecter til
 * Planlegge-hub'en.
 */

import { permanentRedirect } from "next/navigation";

export default function NyDrillRedirect() {
  permanentRedirect("/admin/planlegge");
}
