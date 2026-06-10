/**
 * /admin/workspace/oppgaver — Liste / Kanban / Kalender (AgencyOS)
 *
 * Ekte data fra OppgaveCache (Notion-sync) via getTasksForUser().
 * Alle teller (totalt, delt, prosjekter, status) avledes fra reelle tasks —
 * ingen hardkodede tall. View-state lagres i URL via ?view=liste|kanban|kalender.
 */

import { Plus, Search, Flame, List, LayoutGrid, Calendar } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AgPage, AgPageHead, agBtnClass } from "@/components/admin/agencyos/ui";
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
    alle: tasks.length,
    todo: tasks.filter((t) => t.status === "TODO" && !t.done).length,
    doing: tasks.filter((t) => t.status === "DOING").length,
    done: tasks.filter((t) => t.done).length,
    blokkert: tasks.filter((t) => t.status === "BLOKKERT").length,
  };
  // Avledede header-tall fra ekte data
  const delt = tasks.filter(
    (t) => t.vis === "ALLE" || t.vis === "SELSKAP" || t.vis === "JUNIOR",
  ).length;
  const prosjekter = new Set(tasks.map((t) => t.project.name ?? t.project.company))
    .size;

  const åpne = counts.alle - counts.done;
  const TALLORD = ["Ingen", "Én", "To", "Tre", "Fire", "Fem", "Seks", "Sju", "Åtte", "Ni", "Ti"];
  const åpneTekst = TALLORD[åpne] ?? String(åpne);
  const hasterIdag = tasks.filter((t) => !t.done && t.today).length;

  return (
    <AgPage>
      <AgPageHead
        eyebrow="Min uke · Oppgaver"
        title={åpneTekst}
        italic={åpne === 1 ? "gjenstår." : "gjenstår."}
        lead={`Dine oppgaver på tvers av stallen.${hasterIdag ? ` ${TALLORD[hasterIdag] ?? hasterIdag} haster i dag.` : ""}`}
        actions={
          <>
            <ViewToggle current={view} />
            <button type="button" className={agBtnClass("primary")}>
              <Plus className="h-4 w-4" strokeWidth={2} /> Ny oppgave
            </button>
          </>
        }
      />

      <WorkspaceTabs active="oppgaver" />

      <FilterBar counts={counts} />

      <div className="pb-12">
        {tasks.length === 0 ? (
          <EmptyTasks />
        ) : (
          <>
            {view === "liste" ? <ListView tasks={tasks} /> : null}
            {view === "kanban" ? <KanbanView tasks={tasks} /> : null}
            {view === "kalender" ? <CalView tasks={tasks} /> : null}
          </>
        )}
      </div>
    </AgPage>
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
    <div className="inline-flex rounded-full border border-border bg-secondary/40 p-1">
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
  counts: { alle: number; todo: number; doing: number; done: number; blokkert: number };
}) {
  return (
    <div className="sticky top-0 z-10 -mx-4 flex flex-wrap items-center gap-2 border-b border-border bg-card px-4 py-2 md:-mx-8 md:px-8">
      <label className="flex min-w-[240px] items-center gap-2 rounded-md border border-input bg-secondary/40 px-4 py-1.5">
        <Search className="h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="search"
          placeholder="Søk i oppgaver …"
          className="flex-1 bg-transparent text-[12.5px] outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 placeholder:text-muted-foreground"
        />
      </label>

      <span className="mx-1 h-5 w-px bg-border" />

      <FilterPill label="Alle" count={counts.alle} active />
      <FilterPill label="TODO" count={counts.todo} />
      <FilterPill label="DOING" count={counts.doing} />
      <FilterPill label="DONE" count={counts.done} />
      <FilterPill label="BLOKKERT" count={counts.blokkert} />

      <span className="mx-1 h-5 w-px bg-border" />

      <FilterPill label="Prosjekt" />
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
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
      {typeof count === "number" ? (
        <span
          className={`rounded-full px-1.5 py-px tabular-nums ${
            active ? "bg-primary-foreground/15 text-primary-foreground" : "bg-secondary"
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
        const rows = grouped[status];
        if (rows.length === 0) return null;
        return (
          <section key={status}>
            <div className="mb-2 flex items-center gap-2.5">
              <StatusPill kind={status} />
              <span className="font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
                {rows.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[760px]">
                {/* Column headers */}
                <div className="font-mono grid grid-cols-[20px_1fr_140px_88px_80px_100px_80px_60px] items-center gap-2 rounded-lg bg-secondary/40 px-4 py-2 text-[9.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
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
                  {rows.map((t) => (
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
                      {t.assigned.length > 0 ? (
                        <AvatarStack
                          items={t.assigned.map((k) => ({
                            name: SAMPLE_PEOPLE[k]?.name ?? k,
                            initials: SAMPLE_PEOPLE[k]?.initials ?? k,
                          }))}
                          size={20}
                        />
                      ) : (
                        <span className="font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground/60">
                          —
                        </span>
                      )}
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
    <div className="flex min-h-[540px] flex-col gap-2.5 rounded-2xl bg-secondary/30 p-4">
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
        className="font-mono rounded-xl border border-dashed border-border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground hover:bg-secondary/40"
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
          {t.assigned.length > 0 ? (
            <AvatarStack
              items={t.assigned.map((k) => ({
                name: SAMPLE_PEOPLE[k]?.name ?? k,
                initials: SAMPLE_PEOPLE[k]?.initials ?? k,
              }))}
              size={18}
              max={2}
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}

// ────────────────────────────────────────────────────────── CALENDAR VIEW ──

function CalView({ tasks }: { tasks: SampleTask[] }) {
  // Inneværende uke (man–søn), avledet fra dagens dato.
  const today = new Date();
  const dow = (today.getDay() + 6) % 7; // 0 = mandag
  const monday = new Date(today);
  monday.setDate(today.getDate() - dow);
  monday.setHours(0, 0, 0, 0);

  const dayNames = ["MAN", "TIR", "ONS", "TOR", "FRE", "LØR", "SØN"];
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      name: dayNames[i],
      date: String(d.getDate()).padStart(2, "0"),
      isToday: i === dow,
    };
  });

  return (
    <div className="px-1">
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-7 border-b border-border">
              {days.map((d, i) => (
                <div
                  key={i}
                  className={`flex items-baseline gap-2 px-4 py-2 ${
                    i < 6 ? "border-r border-border" : ""
                  }`}
                >
                  <span className="font-mono text-[10px] font-bold tracking-[0.12em] text-muted-foreground">
                    {d.name}
                  </span>
                  <span
                    className={`font-display text-base font-bold ${d.isToday ? "text-primary" : ""}`}
                  >
                    {d.date}
                  </span>
                  {d.isToday ? (
                    <span className="ml-1 h-1.5 w-1.5 rounded-full bg-accent" />
                  ) : null}
                </div>
              ))}
            </div>

            <div className="grid min-h-[400px] grid-cols-7">
              {days.map((d, i) => {
                const dayTasks = tasks.filter((_, idx) => idx % 7 === i).slice(
                  0,
                  3,
                );
                return (
                  <div
                    key={i}
                    className={`flex flex-col gap-1.5 p-2.5 ${i < 6 ? "border-r border-border" : ""} ${
                      d.isToday ? "bg-accent/[0.06]" : ""
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
                          )} bg-secondary/30 ${barClass === "bg-primary" ? "text-primary" : "text-foreground"}`}
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

// ───────────────────────────────────────────────────────────── EMPTY STATE ──

function EmptyTasks() {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
          <List className="h-6 w-6" strokeWidth={1.5} aria-hidden />
        </span>
        <div>
          <p className="font-display text-lg font-bold tracking-[-0.01em] text-foreground">
            Ingen oppgaver
          </p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Koble til Notion for å synke oppgaver automatisk, eller opprett en
            oppgave manuelt.
          </p>
        </div>
        <button type="button" className={agBtnClass("primary", "sm")}>
          <Plus className="h-3.5 w-3.5" strokeWidth={2} /> Ny oppgave
        </button>
      </div>
    </div>
  );
}
