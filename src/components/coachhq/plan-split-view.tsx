import Link from "next/link";
import { ClipboardList, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { avatarBg, initialsFromName } from "@/lib/avatar-colors";
import { EmptyState } from "@/components/shared/empty-state";
import { AgentStrip } from "@/components/coachhq/agent-strip";
import { PlanCardMini, type PlanCardMiniData } from "./plan-card-mini";
import { buildFaser } from "@/app/admin/plans/[planId]/_faser";

/**
 * PlanSplitView — venstre sidebar (320px) med plan-liste + høyre inline-detalj.
 *
 * Server component. Henter detalj-data for valgt plan via Prisma.
 * Klikk på sidebar bytter detalj via URL ?planId=xxx.
 */

export type SplitPlanRow = PlanCardMiniData & {
  startDate: Date;
  endDate: Date | null;
};

export async function PlanSplitView({
  plans,
  selectedPlanId,
  q,
}: {
  plans: SplitPlanRow[];
  selectedPlanId?: string;
  q?: string;
}) {
  const selected = selectedPlanId
    ? await prisma.trainingPlan.findUnique({
        where: { id: selectedPlanId },
        include: {
          user: { select: { id: true, name: true, hcp: true, tier: true } },
          sessions: {
            select: {
              id: true,
              scheduledAt: true,
              durationMin: true,
              pyramidArea: true,
              status: true,
              title: true,
            },
            orderBy: { scheduledAt: "asc" },
          },
        },
      })
    : null;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
      {/* Sidebar */}
      <aside className="flex flex-col gap-2.5 rounded-2xl border border-border bg-background p-3.5">
        <header className="flex items-center justify-between border-b border-border pb-2">
          <h3 className="font-display text-sm font-semibold text-foreground">
            Alle planer
          </h3>
          <span className="rounded-sm bg-card px-2 py-0.5 font-mono text-[11px] font-semibold text-muted-foreground">
            {plans.length}
          </span>
        </header>
        {plans.length === 0 ? (
          <p className="py-6 text-center font-mono text-[11px] text-muted-foreground">
            Ingen planer
          </p>
        ) : (
          <div className="flex max-h-[calc(100vh-280px)] flex-col gap-1 overflow-y-auto pr-1">
            {plans.map((plan) => (
              <PlanCardMini
                key={plan.id}
                plan={plan}
                active={plan.id === selectedPlanId}
                q={q}
              />
            ))}
          </div>
        )}
      </aside>

      {/* Detalj */}
      <section className="min-h-[520px]">
        {!selected ? (
          <EmptyState
            icon={ClipboardList}
            titleItalic="Velg en"
            titleTrail="plan"
            sub="Velg en plan i listen til venstre for å se detaljer her — hero, KPI-strip, perioder og blokker."
          />
        ) : (
          <SplitDetail plan={selected} />
        )}
      </section>
    </div>
  );
}

type DetailPlan = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  user: { id: string; name: string; hcp: number | null };
  sessions: {
    id: string;
    scheduledAt: Date;
    durationMin: number;
    pyramidArea: import("@/generated/prisma/client").PyramidArea;
    status: import("@/generated/prisma/client").SessionStatus;
    title: string;
  }[];
};

function SplitDetail({ plan }: { plan: DetailPlan }) {
  const total = plan.sessions.length;
  const fullfort = plan.sessions.filter((s) => s.status === "COMPLETED").length;
  const aktiv = plan.sessions.filter((s) => s.status === "ACTIVE").length;
  const pct = total === 0 ? 0 : Math.round((fullfort / total) * 100);
  const totMin = plan.sessions.reduce((acc, s) => acc + s.durationMin, 0);
  const totTimer = (totMin / 60).toFixed(1).replace(".", ",");

  const faser = buildFaser(plan.sessions);

  const periodeFra = plan.startDate.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
  });
  const periodeTil = plan.endDate
    ? plan.endDate.toLocaleDateString("nb-NO", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "åpen";

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
      {/* Hero */}
      <header className="flex items-start gap-4 border-b border-border pb-4">
        <span
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full font-mono text-[13px] font-semibold text-white"
          style={{ background: avatarBg(plan.user.name) }}
        >
          {initialsFromName(plan.user.name)}
        </span>
        <div className="flex-1">
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Treningsplan · {plan.user.name}
            {plan.user.hcp != null && ` · HCP ${plan.user.hcp}`}
          </div>
          <h2 className="mt-1 font-display text-2xl font-semibold leading-tight tracking-tight">
            <em className="font-normal italic text-primary">{plan.name}</em>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {periodeFra} – {periodeTil} · {total} økter · {totTimer} t volum
          </p>
        </div>
        <Link
          href={`/admin/plans/${plan.id}`}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground hover:bg-secondary"
        >
          Åpne
          <ChevronRight size={14} strokeWidth={1.75} />
        </Link>
      </header>

      {/* KPI-strip */}
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <MiniKpi label="Økter" value={String(total)} sub={`${aktiv} aktive`} />
        <MiniKpi label="Fullført" value={`${fullfort}`} sub={`av ${total}`} />
        <MiniKpi label="Progress" value={`${pct} %`} sub="Adherence" />
        <MiniKpi label="Volum" value={`${totTimer} t`} sub={`${totMin} min`} />
      </div>

      {/* AgentStrip */}
      <AgentStrip label="Plan-agent">
        Følger med på {plan.user.name} sin gjennomføring og flagger fasebytter.
        Åpne planen for full detalj og blokker.
      </AgentStrip>

      {/* Perioder (faser) */}
      <section>
        <h3 className="mb-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Perioder · {faser.length} uker
        </h3>
        {faser.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-[13px] text-muted-foreground">
            Ingen økter lagt til ennå.
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {faser.map((f, idx) => (
              <li
                key={f.key}
                className={`flex items-center gap-3 rounded-md border border-border p-3 ${
                  f.status === "current" ? "bg-secondary" : "bg-card"
                }`}
              >
                <span
                  className={`inline-block h-2 w-2 rounded-full ${
                    f.status === "current"
                      ? "bg-primary"
                      : f.status === "done"
                        ? "bg-muted-foreground"
                        : "bg-accent"
                  }`}
                />
                <span className="w-16 font-mono text-[11px] font-semibold text-foreground">
                  Uke {idx + 1}
                </span>
                <span className="flex-1 font-mono text-[11px] text-muted-foreground">
                  {f.dateRangeLabel}
                </span>
                <span className="font-mono text-[11px] tabular-nums text-foreground">
                  {f.done}/{f.totalSessions}
                </span>
                <span className="w-16 text-right font-mono text-[11px] text-muted-foreground">
                  {f.dominantArea ?? "—"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Blokker (kommende økter) */}
      <section>
        <h3 className="mb-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Kommende blokker
        </h3>
        {plan.sessions.filter((s) => s.status !== "COMPLETED").length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-[13px] text-muted-foreground">
            Ingen kommende økter.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border">
            {plan.sessions
              .filter((s) => s.status !== "COMPLETED")
              .slice(0, 6)
              .map((s) => {
                const NB_SHORT = new Intl.DateTimeFormat("nb-NO", {
                  day: "2-digit",
                  month: "short",
                });
                return (
                  <li
                    key={s.id}
                    className="flex items-center gap-3 px-3 py-2.5"
                  >
                    <span className="w-16 font-mono text-[11px] text-muted-foreground">
                      {NB_SHORT.format(s.scheduledAt)}
                    </span>
                    <span className="flex-1 truncate text-[13px] font-medium text-foreground">
                      {s.title}
                    </span>
                    <span className="font-mono text-[10px] uppercase text-muted-foreground">
                      {s.pyramidArea}
                    </span>
                    <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                      {s.durationMin} min
                    </span>
                  </li>
                );
              })}
          </ul>
        )}
      </section>
    </div>
  );
}

function MiniKpi({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-border bg-background p-3">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div className="font-mono text-[20px] font-semibold leading-none tabular-nums text-foreground">
        {value}
      </div>
      {sub && (
        <div className="font-mono text-[10px] text-muted-foreground">{sub}</div>
      )}
    </div>
  );
}
