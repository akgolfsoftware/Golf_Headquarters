// Midlertidig preview-rute for Workbench (Bolk 1). Lar oss se den nye
// workbench-flaten på desktop uten innlogging. FJERNES når workbench kobles
// inn på de ekte rutene (/portal/planlegge/workbench, /admin/spillere/[id]/workbench).
import { Workbench } from "@/components/workbench/workbench";

export const dynamic = "force-static";

export default function WorkbenchPreviewPage() {
  return <Workbench role="player" />;
}
