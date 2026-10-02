/** Historical computed SG has no model provenance and cannot be customer-facing. */
export function harVisbarSg(round: {
  sgSource: string | null;
  sgModelVersionId: string | null;
}): boolean {
  return round.sgSource === "manual" ||
    (typeof round.sgModelVersionId === "string" && round.sgModelVersionId.length > 0);
}
