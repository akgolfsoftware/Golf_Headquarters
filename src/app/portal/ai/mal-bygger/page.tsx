/**
 * /portal/ai/mal-bygger — pixel-perfekt port av Claude Design-modalen.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AiMalByggerScreen } from "@/components/planlegge-v2/ai-mal-bygger-screen";

export const dynamic = "force-dynamic";

export default async function MalByggerPage() {
  await requirePortalUser();
  return <AiMalByggerScreen />;
}
