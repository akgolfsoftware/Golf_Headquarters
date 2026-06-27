"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import type { DesignKoblingStatus } from "@/generated/prisma/client";

async function requireAdmin() {
  const user = await getCurrentUser();
  // Portal-godkjenning er ADMIN-only (forretnings-/intern-QA — ikke golf-coaching).
  if (!user || user.role !== "ADMIN") {
    redirect("/auth/login");
  }
  return user;
}

export async function setKoblingStatus(
  id: string,
  status: DesignKoblingStatus,
) {
  const user = await requireAdmin();
  await prisma.designKobling.update({
    where: { id },
    data: {
      status,
      approvedBy: status === "APPROVED" ? (user.name ?? user.email) : null,
      approvedAt: status === "APPROVED" ? new Date() : null,
    },
  });
  revalidatePath("/admin/godkjenn-portal/koblinger");
  revalidatePath(`/admin/godkjenn-portal/koblinger/${id}`);
}

export async function setConfirmedRoute(id: string, route: string | null) {
  await requireAdmin();
  await prisma.designKobling.update({
    where: { id },
    data: {
      confirmedRoute: route,
      status: route ? "MAPPED" : "UNMAPPED",
    },
  });
  revalidatePath("/admin/godkjenn-portal/koblinger");
  revalidatePath(`/admin/godkjenn-portal/koblinger/${id}`);
}

export async function setNotes(id: string, notes: string) {
  await requireAdmin();
  await prisma.designKobling.update({
    where: { id },
    data: { notes: notes || null },
  });
  revalidatePath(`/admin/godkjenn-portal/koblinger/${id}`);
}

export async function setButtonTarget(
  koblingId: string,
  buttonIndex: number,
  targetRoute: string | null,
) {
  await requireAdmin();
  const kobling = await prisma.designKobling.findUnique({
    where: { id: koblingId },
  });
  if (!kobling) throw new Error("Kobling ikke funnet");

  const buttons = Array.isArray(kobling.buttons)
    ? [...(kobling.buttons as Array<Record<string, unknown>>)]
    : [];

  if (!buttons[buttonIndex]) throw new Error("Knapp-indeks ugyldig");
  buttons[buttonIndex] = {
    ...buttons[buttonIndex],
    targetRoute: targetRoute ?? undefined,
  };

  await prisma.designKobling.update({
    where: { id: koblingId },
    data: { buttons: buttons as never },
  });
  revalidatePath(`/admin/godkjenn-portal/koblinger/${koblingId}`);
}
