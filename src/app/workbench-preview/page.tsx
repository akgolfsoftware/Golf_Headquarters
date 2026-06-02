// Midlertidig preview-rute for Workbench (Bolk 1+2). Lar oss se den nye
// workbench-flaten på desktop uten innlogging. FJERNES når workbench kobles
// inn på de ekte rutene (/portal/planlegge/workbench, /admin/spillere/[id]/workbench).
//
// Query-styrt for screenshots:
//   ?mode=UKE | DAG | KANBAN | DASHBOARD   (default UKE)
//   ?role=player | coach                    (default player)
// Eks: /workbench-preview?mode=KANBAN · ?mode=DASHBOARD · ?role=coach
import { Workbench, type Mode, type Role } from "@/components/workbench/workbench";

const MODES: Mode[] = ["UKE", "DAG", "KANBAN", "DASHBOARD"];
const ROLES: Role[] = ["player", "coach"];

export default async function WorkbenchPreviewPage({
  searchParams,
}: {
  // Next.js 16: searchParams is a Promise.
  searchParams: Promise<{ mode?: string; role?: string }>;
}) {
  const sp = await searchParams;
  const mode = MODES.includes(sp.mode as Mode) ? (sp.mode as Mode) : "UKE";
  const role = ROLES.includes(sp.role as Role) ? (sp.role as Role) : "player";

  return <Workbench role={role} initialMode={mode} />;
}
