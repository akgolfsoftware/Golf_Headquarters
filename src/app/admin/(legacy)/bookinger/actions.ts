"use server";

/**
 * Server-actions for booking-svar i AgencyOS Bookinger-tabellen
 * (fasit BookingsScreen: «bekreft eller avvis i raden»).
 * PENDING → CONFIRMED (bekreft) eller CANCELLED (avvis). updateMany med
 * status-guard så allerede behandlede bookinger ikke endres.
 */

import { revalidatePath } from "next/cache";
import { requireCoachActionUser } from "@/lib/auth/action-guards";
import { prisma } from "@/lib/prisma";


export async function bekreftBooking(id: string) {
  await requireCoachActionUser();
  await prisma.booking.updateMany({
    where: { id, status: "PENDING" },
    data: { status: "CONFIRMED" },
  });
  revalidatePath("/admin/bookinger");
}

export async function avvisBooking(id: string) {
  await requireCoachActionUser();
  await prisma.booking.updateMany({
    where: { id, status: "PENDING" },
    data: { status: "CANCELLED" },
  });
  revalidatePath("/admin/bookinger");
}

export async function bekreftAllePending() {
  await requireCoachActionUser();
  await prisma.booking.updateMany({
    where: { status: "PENDING" },
    data: { status: "CONFIRMED" },
  });
  revalidatePath("/admin/bookinger");
}

export async function avvisAllePending() {
  await requireCoachActionUser();
  await prisma.booking.updateMany({
    where: { status: "PENDING" },
    data: { status: "CANCELLED" },
  });
  revalidatePath("/admin/bookinger");
}

export async function markerAlleConfirmedSomCompleted() {
  await requireCoachActionUser();
  await prisma.booking.updateMany({
    where: { status: "CONFIRMED" },
    data: { status: "COMPLETED" },
  });
  revalidatePath("/admin/bookinger");
}
