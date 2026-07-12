/**
 * v2-preview: AgencyOS Godkjenninger (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver AdminShell — kun root-layout — så V2Shell leverer
 * all chrome (IkonRail/BunnNav) i mørk v2-scope.
 *
 * Auth + data følger den ekte /admin/godkjenninger-flaten: samme
 * requirePortalUser-guard (ADMIN/COACH) og samme Prisma-loader (PENDING
 * PlanAction + zod-validert suggestion + buildDiffPreview). Mapper til
 * AdminGodkjenningerV2Data (ærlige tomrom, ingen fabrikerte tall).
 *
 * Server component.
 */

import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { handlingstypeLabel } from "@/lib/labels/handlingstyper";
import { prisma } from "@/lib/prisma";
import { computeDelta, type PlanContext } from "@/lib/agents/plan-action-executor";
import { LOW_RISK_ACTION_TYPES } from "@/lib/training/skills";
import { koTelling } from "@/lib/admin/ko-telling";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import {
  AdminGodkjenningerV2,
  type AdminGodkjenningerV2Data,
  type AdminGodkjenningV2Row,
} from "@/components/admin/v2/AdminGodkjenningerV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Godkjenninger · AgencyOS (v2)" };


function erHaster(actionType: string): boolean {
  return (
    actionType === "WITHDRAW" ||
    actionType.includes("ESCALATION") ||
    actionType === "TAPER_ENGAGE" ||
    actionType === "PERIOD_SWITCH" ||
    actionType === "SESSION_SWAP"
  );
}

const suggestionSchema = z
  .object({
    title: z.string().optional(),
    tittel: z.string().optional(),
    forklaring: z.string().optional(),
    detail: z.string().optional(),
    signalSnapshot: z
      .object({
        kind: z.string(),
        value: z.union([z.number(), z.string()]).optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough()
  .nullable();

function nårTekst(d: Date): string {
  const dager = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (dager === 0)
    return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
  if (dager === 1) return "i går";
  return `${dager} dg siden`;
}

async function buildDiffPreview(
  actionType: string,
  suggestion: unknown,
  userId: string,
  planId: string | null,
): Promise<string | null> {
  // B2: churn-melding er ikke en plan-endring — forhåndsvis meldingsutkastet.
  if (actionType === "CHURN_MESSAGE") {
    const m = z
      .object({ melding: z.object({ subject: z.string(), body: z.string() }) })
      .safeParse(suggestion);
    return m.success
      ? `Sender melding: «${m.data.melding.subject}» — ${m.data.melding.body.slice(0, 120)}…`
      : null;
  }
  try {
    const plan =
      planId != null
        ? await prisma.trainingPlan.findUnique({ where: { id: planId } })
        : await prisma.trainingPlan.findFirst({
            where: { userId, isActive: true },
            orderBy: { updatedAt: "desc" },
          });
    if (!plan) return null;

    const now = new Date();
    const sessions = await prisma.trainingPlanSession.findMany({
      where: {
        planId: plan.id,
        scheduledAt: { gte: now },
        status: { in: ["PLANNED", "ACTIVE", "PAUSED"] },
      },
      orderBy: { scheduledAt: "asc" },
      select: {
        id: true,
        pyramidArea: true,
        skillArea: true,
        scheduledAt: true,
        status: true,
        durationMin: true,
        title: true,
      },
    });

    const ukeSlutt = new Date(now);
    ukeSlutt.setDate(ukeSlutt.getDate() + 7);
    const ctx: PlanContext = {
      planId: plan.id,
      userId,
      futureSessions: sessions,
      planlagteOkterNesteUke: sessions.filter(
        (s) => s.scheduledAt <= ukeSlutt && s.status === "PLANNED",
      ).length,
    };

    const delta = computeDelta(actionType, suggestion, ctx);
    const parts: string[] = [];
    if (delta.sessionsToAdd.length > 0) {
      parts.push(
        `+${delta.sessionsToAdd.length} økt(er): ${delta.sessionsToAdd.map((s) => s.title).join(", ")}`,
      );
    }
    if (delta.sessionsToRemove.length > 0) {
      parts.push(`−${delta.sessionsToRemove.length} planlagt(e) økt(er)`);
    }
    if (delta.sessionsToModify.length > 0) {
      parts.push(`~${delta.sessionsToModify.length} økt(er) endres`);
    }
    if (delta.planMeta?.periodNote) {
      parts.push(`Periode → ${delta.planMeta.periodNote}`);
    }
    return parts.length > 0 ? parts.join(" · ") : delta.summary;
  } catch {
    return null;
  }
}

export default async function V2AdminGodkjenningerPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  // A1: ÉN kø — fire kilder (PlanAction + CaddieDraft + SessionRequest;
  // e-postutkast bor i innboks-epost-flaten med egen godkjenning der).
  const [actions, caddieDrafts, sessionRequests, ko] = await Promise.all([
    prisma.planAction.findMany({
      where: {
        status: "PENDING",
        OR: [{ coachId: user.id }, { coachId: null }],
      },
      include: {
        user: { select: { id: true, name: true } },
        plan: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.caddieDraft.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { id: true, userId: true, previewText: true, toolName: true, createdAt: true },
    }),
    prisma.sessionRequest.findMany({
      where: { status: "PENDING", OR: [{ coachId: user.id }, { coachId: null }] },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { id: true, userId: true, reason: true, preferredDate: true, preferredTime: true, createdAt: true, user: { select: { name: true } } },
    }).catch(() => []),
    // FUNN 4: kanonisk kø-telling — samme tall i hodet som på innboks/varsler.
    koTelling(user.id),
  ]);
  const caddieBrukere = new Map(
    (await prisma.user.findMany({
      where: { id: { in: caddieDrafts.map((d) => d.userId) } },
      select: { id: true, name: true },
    })).map((u) => [u.id, u.name] as const),
  );

  const lowRiskCount = actions.filter((a) =>
    LOW_RISK_ACTION_TYPES.has(a.actionType),
  ).length;

  const rows: AdminGodkjenningV2Row[] = await Promise.all(
    actions.map(async (a) => {
      const parsed = suggestionSchema.safeParse(a.suggestion);
      const sugg = parsed.success ? parsed.data : null;
      const diffPreview = await buildDiffPreview(
        a.actionType,
        a.suggestion,
        a.userId,
        a.planId,
      );
      return {
        id: a.id,
        actionType: a.actionType,
        playerId: a.user.id,
        who: a.user.name ?? "Spiller",
        title:
          sugg?.title ??
          sugg?.tittel ??
          handlingstypeLabel(a.actionType),
        detail:
          sugg?.forklaring ??
          sugg?.detail ??
          (a.plan ? `Gjelder planen «${a.plan.name}».` : ""),
        signalKind: sugg?.signalSnapshot?.kind ?? null,
        signalValue:
          sugg?.signalSnapshot?.value != null
            ? String(sugg.signalSnapshot.value)
            : null,
        diffPreview,
        when: nårTekst(a.createdAt),
        urgent: erHaster(a.actionType),
        lowRisk: LOW_RISK_ACTION_TYPES.has(a.actionType),
      };
    }),
  );

  // A1: caddie- og forespørsel-rader inn i samme kø (kilde-chip skiller).
  const caddieRows: AdminGodkjenningV2Row[] = caddieDrafts.map((d) => ({
    id: d.id,
    actionType: "CADDIE_DRAFT",
    playerId: d.userId,
    who: caddieBrukere.get(d.userId) ?? "Spiller",
    title: `Caddie-utkast · ${d.toolName}`,
    detail: d.previewText.slice(0, 200),
    signalKind: null,
    signalValue: null,
    diffPreview: null,
    when: nårTekst(d.createdAt),
    urgent: false,
    lowRisk: false,
    kilde: "caddie" as const,
    eksternHref: "/admin/agencyos/caddie/dashbord",
  }));
  const requestRows: AdminGodkjenningV2Row[] = sessionRequests.map((r) => ({
    id: r.id,
    actionType: "SESSION_REQUEST",
    playerId: r.userId,
    who: r.user?.name ?? "Spiller",
    title: "Økt-forespørsel",
    detail: [r.reason, r.preferredDate ? r.preferredDate.toLocaleDateString("nb-NO") : null, r.preferredTime].filter(Boolean).join(" · ") || "Uten detaljer",
    signalKind: null,
    signalValue: null,
    diffPreview: null,
    when: nårTekst(r.createdAt),
    urgent: false,
    lowRisk: false,
    kilde: "forespørsel" as const,
    eksternHref: "/admin/foresporsler",
  }));
  const alleRows = [...rows.map((r) => ({ ...r, kilde: "agent" as const })), ...caddieRows, ...requestRows];

  const data: AdminGodkjenningerV2Data = { rows: alleRows, lowRiskCount, totalt: ko.totalt };

  return (
    <V2Shell aktiv="innboks" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <AdminGodkjenningerV2 data={data} />
    </V2Shell>
  );
}
