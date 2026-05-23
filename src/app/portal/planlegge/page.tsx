/**
 * /portal/planlegge — PlayerHQ Planlegge hovedseksjon.
 *
 * Tabs: Årsplan / Treningsplan / Mål / Turneringer / Drills
 * Hver tab har sin egen sub-komponent for å holde denne fila slank.
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getViewMode } from "@/lib/view-mode";
import { prisma } from "@/lib/prisma";
import { PlanleggeShell } from "@/components/portal-planlegge/planlegge-shell";
import { AthleticButton, AthleticEyebrow } from "@/components/athletic";
import { ArsplanScreen } from "@/components/planlegge-v2/arsplan-screen";
import { TreningsplanScreen } from "@/components/planlegge-v2/treningsplan-screen";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

const VALID_TABS = ["arsplan", "treningsplan", "mal", "turneringer", "drills"] as const;

export default async function PlanleggePage({ searchParams }: Props) {
  const user = await requirePortalUser();

  // Rolle-redirect (samme som /portal)
  const viewMode = await getViewMode();
  if (user.role === "COACH" || user.role === "ADMIN") {
    if (viewMode !== "player") redirect("/admin");
  }
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const params = await searchParams;
  const tab = VALID_TABS.includes(params.tab as (typeof VALID_TABS)[number])
    ? (params.tab as (typeof VALID_TABS)[number])
    : "arsplan";

  // Tellere for badge-count
  const [goalsCount, tournamentsCount] = await Promise.all([
    prisma.goal.count({ where: { userId: user.id, status: "ACTIVE" } }),
    prisma.tournamentEntry
      .count({
        where: {
          userId: user.id,
          entryStatus: { in: ["PLANNED", "CONFIRMED"] },
        },
      })
      .catch(() => 0),
  ]);

  // Ny pixel-perfekt design (Claude Design-handoff 2026-05-23) for arsplan-tab.
  // Andre tabs bruker fortsatt gammel shell inntil de blir portet.
  const initials = user.name
    ?.split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "??";
  const screenProps = {
    playerName: user.name ?? "Spiller",
    playerInitials: initials,
    hcp: user.hcp ?? null,
    seasonYear: new Date().getFullYear(),
  };

  if (tab === "arsplan") return <ArsplanScreen {...screenProps} />;
  if (tab === "treningsplan") return <TreningsplanScreen {...screenProps} />;

  return (
    <PlanleggeShell
      counts={{
        mal: goalsCount,
        turneringer: tournamentsCount,
      }}
    >
      {tab === "mal" ? <MalTab userId={user.id} /> : null}
      {tab === "turneringer" ? <TurneringerTab userId={user.id} /> : null}
      {tab === "drills" ? <DrillsTab /> : null}
    </PlanleggeShell>
  );
}

// ============================================================================
// Tab-innhold (placeholders for natt-økt — kobles til eksisterende sider)
// ============================================================================

async function ArsplanTab({ userId }: { userId: string }) {
  const seasonPlan = await prisma.seasonPlan
    .findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { periodBlocks: true },
    })
    .catch(() => null);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <AthleticEyebrow>SESONG {new Date().getFullYear()}</AthleticEyebrow>
            <h2 className="font-display mt-1 text-xl font-semibold tracking-tight">
              {seasonPlan
                ? `Aktiv sesongplan · ${seasonPlan.periodBlocks.length} perioder`
                : "Ingen sesongplan ennå"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {seasonPlan
                ? "Drag-resize på periodeblokker, koble turneringer, auto-generer økter via periodiserings-popup."
                : "Opprett en sesongplan for å begynne periodisert trening."}
            </p>
          </div>
          <Link href="/portal/tren/aarsplan">
            <AthleticButton variant="lime" size="md">
              {seasonPlan ? "Åpne årsplan" : "Opprett sesongplan"}
              <ArrowRight className="h-4 w-4" />
            </AthleticButton>
          </Link>
        </div>
      </div>

      {seasonPlan ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-5 text-sm text-muted-foreground">
          Full gantt-visning med drag-resize, tournament-flagg og I-dag-linje
          åpnes via knappen over. Bygges direkte i denne tab-en i neste runde.
        </div>
      ) : null}
    </div>
  );
}

async function TreningsplanTab({ userId }: { userId: string }) {
  const activePlan = await prisma.technicalPlan
    .findFirst({
      where: { userId, status: "ACTIVE" },
      orderBy: { startDato: "desc" },
      include: { positions: { include: { tasks: true } } },
    })
    .catch(() => null);

  const taskCount = activePlan?.positions.flatMap((p) => p.tasks).length ?? 0;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <AthleticEyebrow>AKTIV TEKNISK PLAN</AthleticEyebrow>
            <h2 className="font-display mt-1 text-xl font-semibold tracking-tight">
              {activePlan ? activePlan.navn : "Ingen aktiv plan"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {activePlan
                ? `${activePlan.positions.length} posisjoner · ${taskCount} oppgaver`
                : "Be coachen din om en plan, eller AI-generer en selv."}
            </p>
          </div>
          <Link href="/portal/tren/teknisk-plan">
            <AthleticButton variant="lime" size="md">
              {activePlan ? "Åpne plan" : "Be om plan"}
              <ArrowRight className="h-4 w-4" />
            </AthleticButton>
          </Link>
        </div>
      </div>
    </div>
  );
}

async function MalTab({ userId }: { userId: string }) {
  const goals = await prisma.goal
    .findMany({
      where: { userId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 6,
    })
    .catch(() => []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <AthleticEyebrow>{goals.length} AKTIVE MÅL</AthleticEyebrow>
        <Link href="/portal/mal">
          <AthleticButton variant="ghost-light" size="sm">
            Full mål-visning
            <ArrowRight className="h-4 w-4" />
          </AthleticButton>
        </Link>
      </div>
      {goals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Ingen aktive mål. Sett et mål for å komme i gang.
          </p>
          <Link href="/portal/mal" className="mt-3 inline-block">
            <AthleticButton variant="lime" size="sm">
              Opprett mål
            </AthleticButton>
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((g) => (
            <div key={g.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                {g.type}
              </div>
              <div className="font-display mt-2 text-base font-semibold leading-tight">
                {g.title}
              </div>
              {g.targetDate ? (
                <div className="font-mono mt-1 text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                  FRIST {g.targetDate.toLocaleDateString("nb-NO")}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

async function TurneringerTab({ userId }: { userId: string }) {
  const entries = await prisma.tournamentEntry
    .findMany({
      where: { userId, entryStatus: { in: ["PLANNED", "CONFIRMED"] } },
      include: { tournament: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    })
    .catch(
      () =>
        [] as Awaited<
          ReturnType<
            typeof prisma.tournamentEntry.findMany<{
              include: { tournament: true };
            }>
          >
        >,
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <AthleticEyebrow>{entries.length} KOMMENDE TURNERINGER</AthleticEyebrow>
        <Link href="/portal/tren/turneringer">
          <AthleticButton variant="ghost-light" size="sm">
            Turneringsplanlegger
            <ArrowRight className="h-4 w-4" />
          </AthleticButton>
        </Link>
      </div>
      {entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
          Ingen kommende turneringer. Meld deg på via turneringsplanleggeren.
        </div>
      ) : (
        <ul className="space-y-2">
          {entries.map((e) => {
            const tournamentName = e.tournament?.name ?? e.manualName ?? "Turnering";
            const tournamentDate = e.tournament?.startDate ?? e.manualDate;
            return (
              <li
                key={e.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
              >
                <div>
                  <div className="font-display text-sm font-semibold">
                    {tournamentName}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                    {tournamentDate?.toLocaleDateString("nb-NO") ?? "—"} ·{" "}
                    {e.category ?? "—"}
                  </div>
                </div>
                <span
                  className="font-mono rounded-full bg-[var(--color-accent-fill)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em]"
                  style={{ color: "#3B4310" }}
                >
                  {e.entryStatus}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function DrillsTab() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <AthleticEyebrow>DRILL-BIBLIOTEK</AthleticEyebrow>
          <h2 className="font-display mt-1 text-xl font-semibold tracking-tight">
            Drills og øvelser
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Bla i biblioteket, favorittmarkér drills, og legg dem i ukens plan.
          </p>
        </div>
        <Link href="/portal/tren/ovelser">
          <AthleticButton variant="lime" size="md">
            Åpne bibliotek
            <ArrowRight className="h-4 w-4" />
          </AthleticButton>
        </Link>
      </div>
    </div>
  );
}
