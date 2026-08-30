/**
 * Kø · fane «Godkjenninger» — datalasting (MASTERPLAN 15.1).
 *
 * Flyttet ORDRETT ut av src/app/admin/godkjenninger/page.tsx da de seks
 * kø-adressene ble slått sammen til /admin/ko. Ingen filtre, ingen felter og
 * ingen sortering er endret — kun `requirePortalUser` er løftet ut, fordi
 * samlesiden gjør rolle-sjekken én gang og sender brukeren inn hit.
 *
 * A1: ÉN kø — tre kilder (PlanAction + CaddieDraft + SessionRequest);
 * e-postutkast bor i innboks-epost-flaten med egen godkjenning der.
 */

import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { handlingstypeLabel } from "@/lib/labels/handlingstyper";
import { prisma } from "@/lib/prisma";
import { LOW_RISK_ACTION_TYPES } from "@/lib/training/skills";
import { koTelling, planActionKoWhere } from "@/lib/admin/ko-telling";
import { hentUkesrapport } from "@/lib/admin/ukesrapport";
import {
  buildDiffPreview,
  erHasterHandling,
  narTekst,
  planActionSuggestionSchema,
} from "@/lib/admin/plan-action-diff";
import { provenanceLesbarTekst } from "@/lib/agents/provenance";
import { caddieDraftTittel } from "@/lib/caddie/draft-labels";
import type {
  AdminGodkjenningerV2Data,
  AdminGodkjenningV2Row,
} from "@/components/admin/v2/godkjenninger/AdminGodkjenningerTrainLock";

export type KoBruker = { id: string; role: string };

/** KPI-panelets «Eldste» — kompakt dager-etikett (fasit: «3 dg»), ikke narTekst()s «3 dg siden». */
function dagerSidenLabel(d: Date): string {
  const dager = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (dager <= 0) return "I dag";
  return dager === 1 ? "1 dg" : `${dager} dg`;
}

function syvDagerSidenGrense(): Date {
  return new Date(Date.now() - 7 * 86_400_000);
}

export async function lastGodkjenninger(
  user: KoBruker,
): Promise<AdminGodkjenningerV2Data> {

  // A1: ÉN kø — fire kilder (PlanAction + CaddieDraft + SessionRequest;
  // e-postutkast bor i innboks-epost-flaten med egen godkjenning der).
  const spillerScope = coachScopedPlayerWhere(user);
  const syvDagerSiden = syvDagerSidenGrense();
  const erAdmin = user.role === "ADMIN";

  const [
    actions,
    caddieDraftsRaw,
    sessionRequests,
    ko,
    mineSpillere,
    planGodkjent7d,
    planAvvist7d,
    caddieGodkjent7d,
    caddieAvvist7d,
    sessionGodkjent7d,
    sessionAvvist7d,
  ] = await Promise.all([
    prisma.planAction.findMany({
      where: planActionKoWhere(user),
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
    // Køen i tall (høyrekolonne) — «Godkjent 7 dg»/«N avvist», ærlig telt per kilde.
    prisma.planAction.count({
      where: { status: "ACCEPTED", decidedAt: { gte: syvDagerSiden }, OR: [{ coachId: user.id }, { coachId: null }], user: spillerScope },
    }),
    prisma.planAction.count({
      where: { status: "REJECTED", decidedAt: { gte: syvDagerSiden }, OR: [{ coachId: user.id }, { coachId: null }], user: spillerScope },
    }),
    erAdmin
      ? prisma.caddieDraft.count({ where: { status: "APPROVED", resolvedAt: { gte: syvDagerSiden } } })
      : Promise.resolve(0),
    erAdmin
      ? prisma.caddieDraft.count({ where: { status: "REJECTED", resolvedAt: { gte: syvDagerSiden } } })
      : Promise.resolve(0),
    prisma.sessionRequest
      .count({
        where: { status: "APPROVED", respondedAt: { gte: syvDagerSiden }, OR: [{ coachId: user.id }, { coachId: null }], user: spillerScope },
      })
      .catch(() => 0),
    prisma.sessionRequest
      .count({
        where: { status: "DECLINED", respondedAt: { gte: syvDagerSiden }, OR: [{ coachId: user.id }, { coachId: null }], user: spillerScope },
      })
      .catch(() => 0),
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
  // Fasitens kø er ÉN tidsordnet liste på tvers av kilder, ikke tre blokker
  // etter hverandre — sorter på faktisk opprettelsestidspunkt, nyeste først.
  const alleRowsMedTid: (AdminGodkjenningV2Row & { _opprettet: Date })[] = [
    ...rows.map((r, i) => ({ ...r, kilde: "agent" as const, _opprettet: actions[i].createdAt })),
    ...caddieRows.map((r, i) => ({ ...r, _opprettet: caddieDrafts[i].createdAt })),
    ...requestRows.map((r, i) => ({ ...r, _opprettet: sessionRequests[i].createdAt })),
  ];
  alleRowsMedTid.sort((a, b) => b._opprettet.getTime() - a._opprettet.getTime());
  const alleRows: AdminGodkjenningV2Row[] = alleRowsMedTid.map(({ _opprettet, ...rest }) => {
    void _opprettet;
    return rest;
  });

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

  // Køen i tall — «Eldste»: ærlig eldste rad i køen (ikke bare PlanAction).
  const eldsteKandidat = [
    ...actions.map((a) => ({ createdAt: a.createdAt, who: a.user.name ?? "Spiller" })),
    ...caddieDrafts.map((d) => ({
      createdAt: d.createdAt,
      who: caddieBrukere.get(draftSpillerId(d.toolInput) ?? d.userId) ?? "Spiller",
    })),
    ...sessionRequests.map((r) => ({ createdAt: r.createdAt, who: r.user?.name ?? "Spiller" })),
  ].reduce<{ createdAt: Date; who: string } | null>(
    (eldste, r) => (eldste === null || r.createdAt < eldste.createdAt ? r : eldste),
    null,
  );

  // D3: ukesrapporten er et leseelement i køen — den leses, ikke godkjennes.
  const ukesrapport = await hentUkesrapport(spillerScope);

  const data: AdminGodkjenningerV2Data = {
    rows: alleRows,
    lowRiskCount,
    ukesrapport,
    totalt: ko.totalt,
    lostSjekkpunkter,
    kilder: { agent: ko.planActions, caddie: ko.caddieDrafts, forespørsel: ko.sessionRequests },
    eldste: eldsteKandidat ? { dagerLabel: dagerSidenLabel(eldsteKandidat.createdAt), who: eldsteKandidat.who } : null,
    godkjent7Dager: planGodkjent7d + caddieGodkjent7d + sessionGodkjent7d,
    avvist7Dager: planAvvist7d + caddieAvvist7d + sessionAvvist7d,
  };

  return data;
}
