"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import type { ApprovalStatus } from "@/generated/prisma/client";

export async function setApprovalStatus(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "COACH")) {
    redirect("/auth/login");
  }
  const route = formData.get("route") as string;
  const status = formData.get("status") as ApprovalStatus;
  const designPath = (formData.get("designPath") as string) || null;
  const notes = (formData.get("notes") as string) || null;

  if (!route || !status) {
    throw new Error("route og status er påkrevd");
  }

  await prisma.pageApproval.upsert({
    where: { route },
    create: {
      route,
      status,
      designPath: designPath ?? undefined,
      notes: notes ?? undefined,
      reviewedBy: user.name ?? user.email ?? user.id,
      reviewedAt: new Date(),
    },
    update: {
      status,
      designPath: designPath ?? undefined,
      notes: notes ?? undefined,
      reviewedBy: user.name ?? user.email ?? user.id,
      reviewedAt: new Date(),
    },
  });

  revalidatePath("/admin/godkjenn-portal");
}
