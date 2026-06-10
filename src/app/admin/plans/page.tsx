/**
 * AgencyOS — Treningsplaner
 * Design migrert fra wireframe/design-files-v2/final/01-treningsplaner.html.
 *
 * Kanban-view med 3 kolonner: Aktiv / Pause / Arkivert. Plan-kort inneholder
 * spiller-avatar, plan-tittel, periode, progress-bar og AI-badge. KPI-strip
 * øverst. Filter med søk + chips.
 */

import Link from "next/link";
import {
  ClipboardList,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { avatarBg } from "@/lib/avatar-colors";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import { EmptyState } from "@/components/shared/empty-state";
import {
  PlanViewToggle,
  type PlanView,
} from "@/components/coachhq/plan-view-toggle";
import {
  PlanTidslinje,
  type TidslinjePlan,
} from "@/components/coachhq/plan-tidslinje";
import {
  PlanSplitView,
  type SplitPlanRow,
} from "@/components/coachhq/plan-split-view";
import { PlanCardMenu } from "./_plan-card-menu";
import { QuickPlanModal, type QuickPlanSpiller } from "./_quick-plan-modal";

type Search = { q?: string; status?: string; view?: string; planId?: string };

const VALID_VIEWS: readonly PlanView[] = ["kanban", "tidslinje", "split"];

type PlanStatus = "aktiv" | "pause" | "arkiv";

const STATUS_LABEL: Record<PlanStatus, string> = {
  aktiv: "Aktiv",
  pause: "Pause",
  arkiv: "Arkivert",
};

const STATUS_DOT: Record<PlanStatus, string> = {
  aktiv: "bg-primary",
  pause: "bg-accent",
  arkiv: "bg-muted-foreground",
};

export default async function AdminPlansList({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const params = await searchParams;
  const activeView: PlanView = VALID_VIEWS.includes(params.view as PlanView)
    ? (params.view as PlanView)
    : "kanban";

  const plansRaw = await prisma.trainingPlan.findMany({
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    include: {
      user: { select: { id: true, name: true, hcp: true, tier: true } },
      sessions: { select: { id: true, status: true } },
    },
    take: 200,
  });

  // Stabil tidsreferanse for hele requesten — unngår Date.now() spredt rundt.
  const now = new Date();
  const naa = now.getTime();
  type PlanWithStatus = (typeof plansRaw)[number] & { _status: PlanStatus };
  const plans: PlanWithStatus[] = plansRaw.map((p) => {
    let status: PlanStatus;
    if (p.endDate && p.endDate.getTime() < naa) {
      status = "arkiv";
    } else if (!p.isActive) {
      status = "pause";
    } else {
      status = "aktiv";
    }
    return { ...p, _status: status };
  });

  // Tellinger
  const totalCount = plans.length;
  const aktivCount = plans.filter((p) => p._status === "aktiv").length;
  const pauseCount = plans.filter((p) => p._status === "pause").length;
  const arkivCount = plans.filter((p) => p._status === "arkiv").length;

  // Filtrering
  const q = (params.q ?? "").trim().toLowerCase();
  const synlige = plans.filter((p) => {
    if (q) {
      const matchNavn = p.name.toLowerCase().includes(q);
      const matchSpiller = p.user.name.toLowerCase().includes(q);
      if (!matchNavn && !matchSpiller) return false;
    }
    return true;
  });

  const aktivPlans = synlige.filter((p) => p._status === "aktiv");
  const pausePlans = synlige.filter((p) => p._status === "pause");

  // KPI-beregninger
  const pct = (p: PlanWithStatus) => {
    const t = p.sessions.length;
    if (t === 0) return 0;
    const f = p.sessions.filter((s) => s.status === "COMPLETED").length;
    return Math.round((f / t) * 100);
  };
  const snittPct =
    aktivCount > 0
      ? Math.round(
          plans
            .filter((p) => p._status === "aktiv")
            .reduce((acc, p) => acc + pct(p), 0) / aktivCount,
        )
      : 0;
  const totalSpillere = await prisma.user.count({ where: { role: "PLAYER" } });

  // Minimal spillerliste til Hurtigplan-modalen (createPlan).
  const spillereForQuick: QuickPlanSpiller[] = (
    await prisma.user.findMany({
      where: { role: "PLAYER" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, hcp: true },
    })
  ).map((s) => ({ id: s.id, name: s.name, hcp: s.hcp }));

  // Forfaller denne uka
  const enUkeFram = new Date();
  enUkeFram.setDate(enUkeFram.getDate() + 7);
  const forfaller = plans.filter(
    (p) =>
      p._status === "aktiv" &&
      p.endDate &&
      p.endDate.getTime() <= enUkeFram.getTime(),
  ).length;

  const totaltErTomt = totalCount === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AgencyOS · /admin/plans"
        titleLead="Treningsplaner —"
        titleItalic={`${aktivCount} aktive`}
        sub={`${totalSpillere} spillere · ${forfaller} forfaller denne uka · ${arkivCount} arkivert`}
        actions={
          <>
            <PlanViewToggle active={activeView} q={params.q} />
            <QuickPlanModal spillere={spillereForQuick} />
            <Link
              href="/admin/plans/templates"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <Sparkles size={14} strokeWidth={1.75} />
              Maler
            </Link>
            <Link
              href="/admin/plans/new"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Plus size={14} strokeWidth={1.75} />
              Ny plan
            </Link>
          </>
        }
      />

      {/* KPI-strip */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        <KpiAccent
          label="Aktive planer"
          value={String(aktivCount)}
          unit={`/ ${totalSpillere}`}
          sub={
            totalSpillere > 0
              ? `${Math.round((aktivCount / totalSpillere) * 100)} % av spillere har plan`
              : "Ingen spillere"
          }
        />
        <Kpi
          label="Snitt progress"
          value={String(snittPct)}
          unit="%"
          sub={`Over ${aktivCount} aktive planer`}
        />
        <Kpi
          label="Forfaller denne uka"
          value={String(forfaller)}
          sub={
            forfaller === 0 ? "Ingen krever handling" : "Krever oppfølging"
          }
          tone={forfaller > 0 ? "warn" : undefined}
        />
        <Kpi
          label="Pause + arkiv"
          value={`${pauseCount + arkivCount}`}
          unit={`/ ${totalCount}`}
          sub={`${pauseCount} på pause · ${arkivCount} arkivert`}
        />
      </div>

      {/* Filter */}
      <form className="flex flex-wrap items-center gap-2">
        <label className="flex w-full min-w-0 items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-base text-muted-foreground sm:w-auto sm:flex-1 sm:min-w-[280px] sm:text-[13px]">
          <Search size={14} strokeWidth={1.75} />
          <input
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Søk plan eller spiller"
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          />
        </label>
        <FilterChip label="Coach" />
        <FilterChip label="Periode" />
        <FilterChip label="Type" />
        <FilterChip label="Sort: Sist endret" />
      </form>

      {/* Body */}
      {totaltErTomt ? (
        <EmptyState
          icon={ClipboardList}
          titleItalic="Lag din første"
          titleTrail="plan"
          sub="Treningsplaner samler øvelser, mål og periode i én tråd per spiller. Start fra mal eller la AI bygge én utfra spiller-data."
          cta={
            <div className="flex gap-2">
              <Link
                href="/admin/plans/templates"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
              >
                <Sparkles size={16} strokeWidth={1.75} />
                Bruk mal
              </Link>
              <Link
                href="/admin/plans/new"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Plus size={16} strokeWidth={1.75} />
                Manuell plan
              </Link>
            </div>
          }
        />
      ) : activeView === "kanban" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_0.5fr]">
          <Column status="aktiv" count={aktivPlans.length} plans={aktivPlans} />
          <Column
            status="pause"
            count={pausePlans.length}
            plans={pausePlans}
            tone="pause"
          />
          <Column
            status="arkiv"
            count={arkivCount}
            plans={[]}
            collapsed
          />
        </div>
      ) : activeView === "tidslinje" ? (
        <PlanTidslinje
          plans={synlige.map<TidslinjePlan>((p) => ({
            id: p.id,
            name: p.name,
            userId: p.user.id,
            userName: p.user.name,
            startDate: p.startDate,
            endDate: p.endDate,
            status: p._status,
            pct: pct(p),
          }))}
          now={now}
        />
      ) : (
        <PlanSplitView
          plans={synlige.map<SplitPlanRow>((p) => ({
            id: p.id,
            name: p.name,
            userName: p.user.name,
            pct: pct(p),
            status: p._status,
            startDate: p.startDate,
            endDate: p.endDate,
          }))}
          selectedPlanId={params.planId}
          q={params.q}
        />
      )}
    </div>
  );
}

// ----------------- Komponenter -----------------

type PlanCardData = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date | null;
  user: { id: string; name: string };
  sessions: { id: string; status: string }[];
  _status: PlanStatus;
};

function Column({
  status,
  count,
  plans,
  tone,
  collapsed,
}: {
  status: PlanStatus;
  count: number;
  plans: PlanCardData[];
  tone?: "pause";
  collapsed?: boolean;
}) {
  return (
    <section
      className={`flex flex-col gap-2.5 rounded-2xl border border-border p-4 ${
        tone === "pause" ? "bg-secondary" : "bg-background"
      } ${collapsed ? "min-h-[64px]" : "min-h-[520px]"}`}
    >
      <header className="flex items-center justify-between border-b border-border pb-2">
        <h3 className="inline-flex items-center gap-2 font-display text-sm font-semibold text-foreground">
          <span
            className={`inline-block h-2 w-2 rounded-full ${STATUS_DOT[status]}`}
          />
          {STATUS_LABEL[status]}
        </h3>
        <span className="rounded-sm bg-card px-2 py-0.5 font-mono text-[11px] font-semibold text-muted-foreground">
          {count}
        </span>
      </header>
      {!collapsed && plans.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {plans.map((p) => (
            <PlanCard key={p.id} plan={p} />
          ))}
        </div>
      )}
      {!collapsed && plans.length === 0 && (
        <p className="py-6 text-center font-mono text-[11px] text-muted-foreground">
          Ingen planer her
        </p>
      )}
    </section>
  );
}

function PlanCard({ plan }: { plan: PlanCardData }) {
  const total = plan.sessions.length;
  const fullfort = plan.sessions.filter((s) => s.status === "COMPLETED").length;
  const pct = total > 0 ? Math.round((fullfort / total) * 100) : 0;
  const done = pct >= 100;

  // Periode-pill med eventuell warn/over
  const periodeText = formatPeriode(plan.startDate, plan.endDate);
  const periodeTone = perioderTone(plan.endDate);

  return (
    <Link
      href={`/admin/plans/${plan.id}`}
      className="group flex cursor-pointer flex-col gap-2 rounded-lg border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    >
      <header className="flex items-center gap-2">
        <span
          className="grid h-6 w-6 place-items-center rounded-full font-mono text-[10px] font-semibold text-white"
          style={{ background: avatarBg(plan.user.name) }}
        >
          {initials(plan.user.name)}
        </span>
        <span className="flex-1 text-[13px] font-medium text-foreground">
          {plan.user.name}
        </span>
        <PlanCardMenu
          planId={plan.id}
          planNavn={plan.name}
          isActive={plan._status === "aktiv"}
        />
      </header>
      <h4 className="font-display text-[14px] italic leading-tight text-foreground">
        {plan.name}
      </h4>
      <span
        className={`self-start rounded-sm px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] ${
          periodeTone === "warn"
            ? "bg-accent/30 text-accent-foreground"
            : periodeTone === "over"
              ? "bg-destructive/15 text-destructive"
              : "bg-secondary text-muted-foreground"
        }`}
      >
        {periodeText}
      </span>
      <div className="mt-0.5 h-1 overflow-hidden rounded-sm bg-secondary">
        <div
          className={`h-full transition-[width] ${done ? "bg-accent" : "bg-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span
          className={`font-mono text-[11px] font-semibold ${done ? "text-primary" : "text-muted-foreground"}`}
        >
          {pct} % · {fullfort}/{total} økter
        </span>
      </div>
    </Link>
  );
}

function KpiAccent({
  label,
  value,
  unit,
  sub,
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-transparent bg-gradient-to-br from-foreground to-foreground/90 p-4 text-white">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-accent/70">
        {label}
      </div>
      <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-white">
        {value}
        {unit && (
          <span className="ml-1 text-[13px] font-medium text-background/55">
            {unit}
          </span>
        )}
      </div>
      {sub && (
        <div className="font-mono text-[11px] text-background/70">
          {sub}
        </div>
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  unit,
  sub,
  tone,
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  tone?: "warn";
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`font-mono text-[28px] font-semibold leading-none tabular-nums ${
          tone === "warn" ? "text-accent-foreground" : "text-foreground"
        }`}
      >
        {value}
        {unit && (
          <span className="ml-1 text-[13px] font-medium text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
      {sub && (
        <div className="font-mono text-[11px] text-muted-foreground">{sub}</div>
      )}
    </div>
  );
}

function FilterChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-[12px] text-muted-foreground">
      {label}
    </span>
  );
}

// ----------------- Helpers -----------------

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}


function formatDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
  });
}

function formatPeriode(start: Date, end: Date | null): string {
  if (!end) return `${formatDato(start)} – løpende`;
  const naa = Date.now();
  if (end.getTime() < naa) {
    return `${formatDato(start)} – ${formatDato(end)}`;
  }
  const dagerIgjen = Math.ceil((end.getTime() - naa) / (1000 * 60 * 60 * 24));
  if (dagerIgjen <= 7 && dagerIgjen > 0) {
    return `${formatDato(start)} – ${formatDato(end)} · ${dagerIgjen} d`;
  }
  return `${formatDato(start)} – ${formatDato(end)}`;
}

function perioderTone(end: Date | null): "warn" | "over" | null {
  if (!end) return null;
  const naa = Date.now();
  if (end.getTime() < naa) return "over";
  const dagerIgjen = Math.ceil((end.getTime() - naa) / (1000 * 60 * 60 * 24));
  if (dagerIgjen <= 7) return "warn";
  return null;
}
