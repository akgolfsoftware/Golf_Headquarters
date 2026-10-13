/** Bare publiserte spillerkopier kan få coachingopptak. Gruppeoriginalen er ingen person. */
export function erWorkbenchOpptakskilde(økt: {
  id: string; isTemplate: boolean; hiddenByPlayer: boolean;
  needsPlayerApproval: boolean; status: string;
}): boolean {
  return !økt.isTemplate && !økt.hiddenByPlayer && !økt.needsPlayerApproval
    && ["PUBLISHED", "IN_PROGRESS", "COMPLETED"].includes(økt.status)
    && !/^wb-group-[a-f0-9]{64}$/.test(økt.id);
}
