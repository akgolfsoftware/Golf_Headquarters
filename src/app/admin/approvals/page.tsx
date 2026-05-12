import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ApprovalActions } from "./approval-actions";

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
};

export default async function Approvals() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const actions = await prisma.planAction.findMany({
    where: { status: "PENDING" },
    include: {
      user: { select: { id: true, name: true } },
      plan: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CoachHQ · Godkjenninger"
        titleItalic="Plan"
        titleTrail="-forslag"
        sub={`${actions.length} ventende forslag fra agentene.`}
      />

      {actions.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          titleItalic="Ingen ventende"
          titleTrail="forslag"
          sub="Forslag kommer typisk etter mandag-cron eller etter ny aktivitet."
        />
      ) : (
        <ul className="space-y-4">
          {actions.map((a) => {
            const sugg = a.suggestion as { forklaring?: string } | null;
            return (
              <li
                key={a.id}
                className="rounded-lg border border-border bg-card p-6"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-primary">
                    {ACTION_LABEL[a.actionType] ?? a.actionType}
                  </span>
                  <Link
                    href={`/admin/elever/${a.user.id}`}
                    className="text-sm font-medium text-foreground hover:text-primary"
                  >
                    {a.user.name}
                  </Link>
                  {a.plan && (
                    <Link
                      href={`/admin/plans/${a.plan.id}`}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      → {a.plan.name}
                    </Link>
                  )}
                  <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                    {a.agentName} ·{" "}
                    {a.createdAt.toLocaleDateString("nb-NO", {
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </span>
                </div>
                {sugg?.forklaring && (
                  <p className="mt-4 text-sm text-foreground">{sugg.forklaring}</p>
                )}
                <div className="mt-4">
                  <ApprovalActions actionId={a.id} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
