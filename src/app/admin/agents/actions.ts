"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { runPlanWatcher } from "@/lib/agents/plan-watcher";

export async function triggerPlanWatcherManually() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("forbidden");
  }
  const res = await runPlanWatcher();
  revalidatePath("/admin/agents");
  return res;
}
