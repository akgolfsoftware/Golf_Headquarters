/**
 * /portal/ai/foresla-drill — Trigger-side for AI foreslå drill-modalen.
 *
 * Modalen åpnes automatisk på mount. Lukking redirecter til /portal/planlegge.
 * Deep-link inn til denne ruta brukes f.eks. fra Workbench-strip og
 * Planlegge-tabbene.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { DrillModalLauncher } from "./drill-modal-launcher";

export const dynamic = "force-dynamic";

export default async function ForeslaDrillPage() {
  await requirePortalUser();
  return <DrillModalLauncher />;
}
