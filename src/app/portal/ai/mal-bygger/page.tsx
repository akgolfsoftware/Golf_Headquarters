/**
 * /portal/ai/mal-bygger — Trigger-side for AI mål-bygger-modalen.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { MalByggerLauncher } from "./mal-bygger-launcher";

export const dynamic = "force-dynamic";

export default async function MalByggerPage() {
  await requirePortalUser();
  return <MalByggerLauncher />;
}
