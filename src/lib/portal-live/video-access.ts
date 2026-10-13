export type LiveVideoSource = {
  kind: "plan" | "v2" | "workbench"; ownerId: string | null;
  row: { status: string; drills: readonly { id: string }[]; isTemplate?: boolean; hiddenByPlayer?: boolean;
    needsPlayerApproval?: boolean; approvalStatus?: string | null; participants?: readonly { userId: string; status: string }[] };
};
/** Samme eier-, øvelse- og gjennomføringsgrense ved ticket og bekreftet kobling. */
export function canAttachLiveVideo(source: LiveVideoSource, userId: string, drillId: string): boolean {
  const own = source.ownerId === userId || source.kind === "v2" && source.row.participants?.some(p => p.userId === userId && ["ACCEPTED", "ATTENDED"].includes(p.status));
  const active = source.kind === "workbench" ? source.row.status === "IN_PROGRESS" && source.row.isTemplate === false && source.row.hiddenByPlayer === false
    && source.row.needsPlayerApproval === false && source.row.approvalStatus !== "REJECTED"
    : source.kind === "v2" ? source.row.status === "IN_PROGRESS" : ["ACTIVE", "PAUSED"].includes(source.row.status);
  return !!own && active && source.row.drills.some(d => d.id === drillId);
}
