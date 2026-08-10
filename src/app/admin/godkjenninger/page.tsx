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

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { handlingstypeLabel } from "@/lib/labels/handlingstyper";
import { prisma } from "@/lib/prisma";
import { LOW_RISK_ACTION_TYPES } from "@/lib/training/skills";
import { koTelling } from "@/lib/admin/ko-telling";
import {
  buildDiffPreview,
  erHasterHandling,
  narTekst,
  planActionSuggestionSchema,
} from "@/lib/admin/plan-action-diff";
import { provenanceLesbarTekst } from "@/lib/agents/provenance";
import { caddieDraftTittel } from "@/lib/caddie/draft-labels";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { KoHubNav } from "@/components/admin/v2/agency-hub-subnav";
import {
  AdminGodkjenningerV2,
  type AdminGodkjenningerV2Data,
  type AdminGodkjenningV2Row,
} from "@/components/admin/v2/AdminGodkjenningerV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Godkjenninger · AgencyOS (v2)" };


export default async function V2AdminGodkjenningerPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  // A1: ÉN kø — fire kilder (PlanAction + CaddieDraft + SessionRequest;
  // e-postutkast bor i innboks-epost-flaten med egen godkjenning der).
  const spillerScope = coachScopedPlayerWhere(user);

  const [actions, caddieDraftsRaw, sessionRequests, ko, mineSpillere] = await Promise.all([
    prisma.planAction.findMany({
      where: {
        status: "PENDING",
        OR: [{ coachId: user.id }, { coachId: null }],
        user: spillerScope,
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
      take: 50,
      select: { id: true, userId: true, previewText: true, toolName: true, toolInput: true, createdAt: true },
    }),
    prisma.sessionRequest.findMany({
      where: {
        status: "PENDING",
        OR: [{ coachId: user.id }, { coachId: null }],
        user: spillerScope,
      },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { id: true, userId: true, reason: true, preferredDate: true, preferredTime: true, createdAt: true, user: { select: { name: true } } },
    }).catch(() => []),
    // FUNN 4: kanonisk kø-telling — samme tall i hodet som på innboks/varsler.
    koTelling(user.id, user.role),
    prisma.user.findMany({
      where: spillerScope,
      select: { id: true },
    }),
  ]);
  // CaddieDraft.userId er EIEREN (Anders/ADMIN) — spilleren utkastet gjelder
  // ligger i toolInput (playerId/spillerId). Vis spilleren i køen når den finnes.
  const draftSpillerId = (toolInput: unknown): string | null => {
    const inp = toolInput as { playerId?: unknown; spillerId?: unknown } | null;
    if (typeof inp?.playerId === "string") return inp.playerId;
    if (typeof inp?.spillerId === "string") return inp.spillerId;
    return null;
  };
  const mineIds = new Set(mineSpillere.map((s) => s.id));
  const caddieDrafts =
    user.role === "ADMIN"
      ? caddieDraftsRaw
      : caddieDraftsRaw.filter((d) => {
          const spiller = draftSpillerId(d.toolInput);
          return spiller != null && mineIds.has(spiller);
        });
  const caddieBrukerIder = [
    ...new Set(
      caddieDrafts.flatMap((d) => {
        const spiller = draftSpillerId(d.toolInput);
        return spiller ? [d.userId, spiller] : [d.userId];
      }),
    ),
  ];
  const caddieBrukere = new Map(
    (await prisma.user.findMany({
      where: { id: { in: caddieBrukerIder } },
      select: { id: true, name: true },
    })).map((u) => [u.id, u.name] as const),
  );

  const lowRiskCount = actions.filter((a) =>
    LOW_RISK_ACTION_TYPES.has(a.actionType),
  ).length;

  const rows: AdminGodkjenningV2Row[] = await Promise.all(
    actions.map(async (a) => {
      const parsed = planActionSuggestionSchema.safeParse(a.suggestion);
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
        detail: (() => {
          const base =
            sugg?.forklaring ??
            sugg?.detail ??
            (a.plan ? `Gjelder planen «${a.plan.name}».` : "");
          // Foreslått sjekkpunkt i suggestion (skrives til PlanAction.sjekkpunkt ved godkjenning).
          const sp =
            typeof (sugg as { sjekkpunkt?: unknown } | null)?.sjekkpunkt ===
            "string"
              ? String((sugg as { sjekkpunkt: string }).sjekkpunkt)
              : null;
          if (sp?.trim()) {
            return [base, `Sjekkpunkt (foreslått): ${sp.trim()}`]
              .filter(Boolean)
              .join(" · ");
          }
          return base;
        })(),
        signalKind: sugg?.signalSnapshot?.kind ?? null,
        signalValue:
          sugg?.signalSnapshot?.value != null
            ? String(sugg.signalSnapshot.value)
            : null,
        diffPreview,
        when: narTekst(a.createdAt),
        urgent: erHasterHandling(a.actionType),
        lowRisk: LOW_RISK_ACTION_TYPES.has(a.actionType),
        hvorfor: provenanceLesbarTekst(a.provenance),
      };
    }),
  );

  // A1: caddie- og forespørsel-rader inn i samme kø (kilde-chip skiller).
  const caddieRows: AdminGodkjenningV2Row[] = caddieDrafts.map((d) => {
    const spillerId = draftSpillerId(d.toolInput) ?? d.userId;
    return {
    id: d.id,
    actionType: "CADDIE_DRAFT",
    playerId: spillerId,
    who: caddieBrukere.get(spillerId) ?? caddieBrukere.get(d.userId) ?? "Spiller",
    title: caddieDraftTittel(d.toolName),
    detail: d.previewText.slice(0, 200),
    signalKind: null,
    signalValue: null,
    diffPreview: null,
    when: narTekst(d.createdAt),
    urgent: false,
    lowRisk: false,
    kilde: "caddie" as const,
    eksternHref: "/admin/agencyos/caddie/dashbord",
    };
  });
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
    when: narTekst(r.createdAt),
    urgent: false,
    lowRisk: false,
    kilde: "forespørsel" as const,
    eksternHref: "/admin/foresporsler",
  }));
  const alleRows = [...rows.map((r) => ({ ...r, kilde: "agent" as const })), ...caddieRows, ...requestRows];

  // Løst: nylig godkjente sjekkpunkter (ETTER → FØR-tråd).
  const lostRader = await prisma.planAction.findMany({
    where: {
      status: "ACCEPTED",
      sjekkpunkt: { not: null },
      user: spillerScope,
    },
    orderBy: { updatedAt: "desc" },
    take: 12,
    select: {
      id: true,
      sjekkpunkt: true,
      updatedAt: true,
      user: { select: { name: true } },
    },
  });
  const lostSjekkpunkter = lostRader
    .filter((r) => r.sjekkpunkt?.trim())
    .map((r) => ({
      id: r.id,
      who: r.user.name ?? "Spiller",
      sjekkpunkt: r.sjekkpunkt!.trim(),
      when: narTekst(r.updatedAt),
    }));

  const data: AdminGodkjenningerV2Data = {
    rows: alleRows,
    lowRiskCount,
    totalt: ko.totalt,
    lostSjekkpunkter,
  };

  return (
    <V2Shell bredde="kolonne" aktiv="innboks" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <KoHubNav />
      <AdminGodkjenningerV2 data={data} />
    </V2Shell>
  );
}
