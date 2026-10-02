/** Historical computed SG has no model provenance and cannot be customer-facing. */
export function harVisbarSg(round: {
  sgSource: string | null;
  sgModelVersionId: string | null;
}, activeModelVersionId: string | null = null): boolean {
  return round.sgSource === "manual" ||
    (typeof round.sgModelVersionId === "string" && round.sgModelVersionId.length > 0 &&
      round.sgModelVersionId === activeModelVersionId);
}

/** Prisma filter that keeps manual values and exactly one active model version. */
export function synligSgWhere(activeModelVersionId: string | null) {
  return {
    OR: [
      { sgSource: "manual" },
      ...(activeModelVersionId ? [{ sgModelVersionId: activeModelVersionId }] : []),
    ],
  };
}
