// Midlertidig preview-rute for Workbench (Bolk 1+2+3). Lar oss se den nye
// workbench-flaten på desktop uten innlogging. FJERNES når workbench kobles
// inn på de ekte rutene (/portal/planlegge/workbench, /admin/spillere/[id]/workbench).
//
// Query-styrt for screenshots:
//   ?view=A | B                              (default A · Kalender)
//   ?mode=UKE | DAG | KANBAN | DASHBOARD      (A-moduser)
//        | TIDSLINJE | KANBAN | DASHBOARD     (B-moduser)
//   ?role=player | coach                      (default player)
//   ?drill=1                                  (B · TIDSLINJE: open drill-modus overlay)
// Eks:
//   /workbench-preview?view=B                 (B · tidslinje)
//   /workbench-preview?view=B&mode=KANBAN
//   /workbench-preview?view=B&mode=DASHBOARD
//   /workbench-preview?view=B&role=coach      (B-coach · coach-bjelle)
//   /workbench-preview?view=B&drill=1         (B · drill-modus åpen)
//   /workbench-preview?mode=KANBAN · ?mode=DASHBOARD · ?role=coach
import { Workbench, type Mode, type Role, type View } from "@/components/workbench/workbench";

const MODES: Mode[] = ["UKE", "DAG", "KANBAN", "DASHBOARD", "TIDSLINJE"];
const ROLES: Role[] = ["player", "coach"];
const VIEWS: View[] = ["A", "B"];

export default async function WorkbenchPreviewPage({
  searchParams,
}: {
  // Next.js 16: searchParams is a Promise.
  searchParams: Promise<{ mode?: string; role?: string; view?: string; drill?: string }>;
}) {
  const sp = await searchParams;
  const role = ROLES.includes(sp.role as Role) ? (sp.role as Role) : "player";
  const view = VIEWS.includes(sp.view as View) ? (sp.view as View) : undefined;
  // Only pass initialMode when explicitly given, so Workbench can pick the
  // right per-view default (UKE for A, TIDSLINJE for B).
  const mode = MODES.includes(sp.mode as Mode) ? (sp.mode as Mode) : undefined;
  const drill = sp.drill === "1";

  return <Workbench role={role} initialMode={mode} initialView={view} initialDrill={drill} />;
}
