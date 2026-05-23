/**
 * /portal/ai/foresla-turnering — Trigger-side for AI foreslå turnering-modalen.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { TurneringModalLauncher } from "./turnering-modal-launcher";

export const dynamic = "force-dynamic";

export default async function ForeslaTurneringPage() {
  await requirePortalUser();
  return <TurneringModalLauncher />;
}
