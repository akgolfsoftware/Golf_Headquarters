/**
 * /admin/workspace/oppgaver — Liste / Kanban / Kalender
 *
 * Pixel-perfekt fra Claude Design-bundle _SEBg4QyodvbW2k06JWiGw
 * (workspace/s2-oppgaver.jsx).
 *
 * View-state lagres i URL via ?view=liste|kanban|kalender.
 * Filter-bar er sticky.
 */

import { Plus, Search, Flame, List, LayoutGrid, Calendar } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AthleticButton, AthleticEyebrow } from "@/components/athletic";
import {
  AvatarStack,
  DueDate,
  PrioDot,
  ProjectPill,
  SourceBadge,
  StatusPill,
  TaskCheck,
  VisibilityIcon,
  VisibilityPill,
  WorkspaceTabs,
  getCompanyBar,
  type StatusKind,
} from "@/components/workspace/primitives";
import {
  SAMPLE_PEOPLE,
  type SampleTask,
} from "@/components/workspace/sample-data";
import { getTasksForUser } from "@/lib/notion/queries";

export const dynamic = "force-dynamic";

type View = "liste" | "kanban" | "kalender";

export default async function WorkspaceOppgaverPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const sp = await searchParams;
  const view: View = ["liste", "kanban", "kalender"].includes(sp.view as View)
    ? (sp.view as View)
    : "liste";

  const tasks = await getTasksForUser(user.id);

  const counts = {
    todo: tasks.filter((t) => t.status === "TODO" && !t.done).length,
    doing: tasks.filter((t) => t.status === "DOING").length,
    done: tasks.filter((t) => t.done).length,
    blokkert: tasks.filter((t) => t.status === "BLOKKERT").length,
  };

  return (
    <div className="space-y-6">
      <header className="-mx-4 -mt-4 border-b border-border bg-gradient-to-b from-[#FBFAF5] to-background px-4 py-8 md:-mx-8 md:-mt-8 md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <AthleticEyebrow>CoachHQ · Workspace · Oppgaver</AthleticEyebrow>
            <h1 className="font-display mt-2 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              Alle{" "}
              <em
                className="font-normal not-italic"
                style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontStyle: "italic",
                  color: "hsl(var(--primary))",
                }}
              >
                oppgaver
              </em>
            </h1>
            <div className="font-mono mt-2.5 text-[11.5px] uppercase tracking-[0.04em] text-muted-foreground">
              23 OPPGAVER · 5 DELT MED COACHES · 7 PROSJEKTER
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ViewToggle current={view} />
            <AthleticButton variant="lime" size="sm">
              <Plus className="h-3.5 w-3.5" /> Ny oppgave
            </AthleticButton>
          </div>
        </div>
      </header>

      <WorkspaceTabs active="oppgaver" />

      <FilterBar counts={counts} />

      <div className="pb-12">
        {view === "liste" ? <ListView tasks={tasks} /> : null}
        {view === "kanban" ? <KanbanView tasks={tasks} /> : null}
        {view === "kalender" ? <CalView tasks={tasks} /> : null}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────── view toggle ──

function ViewToggle({ current }: { current: View }) {
  const views: { id: View; icon: typeof List; label: string }[] = [
    { id: "liste", icon: List, label: "Liste" },
    { id: "kanban", icon: LayoutGrid, label: "Kanban" },
    { id: "kalender", icon: Calendar, label: "Kalender" },
  ];
  return (
    <div className="inline-flex rounded-full border border-border bg-muted/40 p-1">
      {views.map((v) => {
        const Icon = v.icon;
        const isActive = current === v.id;
        return (
          <a
            key={v.id}
            href={`?view=${v.id}`}
            className={`font-display inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              isActive
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {v.label}
          </a>
        );
      })}
    </div>
  );
}

// ───────────────────────────────────────────────────────────── filter-bar ──

function FilterBar({
  counts,
}: {
  counts: { todo: number; doing: number; done: number; blokkert: number };
}) {
  return (
    <div className="sticky top-0 z-10 -mx-4 flex flex-wrap items-center gap-2 border-b border-border bg-card px-4 py-2 md:-mx-8 md:px-8">
      <label className="flex min-w-[240px] items-center gap-2 rounded-md border border-input bg-muted/30 px-4 py-1.5">
        <Search className="h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="search"
          placeholder="Søk i oppgaver …"
          className="flex-1 bg-transparent text-[12.5px] outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 placeholder:text-muted-foreground"
        />
      </label>

      <span className="mx-1 h-5 w-px bg-border" />

      <FilterPill label="Alle" count={23} active />
      <FilterPill label="TODO" count={counts.todo} />
      <FilterPill label="DOING" count={counts.doing} />
      <FilterPill label="DONE" count={counts.done} />
      <FilterPill label="BLOKKERT" count={counts.blokkert} />

      <span className="mx-1 h-5 w-px bg-border" />

      <FilterPill label="Prosjekt · 3" />
      <FilterPill label="Synlighet · Mine" />
      <FilterPill label="Prioritet" />

      <a
        href="?"
        className="font-mono ml-auto text-[11px] text-muted-foreground underline underline-offset-2"
      >
        Rydd filter
      </a>
    </div>
  );
}

function FilterPill({
  label,
  count,
  active = false,
}: {
  label: string;
  count?: number;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`font-mono inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.06em] transition ${
        active
          ? "border-primary bg-primary text-accent"
          : "border-border bg-card text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
      {typeof count === "number" ? (
        <span
          className={`rounded-full px-1.5 py-px tabular-nums ${
            active ? "bg-white/20" : "bg-muted"
          }`}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}

// ────────────────────────────────────────────────────────────── LIST VIEW ──

function ListView({ tasks }: { tasks: SampleTask[] }) {
  const grouped: Record<StatusKind, SampleTask[]> = {
    DOING: tasks.filter((t) => t.status === "DOING"),
    TODO: tasks.filter((t) => t.status === "TODO" && !t.done),
    BLOKKERT: tasks.filter((t) => t.status === "BLOKKERT"),
    DONE: tasks.filter((t) => t.done),
  };

  return (
    <div className="space-y-8 px-1">
      {(["DOING", "TODO", "BLOKKERT", "DONE"] as StatusKind[]).map((status) => {
        const tasks = grouped[status];
        if (tasks.length === 0) return null;
        return (
          <section key={status}>
            <div className="mb-2 flex items-center gap-2.5">
              <StatusPill kind={status} />
              <span className="font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
                {tasks.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[760px]">
            {/* Column headers */}
            <div className="font-mono grid grid-cols-[20px_1fr_140px_88px_80px_100px_80px_60px] items-center gap-2 rounded-lg bg-muted/40 px-4 py-2 text-[9.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
              <div />
              <div>Oppgave</div>
              <div>Prosjekt</div>
              <div>Prio</div>
              <div>Forfaller</div>
              <div>Tildelt</div>
              <div>Synlighet</div>
              <div>Kilde</div>
            </div>

            <ul>
              {tasks.map((t) => (
                <li
                  key={t.id}
                  className={`grid grid-cols-[20px_1fr_140px_88px_80px_100px_80px_60px] items-center gap-2 border-b border-border px-4 py-2 ${
                    t.done ? "opacity-55" : ""
                  }`}
                >
                  <TaskCheck done={t.done} />
                  <div className="flex items-center gap-2">
                    {t.brenner ? (
                      <Flame
                        className="h-3 w-3 text-destructive"
                        fill="currentColor"
                      />
                    ) : null}
                    <span
                      className={`text-[13px] font-medium ${t.done ? "line-through" : ""}`}
                    >
                      {t.title}
                    </span>
                  </div>
                  <ProjectPill
                    company={t.project.company}
                    name={t.project.name}
                    compact
                  />
                  <PrioDot kind={t.prio} withLabel />
                  <DueDate value={t.due} today={t.today} />
                  <AvatarStack
                    items={t.assigned.map((k) => ({
                      name: SAMPLE_PEOPLE[k]?.name ?? k,
                      initials: SAMPLE_PEOPLE[k]?.initials ?? k,
                    }))}
                    size={20}
                  />
                  <VisibilityPill kind={t.vis} compact />
                  <SourceBadge kind={t.source} />
                </li>
              ))}
            </ul>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────────────────── KANBAN VIEW ──

function KanbanView({ tasks }: { tasks: SampleTask[] }) {
  return (
    <div className="px-1">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KanbanCol status="TODO" tasks={tasks} />
        <KanbanCol status="DOING" tasks={tasks} accent />
        <KanbanCol status="DONE" tasks={tasks} />
      </div>
    </div>
  );
}

function KanbanCol({
  status,
  tasks: allTasks,
  accent = false,
}: {
  status: StatusKind;
  tasks: SampleTask[];
  accent?: boolean;
}) {
  const tasks =
    status === "DONE"
      ? allTasks.filter((t) => t.done)
      : allTasks.filter((t) => t.status === status && !t.done);

  return (
    <div className="flex min-h-[540px] flex-col gap-2.5 rounded-2xl bg-muted/30 p-4">
      <div
        className={`flex items-center gap-2.5 border-b px-1 pb-2 ${
          accent ? "border-b-[2px] border-accent" : "border-border"
        }`}
      >
        <StatusPill kind={status} />
        <span className="font-mono text-[11.5px] font-bold tracking-[0.04em] text-muted-foreground">
          {tasks.length}
        </span>
        <button
          type="button"
          className="ml-auto text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {tasks.map((t) => (
        <KanbanCard key={t.id} task={t} />
      ))}
      <button
        type="button"
        className="font-mono rounded-xl border border-dashed border-border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground hover:bg-muted/40"
      >
        + NY
      </button>
    </div>
  );
}

function KanbanCard({ task: t }: { task: SampleTask }) {
  return (
    <article
      className={`flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-sm ${
        t.brenner ? "border-l-[3px] border-l-destructive" : "border-border"
      }`}
    >
      <div className="flex items-start gap-2">
        {t.brenner ? (
          <Flame
            className="mt-0.5 h-3 w-3 shrink-0 text-destructive"
            fill="currentColor"
          />
        ) : null}
        <h3 className="font-display flex-1 text-[13.5px] font-semibold leading-snug">
          {t.title}
        </h3>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <ProjectPill company={t.project.company} name={t.project.name} compact />
        <PrioDot kind={t.prio} />
      </div>
      <div className="flex items-center gap-2 border-t border-border pt-2">
        <DueDate value={t.due} today={t.today} />
        <div className="ml-auto flex items-center gap-1.5">
          <VisibilityIcon kind={t.vis} />
          <SourceBadge kind={t.source} />
          <AvatarStack
            items={t.assigned.map((k) => ({
              name: SAMPLE_PEOPLE[k]?.name ?? k,
              initials: SAMPLE_PEOPLE[k]?.initials ?? k,
            }))}
            size={18}
            max={2}
          />
        </div>
      </div>
    </article>
  );
}

// ────────────────────────────────────────────────────────── CALENDAR VIEW ──

function CalView({ tasks }: { tasks: SampleTask[] }) {
  const days = ["MAN", "TIR", "ONS", "TOR", "FRE", "LØR", "SØN"];
  const dates = ["26", "27", "28", "29", "30", "31", "01"];

  return (
    <div className="px-1">
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
        <div className="grid grid-cols-7 border-b border-border">
          {days.map((d, i) => (
            <div
              key={d}
              className={`flex items-baseline gap-2 px-4 py-2 ${
                i < 6 ? "border-r border-border" : ""
              }`}
            >
              <span className="font-mono text-[10px] font-bold tracking-[0.12em] text-muted-foreground">
                {d}
              </span>
              <span
                className={`font-display text-base font-bold ${i === 1 ? "text-primary" : ""}`}
              >
                {dates[i]}
              </span>
              {i === 1 ? (
                <span className="ml-1 h-1.5 w-1.5 rounded-full bg-accent" />
              ) : null}
            </div>
          ))}
        </div>

        <div className="grid min-h-[400px] grid-cols-7">
          {days.map((d, i) => {
            const dayTasks = tasks.filter((_, idx) => idx % 7 === i).slice(
              0,
              2 + (i % 2),
            );
            return (
              <div
                key={d}
                className={`flex flex-col gap-1.5 p-2.5 ${i < 6 ? "border-r border-border" : ""} ${
                  i === 1 ? "bg-accent/[0.06]" : ""
                }`}
              >
                {dayTasks.map((t) => {
                  const barClass = getCompanyBar(t.project.company);
                  return (
                    <div
                      key={t.id}
                      className={`flex items-center gap-1.5 rounded-md border-l-2 px-2 py-1.5 text-[11px] font-semibold leading-tight ${barClass.replace(
                        "bg-",
                        "border-l-",
                      )} bg-muted/30 ${barClass === "bg-primary" ? "text-primary" : "text-foreground"}`}
                    >
                      <PrioDot kind={t.prio} />
                      <span className="flex-1 truncate">{t.title}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}
