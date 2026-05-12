/**
 * CoachHQ — Treningsplaner (oversikt)
 * Produksjons-design migrert fra /plan-templates-demo (kort-grid + søk/filter).
 *
 * Datakilde: Prisma. Henter alle TrainingPlan for COACH/ADMIN, med tilhørende
 * spiller og sesjons-status. Filterchips fungerer på server via searchParams.
 */

import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

type Search = { q?: string; status?: string };

type PlanStatus = "aktiv" | "pause" | "arkiv";

// Pyramide-mini-stripes — fast 5-felt fordeling som mirror av plan-templates-demo
const PYR_COLOR: Record<"fys" | "tek" | "slag" | "spill" | "turn", string> = {
  fys: "#005840",
  tek: "#1A7D56",
  slag: "#D1F843",
  spill: "#B8852A",
  turn: "#5E5C57",
};

export default async function AdminPlansList({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const params = await searchParams;

  const plansRaw = await prisma.trainingPlan.findMany({
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    include: {
      user: { select: { id: true, name: true, hcp: true, tier: true } },
      sessions: { select: { id: true, status: true } },
    },
    take: 200,
  });

  // Beregn status per plan
  const naa = Date.now();
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
  const statusFilter = (params.status ?? "alle") as "alle" | PlanStatus;

  const synlige = plans.filter((p) => {
    if (statusFilter !== "alle" && p._status !== statusFilter) return false;
    if (q) {
      const matchNavn = p.name.toLowerCase().includes(q);
      const matchSpiller = p.user.name.toLowerCase().includes(q);
      if (!matchNavn && !matchSpiller) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CoachHQ · Treningsplaner"
        titleLead="Mine"
        titleItalic="planer"
        sub={`${totalCount} planer totalt · ${aktivCount} aktive · ${pauseCount} på pause`}
        actions={
          <>
            <Link
              href="/admin/plans/templates"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <Sparkles size={14} strokeWidth={1.5} />
              Maler
            </Link>
            <Link
              href="/admin/plans/new"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Plus size={14} strokeWidth={1.5} />
              Ny plan
            </Link>
          </>
        }
      />

      {/* Filter bar */}
      <form className="flex flex-wrap items-center gap-2">
        <label className="relative max-w-[360px] flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.5}
          />
          <input
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Søk på plan-navn eller spiller …"
            className="w-full rounded-md border border-border bg-card px-4 py-2 pl-10 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <span className="px-2 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          Status
        </span>
        <StatusChip
          name="alle"
          current={statusFilter}
          count={totalCount}
          label="Alle"
          preserveQ={params.q}
        />
        <StatusChip
          name="aktiv"
          current={statusFilter}
          count={aktivCount}
          label="Aktive"
          preserveQ={params.q}
        />
        <StatusChip
          name="pause"
          current={statusFilter}
          count={pauseCount}
          label="Pause"
          preserveQ={params.q}
        />
        <StatusChip
          name="arkiv"
          current={statusFilter}
          count={arkivCount}
          label="Arkivert"
          preserveQ={params.q}
        />
      </form>

      {/* Body */}
      {synlige.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          titleItalic="Ingen planer"
          titleTrail={
            totalCount === 0 ? "registrert ennå" : "som matcher filteret"
          }
          sub={
            totalCount === 0
              ? "Bygg den første treningsplanen for en spiller — start fra en mal eller fra bunn."
              : "Justér søk eller filterstatus for å se flere planer."
          }
          cta={
            totalCount === 0 ? (
              <Link
                href="/admin/plans/new"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Plus size={16} strokeWidth={1.5} />
                Ny plan
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {synlige.map((p) => (
            <PlanCard key={p.id} plan={p} />
          ))}
        </div>
      )}
    </div>
  );
}

// ----------------- Komponenter -----------------

type PlanCardProps = {
  plan: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date | null;
    user: { id: string; name: string };
    sessions: { id: string; status: string }[];
    _status: PlanStatus;
  };
};

function PlanCard({ plan }: PlanCardProps) {
  const fullført = plan.sessions.filter((s) => s.status === "COMPLETED").length;
  const totalt = plan.sessions.length;
  const pct = totalt > 0 ? Math.round((fullført / totalt) * 100) : 0;

  // Pyramide-stripes — fast 5-felt visuell stripe (illustrativ for v1)
  const stripes: { key: keyof typeof PYR_COLOR; value: number }[] = [
    { key: "fys", value: 20 },
    { key: "tek", value: 30 },
    { key: "slag", value: 25 },
    { key: "spill", value: 20 },
    { key: "turn", value: 5 },
  ];

  const periode = `${formatDato(plan.startDate)}${plan.endDate ? ` – ${formatDato(plan.endDate)}` : " – løpende"}`;

  return (
    <Link
      href={`/admin/plans/${plan.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* Topp: spiller + status */}
      <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div
            className="grid h-9 w-9 place-items-center rounded-full font-mono text-[11px] font-semibold text-white"
            style={{ background: avatarBg(plan.user.name) }}
          >
            {initials(plan.user.name)}
          </div>
          <div className="leading-tight">
            <div className="text-[13px] font-medium text-foreground">
              {plan.user.name}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
              Spiller
            </div>
          </div>
        </div>
        <StatusPill status={plan._status} />
      </div>

      {/* Plan-info */}
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div>
          <h3 className="font-display text-[18px] font-semibold leading-tight tracking-tight text-foreground group-hover:text-primary">
            {plan.name}
          </h3>
          <div className="mt-1 font-mono text-[11px] tabular-nums text-muted-foreground">
            {periode}
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="mb-1.5 flex items-end justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
              Fremdrift
            </span>
            <span className="font-mono text-[11px] tabular-nums text-foreground">
              <b className="font-semibold">{fullført}</b>
              <span className="text-muted-foreground"> / {totalt}</span>
              <span className="ml-2 text-muted-foreground">{pct} %</span>
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-sm bg-secondary">
            <div
              className="h-full bg-primary transition-[width]"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Pyramide-mini-stripes */}
        <div>
          <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
            Pyramide-fordeling
          </div>
          <div className="flex h-2 gap-0.5 overflow-hidden rounded-sm bg-secondary">
            {stripes.map((s) => (
              <div
                key={s.key}
                style={{ width: `${s.value}%`, background: PYR_COLOR[s.key] }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border bg-background px-4 py-2.5 text-[11px] font-medium text-muted-foreground">
        <span>
          <b className="font-mono font-semibold tabular-nums text-foreground">
            {totalt}
          </b>{" "}
          økter
        </span>
        <span className="inline-flex items-center gap-1 text-foreground transition-transform group-hover:translate-x-0.5">
          Åpne
          <ArrowRight size={12} strokeWidth={1.5} />
        </span>
      </div>
    </Link>
  );
}

function StatusPill({ status }: { status: PlanStatus }) {
  const style: Record<PlanStatus, string> = {
    aktiv: "bg-[rgba(45,107,76,0.12)] text-[#1A7D56]",
    pause: "bg-[rgba(184,133,42,0.12)] text-[#7d5814]",
    arkiv: "bg-secondary text-muted-foreground",
  };
  const dot: Record<PlanStatus, string> = {
    aktiv: "bg-[#1A7D56]",
    pause: "bg-[#B8852A]",
    arkiv: "bg-muted-foreground",
  };
  const label: Record<PlanStatus, string> = {
    aktiv: "Aktiv",
    pause: "Pause",
    arkiv: "Arkivert",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${style[status]}`}
    >
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${dot[status]}`} />
      {label[status]}
    </span>
  );
}

function StatusChip({
  name,
  current,
  count,
  label,
  preserveQ,
}: {
  name: "alle" | PlanStatus;
  current: "alle" | PlanStatus;
  count: number;
  label: string;
  preserveQ?: string;
}) {
  const active = current === name;
  const params = new URLSearchParams();
  if (name !== "alle") params.set("status", name);
  if (preserveQ) params.set("q", preserveQ);
  const href = `/admin/plans${params.toString() ? `?${params.toString()}` : ""}`;
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
      <span className="font-mono text-[10px] font-semibold tabular-nums opacity-70">
        {count}
      </span>
    </Link>
  );
}

// ----------------- Helpers -----------------

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function avatarBg(name: string): string {
  const palette = [
    "#005840",
    "#1A7D56",
    "#B8852A",
    "#A32D2D",
    "#5E5C57",
    "#3a5d8a",
    "#7d4f9a",
    "#2c4a6b",
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return palette[h % palette.length];
}

function formatDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}
