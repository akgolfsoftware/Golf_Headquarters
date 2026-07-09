/**
 * PlayerHQ Coach Planer — hub (/portal/coach/plans) — hybrid-design 2026-06-17.
 *
 * Kanban-kolonne-visning: Aktiv · Fullført · Pause.
 * Progress-bar per plan (forest→lime gradient). Matches fasit B5 · Planer (Hub-fane).
 */

import Link from "next/link";
import { ArrowUpRight, ClipboardList } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Eyebrow } from "@/components/athletic/golfdata";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

export default async function CoachPlans() {
  const user = await requirePortalUser();

  if (user.tier === "GRATIS") {
    return (
      <div className="golfdata-scope mx-auto w-full max-w-[460px] px-4 pb-8 pt-3 sm:px-5 md:max-w-[860px] md:px-8 md:pt-6">
        <Eyebrow tone="default" className="mb-2.5 block">
          Coach · Planer
        </Eyebrow>
        <h1 className="font-display text-[29px] font-bold leading-[1.05] tracking-[-0.035em] text-foreground">
          Mine<em className="font-medium italic text-primary"> planer</em>
        </h1>
        <p className="mt-2 text-[13px] text-muted-foreground">
          Coach-laget plan er en del av Pro-abonnementet.
        </p>
      </div>
    );
  }

  const planer = await prisma.trainingPlan.findMany({
    where: {
      userId: user.id,
      createdById: { not: null },
    },
    include: {
      sessions: { select: { id: true, status: true } },
    },
    orderBy: { startDate: "desc" },
  });

  const aktiv  = planer.filter((p) => p.isActive);
  const fullfort = planer.filter((p) => !p.isActive && p.sessions.some((s) => s.status === "COMPLETED"));
  const pause  = planer.filter((p) => !p.isActive && !fullfort.includes(p));

  const cols = [
    { title: "Aktiv",     headColor: "text-primary",          plans: aktiv },
    { title: "Fullført",  headColor: "text-muted-foreground", plans: fullfort },
    { title: "Pause",     headColor: "text-warning",          plans: pause },
  ];

  return (
    <div className="golfdata-scope mx-auto w-full max-w-[460px] px-4 pb-8 pt-3 sm:px-5 md:max-w-[860px] md:px-8 md:pt-6">

      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <Eyebrow tone="default" className="mb-2.5 block">
            Coach · Planer
          </Eyebrow>
          <h1 className="font-display text-[29px] font-bold leading-[1.05] tracking-[-0.035em] text-foreground">
            Mine<em className="font-medium italic text-primary"> planer</em>
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Fra Anders Kristiansen
          </p>
        </div>
        <Link
          href="/portal/onskeligokt"
          className="shrink-0 rounded-full border border-border px-3.5 py-[7px] font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
        >
          Be om plan
        </Link>
      </div>

      {planer.length === 0 ? (
        <div>
          <EmptyState
            icon={ClipboardList}
            titleItalic="Ingen planer"
            titleTrail="fra coach"
            sub="Når coachen lager en plan til deg, dukker den opp her."
            cta={
              <Link
                href="/portal/gjennomfore"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 font-mono text-[12px] font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Til mine økter
                <ArrowUpRight size={14} strokeWidth={1.5} />
              </Link>
            }
          />
        </div>
      ) : (
        /* Kanban — horisontalt scroll på mobil */
        <div className="flex gap-2 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] [scrollbar-width:none]">
          {cols.map((col) => (
            <KanbanCol key={col.title} title={col.title} headColor={col.headColor}>
              {col.plans.map((p) => {
                const fullfort = p.sessions.filter((s) => s.status === "COMPLETED").length;
                const total = p.sessions.length;
                const pct = total > 0 ? Math.round((fullfort / total) * 100) : 0;
                return (
                  <PlanKCard
                    key={p.id}
                    id={p.id}
                    name={p.name}
                    startDate={p.startDate}
                    endDate={p.endDate}
                    isActive={p.isActive}
                    pct={pct}
                  />
                );
              })}
            </KanbanCol>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Kanban-kolonne ────────────────────────────────────────────────────────

function KanbanCol({
  title,
  headColor,
  children,
}: {
  title: string;
  headColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-[180px] shrink-0 flex-col gap-2 rounded-xl border border-border bg-secondary/50 p-2.5 md:w-[220px]">
      <div className={`font-mono text-[9px] font-bold uppercase tracking-[0.08em] ${headColor}`}>
        {title}
      </div>
      {children}
    </div>
  );
}

// ─── Plan-kort ─────────────────────────────────────────────────────────────

function fmtDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", { month: "short", year: "2-digit" });
}

function PlanKCard({
  id,
  name,
  startDate,
  endDate,
  isActive,
  pct,
}: {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  pct: number;
}) {
  const meta = endDate
    ? `${fmtDato(startDate)} – ${fmtDato(endDate)}`
    : `Fra ${fmtDato(startDate)}`;

  return (
    <Link
      href={`/portal/coach/plans/${id}`}
      className={
        "block rounded-lg border bg-card p-2.5 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-sm " +
        (isActive ? "border-l-2 border-l-accent border-border bg-accent/[0.04]" : "border-border")
      }
    >
      <div className="text-[12px] font-semibold leading-[1.3] text-foreground">
        {name}
      </div>
      <div className="mt-1 font-mono text-[9px] text-muted-foreground">{meta}</div>
      {/* Progress-bar */}
      <div className="mt-2 h-[5px] overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg,var(--forest),#b5d629)",
          }}
        />
      </div>
    </Link>
  );
}
