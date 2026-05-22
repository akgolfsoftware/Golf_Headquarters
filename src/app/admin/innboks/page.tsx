/**
 * CoachHQ — Innboks (samle-side).
 *
 * To moduser:
 *  - "alle" (default): samlet listevisning av oppfølging + godkjennelser +
 *     meldinger med filter (alle/uleste/i dag/uka), checkboxer og
 *     bulk-actions. Hovedinngangen for coach.
 *  - "oppfolging" | "godkjennelser" | "meldinger" | "turneringer":
 *     direktelenker til de eksisterende underrutene, beholdt slik at coach
 *     kan dykke ned i en kategori uten å miste den dype visningen.
 */

import Link from "next/link";
import { Trophy } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import { TabStrip } from "@/components/admin/tab-strip";
import { EmptyState } from "@/components/shared/empty-state";
import { avatarBg, initialsFromName } from "@/lib/avatar-colors";
import { PriorityPill } from "@/components/coachhq/tournament-enroll-modal";
import QueuePage from "@/app/admin/queue/page";
import ApprovalsPage from "@/app/admin/approvals/page";
import MessagesPage from "@/app/admin/messages/page";
import { InnboksListe, type InboxItem } from "./innboks-liste";

type TabKey =
  | "alle"
  | "oppfolging"
  | "godkjennelser"
  | "meldinger"
  | "turneringer";

const TABS = [
  { key: "alle", label: "Alle" },
  { key: "oppfolging", label: "Oppfølging" },
  { key: "godkjennelser", label: "Godkjennelser" },
  { key: "meldinger", label: "Meldinger" },
  { key: "turneringer", label: "Turneringer" },
];

const APPROVAL_LABEL: Record<string, string> = {
  PYRAMID_ADJUST: "Justering av pyramide",
  SESSION_ADD: "Legge til økt",
  SESSION_REMOVE: "Fjerne økt",
  INTENSITY_ADJUST: "Justering av intensitet",
  TAPER_ENGAGE: "Start taper",
  WITHDRAW: "Trekke fra plan",
  DRILL_SUGGEST: "Drill-forslag",
  TEST_SCHEDULE: "Planlegge test",
  PEER_COMPARE: "Sammenligning",
  RECOVERY_ADD: "Legge til hvile",
  ESCALATION: "Eskalering",
  DELOAD: "Pauseuke",
};

type Search = {
  tab?: string;
  thread?: string;
  filter?: string;
};

export default async function InnboksPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const params = await searchParams;
  const tab: TabKey =
    params.tab === "oppfolging" ||
    params.tab === "godkjennelser" ||
    params.tab === "meldinger" ||
    params.tab === "turneringer"
      ? params.tab
      : "alle";

  // Hent data for samlet visning + tellere (også når en annen tab er aktiv,
  // så pill-tellerne i hero er i sync med faktisk innhold).
  const items = await byggInnboksItems();
  const antallUleste = items.filter((i) => i.unread).length;
  const antallTotal = items.length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CoachHQ · Produktivitet"
        titleLead="Din"
        titleItalic="innboks"
        sub="Oppfølging, godkjennelser og meldinger samlet på ett sted."
        actions={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 font-mono text-xs tabular-nums text-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {antallTotal} totalt
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 font-mono text-xs tabular-nums text-accent-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-foreground" />
              {antallUleste} uleste
            </span>
          </div>
        }
      />
      <TabStrip basePath="/admin/innboks" tabs={TABS} active={tab} />
      <div>
        {tab === "alle" && <InnboksListe items={items} />}
        {tab === "oppfolging" && <QueuePage />}
        {tab === "godkjennelser" && <ApprovalsPage />}
        {tab === "meldinger" && (
          <MessagesPage
            searchParams={Promise.resolve({
              thread: params.thread,
              filter: params.filter,
            })}
          />
        )}
        {tab === "turneringer" && <TurneringerTab />}
      </div>
    </div>
  );
}

/**
 * Bygger samlet liste over alt som krever coachens oppmerksomhet.
 * Henter parallelt fra PlanAction (godkjennelser), CoachingSession (meldinger)
 * og User+Signal (oppfølging) — slik som de respektive underrutene gjør.
 */
async function byggInnboksItems(): Promise<InboxItem[]> {
  const fjorten = new Date();
  fjorten.setDate(fjorten.getDate() - 14);

  const [approvals, threads, players] = await Promise.all([
    prisma.planAction.findMany({
      where: { status: "PENDING" },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.coachingSession.findMany({
      where: { kind: "DIRECT" },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
    prisma.user.findMany({
      where: { role: "PLAYER" },
      select: {
        id: true,
        name: true,
        lastLoginAt: true,
        trainingPlans: { where: { isActive: true }, select: { id: true } },
        signals: {
          where: { kind: "SG_TOTAL" },
          orderBy: { computedAt: "desc" },
          take: 1,
          select: { value: true, computedAt: true },
        },
      },
    }),
  ]);

  const items: InboxItem[] = [];

  // 1) Godkjennelser
  for (const a of approvals) {
    items.push({
      id: a.id,
      kind: "approval",
      playerId: a.user.id,
      playerName: a.user.name,
      summary: APPROVAL_LABEL[a.actionType] ?? a.actionType,
      detail: `Foreslått av ${a.agentName}`,
      timestamp: a.createdAt.toISOString(),
      unread: true,
      severity: severityForApproval(a.actionType),
      href: `/admin/approvals#${a.id}`,
    });
  }

  // 2) Meldinger — kun de der spiller har sendt sist
  type ChatMelding = { role?: string; content?: string; ts?: string };
  for (const t of threads) {
    const meldinger = (Array.isArray(t.messages) ? t.messages : []) as ChatMelding[];
    const siste = meldinger[meldinger.length - 1];
    const fraSpiller = siste?.role === "user";
    items.push({
      id: t.id,
      kind: "message",
      playerId: t.user.id,
      playerName: t.user.name,
      summary: fraSpiller ? "Nytt spørsmål" : "Pågående samtale",
      detail:
        siste?.content?.slice(0, 100) ??
        (meldinger.length === 0 ? "Ingen meldinger ennå" : "—"),
      timestamp: t.updatedAt.toISOString(),
      unread: fraSpiller,
      severity: fraSpiller ? "warn" : "info",
      href: `/admin/messages?thread=${t.id}`,
    });
  }

  // 3) Oppfølging — spillere uten plan eller inaktive 14d+
  for (const p of players) {
    const dagerStille = p.lastLoginAt
      ? Math.floor(
          (Date.now() - p.lastLoginAt.getTime()) / (1000 * 60 * 60 * 24),
        )
      : null;
    const utenPlan = p.trainingPlans.length === 0;
    const stille = dagerStille === null || dagerStille > 14;
    const sg = p.signals[0]?.value ?? null;
    const sgFall = sg !== null && sg < -0.5;

    if (!utenPlan && !stille && !sgFall) continue;

    const grunner: string[] = [];
    if (utenPlan) grunner.push("ingen aktiv plan");
    if (stille) grunner.push(`inaktiv ${dagerStille ?? "∞"}d`);
    if (sgFall) grunner.push(`SG ${sg!.toFixed(1).replace(".", ",")}`);

    const severity: InboxItem["severity"] = sgFall || (utenPlan && stille)
      ? "urg"
      : "warn";

    items.push({
      id: p.id,
      kind: "follow_up",
      playerId: p.id,
      playerName: p.name,
      summary: utenPlan ? "Mangler aktiv plan" : "Trenger oppfølging",
      detail: grunner.join(" · "),
      timestamp: (p.lastLoginAt ?? new Date(0)).toISOString(),
      unread: true,
      severity,
      href: `/admin/elever/${p.id}`,
    });
  }

  // Sortér: uleste først, deretter nyeste først.
  items.sort((a, b) => {
    if (a.unread !== b.unread) return a.unread ? -1 : 1;
    return b.timestamp.localeCompare(a.timestamp);
  });

  return items;
}

function severityForApproval(actionType: string): InboxItem["severity"] {
  if (
    actionType === "WITHDRAW" ||
    actionType.includes("ESCALATION") ||
    actionType === "TAPER_ENGAGE"
  ) {
    return "urg";
  }
  if (
    actionType === "INTENSITY_ADJUST" ||
    actionType === "PYRAMID_ADJUST" ||
    actionType === "RECOVERY_ADD" ||
    actionType === "DELOAD"
  ) {
    return "warn";
  }
  return "info";
}

async function TurneringerTab() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const tretti = new Date(now);
  tretti.setDate(tretti.getDate() + 30);

  const entries = await prisma.tournamentEntry.findMany({
    where: {
      tournamentId: { not: null },
      tournament: { startDate: { gte: now, lt: tretti } },
    },
    include: {
      user: { select: { id: true, name: true } },
      tournament: { select: { id: true, name: true, startDate: true } },
    },
    orderBy: { tournament: { startDate: "asc" } },
  });

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={Trophy}
        titleItalic="Ingen kommende"
        titleTrail="påmeldinger"
        sub="Når du melder på spillere via /admin/tournaments vises de her med dato og prioritet."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <ul className="divide-y divide-border">
        {entries.map((e) => {
          const navn = e.user.name ?? "?";
          return (
            <li key={e.id}>
              <Link
                href={`/admin/tournaments/${e.tournament?.id ?? ""}`}
                className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-secondary/40"
              >
                <div className="w-14 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                  {e.tournament?.startDate.toLocaleDateString("nb-NO", {
                    day: "numeric",
                    month: "short",
                  })}
                </div>
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full font-mono text-[11px] font-semibold text-white"
                  style={{ background: avatarBg(navn) }}
                >
                  {initialsFromName(navn)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-foreground">
                    {navn}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {e.tournament?.name ?? "—"}
                  </div>
                </div>
                <PriorityPill priority={e.priority} />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
