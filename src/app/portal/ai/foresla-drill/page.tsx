/**
 * /portal/ai/foresla-drill — pixel-perfekt port av Claude Design-modalen.
 * Tidligere wrappet en generisk modal-launcher; nå rendrer vi den faktiske
 * design-modalen som full-page (modal-backdrop dekker viewport).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AiForeslaDrillScreen } from "@/components/planlegge-v2/ai-foresla-drill-screen";

export const dynamic = "force-dynamic";

export default async function ForeslaDrillPage() {
  await requirePortalUser();
  return <AiForeslaDrillScreen />;
}
