/**
 * /portal/ai/foresla-turnering — pixel-perfekt port av Claude Design-modalen.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AiForeslaTurneringScreen } from "@/components/planlegge-v2/ai-foresla-turnering-screen";

export const dynamic = "force-dynamic";

export default async function ForeslaTurneringPage() {
  await requirePortalUser();
  return <AiForeslaTurneringScreen />;
}
