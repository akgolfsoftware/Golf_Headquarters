/**
 * AgencyOS — Godkjenninger (INNBOKS · GODKJENNINGER)
 *
 * Port av fasit `agencyos-app/flows.jsx` → ApprovalsScreen (mørkt, desktop).
 * Datakilde: PlanAction (PENDING) — plan-endringer, økt-bytter og påmeldinger
 * som venter på coach. Godkjenn/Avvis via eksisterende agent-actions.
 * Suggestion-JSON valideres med zod (CLAUDE.md-regel for JSON-blobs).
 */

import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AgAvatar, AgChip, AgPage, AgPageHead } from "@/components/admin/agencyos/ui";
import { ApprovalActions } from "@/app/admin/approvals/approval-actions";

const ACTION_LABEL: Record<string, string> = {
  PYRAMID_ADJUST: "Juster pyramide",
  SESSION_ADD: "Legg til økt",
  SESSION_REMOVE: "Fjern økt",
  SESSION_SWAP: "Bytte økt",
  INTENSITY_ADJUST: "Juster intensitet",
  TAPER_ENGAGE: "Start taper",
  WITHDRAW: "Trekk fra",
  DRILL_SUGGEST: "Drill-forslag",
  TEST_SCHEDULE: "Planlegg test",
  PEER_COMPARE: "Sammenlign",
  RECOVERY_ADD: "Legg til hvile",
  ESCALATION: "Eskalering",
  DELOAD: "Pauseuke",
  TOURNAMENT_ENTRY: "Turneringspåmelding",
  PLAN_CHANGE: "Plan-endring",
};

// Haster-flagg: handlinger som påvirker kommende konkurranse/uke direkte.
function erHaster(actionType: string): boolean {
  return (
    actionType === "WITHDRAW" ||
    actionType.includes("ESCALATION") ||
    actionType === "TAPER_ENGAGE" ||
    actionType === "SESSION_SWAP"
  );
}

const suggestionSchema = z
  .object({
    title: z.string().optional(),
    tittel: z.string().optional(),
    forklaring: z.string().optional(),
    detail: z.string().optional(),
  })
  .nullable();

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function nårTekst(d: Date): string {
  const dager = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (dager === 0)
    return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
  if (dager === 1) return "i går";
  return `${dager} dg siden`;
}

export default async function Godkjenninger() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const actions = await prisma.planAction.findMany({
    where: { status: "PENDING" },
    include: {
      user: { select: { id: true, name: true } },
      plan: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = actions.map((a) => {
    const parsed = suggestionSchema.safeParse(a.suggestion);
    const sugg = parsed.success ? parsed.data : null;
    return {
      id: a.id,
      playerId: a.user.id,
      who: a.user.name,
      title: sugg?.title ?? sugg?.tittel ?? ACTION_LABEL[a.actionType] ?? a.actionType,
      detail: sugg?.forklaring ?? sugg?.detail ?? (a.plan ? `Gjelder planen «${a.plan.name}».` : ""),
      when: nårTekst(a.createdAt),
      urgent: erHaster(a.actionType),
    };
  });

  return (
    <AgPage>
      <AgPageHead
        eyebrow="Innboks · Godkjenninger"
        title={`${rows.length} venter`}
        italic="på deg."
        lead="Plan-endringer, økt-bytter og påmeldinger spillerne har foreslått. Godkjenn eller avvis."
      />
      <div className="flex max-w-[820px] flex-col gap-[10px]">
        {rows.length === 0 && (
          <div className="rounded-xl border border-border bg-card px-[18px] py-10 text-center text-sm text-muted-foreground">
            Ingenting venter på deg — alt er behandlet.
          </div>
        )}
        {rows.map((m) => (
          <div
            key={m.id}
            className="rounded-xl border border-border bg-card p-4"
            style={m.urgent ? { borderLeft: "3px solid hsl(var(--accent))" } : undefined}
          >
            <div className="grid grid-cols-[40px_1fr] items-start gap-[14px]">
              <AgAvatar initials={initials(m.who)} size={40} tone={m.urgent ? "pri" : "neu"} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-bold tracking-[-0.01em] text-foreground">
                    {m.title}
                  </span>
                  {m.urgent && <AgChip tone="lime">Haster</AgChip>}
                </div>
                <div className="mb-[6px] mt-[2px] font-mono text-[10px] text-muted-foreground">
                  {m.who} · {m.when}
                </div>
                {m.detail && (
                  <div className="text-[13px] leading-normal text-foreground">{m.detail}</div>
                )}
                <ApprovalActions actionId={m.id} playerId={m.playerId} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </AgPage>
  );
}
