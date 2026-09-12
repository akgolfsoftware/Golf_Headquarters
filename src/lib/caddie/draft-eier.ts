import type { Prisma } from "@/generated/prisma/client";

/**
 * CaddieDraft.userId er eieren som kan godkjenne eller avvise.
 * Kø, telling og utførelse skal bruke samme eierregel.
 */
export function eierCaddieDraft(draftUserId: string, viewerId: string): boolean {
  return draftUserId === viewerId;
}

export function caddieDraftKoWhere(viewerId: string): Prisma.CaddieDraftWhereInput {
  return { status: "PENDING", userId: viewerId };
}

export function caddieDraftAvgjortWhere(
  viewerId: string,
  status: "APPROVED" | "REJECTED",
  resolvedSince: Date,
): Prisma.CaddieDraftWhereInput {
  return { status, userId: viewerId, resolvedAt: { gte: resolvedSince } };
}
