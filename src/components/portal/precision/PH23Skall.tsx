/**
 * PlayerHQ-skallet for booking-sidene (PH-23). Henter antall uleste varsler
 * for bjella og pakker innholdet i Precision Athletics-skallet.
 */
import type { ReactNode } from "react";
import { prisma } from "@/lib/prisma";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";

export async function PH23Skall({ userId, children }: { userId: string; children: ReactNode }) {
  const uleste = await prisma.notification.count({ where: { userId, readAt: null } });
  return <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>{children}</PlayerHQSkall>;
}
