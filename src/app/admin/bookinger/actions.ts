"use server";

/**
 * Server-actions for booking-svar i AgencyOS Bookinger-tabellen
 * (fasit BookingsScreen: «bekreft eller avvis i raden»).
 * PENDING → CONFIRMED (bekreft) eller CANCELLED (avvis). updateMany med
 * status-guard så allerede behandlede bookinger ikke endres.
 */

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";

async function krevCoach() {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");
  if (user.role !== "COACH" && user.role !== "ADMIN") throw new Error("forbidden");
  return user;
}

export async function bekreftBooking(id: string) {
  await krevCoach();
  await prisma.booking.updateMany({
    where: { id, status: "PENDING" },
    data: { status: "CONFIRMED" },
  });
  revalidatePath("/admin/bookinger");
}

export async function avvisBooking(id: string) {
  await krevCoach();
  await prisma.booking.updateMany({
    where: { id, status: "PENDING" },
    data: { status: "CANCELLED" },
  });
  revalidatePath("/admin/bookinger");
}
