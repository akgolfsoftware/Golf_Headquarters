/**
 * Gammel "rediger drill"-side. Pensjonert (T6, 27.08.2026) sammen med resten
 * av drill-biblioteket (se src/app/admin/(legacy)/drills/) — overlapper
 * Workbench sin drill-editor (src/components/workbench/DrillListEditor.tsx).
 * Redirecter til Planlegge-hub'en.
 */

import { permanentRedirect } from "next/navigation";

export default function DrillRedigerRedirect() {
  permanentRedirect("/admin/planlegge");
}
