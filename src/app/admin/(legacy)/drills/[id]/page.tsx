/**
 * Gammel drill-detaljside. Pensjonert (T6, 27.08.2026) sammen med resten av
 * drill-biblioteket — se ../page.tsx. Detaljvisning/redigering av en kilde
 * skjer nå i Workbench sitt Kilder-panel. Ingen enkelt-id å lande på utenfor
 * den konteksten, så vi redirecter til Planlegge-hub'en.
 *
 * Fra 29.09.2026 sender den til Øvelser-fanen i Plan-hub (AG-14), der coach
 * oppretter og endrer øvelser i øvelsesbanken.
 */

import { permanentRedirect } from "next/navigation";

export default function DrillDetaljRedirect() {
  permanentRedirect("/admin/plan?fane=ovelser");
}
