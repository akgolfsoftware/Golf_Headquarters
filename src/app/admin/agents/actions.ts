"use server";

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { runPlanWatcher } from "@/lib/agents/plan-watcher";

export async function triggerPlanWatcherManually() {
  await requirePortalUser({ allow: ["ADMIN"] });
  const res = await runPlanWatcher();
  revalidatePath("/admin/agents");
  return res;
}
