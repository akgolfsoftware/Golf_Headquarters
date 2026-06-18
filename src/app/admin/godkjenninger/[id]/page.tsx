/**
 * AgencyOS — Godkjenning detaljvisning
 *
 * Detalj-side for én PlanAction. Coach kan godkjenne, avslå med begrunnelse,
 * be om mer info, eller åpne meldingstråd.
 *
 * Viser kun ekte felter fra PlanAction. Finnes ingen handling med gitt id,
 * vises en ærlig "ikke funnet"-tilstand (ingen oppdiktet sammenligning,
 * AI-begrunnelse eller spiller-sitat).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { ApprovalDetailClient } from "@/app/admin/approvals/[id]/approval-detail-client";
import { ApprovalNotFound } from "@/app/admin/approvals/[id]/approval-detail-client";

export const dynamic = "force-dynamic";

export type ApprovalDetail = {
  id: string;
  actionType: string;
  agentName: string;
  status: string;
  createdAt: Date;
  player: {
    id: string;
    name: string;
    initials: string;
  };
  title: {
    lead: string;
    trail?: string;
  };
};

const ACTION_LABEL: Record<string, string> = {
  PYRAMID_ADJUST: "Juster pyramide",
  SESSION_ADD: "Legg til økt",
  SESSION_REMOVE: "Fjern økt",
  INTENSITY_ADJUST: "Juster intensitet",
  TAPER_ENGAGE: "Start taper",
  WITHDRAW: "Trekk fra",
  DRILL_SUGGEST: "Drill-forslag",
  TEST_SCHEDULE: "Planlegg test",
  PEER_COMPARE: "Sammenlign",
  RECOVERY_ADD: "Legg til hvile",
  ESCALATION: "Eskalering",
  DELOAD: "Pauseuke",
  TRAINING_GAP: "Treningsgap",
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default async function GodkjenningDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const action = await prisma.planAction.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  if (!action) {
    return <ApprovalNotFound />;
  }

  const suggestion =
    action.suggestion && typeof action.suggestion === "object"
      ? (action.suggestion as Record<string, unknown>)
      : {};
  const forklaring =
    typeof suggestion.forklaring === "string"
      ? suggestion.forklaring
      : ACTION_LABEL[action.actionType] ?? action.actionType;

  const detail: ApprovalDetail = {
    id: action.id,
    actionType: action.actionType,
    agentName: action.agentName,
    status: action.status,
    createdAt: action.createdAt,
    player: {
      id: action.user.id,
      name: action.user.name,
      initials: initials(action.user.name),
    },
    title: {
      lead: forklaring,
      trail: ` · ${action.user.name.split(" ")[0]}`,
    },
  };

  return <ApprovalDetailClient detail={detail} />;
}
