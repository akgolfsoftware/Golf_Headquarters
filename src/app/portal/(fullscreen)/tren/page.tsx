// Workbench Unified (TSX-portering av /public/design/workbench-unified.html).
// Plassert i `(fullscreen)`-gruppen for å unngå dobbel sidebar/topbar
// fra `PortalShell` — denne siden har sin egen chrome (sidebar + topbar
// + sticky footer) som matcher HTML-prototypen.
//
// Én vertikal flow med 7 seksjoner: sidebar + hero + årsplan-gantt
// + 3-pane workbench + mål-tracker + insight + trackman + sticky footer.
//
// URL: /portal/tren

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { WorkbenchClient } from "./workbench-client";

// Italic-accents på hero og insight-sitater bruker Inter Tight italic
// (font-display + italic), ikke en egen serif-font. Designsystem v2 tillater
// kun Inter, Inter Tight og JetBrains Mono.

export const metadata = {
  title: "Min workbench",
};

export default async function WorkbenchPage() {
  await requirePortalUser();
  return <WorkbenchClient />;
}
