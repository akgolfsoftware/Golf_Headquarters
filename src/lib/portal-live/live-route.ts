/**
 * Ren rute-mapping for live-økt (V2 / plan / WorkbenchSession).
 * Ingen Prisma — enhetstestes uten DB.
 */

export type LiveSessionKind = "v2" | "plan" | "wb";

export type ResolvedLiveSession = {
  kind: LiveSessionKind;
  id: string;
  status: string;
  playerId: string;
  coachId: string | null;
  hostId: string | null;
  isParticipant: boolean;
};

export type LiveRoute =
  | { type: "redirect"; href: string }
  | { type: "notfound" }
  | { type: "forbidden" };

export function canAccessResolved(
  resolved: ResolvedLiveSession,
  userId: string,
  isCoach: boolean,
): boolean {
  if (isCoach) return true;
  if (resolved.playerId === userId) return true;
  if (resolved.kind === "v2") {
    return (
      resolved.coachId === userId ||
      resolved.hostId === userId ||
      resolved.isParticipant
    );
  }
  return false;
}

/** Status → live-sti. WorkbenchSession eies av spilleren: aldri notFound her. */
export function liveHrefForStatus(
  kind: LiveSessionKind,
  status: string,
  sessionId: string,
): string {
  if (kind === "v2") {
    if (status === "COMPLETED") return `/portal/live/${sessionId}/summary`;
    if (status === "IN_PROGRESS") return `/portal/live/${sessionId}/active`;
    if (status === "CANCELLED" || status === "SKIPPED") {
      return "/portal/planlegge/workbench";
    }
    return `/portal/live/${sessionId}/brief`;
  }

  if (status === "COMPLETED") return `/portal/live/${sessionId}/summary`;
  if (status === "ACTIVE" || status === "PAUSED" || status === "IN_PROGRESS") {
    return `/portal/live/${sessionId}/tapper`;
  }
  if (
    status === "CANCELLED" ||
    status === "SKIPPED" ||
    status === "ABANDONED" ||
    status === "DRAFT"
  ) {
    return "/portal/planlegge/workbench";
  }
  return `/portal/live/${sessionId}/brief`;
}

export function liveRouteForResolved(
  resolved: ResolvedLiveSession | null,
  viewer: { userId: string; isCoach: boolean },
): LiveRoute {
  if (!resolved) return { type: "notfound" };
  if (!canAccessResolved(resolved, viewer.userId, viewer.isCoach)) {
    return { type: "forbidden" };
  }
  return {
    type: "redirect",
    href: liveHrefForStatus(resolved.kind, resolved.status, resolved.id),
  };
}
