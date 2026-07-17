"use server";

// B40 §3 — Standard/Pro Workbench-modus. Egen bryter, uavhengig av B37s
// dybdemodus (nivaa/ovet/elite). Lagres som wbMode i User.preferences,
// samme mønster som setSgHubMode.

import { revalidatePath } from "next/cache";
import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { prisma } from "@/lib/prisma";
import { lesRaaPreferences } from "@/lib/preferences";

export async function setWbMode(mode: "standard" | "pro") {
  const user = await requireConsentingUser();

  const existing = lesRaaPreferences(user);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      preferences: {
        ...existing,
        wbMode: mode,
      },
    },
  });

  revalidatePath("/portal/planlegge/workbench");
  revalidatePath("/admin/spillere", "layout");
}
